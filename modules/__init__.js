(function () {
    let iframe = document.createElement("iframe");
    document.body.appendChild(iframe);
    iframe.contentWindow.console.log("[DEBUG] (module:__init__) loaded");

    // Fonction pour créer et afficher le panneau de configuration
    function afficherPanneauConfig() {
        let elm = document.querySelector(`div[data-cy="CsMenuBar-folded-item-concorde"]`);
        if (elm) elm.setAttribute("class", "cs-menu-bar-item cs-menu-bar-item-active");
        // Vérifier si le panneau existe déjà et le supprimer si c'est le cas
        const panneauExistant = document.getElementById(
            "panneau-config-complet"
        );
        if (panneauExistant) {
            panneauExistant.remove();
        }

        // Obtenir les dimensions du contenu principal pour adapter notre panneau
        const mainContent =
            document.getElementById("middle").querySelector(`div[class="middlePart"] div[id="main-tabs"]`) ||
            document.getElementById("main-tabs");
        if (!mainContent) {
            console.error(
                "Impossible de trouver l'élément principal du contenu"
            );
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
        btnFermer.onclick = fermerPanneauConfig;

        enTete.appendChild(titre);
        enTete.appendChild(btnFermer);
        panneauConfig.appendChild(enTete);

        // Corps du panneau de configuration
        const corpsConfig = document.createElement("div");
        corpsConfig.style.padding = "20px";
        corpsConfig.style.flex = "1";
        corpsConfig.style.overflow = "auto";

        // Création d'une boîte de contenu similaire à celle que vous avez dans votre interface
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
        sectionIcon.style.backgroundImage =
            'url("../img/icon/blanc-16x16/parametre-3.png")';

        const sectionTitle = document.createElement("div");
        sectionTitle.className = "title";
        sectionTitle.innerHTML = "<span>Paramètres généraux</span>";

        csTop.appendChild(sectionIcon);
        csTop.appendChild(sectionTitle);
        csBox.appendChild(csTop);

        // Contenu de la boîte
        const csContent = document.createElement("div");
        csContent.className = "content";
        csContent.style.padding = "15px";

        // Groupe de paramètres 1
        const groupe1 = createParamGroup("Affichage", [
            {
                type: "checkbox",
                label: "Afficher les utilisateurs inactifs",
                id: "show-inactive",
                checked: false,
            },
            {
                type: "checkbox",
                label: "Mode compact",
                id: "compact-mode",
                checked: true,
            },
            {
                type: "select",
                label: "Thème",
                id: "theme-select",
                options: ["Défaut", "Sombre", "Clair", "Personnalisé"],
            },
        ]);

        // Groupe de paramètres 2
        const groupe2 = createParamGroup("Données", [
            {
                type: "checkbox",
                label: "Synchronisation automatique",
                id: "auto-sync",
                checked: true,
            },
            {
                type: "select",
                label: "Fréquence de rafraîchissement",
                id: "refresh-rate",
                options: [
                    "30 secondes",
                    "1 minute",
                    "5 minutes",
                    "15 minutes",
                    "30 minutes",
                    "1 heure",
                ],
            },
            {
                type: "text",
                label: "Nombre maximal d'éléments",
                id: "max-items",
                value: "100",
            },
        ]);

        // Groupe de paramètres 3
        const groupe3 = createParamGroup("Filtres par défaut", [
            { type: "checkbox", label: "Nom", id: "filter-nom", checked: true },
            {
                type: "checkbox",
                label: "Prénom",
                id: "filter-prenom",
                checked: true,
            },
            {
                type: "checkbox",
                label: "Société",
                id: "filter-societe",
                checked: false,
            },
            {
                type: "checkbox",
                label: "Emploi",
                id: "filter-emploi",
                checked: false,
            },
            {
                type: "checkbox",
                label: "Établissement",
                id: "filter-etablissement",
                checked: false,
            },
        ]);

        csContent.appendChild(groupe1);
        csContent.appendChild(groupe2);
        csContent.appendChild(groupe3);
        csBox.appendChild(csContent);

        corpsConfig.appendChild(csBox);

        // Zone des boutons d'action en bas
        const zoneActions = document.createElement("div");
        zoneActions.style.padding = "15px 20px";
        zoneActions.style.backgroundColor = "#fff";
        zoneActions.style.borderTop = "1px solid #ddd";
        zoneActions.style.display = "flex";
        zoneActions.style.justifyContent = "flex-end";
        zoneActions.style.gap = "10px";

        const btnAnnuler = document.createElement("button");
        btnAnnuler.textContent = "Annuler";
        btnAnnuler.style.padding = "8px 16px";
        btnAnnuler.style.backgroundColor = "#f0f0f0";
        btnAnnuler.style.border = "1px solid #ddd";
        btnAnnuler.style.borderRadius = "4px";
        btnAnnuler.style.cursor = "pointer";
        btnAnnuler.onclick = fermerPanneauConfig;

        const btnAppliquer = document.createElement("button");
        btnAppliquer.textContent = "Appliquer";
        btnAppliquer.style.padding = "8px 16px";
        btnAppliquer.style.backgroundColor = "#4285f4";
        btnAppliquer.style.color = "white";
        btnAppliquer.style.border = "none";
        btnAppliquer.style.borderRadius = "4px";
        btnAppliquer.style.cursor = "pointer";
        btnAppliquer.onclick = () => {
            // Logique pour sauvegarder les configurations
            console.log("Configuration appliquée !");
            fermerPanneauConfig();
        };

        zoneActions.appendChild(btnAnnuler);
        zoneActions.appendChild(btnAppliquer);

        panneauConfig.appendChild(corpsConfig);
        panneauConfig.appendChild(zoneActions);

        // Ajouter le panneau de configuration au contenu principal
        mainContent.appendChild(panneauConfig);

        // Fonction pour créer un groupe de paramètres
        function createParamGroup(titre, params) {
            const groupe = document.createElement("div");
            groupe.style.marginBottom = "20px";

            const titreGroupe = document.createElement("h3");
            titreGroupe.textContent = titre;
            titreGroupe.style.fontSize = "16px";
            titreGroupe.style.marginBottom = "10px";
            titreGroupe.style.borderBottom = "1px solid #eee";
            titreGroupe.style.paddingBottom = "5px";

            groupe.appendChild(titreGroupe);

            // Créer les paramètres dans le groupe
            params.forEach((param) => {
                const paramDiv = document.createElement("div");
                paramDiv.style.display = "flex";
                paramDiv.style.alignItems = "center";
                paramDiv.style.marginBottom = "8px";

                if (param.type === "checkbox") {
                    const input = document.createElement("input");
                    input.type = "checkbox";
                    input.id = param.id;
                    input.checked = param.checked;
                    input.style.marginRight = "10px";

                    const label = document.createElement("label");
                    label.htmlFor = param.id;
                    label.textContent = param.label;

                    paramDiv.appendChild(input);
                    paramDiv.appendChild(label);
                } else if (param.type === "select") {
                    const label = document.createElement("label");
                    label.htmlFor = param.id;
                    label.textContent = param.label + ": ";
                    label.style.marginRight = "10px";
                    label.style.width = "180px";

                    const select = document.createElement("select");
                    select.id = param.id;
                    select.style.padding = "4px";
                    select.style.borderRadius = "4px";
                    select.style.border = "1px solid #ddd";

                    param.options.forEach((option) => {
                        const opt = document.createElement("option");
                        opt.value = option.toLowerCase().replace(" ", "-");
                        opt.textContent = option;
                        select.appendChild(opt);
                    });

                    paramDiv.appendChild(label);
                    paramDiv.appendChild(select);
                } else if (param.type === "text") {
                    const label = document.createElement("label");
                    label.htmlFor = param.id;
                    label.textContent = param.label + ": ";
                    label.style.marginRight = "10px";
                    label.style.width = "180px";

                    const input = document.createElement("input");
                    input.type = "text";
                    input.id = param.id;
                    input.value = param.value;
                    input.style.padding = "4px";
                    input.style.borderRadius = "4px";
                    input.style.border = "1px solid #ddd";

                    paramDiv.appendChild(label);
                    paramDiv.appendChild(input);
                }

                groupe.appendChild(paramDiv);
            });

            return groupe;
        }

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
            if (document.querySelector(`div[data-cy="CsMenuBar-folded-item-concorde"]`).className.includes("cs-menu-bar-item-active")) {
                fermerPanneauConfig();
            } else {
                afficherPanneauConfig();
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
        document.querySelector(`div[class="cs-menu-bar-footer"]`).insertBefore(item, document.querySelector(`div[data-cy="CsMenuBar-folded-footer-item-profile"]`));
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
