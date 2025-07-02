(function () {
    const module_name = "planningForConges";

    // Redirection console → iframe
    let iframe = document.getElementById("crd-log");
    if (iframe == undefined || iframe == null) {
        iframe = document.createElement("iframe");
        iframe.id = "crd-log";
        document.body.appendChild(iframe);
    }
    console.log = iframe.contentWindow.console.log;
    console.debug = function(...data) { console.log("[DEBUG] (" + module_name + ") " + data); }
    console.error = function(...data) { console.log("[ERROR] (" + module_name + ") " + data); }
    console.info = function(...data) { console.log("[INFO] (" + module_name + ") " + data); }
    console.ok = function(...data) { console.log("[ OK ] (" + module_name + ") " + data); }


    // Fonction de diagnostic pour vérifier la structure des données
    function diagnoseDataStructure() {
        console.info("=== DIAGNOSTIC DE LA STRUCTURE DES DONNÉES ===");
        
        // Vérifier si srh existe
        if (typeof srh === 'undefined') {
            console.error("❌ Variable 'srh' non définie");
            return false;
        }
        console.ok("✅ Variable 'srh' trouvée");

        // Vérifier la structure complète
        try {
            const path = srh?.vueApp?.store?._modules?.root?._children?.absences?._rawModule?.state?.absencesMatCtrDt;
            if (!path) {
                console.error("❌ Chemin vers absencesMatCtrDt introuvable");
                
                // Explorer la structure disponible
                console.info("🔍 Structure disponible dans srh:");
                console.info("srh.vueApp:", !!srh.vueApp);
                console.info("srh.vueApp.store:", !!srh.vueApp?.store);
                console.info("srh.vueApp.store._modules:", !!srh.vueApp?.store?._modules);
                console.info("srh.vueApp.store._modules.root:", !!srh.vueApp?.store?._modules?.root);
                console.info("srh.vueApp.store._modules.root._children:", !!srh.vueApp?.store?._modules?.root?._children);
                
                if (srh.vueApp?.store?._modules?.root?._children) {
                    console.info("🔍 Modules disponibles:", Object.keys(srh.vueApp.store._modules.root._children));
                }

                // Essayer des chemins alternatifs
                if (srh.vueApp?.store?.state) {
                    console.info("🔍 Tentative avec store.state:", Object.keys(srh.vueApp.store.state));
                }

                return false;
            }
            console.ok("✅ Chemin vers absencesMatCtrDt trouvé");
            return true;
        } catch (error) {
            console.error("❌ Erreur lors de l'exploration:", error);
            return false;
        }
    }

    // Génère toutes les dates entre deux bornes inclusives
    function getDateRange(startDate, endDate) {
        const dates = [];
        const currentDate = new Date(startDate.val);
        const finalDate = new Date(endDate.val);

        while (currentDate <= finalDate) {
            dates.push(new Date(currentDate).toISOString().split("T")[0]);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dates;
    }

    // Version améliorée avec gestion d'erreurs et chemins alternatifs
    function getRows() {
        console.info("🔍 Tentative de récupération des données d'absence...");
        
        const rows = {};
        let data = null;

        // Chemin principal (original)
        try {
            data = srh.vueApp.store._modules.root._children.absences._rawModule.state.absencesMatCtrDt;
            if (data) {
                console.ok("✅ Données trouvées via le chemin principal");
            }
        } catch (error) {
            console.warn("⚠️ Chemin principal échoué:", error.message);
        }

        // Chemins alternatifs si le principal échoue
        if (!data) {
            const alternativePaths = [
                () => srh.vueApp.store.state.absences.absencesMatCtrDt,
                () => srh.vueApp.store.state.absencesMatCtrDt,
                () => srh.vueApp.store._modules.root.state.absences.absencesMatCtrDt,
                () => srh.vueApp.$store?.state?.absences?.absencesMatCtrDt,
            ];

            for (let i = 0; i < alternativePaths.length; i++) {
                try {
                    data = alternativePaths[i]();
                    if (data) {
                        console.ok(`✅ Données trouvées via le chemin alternatif ${i + 1}`);
                        break;
                    }
                } catch (error) {
                    console.warn(`⚠️ Chemin alternatif ${i + 1} échoué:`, error.message);
                }
            }
        }

        if (!data) {
            console.error("❌ Impossible de trouver les données d'absence");
            return rows;
        }

        console.info("📊 Structure des données trouvée:", Object.keys(data));

        for (let mat of Object.keys(data)) {
            const row = [];
            const seen = new Set(); // ← reset pour chaque mat

            for (let dateKey of Object.keys(data[mat])) {
                const items = data[mat][dateKey];
                if (!Array.isArray(items)) continue;

                for (let item of items) {
                    // clé unique *par matricule*
                    const key = `${item.mmotif}|${item.name}|${item.ddeb}|${item.dfin}`;
                    if (seen.has(key)) continue;
                    seen.add(key);
                    row.push({
                        mmotif: { val: item.mmotif.trim() },
                        name: { val: item.name },
                        ddeb: { val: item.ddeb },
                        dfin: { val: item.dfin },
                    });
                }
            }

            rows[mat] = row;
            console.info(`📝 Matricule ${mat}: ${row.length} absences trouvées`);
        }

        return rows;
    }

    function addEmoji(cell, emoji) {
        if (cell.querySelector("#emoji")) return;
        const s = document.createElement("div");
        s.id = "emoji";
        s.className = "emojibox";
        s.textContent = emoji;
        cell.appendChild(s);
    }

    function addEmojisToCalendar() {
        console.info("🎯 Début de l'injection des emojis...");
        
        const rows = getRows();
        
        if (Object.keys(rows).length === 0) {
            console.error("❌ Aucune donnée d'absence récupérée");
            return;
        }

        // 1) Récupère les deux tables
        const headerTable = document.querySelector("table.srhcal.planning.right.thead");
        const dataTable = document.querySelector("table.srhcal.planning.right:not(.thead)");
        
        if (!headerTable) {
            console.error("❌ Table header non trouvée");
            return;
        }
        if (!dataTable) {
            console.error("❌ Table data non trouvée");
            return;
        }
        
        console.ok("✅ Tables trouvées");

        // 2) Construit map(col → date) depuis le trth2
        const trth2 = headerTable.querySelector("tr.trth2");
        if (!trth2) {
            console.error("❌ Ligne des jours (tr.trth2) introuvable");
            return;
        }

        const ths = Array.from(trth2.querySelectorAll("th"));
        console.info(`📅 ${ths.length} colonnes de dates trouvées`);

        // Amélioration de la détection d'année et mois
        let year = new Date().getFullYear();
        let month = new Date().getMonth();
        
        const lib = document.querySelector("#libMonth");
        if (lib) {
            const yearMatch = lib.textContent.match(/(\d{4})/);
            if (yearMatch) {
                year = parseInt(yearMatch[1], 10);
                console.info(`📅 Année détectée: ${year}`);
            }
            
            // Détecter le mois de départ
            const monthText = lib.textContent.toLowerCase();
            const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 
                          'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
            
            for (let i = 0; i < months.length; i++) {
                if (monthText.includes(months[i])) {
                    month = i;
                    console.info(`📅 Mois de départ détecté: ${months[i]} (${i})`);
                    break;
                }
            }
        }

        const colDate = new Map();
        let prevDay = 0;
        let curMon = month;
        
        ths.forEach((th, idx) => {
            const parts = th.innerHTML.trim().split("<br>");
            const d = parseInt(parts[1], 10);
            if (isNaN(d)) return;
            
            // Détection du changement de mois
            if (prevDay && prevDay - d > 20) {
                curMon++;
                console.info(`📅 Changement de mois détecté à la colonne ${idx}`);
            }
            
            const ds = `${year}-${String(curMon + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            colDate.set(idx, ds);
            prevDay = d;
        });

        console.info(`📅 Mapping des colonnes: ${colDate.size} dates mappées`);

        // 3) Prépare map(mat|date → motif)
        const dateMap = new Map();
        const motifNames = {};
        
        for (const [mat, absList] of Object.entries(rows)) {
            for (const { mmotif, name, ddeb, dfin } of absList) {
                motifNames[mmotif.val] = name.val;
                const dateRange = getDateRange(ddeb, dfin);
                dateRange.forEach((date) => {
                    const key = `${mat.split("_")[0]}|${date}`;
                    dateMap.set(key, mmotif);
                });
            }
        }

        console.info(`📊 ${dateMap.size} entrées dans la map des dates`);

        // 4) Parcourt chaque ligne de noms pour trouver sa « l.n » et cibler le body
        const nameRows = document.querySelectorAll("table.srhcal.planning.listSal tr[data-me]");
        console.info(`👥 ${nameRows.length} employés trouvés`);

        let processedCount = 0;
        nameRows.forEach((pilot) => {
            const mat = pilot.getAttribute("data-me");
            const cls = Array.from(pilot.classList).find((c) => c.startsWith("l."));
            
            if (!cls) {
                console.warn(`⚠️ Classe 'l.X' non trouvée pour le matricule ${mat}`);
                return;
            }
            
            // converti l.3 → l_3 (correspond au body)
            const suffix = cls.replace(".", "_");
            const bodyRow = dataTable.querySelector(`tr.${suffix}`);
            
            if (!bodyRow) {
                console.warn(`⚠️ Pas de ligne data pour mat=${mat} (classe: ${suffix})`);
                return;
            }

            // 5) Injecte sur chaque <td>
            let cellsProcessed = 0;
            bodyRow.querySelectorAll("td").forEach((cell, ci) => {
                const date = colDate.get(ci);
                if (!date) return;
                
                const motif = dateMap.get(`${mat}|${date}`);
                if (!cell.className.includes("conge") || !motif) return;
                
                if (motif.val === "TTRV") {
                    addEmoji(cell, "💻");
                } else if (["CONGP", "CETM", "ABRTT"].includes(motif.val)) {
                    addEmoji(cell, "☀️");
                } else if (["MALAH", "ABMTM"].includes(motif.val)) {
                    addEmoji(cell, "🏥");
                } else if (["MALAD"].includes(motif.val)) {
                    addEmoji(cell, "🤒");
                } else {
                    addEmoji(cell, "📅");
                }

                // Mise à jour du texte si le nom du motif est disponible
                if (motifNames[motif.val]) {
                    const span = cell.querySelector("span");
                    if (span) {
                        span.innerText = motifNames[motif.val];
                        if (window.motifDebug) span.innerText += ` (${motif.val})`;
                    }
                }
                
                cellsProcessed++;
            });
            
            if (cellsProcessed > 0) {
                processedCount++;
                console.info(`✅ Matricule ${mat}: ${cellsProcessed} cellules traitées`);
            }
        });

        console.ok(`🎉 Emojis injectés avec succès ! ${processedCount} employés traités`);
    }

    function init() {
        console.info("🚀 Initialisation du module...");
        
        // Vérifier la présence de l'élément cible
        const elm = document.querySelector(`div[id="tab-planningForConges"] td[class="we"]`);
        if (!elm) {
            console.info("⏳ En attente du chargement de l'interface...");
            return setTimeout(init, 100);
        }
        
        console.ok("✅ Interface chargée");

        const style = document.createElement('style');
        style.textContent = `.emojibox {
            font-size: 16px;
            display: block !important;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }`;
        document.head.appendChild(style);
        
        // Diagnostic de la structure des données
        if (!diagnoseDataStructure()) {
            console.error("❌ Impossible de procéder sans les données d'absence");
            return;
        }

        let btns = document.querySelector(`table[class="srhcal planning listSalHead"] tr`);
        if (btns) {
            btns.addEventListener("click", (event) => {
                setTimeout(() => { addEmojisToCalendar(); }, 100);
                setTimeout(() => { addEmojisToCalendar(); }, 200);
                setTimeout(() => { addEmojisToCalendar(); }, 500);
            });
        }

        // Exécution avec retry
        let attemptCount = 0;
        let intervalId = setInterval(() => {
            attemptCount++;
            console.info(`🔄 Tentative ${attemptCount}/50`);
            
            try {
                addEmojisToCalendar();
            } catch (error) {
                console.error(`❌ Erreur lors de la tentative ${attemptCount}:`, error);
            }
            
            if (attemptCount >= 50) {
                clearInterval(intervalId);
                console.warn("⚠️ Arrêt après 50 tentatives");
            }
        }, 100);
        
        // Nettoyage après 5 secondes
        setTimeout(() => {
            clearInterval(intervalId);
            console.info("🧹 Nettoyage de l'intervalle");
        }, 3000);
    }

    init();

})();