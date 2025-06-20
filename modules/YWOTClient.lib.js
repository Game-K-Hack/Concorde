class YWOTClient {
    constructor(worldName) {
        this.worldName = worldName;
        this.ws = null;
        this.wsUrl = `wss://www.yourworldoftext.com/${worldName}/ws/`;
        this.requestCounter = 1;
        this.pendingRequests = new Map();
    }

    /**
     * Génère les edits à partir d'une ligne et d'une colonne globales
     */
    generateEditsFromGlobalCoords(lineGlobal, colStartGlobal, text, timestamp, flag = 1) {
        const edits = [];
        const blockY = Math.floor(lineGlobal / 8);
        const yInblock = lineGlobal % 8;
        let blockX = Math.floor(colStartGlobal / 16);
        let xInblock = colStartGlobal % 16;

        for (const ch of text) {
            if (xInblock > 15) {
                xInblock = 0;
                blockX += 1;
            }
            edits.push([blockY, blockX, yInblock, xInblock, timestamp, ch, flag]);
            xInblock += 1;
        }
        return edits;
    }

    /**
     * Connecte au WebSocket
     */
    async connect(maxRetries = 3) {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                this.ws = new WebSocket(this.wsUrl);
                
                await new Promise((resolve, reject) => {
                    this.ws.onopen = () => {
                        console.log(`Connecté au WebSocket (tentative ${attempt + 1})`);
                        this.setupMessageHandler();
                        resolve();
                    };
                    
                    this.ws.onerror = (error) => {
                        console.log(`Erreur de connexion (tentative ${attempt + 1}):`, error);
                        reject(error);
                    };
                    
                    this.ws.onclose = () => {
                        console.log("Connexion WebSocket fermée");
                    };
                });
                
                return true;
            } catch (error) {
                if (attempt < maxRetries - 1) {
                    await this.sleep(2000);
                }
            }
        }
        return false;
    }

    /**
     * Configure le gestionnaire de messages
     */
    setupMessageHandler() {
        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log(`Message reçu: kind=${data.kind}, request_id=${data.request_id}`);
                
                // Résoudre les requêtes en attente
                if (data.request_id && this.pendingRequests.has(data.request_id)) {
                    const { resolve, reject, expectedKind } = this.pendingRequests.get(data.request_id);
                    
                    if (data.kind === expectedKind) {
                        this.pendingRequests.delete(data.request_id);
                        resolve(data);
                    }
                }
            } catch (error) {
                console.error("Erreur lors du parsing du message:", error);
            }
        };
    }

    /**
     * Utilitaire pour les délais
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Écrit du texte à une position donnée
     */
    async writeLine(lineGlobal, colStartGlobal, text, timestamp = null) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error("WebSocket non connecté");
        }

        if (timestamp === null) {
            timestamp = Date.now();
        }

        const requestId = this.requestCounter++;
        const edits = this.generateEditsFromGlobalCoords(lineGlobal, colStartGlobal, text, timestamp);
        
        const message = {
            kind: "write",
            request_id: requestId,
            edits: edits
        };

        this.ws.send(JSON.stringify(message));
        console.log(`[req=${requestId}] Écrit ligne ${lineGlobal} @col ${colStartGlobal} : "${text}"`);
        
        return requestId;
    }

    /**
     * Lit une zone rectangulaire
     */
    async fetchRectangle(minX, minY, maxX, maxY, timeout = 10000) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error("WebSocket non connecté");
        }

        const requestId = this.requestCounter++;
        const message = {
            kind: "fetch",
            request_id: requestId,
            fetchRectangles: [{
                minX: minX,
                minY: minY,
                maxX: maxX,
                maxY: maxY
            }]
        };

        console.log(`[req=${requestId}] Demande de lecture zone (${minX},${minY}) à (${maxX},${maxY})`);

        // Créer une promesse pour attendre la réponse
        const responsePromise = new Promise((resolve, reject) => {
            this.pendingRequests.set(requestId, {
                resolve,
                reject,
                expectedKind: "fetch"
            });

            // Timeout
            setTimeout(() => {
                if (this.pendingRequests.has(requestId)) {
                    this.pendingRequests.delete(requestId);
                    reject(new Error(`Timeout: aucune réponse fetch avec request_id=${requestId} reçue`));
                }
            }, timeout);
        });

        this.ws.send(JSON.stringify(message));
        return responsePromise;
    }

    /**
     * Parse les données de tiles en texte lisible
     */
    parseTilesToText(tilesData) {
        if (!tilesData || !tilesData.tiles) {
            return "Aucune donnée reçue";
        }

        const tiles = tilesData.tiles;
        const lines = {};

        for (const [coord, tile] of Object.entries(tiles)) {
            if (tile === null) continue;

            const parts = coord.split(',');
            if (parts.length !== 2) continue;

            const blockY = parseInt(parts[0]);
            const blockX = parseInt(parts[1]);
            
            if (isNaN(blockY) || isNaN(blockX)) continue;

            const content = tile.content || "";
            if (!content.trim()) continue;

            // Calculer les lignes globales pour ce bloc (chaque bloc = 8 lignes)
            for (let yInblock = 0; yInblock < 8; yInblock++) {
                const lineGlobal = blockY * 8 + yInblock;
                
                // Extraire le contenu de cette ligne spécifique
                const startIdx = yInblock * 16;
                const endIdx = startIdx + 16;
                
                if (startIdx < content.length) {
                    const lineContent = content.substring(startIdx, endIdx);
                    if (lineContent.trim()) {
                        if (!lines[lineGlobal]) {
                            lines[lineGlobal] = {};
                        }
                        const colGlobalStart = blockX * 16;
                        lines[lineGlobal][colGlobalStart] = lineContent;
                    }
                }
            }
        }

        // Construire le texte final
        const result = [];
        const sortedLineNums = Object.keys(lines).map(Number).sort((a, b) => a - b);
        
        for (const lineNum of sortedLineNums) {
            const lineParts = lines[lineNum];
            let fullLine = "";
            const sortedColStarts = Object.keys(lineParts).map(Number).sort((a, b) => a - b);
            
            for (const colStart of sortedColStarts) {
                // Ajouter des espaces si nécessaire pour combler les trous
                while (fullLine.length < colStart) {
                    fullLine += " ";
                }
                fullLine += lineParts[colStart];
            }
            
            result.push(`Ligne ${lineNum}: ${JSON.stringify(fullLine.trimEnd())}`);
        }

        return result.length > 0 ? result.join('\n') : "Aucun contenu trouvé";
    }

    /**
     * Ferme la connexion WebSocket
     */
    close() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.pendingRequests.clear();
    }

    /**
     * Écrit plusieurs lignes avec des délais
     */
    async writeMultipleLines(lines, delay = 500) {
        for (const { line, col, text } of lines) {
            await this.writeLine(line, col, text);
            if (delay > 0) {
                await this.sleep(delay);
            }
        }
    }

    /**
     * Lit du texte et le parse automatiquement
     */
    async readText(minX, minY, maxX, maxY) {
        const response = await this.fetchRectangle(minX, minY, maxX, maxY);
        return this.parseTilesToText(response);
    }
}


window.YWOTClient = YWOTClient;
