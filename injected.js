(function () {
    let iframe = document.createElement("iframe");
    document.body.appendChild(iframe);
    iframe.contentWindow.console.log("[DEBUG] (injected) loaded");

    let oldcode = null;

    function waitForSRH() {
        const code = window.srh?.vueApp?.store?._modules?.root?._children?.root?.state?.activeEcran?.item?.code;

        if (code && code != oldcode) {
            oldcode = code;
            iframe.contentWindow.console.log("[DEBUG] code: " + code);
            window.postMessage({ source: "concorde", codeSRH: code }, "*");
        }
    }

    setInterval(waitForSRH, 100);
})();
