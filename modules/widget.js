(function() {
    const module_name = "widget";
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

    const HOURS_PER_WEEK = 38;
    const HOURS_PER_DAY = HOURS_PER_WEEK / 5;
    const HOURS_PER_DAY_S = HOURS_PER_DAY * 3600;
    
    const CARD_CONFIG = {
        "hjt": {
            "icon": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="3 3 18 18"><path fill="#fff" d="M12 20q-1.649 0-3.108-.626t-2.55-1.716t-1.716-2.55T4 12q0-.965.212-1.849q.211-.884.59-1.671q.379-.788.916-1.46q.538-.672 1.19-1.22l6.107 6.108l-.707.708l-5.4-5.4q-.789.88-1.349 2.05T5 12q0 2.9 2.05 4.95T12 19t4.95-2.05T19 12q0-2.617-1.76-4.651T12.5 5.023V7h-1V4h.5q1.649 0 3.108.626t2.55 1.716t1.716 2.55T20 12t-.626 3.108t-1.716 2.55t-2.55 1.716T12 20m-5.001-7.23q-.328 0-.548-.222t-.22-.55t.221-.547t.55-.22t.547.221t.22.55t-.221.547t-.55.22m5 5q-.327 0-.547-.221t-.22-.55t.221-.547t.55-.22t.547.221t.22.55t-.221.547t-.55.22m5-5q-.327 0-.547-.221t-.22-.55t.221-.547t.55-.22t.547.221t.22.55t-.221.547t-.55.22"/></svg>`, 
            "title": "Heures du jour",
            "description": "Heures du jour travaillées",
            "calculation": "Calcule le temps travaillé aujourd'hui :\n• Si 1 pointage : temps actuel - heure d'arrivée\n• Si 2 pointages : heure de sortie - heure d'arrivée\n• Si 3 pointages : (sortie pause - arrivée) + (temps actuel - retour pause)\n• Si 4 pointages : (sortie pause - arrivée) + (sortie - retour pause)"
        }, 
        "bs": {
            "icon": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="3 3 18 18"><path fill="#fff" d="M3 20v-1h8.5V7.94q-.708-.129-1.25-.642T9.56 6H6.116L9 13.212q-.058 1-.929 1.702T6 15.616t-2.071-.702T3 13.212L5.885 6H4V5h5.56q.165-.836.834-1.418T12 3t1.606.582T14.44 5H20v1h-1.884L21 13.212q-.058 1-.929 1.702T18 15.616t-2.071-.702T15 13.212L17.884 6h-3.443q-.149.785-.691 1.298t-1.25.643V19H21v1zm12.99-6.884h4.02L18 8.092zm-12 0h4.02L6 8.092zM12 7q.617 0 1.059-.441q.441-.442.441-1.059t-.441-1.059Q12.617 4 12 4t-1.059.441T10.5 5.5t.441 1.059Q11.383 7 12 7"/></svg>`, 
            "title": "Balance de la semaine",
            "description": "Balance des heures de la semaine",
            "calculation": "Calcule le solde d'heures de la semaine courante :\n• Heures travaillées cette semaine - (7.6h × nombre de jours travaillés)\n• Positif = heures d'avance\n• Négatif = heures de retard"
        }, 
        "hsi": {
            "icon": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="3 3 18 18"><path fill="#fff" d="M11 12.77q.329 0 .549-.23t.22-.54q0-.329-.22-.549t-.549-.22q-.31 0-.54.22t-.23.549q0 .31.23.54t.54.23M7 20v-1l7-.692V6.452q0-.567-.37-.983q-.368-.415-.91-.465L7.615 4.5v-1l5.23.516q.927.103 1.54.794Q15 5.5 15 6.427v12.762zm-2.539 0v-1H6V5.116q0-.697.472-1.156q.472-.46 1.144-.46h8.769q.696 0 1.156.46T18 5.116V19h1.539v1zM7 19h10V5.116q0-.27-.173-.443t-.442-.173h-8.77q-.269 0-.442.173T7 5.116z"/></svg>`, 
            "title": "Heures de sortie idéales",
            "description": "Heure de sortie idéale pour faire exactement 7.6h",
            "calculation": "Calcule l'heure à laquelle partir pour faire exactement 7.6h :\n• Temps actuel + (7.6h - temps déjà travaillé)\n• Le détail indique si cette heure est passée ou à venir"
        }, 
        "hsiq": {
            "icon": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="3 3 18 18"><path fill="#fff" d="M11 12.77q.329 0 .549-.23t.22-.54q0-.329-.22-.549t-.549-.22q-.31 0-.54.22t-.23.549q0 .31.23.54t.54.23M7 20v-1l7-.692V6.452q0-.567-.37-.983q-.368-.415-.91-.465L7.615 4.5v-1l5.23.516q.927.103 1.54.794Q15 5.5 15 6.427v12.762zm-2.539 0v-1H6V5.116q0-.697.472-1.156q.472-.46 1.144-.46h8.769q.696 0 1.156.46T18 5.116V19h1.539v1zM7 19h10V5.116q0-.27-.173-.443t-.442-.173h-8.77q-.269 0-.442.173T7 5.116z"/></svg>`, 
            "title": "Heures de sortie idéales équilibré",
            "description": "Heure de sortie pour équilibrer la semaine",
            "calculation": "Calcule l'heure de sortie pour équilibrer la balance hebdomadaire :\n• Heure de sortie idéale - balance de la semaine\n• Permet de rattraper le retard ou d'optimiser l'avance\n• Le détail indique si cette heure est passée ou à venir"
        }
    }

    const SETTING_IDS = [
        "hjt", "hjtt", 
        "bs", "bse", "bst", 
        "b30dj", "b30dje", "b30djt", 
        "hsi", "hsit", 
        "hsid", "hsidt", "hsidc", 
        "hsiq", "hsiqt", 
        "hsiqd", "hsiqdt", "hsiqdc"
    ];

    const BOX_IDS = ["hjt", "bs", "b30dj", "hsi", "hsiq"];

    let lockDisplay = 0;
    let lastStatus = null;
    let userData = null;
    let updateInterval = null;
    let isInitialized = false;
    let wait_card_already_display = false;

    const utils = {
        formatDate(date) {
            const d = new Date(date);
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const year = d.getFullYear();
            return `${year}-${month}-${day}`;
        },

        time2seconds(time) {
            const [hours, minutes, seconds] = time.split(':').map(Number);
            return hours * 3600 + minutes * 60 + seconds;
        },

        seconds2timeformat(seconds) {
            const s = Math.abs(seconds);
            const hours = Math.floor(s / 3600);
            const minutes = Math.floor((s % 3600) / 60);
            const sh = hours > 1 ? "s" : "";
            const sm = minutes > 1 ? "s" : "";
            
            if (hours !== 0) {
                return `${hours} heure${sh} et ${minutes} minute${sm}`;
            } else if (minutes !== 0) {
                return `${minutes} minute${sm}`;
            } else {
                return `Pas de temps`;
            }
        },

        seconds2timeformatH(seconds) {
            const s = Math.abs(seconds);
            const hours = Math.floor(s / 3600);
            const minutes = Math.floor((s % 3600) / 60);
            const formattedHours = String(hours).padStart(2, '0');
            const formattedMinutes = String(minutes).padStart(2, '0');
            return `${formattedHours} h ${formattedMinutes}`;
        },

        getLocalTime() {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            return `${hours}:${minutes}:${seconds}`;
        },

        sortTimes(times) {
            return times.sort((a, b) => this.time2seconds(a) - this.time2seconds(b));
        },

        groupByWeek(dates) {
            const getWeekInfo = (date) => {
                const current = new Date(date);
                const firstDayOfYear = new Date(current.getFullYear(), 0, 1);
                const pastDaysOfYear = (current - firstDayOfYear) / (1000 * 60 * 60 * 24);
                const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
                return { year: current.getFullYear(), week: weekNumber };
            };

            const grouped = {};
            dates.forEach(date => {
                const { year, week } = getWeekInfo(date);
                const key = `${year}-W${week}`;
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(date);
            });

            return Object.values(grouped);
        },

        findCurrentWeekIndex(dates) {
            const groupedWeeks = this.groupByWeek(dates);
            return groupedWeeks.length - 1;
        }
    };

    const settings = {
        isChecked(id) {
            const actv = localStorage.getItem("smartbalance");
            if (SETTING_IDS.includes(id)) {
                return atob(actv).split("|")[SETTING_IDS.indexOf(id)] === "true";
            }
            return false;
        }
    };

    const api = {
        getSrhData() {
            const date = new Date();
            const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            const jsonContent = {
                "script":"ws_gtareadtables",
                "popu":[[srh.user.id,1]],
                "ddeb":utils.formatDate(firstDay),
                "dfin":utils.formatDate(lastDay),
                "tables":["cpointagereel"],
                "lastResult":true,
                "headerrows":true,
                "byday":false,
                "order":"nextday,mitem",
                "idcontext":srh.getIdContext(),
                "pversion":-1,
                "lang":"fr",
                "debug":false
            };
            return encodeURIComponent(srh.ajax.buildWSParameter(jsonContent));
        },

        getTime() {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "/smartw080/srh/smartrh/smartrh", false);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            xhr.send("ctx=" + this.getSrhData());
            
            if (xhr.status === 200) {
                return JSON.parse(xhr.responseText.slice(1, -1));
            }
            throw new Error('Network error');
        },

        data2time(data) {
            const timedata = {};
            const timelist = data["response"]["popu"][srh.user.id.toString()]["1"]["cpointagereel"]["rows"];
            timelist.forEach(r => timedata[r.datecorr.val] = []);
            timelist.forEach(r => timedata[r.datecorr.val].push(r.timecorr.val));
            return timedata;
        }
    };

    const pointageChecker = {
        checkPointages() {
            if (userData === null) return { hasErrors: false, errors: [] };
            
            const timesorted = {};
            Object.keys(userData).forEach(key => {
                timesorted[key] = utils.sortTimes(userData[key]);
            });
            
            const today = new Date().toISOString().split("T")[0];
            const errors = [];

            Object.keys(timesorted).forEach(date => {
                if (date !== today) {
                    const dayPointages = timesorted[date];
                    if (dayPointages.length % 2 !== 0) {
                        errors.push({
                            date: date,
                            pointages: dayPointages.length,
                            message: `Pointage incomplet (${dayPointages.length} pointages)`
                        });
                    }
                }
            });
            
            return { hasErrors: errors.length > 0, errors: errors };
        },

        showPointageErrorPopup(errors) {
            const existingPopup = document.getElementById('pointage-error-popup');
            if (existingPopup) {
                existingPopup.remove();
            }

            const popupDiv = document.createElement('div');
            popupDiv.id = 'pointage-error-popup';
            popupDiv.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border: 2px solid #dc3545;
                border-radius: 10px;
                padding: 20px;
                max-width: 500px;
                max-height: 400px;
                overflow-y: auto;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 10001;
                font-family: Arial, sans-serif;
            `;

            const overlay = document.createElement('div');
            overlay.id = 'pointage-error-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 10000;
            `;

            const errorList = errors.map(error => {
                const dateObj = new Date(error.date);
                const formattedDate = dateObj.toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
                return `<li style="margin-bottom: 8px; padding: 8px; background: #f8d7da; border-radius: 4px; color: #721c24;">
                    <strong>${formattedDate}</strong><br>
                    ${error.message}
                </li>`;
            }).join('');

            popupDiv.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin: 0; color: #dc3545; display: flex; align-items: center;">
                        <span style="margin-right: 8px;">⚠️</span>
                        Erreurs de pointage détectées
                    </h3>
                    <button id="close-pointage-popup" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">&times;</button>
                </div>
                <div style="margin-bottom: 15px;">
                    <p style="margin: 5px 0; color: #333;">
                        ${errors.length} jour${errors.length > 1 ? 's' : ''} avec des pointages incomplets détecté${errors.length > 1 ? 's' : ''} :
                    </p>
                    <ul style="margin: 10px 0; padding-left: 0; list-style: none;">
                        ${errorList}
                    </ul>
                </div>
                <div style="background: #d1ecf1; padding: 10px; border-radius: 5px; border-left: 4px solid #bee5eb;">
                    <small style="color: #0c5460;">
                        <strong>Info :</strong> Ces erreurs n'affectent pas les calculs du jour en cours et de la semaine, 
                        mais peuvent impacter les statistiques globales.
                    </small>
                </div>
            `;

            document.body.appendChild(overlay);
            document.body.appendChild(popupDiv);

            const closePopup = () => {
                popupDiv.remove();
                overlay.remove();
            };

            document.getElementById('close-pointage-popup').addEventListener('click', closePopup);
            overlay.addEventListener('click', closePopup);

            const escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    closePopup();
                    document.removeEventListener('keydown', escapeHandler);
                }
            };
            document.addEventListener('keydown', escapeHandler);
        }
    };

    const calculator = {
        calculate() {
            if (userData === null) return null;
            
            const timesorted = {};
            Object.keys(userData).forEach(key => {
                timesorted[key] = utils.sortTimes(userData[key]);
            });
            
            const weeks = utils.groupByWeek(Object.keys(userData));
            const weeksMapped = weeks.map(week => week.map(key => timesorted[key]));
            
            let sbalance = 0;
            let sworkedtoday = 0;
            let sidealout = 0;
            let sweekwork = 0;

            const today = new Date().toISOString().split("T")[0];
            const htoday = utils.getLocalTime();
            const currentweek = utils.findCurrentWeekIndex(Object.keys(userData));

            if (currentweek > -1) {
                const cw = weeksMapped[currentweek];
                for (let i = 0; i < cw.length; i++) {
                    // Ignorer les jours avec des pointages incomplets pour les calculs
                    if (cw[i].length === 4 || cw[i] === timesorted[today]) {
                        if (cw[i].length === 4) {
                            sweekwork += (utils.time2seconds(cw[i][1]) - utils.time2seconds(cw[i][0])) + 
                                       (utils.time2seconds(cw[i][3]) - utils.time2seconds(cw[i][2]));
                        }
                    }
                }
            }
            
            if (timesorted[today] !== undefined) {
                const todayTimes = timesorted[today];
                const currentTimeSeconds = utils.time2seconds(htoday);
                
                if (todayTimes.length === 1) {
                    sworkedtoday = currentTimeSeconds - utils.time2seconds(todayTimes[0]);
                    sidealout = currentTimeSeconds + (HOURS_PER_DAY_S - sworkedtoday);
                } else if (todayTimes.length === 2) {
                    sworkedtoday = utils.time2seconds(todayTimes[1]) - utils.time2seconds(todayTimes[0]);
                    sidealout = currentTimeSeconds + (HOURS_PER_DAY_S - sworkedtoday);
                } else if (todayTimes.length === 3) {
                    sworkedtoday = utils.time2seconds(todayTimes[1]) - utils.time2seconds(todayTimes[0]);
                    sworkedtoday += currentTimeSeconds - utils.time2seconds(todayTimes[2]);
                    sidealout = currentTimeSeconds + (HOURS_PER_DAY_S - sworkedtoday);
                    if (sworkedtoday - HOURS_PER_DAY_S > 0) {
                        sweekwork += sworkedtoday - HOURS_PER_DAY_S;
                    }
                } else if (todayTimes.length === 4) {
                    sworkedtoday = utils.time2seconds(todayTimes[1]) - utils.time2seconds(todayTimes[0]);
                    sworkedtoday += utils.time2seconds(todayTimes[3]) - utils.time2seconds(todayTimes[2]);
                    sidealout = currentTimeSeconds + (HOURS_PER_DAY_S - sworkedtoday);
                    sbalance = sweekwork - (HOURS_PER_DAY_S * weeksMapped[currentweek].length);
                }

                if (todayTimes.length < 4) {
                    sbalance = sweekwork - (HOURS_PER_DAY_S * (weeksMapped[currentweek].length - 1));
                }
            } else {
                sbalance = sweekwork - (HOURS_PER_DAY_S * weeksMapped[currentweek].length);
            }

            return [sworkedtoday, sbalance, sidealout];
        }
    };

    const popup = {
        create(cardId) {
            const existingPopup = document.getElementById('info-popup');
            if (existingPopup) {
                existingPopup.remove();
            }

            const config = CARD_CONFIG[cardId];
            if (!config) return;

            const popupDiv = document.createElement('div');
            popupDiv.id = 'info-popup';
            popupDiv.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border: 2px solid #007bff;
                border-radius: 10px;
                padding: 20px;
                max-width: 500px;
                max-height: 400px;
                overflow-y: auto;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 10000;
                font-family: Arial, sans-serif;
            `;

            const overlay = document.createElement('div');
            overlay.id = 'popup-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 9999;
            `;

            popupDiv.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin: 0; color: #007bff;">${config.title}</h3>
                    <button id="close-popup" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">&times;</button>
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>Description :</strong>
                    <p style="margin: 5px 0; color: #333;">${config.description}</p>
                </div>
                <div>
                    <strong>Méthode de calcul :</strong>
                    <pre style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin: 5px 0; white-space: pre-wrap; font-size: 14px; color: #333;">${config.calculation}</pre>
                </div>
            `;

            document.body.appendChild(overlay);
            document.body.appendChild(popupDiv);

            const closePopup = () => {
                popupDiv.remove();
                overlay.remove();
            };

            document.getElementById('close-popup').addEventListener('click', closePopup);
            overlay.addEventListener('click', closePopup);

            const escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    closePopup();
                    document.removeEventListener('keydown', escapeHandler);
                }
            };
            document.addEventListener('keydown', escapeHandler);
        }
    };

    const ui = {
        getInnerHTMLCard(id, value, detailvalue = null, bl = false) {
            let newtext = "";
            let newdetailtext = "";

            if (settings.isChecked(id + "t")) {
                newtext = utils.seconds2timeformat(value);
                if (bl) {
                    newtext += value < 0 ? " de retard" : " d'avance";
                }
            } else {
                newtext = (value < 0 ? "- " : "") + utils.seconds2timeformatH(value);
            }

            if (settings.isChecked(id + "e")) {
                newtext = (value > 0 ? "💪 " : "⚠️ ") + newtext;
            }

            if (settings.isChecked(id + "c")) {
                const colortext = value >= 0 ? "#3cb478" : "#aa1e1e";
                newtext = `<span style="color: ${colortext};">${newtext}</span>`;
            }

            if (settings.isChecked(id + "d") && detailvalue !== null) {
                if (settings.isChecked(id + "dt")) {
                    newdetailtext = utils.seconds2timeformat(detailvalue);
                    newdetailtext = (detailvalue < 0 ? "dans " : "il y a ") + newdetailtext;
                } else {
                    newdetailtext = utils.seconds2timeformatH(detailvalue);
                    newdetailtext = (detailvalue < 0 ? "- " : "+ ") + newdetailtext;
                }

                const colordetailtext = detailvalue >= 0 ? "#3cb478" : "#aa1e1e";
                if (settings.isChecked(id + "dc")) {
                    newdetailtext = `<span style="color: ${colordetailtext};">${newdetailtext}</span>`;
                } else {
                    newdetailtext = `<span>${newdetailtext}</span>`;
                }
                newdetailtext += "<span></span>";
            }

            return newtext + newdetailtext;
        },

        addCard(id, baseElm, value, detailvalue = null, bl = false) {
            if (!settings.isChecked(id)) return;

            const elm = baseElm.cloneNode(true);
            elm.id = id;
            const clr = atob(localStorage.getItem("smartbalancec")).split("|");
            elm.style.backgroundColor = clr[BOX_IDS.indexOf(id)];
            elm.style.cursor = 'pointer';
            elm.querySelector(`span[data-cy="CsIcon-light"]`).innerHTML = CARD_CONFIG[id]["icon"];
            elm.querySelector(`span[class="sub-details"]`).innerText = CARD_CONFIG[id]["title"];
            
            const h = elm.querySelector(`h2[class="details"]`);
            h.innerHTML = this.getInnerHTMLCard(id, value, detailvalue, bl);
            h.style.display = "flex";
            h.style.justifyContent = "space-between";
            
            elm.addEventListener('click', () => {
                popup.create(id);
            });

            const prt = document.getElementById("crd-indicator").querySelector(`div[class="conge-container"]`);
            prt.appendChild(elm);
        },

        updateCardValue(elm, id, value, detailvalue = null, bl = false) {
            const box = elm.querySelector(`div[id="${id}"] h2[class="details"]`);
            if (box) {
                const newValue = this.getInnerHTMLCard(id, value, detailvalue, bl);
                if (box.innerHTML !== newValue) {
                    box.innerHTML = newValue;
                }
            }
        },

        createCard(status) {
            if (document.getElementById("crd-indicator")) {
                if (status !== lastStatus) {
                    document.getElementById("crd-indicator").remove();
                } else {
                    return;
                }
            }

            lastStatus = status;

            const elm = document.querySelector(`article[code="congeGta"]`).cloneNode(true);
            elm.classList.remove('position-5');
            elm.classList.add('position-6');
            elm.id = "crd-indicator";

            const box = elm.querySelectorAll(`div[class="conge-container"] div[class="conge-color card"]`);
            const baseBox = box[0];
            box.forEach(b => b.remove());

            document.querySelector(`div[class="cs-dashboard-content"]`).appendChild(elm);

            if (status === "error") {
                lockDisplay = 1;
                elm.querySelector(`h2[class="cs-widget-title"]`).innerText = "Heures - ❌ Error";
            } else if (status === "wait") {
                lockDisplay = 1;
                elm.querySelector(`h2[class="cs-widget-title"]`).innerText = "Heures - ⏳ Wait...";
            } else if (status === "display" || (status === "update" && lockDisplay === 0)) {
                const val = calculator.calculate();
                if (val) {
                    lockDisplay = 0;
                    elm.querySelector(`h2[class="cs-widget-title"]`).innerText = "Heures";

                    this.addCard("hjt", baseBox, val[0]);
                    this.addCard("bs", baseBox, val[1], null, true);
                    
                    const detailHeureDeSortieIdeale = utils.time2seconds(utils.getLocalTime()) - val[2];
                    this.addCard("hsi", baseBox, val[2], detailHeureDeSortieIdeale);
                    
                    const heureDeSortieIdealeEquilibre = val[2] - val[1];
                    const detailHeureDeSortieIdealeEquilibre = utils.time2seconds(utils.getLocalTime()) - heureDeSortieIdealeEquilibre;
                    this.addCard("hsiq", baseBox, heureDeSortieIdealeEquilibre, detailHeureDeSortieIdealeEquilibre);
                }
            }
        },

        updateCards() {
            const elm = document.getElementById("crd-indicator");
            if (elm) {
                const val = calculator.calculate();
                if (val) {
                    this.updateCardValue(elm, "hjt", val[0]);
                    this.updateCardValue(elm, "bs", val[1], null, true);
                    
                    const detailHeureDeSortieIdeale = utils.time2seconds(utils.getLocalTime()) - val[2];
                    this.updateCardValue(elm, "hsi", val[2], detailHeureDeSortieIdeale);
                    
                    const heureDeSortieIdealeEquilibre = val[2] - val[1];
                    const detailHeureDeSortieIdealeEquilibre = utils.time2seconds(utils.getLocalTime()) - heureDeSortieIdealeEquilibre;
                    this.updateCardValue(elm, "hsiq", heureDeSortieIdealeEquilibre, detailHeureDeSortieIdealeEquilibre);
                }
            }
        }
    };

    const dataManager = {
        async getData() {
            if (userData === null) {
                try {
                    const data = api.getTime();
                    if (data.error && data.codeError) {
                        userData = null;
                        setTimeout(() => this.getData(), 1500);
                    } else {
                        userData = api.data2time(data);
                    }
                } catch (e) {
                    if (e.message.includes("srh.getIdContext is not a function")) {
                        setTimeout(() => this.getData(), 1500);
                    }
                }
            }
        },

        executeWhenElementCreated() {
            if (isInitialized) return "end";

            if (!wait_card_already_display) ui.createCard("wait");
            if (userData === null) {
                try {
                    const data = api.getTime();
                    if (data.error && data.codeError) {
                        ui.createCard("error");
                        return;
                    } else {
                        userData = api.data2time(data);
                        ui.createCard("display");
                        isInitialized = true;
                        return "end";
                    }
                } catch (e) {
                    ui.createCard("error");
                    return;
                }
            } else {
                ui.createCard("display");
                isInitialized = true;
                return "end";
            }
        }
    };

    function init() {
        let elm = document.getElementById("csAccuielContainer");
        let cncd = document.getElementById("crd-indicator");
        if (elm && (cncd == null || cncd == undefined)) {
            const targetNode = document.body;
            const config = { childList: true, subtree: true };
            const mutationObserver = new MutationObserver((mutationsList, observer) => {
                if (isInitialized) return;
                
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList') {
                        if (document.querySelector('article[code="congeGta"] div.conge-container[class="conge-container"] div[class="conge-color card"] svg g path')) {
                            const res = dataManager.executeWhenElementCreated();
                            if (res === "end") {
                                observer.disconnect();
                                if (updateInterval) clearInterval(updateInterval);
                                updateInterval = setInterval(() => ui.updateCards(), 30000);
                                return;
                            }
                        } else if (document.querySelector('article[code="congeGta"]') && !wait_card_already_display) {
                            wait_card_already_display = true;
                            ui.createCard("wait");
                        }
                    }
                }
            });
            mutationObserver.observe(targetNode, config);

            window.addEventListener("storage", () => {
                ui.createCard("update");
            });

        } else setTimeout(() => init(), 100);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => init());
    } else {
        init();
    }

})();