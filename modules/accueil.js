(function () {
    let iframe = document.createElement("iframe");
    document.body.appendChild(iframe);
    iframe.contentWindow.console.log("[DEBUG] (module:accueil) loaded");

    function setBackground() {
        let elm = document.getElementById(`csAccuielContainer`);
        elm.style.backgroundImage = `url(%file.background.jpg%)`;
        elm.style.backgroundPosition = `center center`;
        elm.style.backgroundAttachment = `fixed`;
        elm.style.backgroundRepeat = `no-repeat`;
        elm.style.backgroundSize = `cover`;
    }

    function setStyle() {
        let tab = document.getElementById(`main-tabs`);
        tab.querySelector(`ul[class="ui-tabs-nav ui-corner-all ui-helper-reset ui-helper-clearfix ui-widget-header"]`).style.padding = `unset`;
        tab.style.minHeight = `100vh`;
        let feuilleDeStyle = document.styleSheets;
        for (let fi of feuilleDeStyle) {
            for (let ficss of fi.cssRules) {
                if (ficss.selectorText === ".cs-widget") {
                    ficss.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
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

    function saveHTML() {
        let content = `<!DOCTYPE html>\n` + document.querySelector("*").outerHTML;
        let contentbase64 = window.btoa(encodeURIComponent(content));
        localStorage.setItem("accueiliframe", contentbase64);
    }

    let htmlAlreadySave = false;

    function init() {
        if (!htmlAlreadySave) saveHTML();
        if (document.getElementById("calendar-module")) document.getElementById("calendar-module").remove();
        if (document.getElementById(`csAccuielContainer`) && document.getElementById(`main-tabs`)) {
            setBackground();
            setStyle();
            setEastLink();
        } else setTimeout(() => init(), 100);
    }

    init();
})();
