(function () {
    const module_name = "__init__";
    let iframe = document.createElement("iframe");
    document.body.appendChild(iframe);
    console.log = iframe.contentWindow.console.log;
    console.debug = function(...data) { console.log("[DEBUG] " + module_name + " " + data); }
    console.debug("loaded");

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
                                case "checkbox":
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

                                case "select":
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

                                case "text":
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

                                case "paragraphe":
                                    const paragraphe = document.createElement("p");
                                    paragraphe.innerHTML = param.value;
                                    paragraphe.style.margin = "0 0 10px 0";
                                    paragraphe.style.color = "#666";
                                    paragraphe.style.fontStyle = "italic";

                                    paramDiv.style.display = "block"; // Changer l'affichage pour un paragraphe
                                    paramDiv.appendChild(paragraphe);
                                    break;

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

    // Récupérer l'identifiant de l'utilisateur
    const userID = CryptoJS.SHA256(srh.user.nom + srh.user.prenom + "|" + srh.user.id).toString(CryptoJS.enc.Hex);

    // Structure de données pour la configuration
    const initroot = [
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
            title: "Information", 
            idinfo: {
                idinfodesc: {
                    type: "paragraphe", 
                    value: "Pour toutes demande vous pouvez me contacter à l'adresse e-mail suivante: <strong>concorde.algam@laposte.net</strong><br><br>Version: 1.0<br>Identifiant: " + userID
                }
            }
        }
    ];

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
        icon.style.backgroundImage = "url(%file.concorde-nbg-shadow.png%)";
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
            iconMenuBar();
        } else setTimeout(() => init(), 100);
    }

    init();
})();

// activate
// let elm = document.querySelector(`div[data-cy="CsMenuBar-folded-item-concorde"]`);
// if (elm) elm.setAttribute("class", "cs-menu-bar-item cs-menu-bar-item-active");

// desactivate
// let elm = document.querySelector(`div[data-cy="CsMenuBar-folded-item-concorde"]`);
// if (elm) elm.setAttribute("class", "cs-menu-bar-item");
