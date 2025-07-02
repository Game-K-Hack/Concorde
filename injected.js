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

            window.fermerPanneauConfig();

            if (document.getElementById("calendar-module")) document.getElementById("calendar-module").remove();

            window.postMessage({ source: "concorde", codeSRH: code }, "*");
        } else if (code == "accueil" && !welcomeWaiting) {
            window.postMessage({ source: "concorde", codeSRH: code }, "*");
            welcomeWaiting = true;
            setTimeout(() => {welcomeWaiting = false;}, "1000");
        }
    }

    setInterval(waitForSRH, 100);
})();
