(function () {
    const module_name = "wc_pointvirt";
    let iframe = document.createElement("iframe");
    document.body.appendChild(iframe);
    console.log = iframe.contentWindow.console.log;
    console.debug = function(...data) { console.log("[DEBUG] (module:" + module_name + ") " + data); }
    console.error = function(...data) { console.log("[ERROR] (module:" + module_name + ") " + data); }
    console.info = function(...data) { console.log("[INFO] (module:" + module_name + ") " + data); }
    console.ok = function(...data) { console.log("[ OK ] (module:" + module_name + ") " + data); }

    console.debug("loaded");

    // Configuration du calendrier
    const config = {
        startHour: 9,
        endHour: 18,
        hourStep: 1,
        days: [
            { name: "lundi", shortName: "Lun", date: "" },
            { name: "mardi", shortName: "Mar", date: "" },
            { name: "mercredi", shortName: "Mer", date: "" },
            { name: "jeudi", shortName: "Jeu", date: "" },
            { name: "vendredi", shortName: "Ven", date: "" },
            // { name: "samedi", shortName: "Sam", date: "" },
            // { name: "dimanche", shortName: "Dim", date: "" },
        ],
        colors: {
            rouge: "#ffd6d1",
            jaune: "#fafaa3",
            bleu: "#e2f8ff",
            vert: "#d1ffe6",
            conge: "#ffebe6",      // Couleur pour les congés
            ferie: "#f0e6ff"       // Couleur pour les jours fériés
        },
        numDays: 5,
        numHours: 10,
        timeHeight: "60px",
        calBgColor: "#f0f0fa",
        eventBorderColor: "#dcdcf0",
    };

    // Liste des jours fériés en France (format MM-DD)
    // const joursFeries = {
    //     "01-01": {"name":"Jour de l'an", "image":"%file.ferie/an.jpg%"},
    //     "05-01": {"name":"Fête du travail", "image":"%file.ferie/travail.jpg%"},
    //     "05-08": {"name":"Victoire 1945", "image":"%file.ferie/8mai.jpg%"},
    //     "07-14": {"name":"Fête nationale", "image":"%file.ferie/fetenationale.jpg%"},
    //     "08-15": {"name":"Assomption", "image":"%file.ferie/asumption.jpg%"},
    //     "11-01": {"name":"Toussaint", "image":"%file.ferie/toussaint.png%"},
    //     "11-11": {"name":"Armistice", "image":"%file.ferie/armistice.jpg%"},
    //     "12-25": {"name":"Noël", "image":"%file.ferie/noel.jpg%"}
    //     // TODO: il manque des jours férié
    //     // TODO: il manque les congés qui ne fonctionne pas
    // };
    const joursFeries = getHolidays();

    let currentWeekOffset = 0; // 0 = semaine actuelle, -1 = semaine précédente, +1 = semaine suivante

    // Fonction pour initialiser le calendrier
    function initCalendar() {
        // Mettre à jour les variables CSS
        const numHours = Math.ceil(
            (config.endHour - config.startHour) / config.hourStep
        );
        document.documentElement.style.setProperty("--numHours", numHours + 1); // +1 pour avoir de l'espace à la fin
        document.documentElement.style.setProperty("--startHour", config.startHour);
        document.documentElement.style.setProperty("--endHour", config.endHour);

        // Mettre à jour la date de chaque jour de la semaine
        const daydate = getWeekDaysDict();
        config.days = config.days.map((d) => {
            d.date = daydate[d.name];
            return d;
        });

        // Générer la timeline
        generateTimeline();

        // Générer les jours
        generateDays();
    }

    // Fonction pour générer la timeline
    function generateTimeline() {
        const timeline = document.getElementById("timeline");
        timeline.innerHTML = '<div class="spacer"></div>';

        for (let hour = config.startHour; hour <= config.endHour; hour += config.hourStep) {
            const timeMarker = document.createElement("div");
            timeMarker.className = "time-marker";
            timeMarker.textContent = formatHour24(hour);
            timeline.appendChild(timeMarker);
        }
    }

    // Fonction pour générer les jours
    function generateDays() {
        const daysContainer = document.getElementById("days");
        daysContainer.innerHTML = "";

        config.days.forEach((day) => {
            const dayElement = document.createElement("div");
            dayElement.className = `day ${day.name.toLowerCase()}`;
            dayElement.id = `day-${day.name.toLowerCase()}`;

            const dateElement = document.createElement("div");
            dateElement.className = "date";
            dateElement.innerHTML = `
            <p class="date-num">${day.date}</p>
            <p class="date-day">${day.shortName}</p>`;

            // Conteneur pour l'icône de télétravail (ajouté mais caché par défaut)
            const teleIcon = document.createElement("div");
            teleIcon.className = "teletravail-icon";
            teleIcon.innerHTML = `<span class="icon">💻</span>`;
            teleIcon.style.display = "none";
            dateElement.appendChild(teleIcon);

            const eventsElement = document.createElement("div");
            eventsElement.className = "events";
            eventsElement.id = `events-${day.name.toLowerCase()}`;

            dayElement.appendChild(dateElement);
            dayElement.appendChild(eventsElement);
            daysContainer.appendChild(dayElement);
        });
    }

    // Fonction pour marquer un jour comme jour de télétravail
    function markAsTeletravail(jour) {
        const jourNormalise = jour.toLowerCase();
        const dayElement = document.getElementById(`day-${jourNormalise}`);
        
        if (dayElement) {
            const teleIcon = dayElement.querySelector('.teletravail-icon');
            if (teleIcon) {
                teleIcon.style.display = "block";
            }
        }
    }

    // Fonction pour marquer un jour comme congé
    function markAsConge(jour, libelle = "Congé") {
        const jourNormalise = jour.toLowerCase();
        const dayElement = document.getElementById(`day-${jourNormalise}`);
        
        if (dayElement) {
            // Conteneur pour l'overlay de congé
            const congeOverlay = document.createElement("div");
            congeOverlay.className = "conge-text";
            congeOverlay.textContent = libelle;

            // Désactiver les événements pour cette journée
            const eventsElement = document.getElementById(`events-${jourNormalise}`);
            if (eventsElement) {
                eventsElement.style.pointerEvents = "none";
                eventsElement.style.opacity = "0.6";
                eventsElement.style.background = "repeating-linear-gradient(45deg, var(--congeColor), var(--congeColor) 10px, rgba(255, 235, 230, 0.7) 10px, rgba(255, 235, 230, 0.7) 20px)";
                if (!document.querySelector(`div[id="events-${jourNormalise}"] div[class="conge-overlay"]`)) {
                    eventsElement.appendChild(congeOverlay);
                }
            }
        }
    }

    // Fonction pour marquer un jour comme férié
    function markAsFerie(jour, nomFerie, image) {
        const jourNormalise = jour.toLowerCase();
        const dayElement = document.getElementById(`day-${jourNormalise}`);

        if (dayElement) {
            const eventsElement = document.getElementById(`events-${jourNormalise}`);
            if (eventsElement) {
                eventsElement.style.pointerEvents = "none";
                eventsElement.classList.add("ferie-background");
                eventsElement.style.backgroundImage = `linear-gradient(rgb(240, 240, 250), rgba(240, 240, 250, 0.5)), url(${image})`;
                let p = document.createElement("p");
                p.textContent = nomFerie;
                p.style.textAlign = "center";
                p.style.width = "100%";
                p.style.marginTop = "50%";
                p.style.fontSize = "30px";
                p.style.fontWeight = "bold";
                eventsElement.append(p);
            }
        }
    }

    // Fonction pour ajouter un événement au calendrier
    function addEventOnCalandar(titre, heureDebut, heureFin, jour, couleur) {
        // Normaliser le jour (tout en minuscules)
        const jourNormalise = jour.toLowerCase();

        // Vérifier si le jour existe
        const dayIndex = config.days.findIndex(
            (d) => d.name.toLowerCase() === jourNormalise
        );
        if (dayIndex === -1) {
            console.error(`Le jour "${jour}" n'existe pas dans le calendrier`);
            return;
        }

        // Vérifier si la couleur existe ou utiliser une couleur par défaut
        const bgColor = config.colors[couleur.toLowerCase()] || "#ffffff";

        // Convertir les heures en entiers
        const startHour = convertTimeToDecimal(heureDebut);
        let endHour = 0;

        if (heureFin == null || heureFin == undefined) {
            const now = new Date();
            endHour = convertTimeToDecimal(`${now.getHours()}h${now.getMinutes()}`);
        } else {
            endHour = convertTimeToDecimal(heureFin);
        }

        if (startHour < config.startHour || endHour > config.endHour) {
            console.error(
                `L'événement doit être entre ${formatHour24(
                    config.startHour
                )} et ${formatHour24(config.endHour)}`
            );
            return;
        }

        // Calculer la position en pourcentage par rapport à la hauteur totale du calendrier
        const totalMinutes = (config.endHour - config.startHour) * 60;
        const startMinutes = (startHour - config.startHour) * 60;
        const durationMinutes = (endHour - startHour) * 60;

        const startPercentage = (startMinutes / totalMinutes) * 100;
        const heightPercentage = (durationMinutes / totalMinutes) * 100;

        // Créer l'élément d'événement
        const eventElement = document.createElement("div");
        eventElement.className = "event";
        eventElement.style.backgroundColor = bgColor;
        eventElement.style.top = `${startPercentage}%`;
        eventElement.style.height = `${heightPercentage}%`;
        if (heureFin == null || heureFin == undefined) {
            eventElement.style.borderBottom = `3px dashed var(--eventBorderColor)`;
            heureFin = "...";
        }

        eventElement.innerHTML = `
        <p class="title">${titre}</p>
        <p class="time">${heureDebut} - ${heureFin}</p>`;

        // Ajouter l'événement au jour correspondant
        const dayEventsContainer = document.getElementById(
            `events-${jourNormalise}`
        );
        if (dayEventsContainer) {
            dayEventsContainer.appendChild(eventElement);
        } else {
            console.error(`Conteneur d'événements pour "${jour}" non trouvé`);
        }
    }

    // Fonction pour convertir une heure (format "9h30" ou "14h45") en nombre décimal
    function convertTimeToDecimal(timeStr) {
        const match = timeStr.match(/(\d+)h(\d+)?/);
        if (!match) return null;

        const hours = parseInt(match[1], 10);
        const minutes = match[2] ? parseInt(match[2], 10) : 0;

        return hours + minutes / 60;
    }

    // Fonction pour formater l'heure en format 24h
    function formatHour24(hour) {
        const intHour = Math.floor(hour);
        const minutes = Math.round((hour - intHour) * 60);

        return `${intHour.toString().padStart(2, "0")}h${
            minutes > 0 ? minutes.toString().padStart(2, "0") : "00"
        }`;
    }

    // Fonction pour changer les heures affichées
    function changeHours(startHour, endHour, hourStep = 1) {
        config.startHour = startHour;
        config.endHour = endHour;
        config.hourStep = hourStep;

        // Reconstruire le calendrier
        initCalendar();
    }

    function initHTML() {
        let elm = document.getElementById(`main-tabs`);

        if (elm.querySelector(`ul`)) elm.querySelector(`ul`).remove();
        // if (elm.querySelector(`div`)) elm.querySelector(`div`).remove();
        elm.querySelector(`div[id="main-content"] div[id="tab-wc_pointvirt"]`).remove();

        elm.style.height = `100vh`;
        elm.querySelector(`div[id="main-content"]`).style.overflowY = `auto`;

        // let mainContent = document.createElement("div");
        // mainContent.id = "main-content";
        // elm.appendChild(mainContent);

        // let tab = document.createElement("div");
        // tab.id = "tab-wc_pointvirt";
        // mainContent.appendChild(tab);

        let module = document.createElement("div");
        module.id = "calendar-module";
        elm.querySelector(`div[id="main-content"]`).appendChild(module);

        // ===== NOUVEAU : Ajouter la barre de navigation =====
        let navigationBar = document.createElement("div");
        navigationBar.className = "week-navigation";
        navigationBar.innerHTML = `
            <button id="prev-week" class="nav-button">
                <span class="arrow">◀</span>
                <span class="text">Semaine précédente</span>
            </button>
            <div id="current-week-info" class="week-info">
                <span class="week-text">Semaine du</span>
                <span class="week-dates" id="week-dates-display"></span>
            </div>
            <button id="next-week" class="nav-button">
                <span class="text">Semaine suivante</span>
                <span class="arrow">▶</span>
            </button>
        `;
        module.appendChild(navigationBar);
        // ===== FIN NOUVEAU =====

        let c = document.createElement("div");
        c.className = "calendar";
        module.appendChild(c);

        let t = document.createElement("div");
        t.className = "timeline";
        t.id = "timeline";
        c.appendChild(t);

        let d = document.createElement("div");
        d.className = "days";
        d.id = "days";
        c.appendChild(d);

        let style = document.createElement('style');
        style.innerHTML = `:root {--numDays: ${config.numDays};--numHours: ${config.numHours};--timeHeight: ${config.timeHeight};--calBgColor: ${config.calBgColor};--eventBorderColor: ${config.eventBorderColor};--startHour: ${config.startHour};--endHour: ${config.endHour};--congeColor: ${config.colors.conge};--ferieColor: ${config.colors.ferie};}
            #calendar-module,div,p {margin: 0;padding: 0;border: 0;font-size: 100%;font: inherit;vertical-align: baseline;}
            #calendar-module {line-height: 1;}
            .calendar {display: grid;gap: 10px;grid-template-columns: auto 1fr;margin: 2rem;}
            .timeline {display: grid;grid-template-rows: repeat(var(--numHours), var(--timeHeight));}
            .days {display: grid;grid-column: 2;gap: 5px;grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));}
            .events {display: grid;grid-template-rows: repeat(var(--numHours), var(--timeHeight));border-radius: 5px;background: var(--calBgColor);position: relative;height: calc(var(--numHours) * var(--timeHeight));}
            .title {font-weight: 600;margin-bottom: 0.25rem;}
            .event {border: 1px solid var(--eventBorderColor);border-radius: 5px;padding: 0.5rem;margin-left: 0.5rem;margin-right: 0.5rem;background: white;position: absolute;width: calc(100% - 1rem - 2px);box-sizing: border-box;left: 0;}
            .space,.date {height: 60px;}
            body {font-family: system-ui, sans-serif;}
            .date {display: flex;gap: 1em;position: relative;}
            .date-num {font-size: 3rem;font-weight: 600;display: inline;}
            .date-day {display: inline;font-size: 3rem;font-weight: 100;}
            .event {transition: all 0.3s ease;}
            .event:hover {transform: scale(1.02);box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);z-index: 10;}
            .time-marker {height: var(--timeHeight);display: flex;align-items: center;}
            
            /* ===== NOUVEAUX STYLES POUR LA NAVIGATION ===== */
            .week-navigation {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin: 1rem 2rem;
                padding: 1rem;
                background: #f8f9fa;
                border-radius: 10px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .nav-button {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.75rem 1.5rem;
                background: #007bff;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1rem;
                font-weight: 500;
                transition: all 0.3s ease;
                box-shadow: 0 2px 4px rgba(0,123,255,0.3);
            }
            
            .nav-button:hover {
                background: #0056b3;
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,123,255,0.4);
            }
            
            .nav-button:active {
                transform: translateY(0);
                box-shadow: 0 2px 4px rgba(0,123,255,0.3);
            }
            
            .nav-button .arrow {
                font-size: 1.2rem;
                font-weight: bold;
            }
            
            .week-info {
                text-align: center;
                flex: 1;
                margin: 0 2rem;
            }
            
            .week-text {
                display: block;
                font-size: 1.1rem;
                font-weight: 500;
                color: #495057;
                margin-bottom: 0.5rem;
            }
            
            .week-dates {
                display: block;
                font-size: 1.3rem;
                font-weight: bold;
                color: #007bff;
            }
            
            /* Responsive design pour mobile */
            @media (max-width: 768px) {
                .week-navigation {
                    margin: 0.5rem;
                    padding: 0.75rem;
                    flex-direction: column;
                    gap: 1rem;
                }
                
                .nav-button .text {
                    display: none;
                }
                
                .nav-button {
                    padding: 0.75rem;
                    min-width: 50px;
                }
                
                .week-info {
                    margin: 0;
                    order: -1;
                }
                
                .nav-buttons-container {
                    display: flex;
                    justify-content: space-between;
                    width: 100%;
                    max-width: 200px;
                }
            }
            /* ===== FIN NOUVEAUX STYLES ===== */
            
            /* Style pour l'icône de télétravail */
            .teletravail-icon {
                display: none;
                position: absolute;
                top: 70px;
                right: 5px;
                font-size: 1.5rem;
                animation: pulse 2s infinite;
                z-index: 1;
            }
            @keyframes pulse {
                0% { transform: scale(1); opacity: 0.7; }
                50% { transform: scale(1.1); opacity: 1; }
                100% { transform: scale(1); opacity: 0.7; }
            }
            /* Style pour les jours de congé */
            .conge-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                width: 100%;
                height: 100%;
                z-index: 5;
                border-radius: 5px;
            }
            .conge-text {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                color: #ff6347;
                font-size: 2.5rem;
                font-weight: bold;
                text-transform: uppercase;
                white-space: nowrap;
                pointer-events: none;
                text-shadow: 1px 1px 3px rgba(255, 255, 255, 0.8);
            }
            /* Style pour les jours fériés */
            .ferie-background {
                background-size: cover;
                background-image: linear-gradient(rgb(240, 240, 250), rgba(240, 240, 250, 0.5)), url(https://voltfrance.org/img/containers/assets/images_actualites/8_mai_1945.jpg/42dfad027cf87874311499afa074e36c.jpg);
                background-repeat: no-repeat;
                background-position: center;
            }`;
        document.getElementsByTagName('head')[0].appendChild(style);

        const timelineEl = document.getElementById('timeline');
        const daysEl = document.getElementById('days');

        // Générer la timeline des heures
        for (let hour = config.startHour; hour < config.endHour; hour++) {
            const timeMarker = document.createElement('div');
            timeMarker.classList.add('time-marker');
            timeMarker.textContent = `${hour}h`;
            timelineEl.appendChild(timeMarker);
        }

        // Obtenir la date du jour
        const today = new Date();

        // Créer les colonnes de jour
        for (let i = 0; i < config.numDays; i++) {
            const dayColumn = document.createElement('div');
            dayColumn.classList.add('day');

            // Calculer la date correspondante
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() + i);
            const dayName = currentDate.toLocaleDateString('fr-FR', { weekday: 'short' });
            const dayNumber = currentDate.getDate();

            // En-tête de la colonne
            const dateHeader = document.createElement('div');
            dateHeader.classList.add('date');
            dateHeader.innerHTML = `
                <div class="date-num">${dayNumber}</div>
                <div class="date-day">${dayName}</div>
                <div class="teletravail-icon" style="display:none;"><span class="icon">💻</span></div>
            `;

            // Conteneur pour les événements
            const eventsContainer = document.createElement('div');
            eventsContainer.classList.add('events');

            // Ajouter les éléments à la colonne
            dayColumn.appendChild(dateHeader);
            dayColumn.appendChild(eventsContainer);
            daysEl.appendChild(dayColumn);
        }

        let timelinebox = document.getElementById(`main-tabs`).querySelector(`div[id="calendar-module"]`).querySelector(`div[id="timeline"]`);
        timelinebox.style.backgroundColor = "unset";
        timelinebox.style.boxShadow = "unset";

        setupNavigationEvents();
        updateWeekDisplay();

        console.debug("HTML loaded");
    }

    function setupNavigationEvents() {
        const prevButton = document.getElementById('prev-week');
        const nextButton = document.getElementById('next-week');
        
        prevButton.addEventListener('click', () => {
            currentWeekOffset--;
            updateWeekDisplay();
            refreshCalendarData();
        });
        
        nextButton.addEventListener('click', () => {
            currentWeekOffset++;
            updateWeekDisplay();
            refreshCalendarData();
        });
    }

    function refreshCalendarData() {
        // Vider le calendrier existant
        const daysContainer = document.getElementById("days");
        if (daysContainer) {
            daysContainer.innerHTML = "";
        }
        
        // Réinitialiser la configuration des jours
        config.days = [
            { name: "lundi", shortName: "Lun", date: "" },
            { name: "mardi", shortName: "Mar", date: "" },
            { name: "mercredi", shortName: "Mer", date: "" },
            { name: "jeudi", shortName: "Jeu", date: "" },
            { name: "vendredi", shortName: "Ven", date: "" },
        ];
        config.numDays = 5;
        
        // Réinitialiser le calendrier avec les nouvelles dates
        initCalendar();
        
        // CORRECTION : Appeler directement la logique de chargement des données
        loadCalendarData();
    }

    function loadCalendarData() {
        // console.debug("Chargement des données pour offset: " + currentWeekOffset);
        
        // Récupérer les données
        let data = getData();
        // console.debug("Data: " + JSON.stringify(data));
        
        if (data && data.response && data.response.popu) {
            // Mapper les jours de la semaine en français
            const joursSemaine = {
                0: "dimanche",
                1: "lundi",
                2: "mardi",
                3: "mercredi",
                4: "jeudi",
                5: "vendredi",
                6: "samedi"
            };
            
            // Vérifier s'il y a des pointages le week-end
            let hasWeekendEntries = false;
            
            // Créer une carte pour stocker les pointages par jour
            const pointagesParJour = {};
            
            // Calculer la date actuelle pour la semaine sélectionnée
            const today = new Date();
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + (currentWeekOffset * 7));
            const jourActuel = targetDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
            
            let pointagesData = [];
            let absencesData = [];
            let teletravailData = [];
            
            // Récupérer les données de pointage
            if (data.response.popu[Object.keys(data.response.popu)[0]]) {
                const respData = data.response.popu[Object.keys(data.response.popu)[0]][1];
                
                // Récupérer les pointages
                if (respData.cpointagereel && respData.cpointagereel.rows) {
                    pointagesData = respData.cpointagereel.rows;
                    // console.debug("Nombre de pointages trouvés: " + pointagesData.length);
                }
                
                // Récupérer les absences (congés)
                if (respData.cabsenceuser && respData.cabsenceuser.rows) {
                    absencesData = respData.cabsenceuser.rows;
                    // console.debug("Nombre d'absences trouvées: " + absencesData.length);
                }
                
                // Récupérer le télétravail
                if (respData.cteletravail && respData.cteletravail.rows) {
                    teletravailData = respData.cteletravail.rows;
                    // console.debug("Nombre de télétravails trouvés: " + teletravailData.length);
                }
                
                // Détecter les oublis de pointage
                const oublis = detectOubliPointage(pointagesData);
                
                // Afficher une alerte si des oublis sont détectés (seulement pour la semaine actuelle)
                if (oublis.length > 0 && currentWeekOffset === 0) {
                    // ... (code d'affichage des notifications d'oubli)
                }
                
                // Grouper les pointages par jour
                pointagesData.forEach(pointage => {
                    const datePointage = pointage.datecorr.val;
                    const heurePointage = pointage.timecorr.val;
                    const dateObj = new Date(datePointage + "T" + heurePointage);
                    const jourSemaine = joursSemaine[dateObj.getDay()];
                    
                    // Vérifier si c'est un jour de week-end
                    if (dateObj.getDay() === 0 || dateObj.getDay() === 6) {
                        hasWeekendEntries = true;
                    }
                    
                    // Initialiser le tableau pour ce jour s'il n'existe pas encore
                    if (!pointagesParJour[jourSemaine]) {
                        pointagesParJour[jourSemaine] = [];
                    }
                    
                    // Ajouter ce pointage au tableau du jour
                    pointagesParJour[jourSemaine].push({
                        date: datePointage,
                        heure: heurePointage.substring(0, 5).replace(':', 'h'),  // Format 08:46 -> 08h46
                        isToday: datePointage === jourActuel
                    });
                });
                
                // Si des pointages ont été effectués le week-end, activer samedi et dimanche
                if (hasWeekendEntries) {
                    config.days.push(
                        { name: "samedi", shortName: "Sam", date: "" },
                        { name: "dimanche", shortName: "Dim", date: "" }
                    );
                    config.numDays = 7;
                    generateDays();
                }

                // Traiter les jours de télétravail
                if (teletravailData && teletravailData.length > 0) {
                    teletravailData.forEach(tele => {
                        const dateTele = tele.date.val;
                        if (estDansPlageActuelle(dateTele)) {
                            const jourSemaine = getJourSemaine(dateTele);
                            markAsTeletravail(jourSemaine);
                        }
                    });
                }

                // Traiter les congés et absences
                if (absencesData && absencesData.length > 0) {
                    absencesData.forEach(absence => {
                        const dateDebut = absence.datedeb.val;
                        const dateFin = absence.datefin.val;
                        const libelle = absence.libelle ? absence.libelle.val : "Congé";
                        
                        // Créer une boucle pour couvrir toute la période d'absence
                        const debut = new Date(dateDebut);
                        const fin = new Date(dateFin);
                        
                        for (let d = new Date(debut); d <= fin; d.setDate(d.getDate() + 1)) {
                            const dateStr = d.toISOString().split('T')[0];
                            if (estDansPlageActuelle(dateStr)) {
                                const jourSemaine = getJourSemaine(dateStr);
                                markAsConge(jourSemaine, libelle);
                            }
                        }
                    });
                }

                // Traiter les jours fériés
                for (const jour of config.days) {
                    // Récupérer la date complète au format YYYY-MM-DD
                    const today = new Date();
                    const targetDate = new Date(today);
                    targetDate.setDate(today.getDate() + (currentWeekOffset * 7));
                    const semaine = getStartAndEndOfWeek(targetDate);
                    const jourDate = new Date(semaine.monday);
                    jourDate.setDate(jourDate.getDate() + config.days.indexOf(jour));
 
                    // Vérifier si c'est un jour férié
                    const ferie = joursFeries[jourDate.toISOString().split('T')[0]];
                    if (ferie) {
                        markAsFerie(jour.name, ferie["name"], ferie["image"]);
                    }
                }

                // Créer des événements à partir des pointages
                for (const jour in pointagesParJour) {
                    const pointages = pointagesParJour[jour].sort((a, b) => a.heure.localeCompare(b.heure));

                    // Parcourir tous les pointages et créer des paires
                    for (let i = 0; i < pointages.length; i++) {
                        const heureDebut = pointages[i].heure;
                        let heureFin = null;
                        
                        // Gérer différents cas
                        if (i % 2 === 0) { // Pointage d'entrée (position paire dans la liste)
                            // Si c'est le dernier pointage du jour actuel, laisser heureFin à null
                            if (pointages[i].isToday && i === pointages.length - 1 && currentWeekOffset === 0) {
                                heureFin = null; // Pointage en cours (seulement pour la semaine actuelle)
                            }
                            // S'il y a un pointage suivant, c'est l'heure de fin
                            else if (i + 1 < pointages.length) {
                                heureFin = pointages[i + 1].heure;
                            }
                            // S'il n'y a pas de pointage suivant et ce n'est pas aujourd'hui
                            else if (!pointages[i].isToday || currentWeekOffset !== 0) {
                                heureFin = (parseInt(heureDebut.split('h')[0]) + 8) + "h00"; // Fin estimée à +8h
                                
                                // Ajouter l'événement avec couleur spéciale pour marquer l'oubli
                                addEventOnCalandar(
                                    "Travail (Sortie oubliée)",
                                    heureDebut, 
                                    heureFin,
                                    jour,
                                    "jaune"
                                );
                                continue;
                            }
                        } else {
                            if (i === 0) {
                                const heureEstimeeDebut = (parseInt(heureDebut.split('h')[0]) - 8) + "h00";
                                
                                addEventOnCalandar(
                                    "Travail (Entrée oubliée)",
                                    heureEstimeeDebut, 
                                    heureDebut,
                                    jour,
                                    "rouge"
                                );
                                continue;
                            }
                        }
                        
                        // Si on est sur un pointage d'entrée
                        if (i % 2 === 0) {
                            addEventOnCalandar(
                                "Travail",
                                heureDebut, 
                                heureFin,
                                jour,
                                "bleu"
                            );
                        }
                    }
                }
            }
        } else {
            console.debug("Aucune donnée disponible pour cette semaine");
        }
    }

    function updateWeekDisplay() {
        const today = new Date();
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + (currentWeekOffset * 7));
        
        const week = getStartAndEndOfWeek(targetDate);
        
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        const startDateStr = week.monday.toLocaleDateString('fr-FR', options);
        const endDateStr = week.sunday.toLocaleDateString('fr-FR', options);
        
        const weekDatesDisplay = document.getElementById('week-dates-display');
        if (weekDatesDisplay) {
            weekDatesDisplay.textContent = `${startDateStr} - ${endDateStr}`;
        }
    }

    function getStartAndEndOfWeek(date = new Date()) {
        // Si pas de date fournie, utiliser la date actuelle avec l'offset
        const targetDate = date ? new Date(date) : new Date();
        if (!date) {
            targetDate.setDate(targetDate.getDate() + (currentWeekOffset * 7));
        }
        
        const day = targetDate.getDay(); // 0 (dimanche) à 6 (samedi)
        const diffToMonday = (day === 0 ? -6 : 1 - day); // Si dimanche (0), on recule de 6 jours
        const monday = new Date(targetDate);
        monday.setDate(targetDate.getDate() + diffToMonday);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        return { monday: monday, sunday: sunday };
    }

    function getWeekDaysDict(date = new Date()) {
        // Appliquer l'offset de semaine
        const targetDate = new Date(date);
        targetDate.setDate(date.getDate() + (currentWeekOffset * 7));
        
        const day = targetDate.getDay();
        const diffToMonday = (day === 0 ? -6 : 1 - day);
        const monday = new Date(targetDate);
        monday.setDate(targetDate.getDate() + diffToMonday);

        const daysOfWeek = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
        const result = {};

        for (let i = 0; i < 7; i++) {
            const current = new Date(monday);
            current.setDate(monday.getDate() + i);

            result[daysOfWeek[i]] = String(current.getDate()).padStart(2, '0');
        }

        return result;
    }

    function refreshCalendarData() {
        // Vider le calendrier existant
        const daysContainer = document.getElementById("days");
        if (daysContainer) {
            daysContainer.innerHTML = "";
        }
        
        // Réinitialiser la configuration des jours
        config.days = [
            { name: "lundi", shortName: "Lun", date: "" },
            { name: "mardi", shortName: "Mar", date: "" },
            { name: "mercredi", shortName: "Mer", date: "" },
            { name: "jeudi", shortName: "Jeu", date: "" },
            { name: "vendredi", shortName: "Ven", date: "" },
        ];
        config.numDays = 5;
        
        // Réinitialiser le calendrier avec les nouvelles dates
        initCalendar();
        
        // Déclencher le rechargement des données
        window.postMessage({ 
            get_storage: ["pref_startHour", "pref_endHour", "pref_hourStep"], 
            id: "changeHours",
            forceRefresh: true 
        }, "*");
    }

    function getData() {
        function formatDate(d) { // Format AAAA-MM-JJ
            return d.toISOString().split('T')[0];
        }
        
        function getsrhdata(week) {
            let ctx = srh.getIdContext();
            let data = {
                "script":"ws_gtareadtables",
                "popu":[[srh.user.id,1]],
                "ddeb":formatDate(week.monday),
                "dfin":formatDate(week.sunday),
                "tables":["cpointagereel"],
                "lastResult":true,
                "headerrows":true,
                "byday":false,
                "order":"nextday,mitem",
                "idcontext":ctx,
                "pversion":-1,
                "lang":"fr",
                "debug":false
            }
            return encodeURIComponent(srh.ajax.buildWSParameter(data));
        }

        const today = new Date();
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + (currentWeekOffset * 7));
        const week = getStartAndEndOfWeek(targetDate);
        const keydate = formatDate(week.monday) + "-" + formatDate(week.sunday);

        let data = localStorage.getItem(keydate);

        if (data == null || data == undefined) {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "/smartw080/srh/smartrh/smartrh", false);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            xhr.send("ctx=" + getsrhdata(week));
            if (xhr.status == 200) {
                data = xhr.responseText.slice(1, -1);
                localStorage.setItem(keydate, data);
            }
        }
        
        return JSON.parse(data);
    }

    function getHolidays() {
        let ctx = srh.getIdContext();
        let datactx = {
            "script":"ws_holidays",
            "soc":"AL",
            "eta":"ALT",
            "obj":true,
            "idcontext":ctx,
            "pversion":-1,
            "lang":"fr",
            "debug":false
        }
        datactx = encodeURIComponent(srh.ajax.buildWSParameter(datactx));
        let data = localStorage.getItem("holidays");

        if (data == null || data == undefined || parseInt(new Date().toISOString().split('-')[0]) != parseInt(JSON.parse(data)[0].val.split('-')[0])) {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "/smartw080/srh/smartrh/smartrh", false);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            xhr.send("ctx=" + datactx);
            if (xhr.status == 200) {
                data = xhr.responseText.slice(1, -1);
                data = JSON.parse(data).response.holidays;
                const currentYear = new Date().getFullYear();
                data = data.filter(h => {
                    const year = new Date(h.val).getFullYear();
                    return year === currentYear;
                });
                localStorage.setItem("holidays", JSON.stringify(data));
            }
        } else {
            data = JSON.parse(data);
        }

        function imageName(name) {
            let basepath = `%file.ferie/an.jpg%`;
            name = name.split(" ");
            name = name[name.length-1].toLowerCase();
            name = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return basepath.replace("an.jpg", name + ".jpg");
        }

        const result = {};
        data.forEach((item, index) => {
            result[item.val] = {
                name: item.lib,
                image: imageName(item.lib)
            };
        });
        return result;
    }

    // Ajout d'une fonction de détection d'oubli de pointage
    function detectOubliPointage(pointages) {
        const oublis = [];
        
        // Regrouper les pointages par jour
        const pointagesParJour = {};
        
        pointages.forEach(pointage => {
            const datePointage = pointage.datecorr.val;
            if (!pointagesParJour[datePointage]) {
                pointagesParJour[datePointage] = [];
            }
            pointagesParJour[datePointage].push(pointage);
        });
        
        // Pour chaque jour, vérifier si le nombre de pointages est impair
        for (const date in pointagesParJour) {
            const pointagesDuJour = pointagesParJour[date];
            
            // Si le nombre de pointages est impair (sauf aujourd'hui), c'est qu'il y a un oubli
            const aujourdhui = new Date().toISOString().split('T')[0];
            if (pointagesDuJour.length % 2 !== 0 && date !== aujourdhui) {
                oublis.push({
                    date: date,
                    pointages: pointagesDuJour
                });
            }
        }
        
        return oublis;
    }

    // Fonction pour convertir une date au format YYYY-MM-DD en jour de la semaine
    function getJourSemaine(dateStr) {
        const joursSemaine = {
            0: "dimanche",
            1: "lundi",
            2: "mardi",
            3: "mercredi",
            4: "jeudi",
            5: "vendredi",
            6: "samedi"
        };
        
        const dateObj = new Date(dateStr);
        return joursSemaine[dateObj.getDay()];
    }

    // Fonction pour vérifier si une date est dans la plage de dates actuelle
    function estDansPlageActuelle(dateStr) {
        const today = new Date();
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + (currentWeekOffset * 7));
        const week = getStartAndEndOfWeek(targetDate);
        
        const dateObj = new Date(dateStr);
        return dateObj >= week.monday && dateObj <= week.sunday;
    }

    // Modification de la fonction initEvent pour inclure la détection d'oubli
    function initEvent() {
        window.addEventListener("message", (event) => {
            if (event.source !== window || !event.data?.source == "concorde") return;
            if (event.data.data && event.data.id == "changeHours") {
                changeHours(...Object.values(event.data.data));
                loadCalendarData();
            }
        });

        window.postMessage({ get_storage: ["pref_startHour", "pref_endHour", "pref_hourStep"], id: "changeHours" }, "*");
        console.debug("Event loaded");
    }

    function cleanLocalStorage(full=false) {
        if (full) {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.match(/^(\d{4}-\d{2}-\d{2})-(\d{4}-\d{2}-\d{2})$/)) {
                    localStorage.removeItem(key);
                    i = -1;
                }
            }
        } else {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Ignorer l'heure

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);

                // Vérifie le format YYYY-MM-DD-YYYY-MM-DD
                const match = key.match(/^(\d{4}-\d{2}-\d{2})-(\d{4}-\d{2}-\d{2})$/);
                if (match) {
                    const startDate = new Date(match[1]); // Lundi
                    const endDate = new Date(match[2]);   // Dimanche
                    startDate.setHours(0, 0, 0, 0);
                    endDate.setHours(0, 0, 0, 0);

                    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                        const ageInDays = (today - endDate) / (1000 * 60 * 60 * 24);

                        const isTooOld = ageInDays > 30;
                        const isCurrentWeek = today >= startDate && today <= endDate;
                        const isInFuture = today < startDate;

                        if (isTooOld || isCurrentWeek || isInFuture) {
                            localStorage.removeItem(key);
                            // Redémarrer la boucle car localStorage a changé
                            i = -1;
                        }
                    }
                }
            }
        }
    }

    function init() {
        let elm = document.getElementById(`main-tabs`);
        if (elm) {
            cleanLocalStorage();
            initHTML();
            initEvent();
        } else setTimeout(() => init(), 100);
    }

    init();

})();