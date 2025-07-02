(function () {
    const baseurl = "https://raw.githubusercontent.com/Game-K-Hack/Concorde/refs/heads/master/base";
    
    const module_name = "__init__";
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

    let initroot = [];
    let userID = "";

    // Fonction pour créer et afficher le panneau de configuration
    function afficherPanneauConfig(configData) {
        let elm = document.querySelector(`div[data-cy="CsMenuBar-folded-item-concorde"]`);
        if (elm) elm.setAttribute("class", "cs-menu-bar-item cs-menu-bar-item-active");

        // Vérifier si le panneau existe déjà et le supprimer si c'est le cas
        const panneauExistant = document.getElementById("panneau-config-complet");
        if (panneauExistant) { panneauExistant.remove(); }
        
        // Obtenir les dimensions du contenu principal pour adapter notre panneau
        const mainContent = document.getElementById("middle").querySelector(`div[class="middlePart"] div[id="main-tabs"]`) || document.getElementById("main-tabs");
        if (!mainContent) {
            console.error("Impossible de trouver l'élément principal du contenu");
            return;
        }
        
        // Création du panneau de configuration
        const panneauConfig = document.createElement("div");
        panneauConfig.id = "panneau-config-complet";
        
        // Styles pour que le panneau prenne tout l'espace disponible
        panneauConfig.style.position = "absolute";
        panneauConfig.style.top = "0";
        panneauConfig.style.left = "0";
        panneauConfig.style.width = "100%";
        panneauConfig.style.height = "100%";
        panneauConfig.style.zIndex = "999"; // Pour être au-dessus du contenu existant
        panneauConfig.style.backgroundColor = "#f5f5f5";
        panneauConfig.style.display = "flex";
        panneauConfig.style.flexDirection = "column";
        panneauConfig.style.overflow = "auto";
        
        // En-tête du panneau de configuration
        const enTete = document.createElement("div");
        enTete.style.display = "flex";
        enTete.style.justifyContent = "space-between";
        enTete.style.alignItems = "center";
        enTete.style.padding = "10px 20px";
        enTete.style.backgroundColor = "#fff";
        enTete.style.borderBottom = "1px solid #ddd";
        enTete.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
        
        // Titre du panneau
        const titre = document.createElement("h2");
        titre.textContent = "Configuration";
        titre.style.margin = "0";
        titre.style.fontSize = "18px";
        titre.style.fontWeight = "bold";
        titre.style.color = "#333";
        
        // Bouton de fermeture
        const btnFermer = document.createElement("button");
        btnFermer.textContent = "✕ Fermer";
        btnFermer.style.padding = "5px 10px";
        btnFermer.style.backgroundColor = "#f0f0f0";
        btnFermer.style.border = "1px solid #ddd";
        btnFermer.style.borderRadius = "4px";
        btnFermer.style.cursor = "pointer";
        btnFermer.style.fontSize = "14px";
        btnFermer.style.borderColor = "#fa3737";
        btnFermer.style.color = "#fa3737";
        btnFermer.onclick = fermerPanneauConfig;
        
        enTete.appendChild(titre);
        enTete.appendChild(btnFermer);
        panneauConfig.appendChild(enTete);
        
        // Corps du panneau de configuration
        const corpsConfig = document.createElement("div");
        corpsConfig.style.padding = "20px";
        corpsConfig.style.flex = "1";
        corpsConfig.style.overflow = "auto";
        
        // Parcourir la structure de données pour créer les sections
        configData.forEach((section, index) => {
            // Création d'une boîte de contenu pour la section
            const csBox = document.createElement("div");
            csBox.className = "cs-box";
            csBox.style.backgroundColor = "#fff";
            csBox.style.border = "1px solid #ddd";
            csBox.style.borderRadius = "4px";
            csBox.style.marginBottom = "20px";
            
            // En-tête de la boîte
            const csTop = document.createElement("div");
            csTop.className = "cs-top";
            csTop.style.padding = "10px";
            csTop.style.borderBottom = "1px solid #ddd";
            csTop.style.display = "flex";
            csTop.style.alignItems = "center";
            
            const sectionIcon = document.createElement("div");
            sectionIcon.className = "section-icon";
            sectionIcon.style.width = "16px";
            sectionIcon.style.height = "16px";
            sectionIcon.style.marginRight = "10px";
            sectionIcon.style.backgroundImage = 'url("../img/icon/blanc-16x16/parametre-3.png")';
            
            const sectionTitle = document.createElement("div");
            sectionTitle.className = "title";
            sectionTitle.innerHTML = `<span>${section.title}</span>`;
            
            csTop.appendChild(sectionIcon);
            csTop.appendChild(sectionTitle);
            csBox.appendChild(csTop);
            
            // Contenu de la boîte
            const csContent = document.createElement("div");
            csContent.className = "content";
            csContent.style.padding = "15px";
            
            // Parcourir les groupes de paramètres dans la section
            for (const groupKey in section) {
                if (groupKey !== "title") {
                    const group = section[groupKey];

                    // Vérifier si le groupe a un titre
                    let groupTitle = "";
                    if (group.title) {
                        groupTitle = group.title;
                    }

                    // Créer le groupe de paramètres
                    const paramGroup = document.createElement("div");
                    paramGroup.style.marginBottom = "20px";

                    // Ajouter le titre du groupe si présent
                    if (groupTitle) {
                        const titreGroupe = document.createElement("h3");
                        titreGroupe.textContent = groupTitle;
                        titreGroupe.style.fontSize = "16px";
                        titreGroupe.style.marginBottom = "10px";
                        titreGroupe.style.borderBottom = "1px solid #eee";
                        titreGroupe.style.paddingBottom = "5px";
                        paramGroup.appendChild(titreGroupe);
                    }

                    // Parcourir les paramètres du groupe
                    for (const paramKey in group) {
                        if (paramKey !== "title") {
                            const param = group[paramKey];

                            const paramDiv = document.createElement("div");
                            paramDiv.style.display = "flex";
                            paramDiv.style.alignItems = "flex-start";
                            paramDiv.style.marginBottom = "8px";

                            switch (param.type) {
                                case "checkbox": {
                                    const input = document.createElement("input");
                                    input.type = "checkbox";
                                    input.id = paramKey;
                                    input.checked = param.checked;
                                    input.style.marginRight = "10px";
                                    input.style.marginTop = "3px"; // Aligner avec le texte

                                    const label = document.createElement("label");
                                    label.htmlFor = paramKey;
                                    label.textContent = param.label;

                                    paramDiv.appendChild(input);
                                    paramDiv.appendChild(label);
                                    break;
                                }
                                case "select": {
                                    const labelSelect = document.createElement("label");
                                    labelSelect.htmlFor = paramKey;
                                    labelSelect.textContent = param.label + ": ";
                                    labelSelect.style.marginRight = "10px";
                                    labelSelect.style.width = "180px";

                                    const select = document.createElement("select");
                                    select.id = paramKey;
                                    select.style.padding = "4px";
                                    select.style.borderRadius = "4px";
                                    select.style.border = "1px solid #ddd";

                                    param.options.forEach((option) => {
                                        const opt = document.createElement("option");
                                        opt.value = option.toLowerCase().replace(" ", "-");
                                        opt.textContent = option;
                                        select.appendChild(opt);
                                    });

                                    paramDiv.appendChild(labelSelect);
                                    paramDiv.appendChild(select);
                                    break;
                                }
                                case "text": {
                                    const labelText = document.createElement("label");
                                    labelText.htmlFor = paramKey;
                                    labelText.textContent = param.label + ": ";
                                    labelText.style.marginRight = "10px";
                                    labelText.style.width = "180px";

                                    const inputText = document.createElement("input");
                                    inputText.type = "text";
                                    inputText.id = paramKey;
                                    inputText.value = param.value || "";
                                    inputText.style.padding = "4px";
                                    inputText.style.borderRadius = "4px";
                                    inputText.style.border = "1px solid #ddd";

                                    paramDiv.appendChild(labelText);
                                    paramDiv.appendChild(inputText);
                                    break;
                                }
                                case "textarea": {
                                    const labelTextArea = document.createElement("label");
                                    labelTextArea.htmlFor = paramKey;
                                    labelTextArea.textContent = param.label + ": ";
                                    labelTextArea.style.width = "180px";
                                    labelTextArea.style.display = "block";
                                    labelTextArea.style.marginBottom = "5px";
                            
                                    const textArea = document.createElement("textarea");
                                    textArea.id = paramKey;
                                    textArea.value = param.value || "";
                                    textArea.style.padding = "8px";
                                    textArea.style.borderRadius = "4px";
                                    textArea.style.border = "1px solid #ddd";
                                    textArea.style.width = "99%";
                                    textArea.style.minHeight = param.height || "100px";
                                    textArea.style.resize = param.resize || "vertical";

                                    if (param.placeholder) textArea.placeholder = param.placeholder;
                                    if (param.maxLength) textArea.maxLength = param.maxLength;
                                    if (param.rows) textArea.rows = param.rows;
                                    if (param.cols) textArea.cols = param.cols;
                            
                                    paramDiv.style.display = "block";
                                    paramDiv.appendChild(labelTextArea);
                                    paramDiv.appendChild(textArea);
                                    break;
                                }
                                case "paragraphe": {
                                    const paragraphe = document.createElement("p");
                                    paragraphe.innerHTML = param.value;
                                    paragraphe.style.margin = "0 0 10px 0";
                                    paragraphe.style.color = "#666";
                                    paragraphe.style.fontStyle = "italic";

                                    paramDiv.style.display = "block"; // Changer l'affichage pour un paragraphe
                                    paramDiv.appendChild(paragraphe);
                                    break;
                                }
                                case "button": {
                                    const button = document.createElement("button");
                                    button.textContent = param.label || "Bouton";
                                    button.id = paramKey;
                                    button.style.padding = "5px 10px";
                                    button.style.backgroundColor = "#f0f0f0";
                                    button.style.border = "1px solid #ddd";
                                    button.style.borderRadius = "4px";
                                    button.style.cursor = "pointer";
                                    button.style.fontSize = "14px";
                                    
                                    // Style spécifique si défini
                                    if (param.style) {
                                        if (param.style.borderColor) button.style.borderColor = param.style.borderColor;
                                        if (param.style.color) button.style.color = param.style.color;
                                        if (param.style.backgroundColor) button.style.backgroundColor = param.style.backgroundColor;
                                    }
                                    
                                    // Attacher la fonction onclick
                                    if (param.onClick && typeof window[param.onClick] === 'function') {
                                        button.onclick = window[param.onClick];
                                    } else if (param.onClickFn) {
                                        // Permet de passer une fonction directement
                                        button.onclick = param.onClickFn;
                                    } else {
                                        // Fonction par défaut
                                        button.onclick = function() {
                                            console.log("Bouton " + paramKey + " cliqué");
                                        };
                                    }
                                    
                                    // Possibilité d'ajouter une description
                                    if (param.description) {
                                        const desc = document.createElement("span");
                                        desc.textContent = param.description;
                                        desc.style.marginLeft = "10px";
                                        desc.style.fontSize = "12px";
                                        desc.style.color = "#666";
                                        
                                        paramDiv.appendChild(button);
                                        paramDiv.appendChild(desc);
                                    } else {
                                        paramDiv.appendChild(button);
                                    }
                                    break;
                                }
                                // Vous pouvez ajouter d'autres types ici si nécessaire
                            }

                            paramGroup.appendChild(paramDiv);
                        }
                    }

                    csContent.appendChild(paramGroup);
                }
            }

            csBox.appendChild(csContent);
            corpsConfig.appendChild(csBox);
        });
        
        panneauConfig.appendChild(corpsConfig);

        // Ajouter le panneau de configuration au contenu principal
        mainContent.appendChild(panneauConfig);
    }

    function getinfo() {
        let ctx = srh.getIdContext();
        let data = {
            script: "ws_readSalarie",
            mat: srh.user.id,
            ddeb: "1001-01-01",
            dfin: "9999-12-31",
            ddebcday: "1001-01-01",
            dfincday: "9999-12-31",
            tables: ["s1adr", "s1titretrav"],
            headerrows: true,
            idcontext: ctx,
            pversion: -1,
            lang: "fr",
            debug: false,
        };
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/smartw080/srh/smartrh/smartrh", false);
        xhr.setRequestHeader(
            "Content-Type",
            "application/x-www-form-urlencoded; charset=UTF-8"
        );
        xhr.send("ctx=" + encodeURIComponent(srh.ajax.buildWSParameter(data)));
        if (xhr.status == 200) {
            let data = JSON.parse(xhr.responseText.slice(1, -1));
            return data;
        }
    }

    function defineVariables() {

        // Récupérer l'identifiant de l'utilisateur
        userID = window.sha256(srh.user.nom.toLowerCase()) + "g" + window.sha256(srh.user.prenom.toLowerCase()) + "g" + window.sha256(srh.user.id);

        // Structure de données pour la configuration
        initroot = [
            {
                title: "Paramètres généraux",
                idaff: {
                    title: "Affichage",
                    idesc: {
                        type: "paragraphe",
                        value: "Modifier les paramètres d'affichage",
                    },
                    "show-inactive": {
                        type: "checkbox",
                        label: "Afficher les utilisateurs inactifs",
                        checked: false,
                    },
                    "compact-mode": {
                        type: "checkbox",
                        label: "Mode compact",
                        checked: true,
                    },
                    "theme-select": {
                        type: "select",
                        label: "Thème",
                        options: ["Défaut", "Sombre", "Clair", "Personnalisé"],
                    },
                },
                iddata: {
                    title: "Données",
                    idesc: {
                        type: "paragraphe",
                        value: "Paramètres de synchronisation des données",
                    },
                    "auto-sync": {
                        type: "checkbox",
                        label: "Synchronisation automatique",
                        checked: true,
                    },
                    "refresh-rate": {
                        type: "select",
                        label: "Fréquence de rafraîchissement",
                        options: [
                            "30 secondes",
                            "1 minute",
                            "5 minutes",
                            "15 minutes",
                            "30 minutes",
                            "1 heure",
                        ],
                    },
                    "max-items": {
                        type: "text",
                        label: "Nombre maximal d'éléments",
                        value: "100",
                    },
                },
            },
            {
                title: "Paramètres avancés",
                idfilters: {
                    title: "Filtres par défaut",
                    idesc: {
                        type: "paragraphe",
                        value: "Définir les filtres qui seront activés par défaut",
                    },
                    "filter-nom": {
                        type: "checkbox",
                        label: "Nom",
                        checked: true,
                    },
                    "filter-prenom": {
                        type: "checkbox",
                        label: "Prénom",
                        checked: true,
                    },
                    "filter-societe": {
                        type: "checkbox",
                        label: "Société",
                        checked: false,
                    },
                    "filter-emploi": {
                        type: "checkbox",
                        label: "Emploi",
                        checked: false,
                    },
                    "filter-etablissement": {
                        type: "checkbox",
                        label: "Établissement",
                        checked: false,
                    },
                },
                idmisc: {
                    title: "Divers",
                    idesc: {
                        type: "paragraphe",
                        value: "Autres paramètres qui seront définis très bientôt",
                    },
                },
            },
            {
                title: "Ticket", 
                idticket: {
                    "ticket-type": {
                        type: "select",
                        label: "Type du ticket",
                        options: ["Problème", "Question", "Suggestion"],
                    },
                    "ticket-description": {
                        type: "textarea", 
                        label: "Description", 
                        value: ""
                    }, 
                    "ticket-send": {
                        type: "button",
                        label: "Envoyer",
                        onClickFn: function() {
                            if (srh.user.sal.tables.s1adr == null || srh.user.sal.tables.s1adr == undefined) {
                                let data = getinfo();
                                srh.user.sal.tables.s1adr = data["response"]["s1adr"];
                            }
                            // window.postMessage({
                            //     source: "concorde",
                            //     webhook: document.getElementById("ticket-type").value[0], 
                            //     description: document.getElementById("ticket-description").value,
                            //     name: srh.user.prenom + " " + srh.user.nom,
                            //     email: srh.user.sal.tables.s1adr.rows[0].adrmail.val,
                            //     id: userID
                            // }, "*");
                            window.postMessage({
                                source: "concorde",
                                type: "DB_UPDATE_PROFILE", 
                                avatar: 1,
                                banner: 2,
                            }, "*");
                        },
                        style: { borderColor: "#4a90e2", color: "#4a90e2", backgroundColor: "#f5f9ff" },
                    }
                }
            },
            {
                title: "Information", 
                idinfo: {
                    idinfodesc: {
                        type: "paragraphe", 
                        value: "Pour toutes demande vous pouvez me contacter à l'adresse e-mail suivante: <strong>concorde.algam@laposte.net</strong><br><br>Version: 1.0<br>Identifiant: " + userID
                    }
                }
            }
        ];
    }

    // Fonction pour fermer le panneau de configuration
    function fermerPanneauConfig() {
        let elm = document.querySelector(`div[data-cy="CsMenuBar-folded-item-concorde"]`);
        if (elm) elm.setAttribute("class", "cs-menu-bar-item");
        const panneau = document.getElementById("panneau-config-complet");
        if (panneau) {
            panneau.remove();
        }
    }

    function iconMenuBar() {
        let item = document.createElement("div");
        item.setAttribute("data-cy", "CsMenuBar-folded-item-concorde");
        item.setAttribute("class", "cs-menu-bar-item");
        item.setAttribute("data-original-title", "null");
        item.addEventListener("click", (event) => {
            if (document.querySelector(`div[data-cy="CsMenuBar-folded-item-concorde"]`)
                        .className.includes("cs-menu-bar-item-active")) {
                fermerPanneauConfig();
            } else {
                console.debug("afficherPanneauConfig");
                afficherPanneauConfig(initroot);
            }
        });
        let icon = document.createElement("span");
        icon.setAttribute("data-cy", "CsMenuBar-CsIcon-light");
        icon.setAttribute("class", "cs-icon cs-menu-bar-item-icon");
        icon.style.height = "31px";
        icon.style.width = "50px";
        icon.style.backgroundImage = "url(\"%file.concorde-nbg-shadow.png%\")";
        icon.style.backgroundSize = "50px 31px";
        icon.style.transform = "translateX(calc(calc(-30px / 4) - 1px))";
        item.appendChild(icon);
        document.querySelector(`div[class="cs-menu-bar-footer"]`)
                .insertBefore(
                    item,
                    document.querySelector(`div[data-cy="CsMenuBar-folded-footer-item-profile"]`)
                );
    }

    function init() {
        let elm = document.querySelector(`div[data-cy="CsMenuBar-folded-footer-item-profile"]`);
        let cncd = document.querySelector(`div[data-cy="CsMenuBar-folded-item-concorde"]`);
        if (elm && (cncd == null || cncd == undefined)) {
            defineVariables();
            iconMenuBar();

            fetch(baseurl).then(response => {
                if (!response.ok) {
                    throw new Error(`Erreur HTTP : ${response.status}`);
                }
                return response.text();
            }).then(data => {
                window.dechiffrer(data, srh.data.client.lib).then(clair => {
                    window.postMessage({
                        source: "concorde",
                        type: "DB_CONNECT", 
                        prenom: srh.user.prenom,
                        nom: srh.user.nom,
                        mat: srh.user.id,
                        token: clair,
                    }, "*");
                    window.initCustomCard();
                });
            });

            document
                .querySelector(`div[class="cs-menu-bar-content"] div[data-cy="CsMenuBar-folded-item-accueil"]`)
                .addEventListener('click', function(e) {
                    fermerPanneauConfig();
                });

        } else setTimeout(() => init(), 100);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => init());
    } else {
        init();
    }

    window.fermerPanneauConfig = fermerPanneauConfig;

})();
