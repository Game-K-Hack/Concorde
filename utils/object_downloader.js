function deepsearch(o, visited = new Set()) {
    let r = {};

    // Cas de base: null
    if (o === null) {
        return null;
    }

    // Vérification du type
    if (typeof o !== "object") {
        return o;
    }

    // Détection de cycle
    if (visited.has(o)) {
        //console.log("[CYCLE DÉTECTÉ]");
        return null;
    }

    // Ajouter l'objet actuel à l'ensemble des objets visités
    visited.add(o);

    // Parcourir les propriétés
    for (const key of Object.keys(o)) {
        if (typeof o[key] === "object") {
            //console.log(o[key]);
            r[key] = deepsearch(o[key], visited);
        } else if (typeof o[key] === "function") {
            r[key] = "<function>";
        } else {
            r[key] = o[key];
        }
    }

    return r;
}

// Utilisation de la fonction et téléchargement du résultat
function saveAndDownloadJSON(data, filename = "data.json") {
    // Conversion de l'objet en chaîne JSON
    const jsonData = JSON.stringify(data);

    // Création d'un Blob contenant les données JSON
    const blob = new Blob([jsonData], { type: "application/json" });

    // Création d'une URL pour le Blob
    const url = URL.createObjectURL(blob);

    // Création d'un élément <a> pour déclencher le téléchargement
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;

    // Ajout temporaire de l'élément au document, clic, puis suppression
    document.body.appendChild(a);
    a.click();

    // Nettoyage
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

// Exécution de la recherche et téléchargement du résultat
saveAndDownloadJSON(deepsearch(srh), "deepsearch_result.json");
