(function () {
    const module_name = "injected";
    let iframe = document.createElement("iframe");
    document.body.appendChild(iframe);
    console.log = iframe.contentWindow.console.log;
    console.debug = function(...data) { console.log("[DEBUG] (module:" + module_name + ") " + data); }
    console.error = function(...data) { console.log("[ERROR] (module:" + module_name + ") " + data); }
    console.info = function(...data) { console.log("[INFO] (module:" + module_name + ") " + data); }
    console.ok = function(...data) { console.log("[ OK ] (module:" + module_name + ") " + data); }

    console.debug("loaded");

    // let s = document.createElement("script");
    // s.src = "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js";
    // document.head.appendChild(s);
    console.debug("lib added");

    let oldcode = null;

    function waitForSRH() {
        const code = window.srh?.vueApp?.store?._modules?.root?._children?.root?.state?.activeEcran?.item?.code;

        if (code && code != oldcode) {
            oldcode = code;
            console.debug("code: " + code);

            if (document.getElementById("calendar-module")) document.getElementById("calendar-module").remove();

            window.postMessage({ source: "concorde", codeSRH: code }, "*");
        }
    }

    setInterval(waitForSRH, 100);
})();
