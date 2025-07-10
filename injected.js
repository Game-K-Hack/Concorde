(function () {
    const module_name = "injected";
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

    console.debug("loaded");

    // let s = document.createElement("script");
    // s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js";
    // document.head.appendChild(s);
    // console.debug("lib added");

    let oldcode = null;

    let welcomeWaiting = false;

    function waitForSRH() {
        const code = window.srh?.vueApp?.store?._modules?.root?._children?.root?.state?.activeEcran?.item?.code;

        if (code && (code != oldcode)) {
            oldcode = code;
            console.debug("code: " + code);

            try {window.fermerPanneauConfig();} catch (e) {}

            if (document.getElementById("calendar-module")) document.getElementById("calendar-module").remove();

            window.postMessage({ source: "concorde", codeSRH: code }, "*");
        } else if (code == "accueil" && !welcomeWaiting) {
            window.postMessage({ source: "concorde", codeSRH: code }, "*");
            welcomeWaiting = true;
            setTimeout(() => {welcomeWaiting = false;}, "1000");
        }
    }

    function salut() {
        // Configuration
        const gifUrl = '%file.harlock.gif%?t=' + new Date().getTime();
        const popupWidth = 400;
        const popupHeight = 300;
        
        // Créer la popup
        function createGifPopup() {
            // Créer l'overlay de fond
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                z-index: 9999;
                display: flex;
                justify-content: center;
                align-items: center;
            `;
            
            // Créer le conteneur de la popup (sans contour)
            const popup = document.createElement('div');
            popup.style.cssText = `
                background: transparent;
                position: relative;
                max-width: 90%;
                max-height: 90%;
            `;
            
            // Créer un canvas pour contrôler le GIF
            const canvas = document.createElement('canvas');
            canvas.width = popupWidth;
            canvas.height = popupHeight;
            canvas.style.cssText = `
                display: block;
                max-width: 100%;
                max-height: 100%;
            `;
            
            // Créer l'image GIF
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            // Alternative plus simple : utiliser une image normale qui se transforme en statique
            const gifImg = document.createElement('img');
            gifImg.src = gifUrl;
            gifImg.style.cssText = `
                max-width: 100%;
                max-height: 100%;
                display: block;
            `;
            
            // Arrêter l'animation après un délai
            setTimeout(() => {
                // Remplacer par une version statique (première frame)
                const staticCanvas = document.createElement('canvas');
                const staticCtx = staticCanvas.getContext('2d');
                
                gifImg.onload = function() {
                    staticCanvas.width = gifImg.naturalWidth;
                    staticCanvas.height = gifImg.naturalHeight;
                    staticCtx.drawImage(gifImg, 0, 0);
                    
                    // Remplacer l'image par le canvas statique
                    popup.replaceChild(staticCanvas, gifImg);
                    staticCanvas.style.cssText = gifImg.style.cssText;
                };
            }, 3000); // Durée approximative du GIF
            
            // Événements de fermeture
            overlay.onclick = function(e) {
                if (e.target === overlay) {
                    closePopup();
                }
            };
            
            // Fermeture avec Escape
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    closePopup();
                }
            });
            
            function closePopup() {
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                }
            }
            
            // Assembler la popup
            popup.appendChild(gifImg); // Utiliser l'image GIF simple
            overlay.appendChild(popup);
            document.body.appendChild(overlay);
            
            // Optionnel : fermeture automatique après le GIF
            setTimeout(() => {
                closePopup();
            }, 1500); // Ferme après 1.5 secondes
        }
        
        // Lancer la popup
        createGifPopup();
    }

    var k = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65],
    n = 0;
    $(document).keydown(function (e) {
        if (e.keyCode === k[n++]) {
            if (n === k.length) {
                salut();
                n = 0;
                return false;
            }
        }
        else {
            n = 0;
        }
    });

    setInterval(waitForSRH, 100);
})();
