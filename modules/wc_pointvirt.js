(function () {
    let iframe = document.createElement("iframe");
    document.body.appendChild(iframe);
    iframe.contentWindow.console.log("[DEBUG] (module:wc_pointvirt) loaded");

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
        },
        numDays: 5,
        numHours: 10,
        timeHeight: "60px",
        calBgColor: "#f0f0fa",
        eventBorderColor: "#dcdcf0",
    };

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

            const eventsElement = document.createElement("div");
            eventsElement.className = "events";
            eventsElement.id = `events-${day.name.toLowerCase()}`;

            dayElement.appendChild(dateElement);
            dayElement.appendChild(eventsElement);
            daysContainer.appendChild(dayElement);
        });
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
        if (elm.querySelector(`div`)) elm.querySelector(`div`).remove();

        elm.style.height = `100vh`;
        elm.style.overflowY = `auto`;

        let module = document.createElement("div");
        module.id = "calendar-module";
        elm.appendChild(module);

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
        style.innerHTML = `:root {--numDays: ${config.numDays};--numHours: ${config.numHours};--timeHeight: ${config.timeHeight};--calBgColor: ${config.calBgColor};--eventBorderColor: ${config.eventBorderColor};--startHour: ${config.startHour};--endHour: ${config.endHour};}
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
            .date {display: flex;gap: 1em;}
            .date-num {font-size: 3rem;font-weight: 600;display: inline;}
            .date-day {display: inline;font-size: 3rem;font-weight: 100;}
            .event {transition: all 0.3s ease;}
            .event:hover {transform: scale(1.02);box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);z-index: 10;}
            .time-marker {height: var(--timeHeight);display: flex;align-items: center;}`;
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

        iframe.contentWindow.console.log("[DEBUG] (module:wc_pointvirt) HTML loaded");
    }

    function getStartAndEndOfWeek(date = new Date()) {
        const day = date.getDay(); // 0 (dimanche) à 6 (samedi)
        const diffToMonday = (day === 0 ? -6 : 1 - day); // Si dimanche (0), on recule de 6 jours
        const monday = new Date(date);
        monday.setDate(date.getDate() + diffToMonday);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        return { monday: monday, sunday: sunday };
    }

    function getWeekDaysDict(date = new Date()) {
        const day = date.getDay();
        const diffToMonday = (day === 0 ? -6 : 1 - day);
        const monday = new Date(date);
        monday.setDate(date.getDate() + diffToMonday);

        const daysOfWeek = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
        const result = {};

        for (let i = 0; i < 7; i++) {
            const current = new Date(monday);
            current.setDate(monday.getDate() + i);

            result[daysOfWeek[i]] = String(current.getDate()).padStart(2, '0');
        }

        return result;
    }

    function getData() {
        function formatDate(d) { // Format AAAA-MM-JJ
            return d.toISOString().split('T')[0];
        }
        
        function getsrhdata() {
            const week = getStartAndEndOfWeek();
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
            data = encodeURIComponent(srh.ajax.buildWSParameter(data));
            return data;
        }

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/smartw080/srh/smartrh/smartrh", false);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xhr.send("ctx=" + getsrhdata());
        if (xhr.status == 200) {
            let data = JSON.parse(xhr.responseText.slice(1, -1));
            return data;
        }
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

    // Modification de la fonction initEvent pour inclure la détection d'oubli
    function initEvent() {
        // Changer les heures pour avoir une plage plus large
        window.addEventListener("message", (event) => {
            if (event.source !== window || !event.data?.source == "concorde") return;
            if (event.data.data && event.data.id == "changeHours") { 
                iframe.contentWindow.console.log("[DEBUG] (module:wc_pointvirt) data: " + JSON.stringify(event.data.data));
                changeHours(...Object.values(event.data.data));

                // récupérer le calendrier
                let data = getData();
                iframe.contentWindow.console.log("[DEBUG] (module:wc_pointvirt) data: " + JSON.stringify(data));
                
                // Vérifier si nous avons des données
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
                    
                    // Date actuelle pour déterminer le jour en cours
                    const dateActuelle = new Date();
                    const jourActuel = dateActuelle.toISOString().split('T')[0]; // Format YYYY-MM-DD
                    
                    let pointagesData = [];
                    
                    // Collecter toutes les entrées de pointage et les organiser par jour
                    if (data.response.popu[Object.keys(data.response.popu)[0]]) {
                        pointagesData = data.response.popu[Object.keys(data.response.popu)[0]][1].cpointagereel.rows;
                        
                        // Détecter les oublis de pointage
                        const oublis = detectOubliPointage(pointagesData);
                        
                        // Afficher une alerte si des oublis sont détectés
                        if (oublis.length > 0) {
                            const notificationElement = document.createElement("div");
                            notificationElement.className = "notification-oubli";
                            notificationElement.style.cssText = `
                                position: fixed;
                                top: 20px;
                                right: 20px;
                                background-color: #ffeeee;
                                border: 1px solid #ffaaaa;
                                border-radius: 5px;
                                padding: 10px 15px;
                                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                                z-index: 1000;
                                max-width: 300px;
                            `;
                            
                            let oublisHTML = '<h3 style="margin-top:0;color:#cc0000;">⚠️ Oublis de pointage détectés</h3><ul style="padding-left:20px;margin-bottom:5px;">';
                            
                            oublis.forEach(oubli => {
                                // Formater la date en français
                                const dateObj = new Date(oubli.date);
                                const options = { weekday: 'long', day: 'numeric', month: 'long' };
                                const dateFormatee = dateObj.toLocaleDateString('fr-FR', options);
                                
                                oublisHTML += `<li>${dateFormatee} : nombre impair de pointages (${oubli.pointages.length})</li>`;
                            });
                            
                            oublisHTML += '</ul>';
                            oublisHTML += '<p style="margin-top:10px;font-size:0.9em;">Veuillez contacter votre responsable pour régulariser.</p>';
                            oublisHTML += '<button id="close-notification" style="float:right;padding:5px 10px;background:#f0f0f0;border:1px solid #ccc;border-radius:3px;cursor:pointer;">Fermer</button>';
                            oublisHTML += '<div style="clear:both;"></div>';
                            
                            notificationElement.innerHTML = oublisHTML;
                            document.body.appendChild(notificationElement);
                            
                            // Ajouter un écouteur pour fermer la notification
                            document.getElementById('close-notification').addEventListener('click', function() {
                                notificationElement.style.display = 'none';
                            });
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
                            // Décommenter les jours du week-end dans la configuration
                            config.days.push(
                                { name: "samedi", shortName: "Sam", date: "" },
                                { name: "dimanche", shortName: "Dim", date: "" }
                            );
                            // Mettre à jour le nombre de jours
                            config.numDays = 7;
                            // Régénérer les jours pour afficher le week-end
                            generateDays();
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
                                    if (pointages[i].isToday && i === pointages.length - 1) {
                                        heureFin = null; // Pointage en cours
                                    }
                                    // S'il y a un pointage suivant, c'est l'heure de fin
                                    else if (i + 1 < pointages.length) {
                                        heureFin = pointages[i + 1].heure;
                                    }
                                    // S'il n'y a pas de pointage suivant et ce n'est pas aujourd'hui
                                    // C'est un oubli de pointage de sortie
                                    else if (!pointages[i].isToday) {
                                        heureFin = (parseInt(heureDebut.split('h')[0]) + 8) + "h00"; // Fin estimée à +8h
                                        
                                        // Ajouter l'événement avec couleur spéciale pour marquer l'oubli
                                        addEventOnCalandar(
                                            "Travail (Sortie oubliée)",
                                            heureDebut, 
                                            heureFin,
                                            jour,
                                            "jaune" // Couleur pour signaler l'anomalie
                                        );
                                        continue; // Passer à l'itération suivante
                                    }
                                } else { // Pointage de sortie sans entrée précédente (position impaire mais premier élément)
                                    if (i === 0) {
                                        // C'est un oubli de pointage d'entrée
                                        const heureEstimeeDebut = (parseInt(heureDebut.split('h')[0]) - 8) + "h00"; // Début estimé à -8h
                                        
                                        // Ajouter l'événement avec couleur spéciale pour marquer l'oubli
                                        addEventOnCalandar(
                                            "Travail (Entrée oubliée)",
                                            heureEstimeeDebut, 
                                            heureDebut,
                                            jour,
                                            "rouge" // Couleur pour signaler l'anomalie
                                        );
                                        continue; // Passer à l'itération suivante
                                    }
                                }
                                
                                // Si on est sur un pointage d'entrée
                                if (i % 2 === 0) {
                                    // Ajouter l'événement au calendrier
                                    addEventOnCalandar(
                                        "Travail",  // Titre standard pour tous les pointages
                                        heureDebut, 
                                        heureFin,
                                        jour,
                                        "bleu"  // Couleur standard pour tous les pointages
                                    );
                                }
                            }
                        }
                    }
                } else {
                    // Si pas de données, utiliser les événements de test (facultatif)
                    iframe.contentWindow.console.log("[DEBUG] (module:wc_pointvirt) No data available, using test events");
                    addEventOnCalandar("Petit-déjeuner","7h00","8h00","lundi","jaune");
                    addEventOnCalandar("Travail", "8h46", null, "lundi", "bleu");
                    addEventOnCalandar("Déjeuner","12h30","13h30","lundi","rouge");
                    addEventOnCalandar("Réunion","14h30","16h00","mardi","rouge");
                    addEventOnCalandar("Pause café","16h15","16h45","mardi","vert");
                    addEventOnCalandar("Cours","10h00","12h00","mercredi","vert");
                }
            }
        });
        window.postMessage({ get_storage: ["pref_startHour", "pref_endHour", "pref_hourStep"], id: "changeHours" }, "*");

        iframe.contentWindow.console.log("[DEBUG] (module:wc_pointvirt) Event loaded");
    }

    function init() {
        let elm = document.getElementById(`main-tabs`);
        if (elm) {
            initHTML();
            initEvent();
        } else setTimeout(() => init(), 100);
    }

    init();

})();