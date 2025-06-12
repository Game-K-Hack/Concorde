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

    function customMenu() {
        var popup = document.querySelector(`div[data-cy="CsDashboard-CsModal"]`);
        popup = popup.querySelector(`div[class="cs-popup-content"]`);
        if (popup.querySelector(`div[class="cs-addable-widget-wrapper"]`) == undefined) {
        popup.querySelector(`p`).remove()
        var c = document.createElement(`div`);
        c.className = "cs-addable-widget-wrapper"
        popup.append(c);
        }
        popup = popup.querySelector(`div[class="cs-addable-widget-wrapper"]`);

        if (document.getElementById("balance-widget") == undefined) {
            var d = document.createElement("div");
            d.className = "cs-addable-widget-container";
            d.id = "balance-widget";

            var t = document.createElement("h3");
            t.className = "cs-addable-widget-title";
            t.textContent = "Balance de temps";
            d.appendChild(t);

            var s = document.createElement("span");
            s.className = "cs-icon cs-addable-widget-image";
            var a = document.createAttribute("data-cy");
            a.value = "CsDashboard-CsModal-GenericPopup-CsIcon-default";
            s.setAttributeNode(a);
            s.style.height = "5.875rem";
            s.style.width = "10.125rem";
            s.style.maxHeight = "5.875rem";
            s.style.maxWidth = "10.125rem";
            s.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="width: 10.125rem; height: 5.875rem;"><path fill="currentColor" d="M3.5 20q-.213 0-.357-.143T3 19.5t.143-.357Q3.287 19 3.5 19h8V7.94q-.708-.128-1.25-.642T9.56 6H6.115l2.693 6.738q.105.237.111.486q.006.25-.044.491q-.225.92-1.103 1.41T6 15.615t-1.772-.49t-1.103-1.41q-.05-.242-.044-.491t.111-.486L5.885 6H4.5q-.213 0-.357-.143T4 5.5t.143-.357Q4.287 5 4.5 5h5.06q.165-.837.834-1.418T12 3t1.606.582T14.44 5h5.06q.213 0 .357.143T20 5.5t-.143.357Q19.713 6 19.5 6h-1.385l2.693 6.738q.105.237.111.486q.006.25-.044.491q-.225.92-1.103 1.41t-1.772.49t-1.772-.49t-1.103-1.41q-.05-.242-.044-.491t.111-.486L17.885 6H14.44q-.148.785-.69 1.298t-1.25.642V19h8q.213 0 .357.143T21 19.5t-.143.357Q20.713 20 20.5 20zm12.49-6.885h4.02L18 8.092zm-12 0h4.02L6 8.092zM12 7q.617 0 1.059-.441T13.5 5.5t-.441-1.059T12 4t-1.059.441T10.5 5.5t.441 1.059T12 7"/></svg>`;
            d.appendChild(s);

            var p = document.createElement("p");
            p.className = "cs-addable-widget-description";
            p.textContent = "Balance de temps";
            d.appendChild(p);

            d.addEventListener("click", function(e) {
                this.classList.toggle("is-selected-widget-to-add");
            });

            popup.appendChild(d);
        }
    }

    function saveHTML() {
        let content = `<!DOCTYPE html>\n` + document.querySelector("*").outerHTML;
        let contentbase64 = window.btoa(encodeURIComponent(content));
        localStorage.setItem("accueiliframe", contentbase64);
    }

    // let htmlAlreadySave = false;

    function init() {
        // if (!htmlAlreadySave) saveHTML();
        if (document.getElementById("calendar-module")) document.getElementById("calendar-module").remove();
        if (document.getElementById(`csAccuielContainer`) && document.getElementById(`main-tabs`)) {
            setBackground();
            setStyle();
            setEastLink();
        } else setTimeout(() => init(), 100);
    }

    init();
})();
