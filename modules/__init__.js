(function () {
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
                                        opt.innerHTML = option;
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

    // Fonction pour afficher la popup
    function showPopup(message, type = "success") {
        // Supprimer les anciennes popups
        const existingPopup = document.querySelector('.ticket-popup');
        if (existingPopup) {
            existingPopup.remove();
        }
        
        // Créer la popup
        const popup = document.createElement('div');
        popup.className = 'ticket-popup';
        popup.innerHTML = message;
        
        // Styles de base
        popup.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease-in-out;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        // Couleurs selon le type
        if (type === "success") {
            popup.style.backgroundColor = "#d4edda";
            popup.style.color = "#155724";
            popup.style.border = "1px solid #c3e6cb";
        } else if (type === "error") {
            popup.style.backgroundColor = "#f8d7da";
            popup.style.color = "#721c24";
            popup.style.border = "1px solid #f5c6cb";
        }
        
        // Ajouter au DOM
        document.body.appendChild(popup);
        
        // Animation d'entrée
        setTimeout(() => {
            popup.style.transform = "translateX(0)";
        }, 100);
        
        // Suppression automatique après 3 secondes
        setTimeout(() => {
            popup.style.transform = "translateX(100%)";
            setTimeout(() => {
                if (popup.parentNode) {
                    popup.parentNode.removeChild(popup);
                }
            }, 300);
        }, 3000);
    }

    // Fonction pour afficher le compteur de caractères (optionnel)
    function updateCharacterCounter() {
        const description = document.getElementById("ticket-description");
        if (!description) return;
        
        const currentLength = description.value.length;
        let counter = document.getElementById("ticket-char-counter");
        
        if (!counter) {
            counter = document.createElement('div');
            counter.id = "ticket-char-counter";
            counter.style.cssText = `
                font-size: 12px;
                color: #666;
                margin-top: 5px;
                text-align: right;
            `;
            description.parentNode.appendChild(counter);
        }
        
        counter.textContent = `${currentLength}/200 caractères`;
        
        if (currentLength < 10) {
            counter.style.color = "#dc3545";
        } else if (currentLength > 180) {
            counter.style.color = "#fd7e14";
        } else {
            counter.style.color = "#28a745";
        }
    }

    function defineVariables() {

        // Récupérer l'identifiant de l'utilisateur
        userID = window.sha256(srh.user.nom.toLowerCase()) + "g" + window.sha256(srh.user.prenom.toLowerCase()) + "g" + window.sha256(srh.user.id);

        // Structure de données pour la configuration
        initroot = [
            {
                title: "Accueil",
                idaff: {
                    title: "Affichage",
                    idesc: {
                        type: "paragraphe",
                        value: "Modifier les paramètres d'affichage",
                    },
                    "ew": {
                        type: "checkbox",
                        label: "Activer le widget de temps",
                        checked: true,
                    },
                    "url-bg-image": {
                        type: "text",
                        label: "URL de l'image de fond ou la couleur en hexadécimal",
                        value: "",
                    },
                    "to": {
                        type: "select",
                        label: "Taux de transparence des box",
                        options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"],
                    },
                },
                idwidget: {
                    title: "Widget", 
                    "pw": {
                        type: "select",
                        label: "Position du widget",
                        options: ["1", "2", "3", "3", "4", "5", "6"],
                    },

                },
            },
            {
                title: "Mes pointages",
                idfilters: {
                    title: "Affichage",
                    idesc: {
                        type: "paragraphe",
                        value: "Définir les éléments à afficher ou non",
                    },
                    "afch-hj": {
                        type: "checkbox",
                        label: "Heures effectuées par jour",
                        checked: true,
                    },
                    "afch-bhj": {
                        type: "checkbox",
                        label: "Balance d'heures du jour",
                        checked: true,
                    },
                    "afch-hs": {
                        type: "checkbox",
                        label: "Heures effectuées par semaine",
                        checked: true,
                    },
                    "afch-bhs": {
                        type: "checkbox",
                        label: "Balance d'heures de la semaine",
                        checked: true,
                    },
                    "afch-if": {
                        type: "checkbox",
                        label: "Image correspondant au jour ferié",
                        checked: true,
                    },
                    "afch-itt": {
                        type: "checkbox",
                        label: "Icone de télétravail",
                        checked: true,
                    },
                    "afch-jc": {
                        type: "checkbox",
                        label: "Jour de congé",
                        checked: true,
                    },
                },
                idmisc: {
                    title: "Divers",
                    "nbh": {
                        type: "text",
                        label: "Nombre par semaine",
                        value: "38",
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
                            if (window.is_locked_btn_send_ticket) return;
                            
                            // Validation de la longueur du message
                            const description = document.getElementById("ticket-description").value.trim();
                            if (description.length < 10) {
                                showPopup("Le message doit contenir au moins 10 caractères", "error");
                                return;
                            }
                            if (description.length > 1200) {
                                showPopup("Le message ne peut pas dépasser 1200 caractères", "error");
                                return;
                            }
                            
                            window.is_locked_btn_send_ticket = true;
                            
                            if (srh.user.sal.tables.s1adr == null || srh.user.sal.tables.s1adr == undefined) {
                                let data = getinfo();
                                srh.user.sal.tables.s1adr = data["response"]["s1adr"];
                            }
                            
                            window.postMessage({
                                source: "concorde",
                                webhook: document.getElementById("ticket-type").value[0],
                                description: description,
                                name: srh.user.prenom + " " + srh.user.nom,
                                email: srh.user.sal.tables.s1adr.rows[0].adrmail.val,
                                id: userID
                            }, "*");
                            
                            // Afficher la popup de succès
                            showPopup("Ticket envoyé avec succès !", "success");
                            
                            // Vider le champ
                            document.getElementById("ticket-description").value = "";
                            
                            setTimeout(() => {
                                window.is_locked_btn_send_ticket = false;
                            }, 2000);
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
                        value: "Pour toutes demande vous pouvez me contacter à l'adresse e-mail suivante: <a href=\"mailto:concorde.algam@laposte.net\"><strong>concorde.algam@laposte.net</strong></a><br><br>Auteur: <strong>Kélian M.</strong><br>Version: <strong>1.0</strong><br>Identifiant: <strong>" + userID + "</strong>"
                    }
                }
            }
        ];

        // Ajouter l'événement pour le compteur (à appeler lors de l'initialisation)
        document.addEventListener('DOMContentLoaded', function() {
            const description = document.getElementById("ticket-description");
            if (description) {
                description.addEventListener('input', updateCharacterCounter);
                updateCharacterCounter(); // Initialiser le compteur
            }
        });
    }

    function saveParam() {
        let p = [
            document.getElementById("ew").checked,         // Activer le widget de temps
            document.getElementById("url-bg-image").value, // URL de l'image de fond ou la couleur en hexadécimal
            document.getElementById("to").value,           // Taux de transparence des box
            document.getElementById("pw").value,           // Position du widget
            document.getElementById("afch-hj").checked,    // Heures effectuées par jour
            document.getElementById("afch-bhj").checked,   // Balance d'heures du jour
            document.getElementById("afch-hs").checked,    // Heures effectuées par semaine
            document.getElementById("afch-bhs").checked,   // Balance d'heures de la semaine
            document.getElementById("afch-if").checked,    // Image correspondant au jour ferié
            document.getElementById("afch-itt").checked,   // Icone de télétravail
            document.getElementById("afch-jc").checked,    // Jour de congé
            document.getElementById("nbh").value,          // Nombre par semaine
        ];
        localStorage.setItem("crd-param", btoa(p.join("<crd>")));
    }

    function loadParam() {
        if (localStorage.getItem("crd-param")) {
            let p = atob(localStorage.getItem("crd-param")).split("<crd>");
            document.getElementById("ew").checked = p[0] == "true" ? true : false       // Activer le widget de temps
            document.getElementById("url-bg-image").value = p[1]  // URL de l'image de fond ou la couleur en hexadécimal
            document.getElementById("to").value = p[2]  // Taux de transparence des box
            document.getElementById("pw").value = p[3]  // Position du widget
            document.getElementById("afch-hj").checked = p[4] == "true" ? true : false  // Heures effectuées par jour
            document.getElementById("afch-bhj").checked = p[5] == "true" ? true : false // Balance d'heures du jour
            document.getElementById("afch-hs").checked = p[6] == "true" ? true : false  // Heures effectuées par semaine
            document.getElementById("afch-bhs").checked = p[7] == "true" ? true : false // Balance d'heures de la semaine
            document.getElementById("afch-if").checked = p[8] == "true" ? true : false  // Image correspondant au jour ferié
            document.getElementById("afch-itt").checked = p[9] == "true" ? true : false // Icone de télétravail
            document.getElementById("afch-jc").checked = p[10] == "true" ? true : false // Jour de congé
            document.getElementById("nbh").value = p[11]  // Nombre par semaine
        } else {
            localStorage.setItem("crd-param", "salut");
            loadParam();
        }
    }

    // Fonction pour fermer le panneau de configuration
    function fermerPanneauConfig() {
        saveParam();
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
                loadParam();
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
