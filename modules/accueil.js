(function () {
    const module_name = "accueil";
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

    function setBackground() {
        let p = atob(localStorage.getItem("crd-param")).split("<crd>")[0];
        let elm = document.getElementById(`csAccuielContainer`);

        const isHexColor = /^(#|)([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/i.test(p);
        const isImageUrl = /^(https?:\/\/|\/|\.\/|\.\.\/|data:image\/)/i.test(p);

        if (isHexColor) {
            elm.style.backgroundImage = "";
            elm.style.backgroundColor = p.startsWith("#") ? p : "#" + p;
        } else if (isImageUrl) {
            elm.style.backgroundColor = "";
            elm.style.backgroundImage = `url(${p})`;
        } else {
            elm.style.backgroundColor = "";
            elm.style.backgroundImage = `url(%file.background.jpg%)`;
        }

        elm.style.backgroundPosition = `center center`;
        elm.style.backgroundAttachment = `fixed`;
        elm.style.backgroundRepeat = `no-repeat`;
        elm.style.backgroundSize = `cover`;
    }

    function setStyle() {
        let p = atob(localStorage.getItem("crd-param")).split("<crd>");
        p = 1 - (parseFloat(p[1]) / 100);
        let tab = document.getElementById(`main-tabs`);
        tab.querySelector(`ul[class="ui-tabs-nav ui-corner-all ui-helper-reset ui-helper-clearfix ui-widget-header"]`).style.padding = `unset`;
        tab.style.minHeight = `100vh`;
        let feuilleDeStyle = document.styleSheets;
        for (let fi of feuilleDeStyle) {
            for (let ficss of fi.cssRules) {
                if (ficss.selectorText === ".cs-widget") {
                    ficss.style.backgroundColor = `rgba(255, 255, 255, ${p})`;
                }
                if (ficss.selectorText === ".el-collapse-item__header") {
                    ficss.style.backgroundColor = "transparent";
                }
                if (ficss.selectorText === ".el-collapse-item__wrap") {
                    ficss.style.backgroundColor = "transparent";
                }
            }
        }
    }

    function setEastLink() {
        srh.data.modulesLibs.eastLinks_github = "GitHub"
        srh.ui.addEastLink("eastLinks_github", "script", "https://github.com/Game-K-Hack/");
        srh.tools.translate("#east-links");
    }

    function init() {
        if (document.getElementById("calendar-module")) document.getElementById("calendar-module").remove();
        if (document.getElementById(`csAccuielContainer`) && document.getElementById(`main-tabs`)) {
            setBackground();
            setStyle();
            setEastLink();
        } else setTimeout(() => init(), 100);
    }

    init();
})();
