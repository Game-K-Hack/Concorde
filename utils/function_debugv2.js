// Configuration du logging sécurisé
var iframe = document.createElement('iframe');
document.body.appendChild(iframe);
const safeConsole = iframe.contentWindow.console;

// Configuration globale du debugger
const DEBUG_CONFIG = {
    maxDepth: 5,
    logLevel: 'info', // 'debug', 'info', 'warn', 'error'
    showReturnValues: true,
    showExecutionTime: true,
    showStackTrace: false,
    filterPatterns: [], // Patterns à ignorer (regex)
    onlyPatterns: [], // Ne logger que ces patterns (regex)
    colorize: true
};

// Couleurs pour le logging
const COLORS = {
    call: '#2196F3',
    return: '#4CAF50',
    error: '#F44336',
    time: '#FF9800',
    path: '#9C27B0'
};

function deepDebug(obj, options = {}) {
    const config = { ...DEBUG_CONFIG, ...options };
    const visited = new WeakSet();
    const originalFunctions = new WeakMap();
    
    function shouldLog(functionName, path) {
        // Filtrer selon les patterns
        if (config.filterPatterns.length > 0) {
            if (config.filterPatterns.some(pattern => 
                new RegExp(pattern).test(functionName) || 
                new RegExp(pattern).test(path)
            )) {
                return false;
            }
        }
        
        if (config.onlyPatterns.length > 0) {
            return config.onlyPatterns.some(pattern => 
                new RegExp(pattern).test(functionName) || 
                new RegExp(pattern).test(path)
            );
        }
        
        return true;
    }
    
    function formatValue(value, maxLength = 100) {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        
        let str;
        if (typeof value === 'string') {
            str = `"${value}"`;
        } else if (typeof value === 'object') {
            try {
                str = JSON.stringify(value, null, 0);
            } catch (e) {
                str = '[Circular/Non-serializable]';
            }
        } else {
            str = String(value);
        }
        
        return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
    }
    
    function logWithColor(message, color, level = 'info') {
        if (config.colorize && safeConsole.log.toString().includes('[native code]')) {
            safeConsole[level](`%c${message}`, `color: ${color}; font-weight: bold;`);
        } else {
            safeConsole[level](message);
        }
    }
    
    function wrapFunction(originalFunc, functionName, objectPath, parentObject = null) {
        if (originalFunctions.has(originalFunc)) {
            return originalFunctions.get(originalFunc);
        }
        
        const wrappedFunction = function (...args) {
            const fullPath = objectPath ? `${objectPath}.${functionName}` : functionName;
            
            if (!shouldLog(functionName, fullPath)) {
                return originalFunc.apply(this, args);
            }
            
            const startTime = performance.now();
            const callId = Math.random().toString(36).substr(2, 9);
            
            // Log de l'appel
            const argsStr = args.map(arg => formatValue(arg)).join(', ');
            logWithColor(
                `🔵 [${callId}] ${fullPath}(${argsStr})`,
                COLORS.call
            );
            
            if (config.showStackTrace) {
                const stack = new Error().stack;
                safeConsole.groupCollapsed('Stack Trace');
                safeConsole.log(stack);
                safeConsole.groupEnd();
            }
            
            try {
                // TOUJOURS utiliser 'this' pour préserver le contexte d'appel
                const result = originalFunc.apply(this, args);
                const endTime = performance.now();
                
                // Log du résultat
                if (config.showReturnValues) {
                    logWithColor(
                        `🟢 [${callId}] ${fullPath} → ${formatValue(result)}`,
                        COLORS.return
                    );
                }
                
                if (config.showExecutionTime) {
                    logWithColor(
                        `⏱️  [${callId}] Temps d'exécution: ${(endTime - startTime).toFixed(2)}ms`,
                        COLORS.time
                    );
                }
                
                return result;
            } catch (error) {
                const endTime = performance.now();
                
                logWithColor(
                    `🔴 [${callId}] ${fullPath} → ERREUR: ${error.message}`,
                    COLORS.error,
                    'error'
                );
                
                if (config.showExecutionTime) {
                    logWithColor(
                        `⏱️  [${callId}] Temps avant erreur: ${(endTime - startTime).toFixed(2)}ms`,
                        COLORS.time
                    );
                }
                
                // Debug du contexte
                safeConsole.group(`🔍 Debug contexte pour ${fullPath}`);
                safeConsole.log('this:', this);
                safeConsole.log('parentObject:', parentObject);
                safeConsole.log('Propriétés de this:', this ? Object.getOwnPropertyNames(this) : 'this is null');
                if (this && this.constructor) {
                    safeConsole.log('Constructor:', this.constructor.name);
                }
                safeConsole.groupEnd();
                
                throw error;
            }
        };
        
        // Copier toutes les propriétés de la fonction originale
        Object.setPrototypeOf(wrappedFunction, Object.getPrototypeOf(originalFunc));
        Object.defineProperty(wrappedFunction, 'name', { 
            value: originalFunc.name || functionName,
            configurable: true
        });
        Object.defineProperty(wrappedFunction, 'length', { 
            value: originalFunc.length,
            configurable: true
        });
        wrappedFunction.toString = () => originalFunc.toString();
        
        // Copier les propriétés personnalisées
        for (const prop of Object.getOwnPropertyNames(originalFunc)) {
            if (prop !== 'name' && prop !== 'length' && prop !== 'prototype') {
                try {
                    wrappedFunction[prop] = originalFunc[prop];
                } catch (e) {
                    // Ignorer les propriétés non-writable
                }
            }
        }
        
        originalFunctions.set(originalFunc, wrappedFunction);
        return wrappedFunction;
    }
    
    function debugObject(target, visited, depth = 0, path = '') {
        if (target === null || typeof target !== "object") {
            return target;
        }
        
        if (visited.has(target)) {
            return target;
        }
        
        if (depth > config.maxDepth) {
            return target;
        }
        
        visited.add(target);
        
        // Obtenir toutes les propriétés (enumérables et non-enumérables)
        const allKeys = new Set([
            ...Object.getOwnPropertyNames(target),
            ...Object.keys(target)
        ]);
        
        for (const key of allKeys) {
            try {
                const descriptor = Object.getOwnPropertyDescriptor(target, key);
                if (!descriptor) continue;
                
                const currentPath = path ? `${path}.${key}` : key;

                safeConsole.log(currentPath);
                
                if (descriptor.value && typeof descriptor.value === "function") {
                    // Ne pas wrapper si la fonction a déjà été wrappée
                    if (originalFunctions.has(descriptor.value) || currentPath == "db.Contrat" || currentPath == "db.Salarie" || currentPath == "soldes.loadSolde" || currentPath == "db.getTabMatricule") {
                        continue;
                    }
                    
                    // Wrapper les fonctions
                    const wrappedFunc = wrapFunction(descriptor.value, key, path, target);
                    
                    try {
                        if (descriptor.writable !== false && descriptor.configurable !== false) {
                            // Utiliser Object.defineProperty pour préserver le contexte
                            Object.defineProperty(target, key, {
                                value: wrappedFunc,
                                writable: descriptor.writable,
                                enumerable: descriptor.enumerable,
                                configurable: descriptor.configurable
                            });
                        }
                    } catch (e) {
                        safeConsole.warn(`Impossible de wrapper ${currentPath}:`, e.message);
                    }
                    
                } else if (descriptor.get && typeof descriptor.get === "function") {
                    // Wrapper les getters en préservant le contexte
                    const originalGetter = descriptor.get;
                    const wrappedGetter = wrapFunction(originalGetter, `get ${key}`, path, target);
                    
                    try {
                        Object.defineProperty(target, key, {
                            ...descriptor,
                            get: wrappedGetter
                        });
                    } catch (e) {
                        safeConsole.warn(`Impossible de wrapper le getter ${currentPath}:`, e.message);
                    }
                    
                } else if (descriptor.set && typeof descriptor.set === "function") {
                    // Wrapper les setters en préservant le contexte
                    const originalSetter = descriptor.set;
                    const wrappedSetter = wrapFunction(originalSetter, `set ${key}`, path, target);
                    
                    try {
                        Object.defineProperty(target, key, {
                            ...descriptor,
                            set: wrappedSetter
                        });
                    } catch (e) {
                        safeConsole.warn(`Impossible de wrapper le setter ${currentPath}:`, e.message);
                    }
                    
                } else if (descriptor.value && typeof descriptor.value === "object" && descriptor.value !== null) {
                    // Récursion pour les objets
                    debugObject(descriptor.value, visited, depth + 1, currentPath);
                }
                
            } catch (e) {
                // Propriété inaccessible
                if (config.logLevel === 'debug') {
                    safeConsole.warn(`Propriété inaccessible: ${path ? path + '.' : ''}${key}`, e.message);
                }
            }
        }
        
        return target;
    }
    
    safeConsole.log('🚀 Début du debug pour:', obj);
    const result = debugObject(obj, visited);
    safeConsole.log('✅ Debug configuré avec succès');
    
    return result;
}

// Fonction utilitaire pour configurer le debug
function configureDebug(newConfig) {
    Object.assign(DEBUG_CONFIG, newConfig);
    safeConsole.log('Configuration du debug mise à jour:', DEBUG_CONFIG);
}

// Fonction pour désactiver le debug (restaurer les fonctions originales)
function disableDebug(obj) {
    // Cette fonctionnalité nécessiterait un tracking plus complexe
    safeConsole.warn('La désactivation du debug n\'est pas encore implémentée dans cette version');
}

// Fonction utilitaire pour tester une fonction spécifique
function testFunction(obj, functionName) {
    if (!obj || !obj[functionName] || typeof obj[functionName] !== 'function') {
        safeConsole.error(`Fonction ${functionName} non trouvée sur l'objet`);
        return;
    }
    
    const originalFunc = obj[functionName];
    safeConsole.log(`🧪 Test de ${functionName}:`);
    safeConsole.log('- Fonction originale:', originalFunc);
    safeConsole.log('- Contexte (obj):', obj);
    safeConsole.log('- Propriétés de obj:', Object.getOwnPropertyNames(obj));
    
    // Test d'appel direct
    try {
        safeConsole.log('- Test d\'appel direct...');
        const result = originalFunc.call(obj);
        safeConsole.log('✅ Appel direct réussi:', result);
    } catch (e) {
        safeConsole.error('❌ Appel direct échoué:', e.message);
    }
}

// Exemples d'utilisation:
deepDebug(window.srh);
// deepDebug(window.srh, { maxDepth: 2, showExecutionTime: false });
// configureDebug({ filterPatterns: ['internal', 'private'] });
// configureDebug({ onlyPatterns: ['search', 'fetch'] });
// testFunction(db, 'getContrat'); // Pour tester une fonction spécifique