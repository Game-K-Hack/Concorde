var iframe = document.createElement('iframe');
document.body.appendChild(iframe);
console.log = iframe.contentWindow.console.log;

function deepdebug(o, visited = new Set(), depth = 0, maxDepth = 3) {
    if (o === null || typeof o !== "object") return o;
    if (visited.has(o)) return null;
    if (depth > maxDepth) return o;

    visited.add(o);

    for (const key of Object.keys(o)) {
        try {
            const val = o[key];
            if (typeof val === "function") {
                o[key] = function (...args) {
                    console.log(`Appel de ${key} avec les arguments:`, args);
                    let p = prompt("JSON :");
                    if (p.length === 0) {
                        p = args;
                    }
                    return val.apply(this, p);
                };
            } else if (typeof val === "object" && val !== null) {
                deepdebug(val, visited, depth + 1, maxDepth);
            }
        } catch (e) {
            // Si on ne peut pas accéder à la propriété, on ignore
            console.warn(`Propriété inaccessible: ${key}`);
        }
    }

    return o;
}

deepdebug(srh)
