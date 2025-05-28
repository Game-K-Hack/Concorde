(function () {
    const module_name = "wc_pointvirt";

    // Redirection console → iframe
    const iframe = document.createElement("iframe");
    document.body.appendChild(iframe);
    const log = iframe.contentWindow.console.log.bind(iframe.contentWindow.console);
    ["log", "debug", "info", "warn", "error"].forEach((lvl) => {console[lvl] = (...args) => log(`[${lvl.toUpperCase().padEnd(5)}] (${module_name})`, ...args);});
    console.ok = (...args) => log(`[  OK  ] (${module_name})`, ...args);

    // Génère toutes les dates entre deux bornes inclusives
    function getDateRange(startDate, endDate) {
        const dates = [];
        const currentDate = new Date(startDate.val);
        const finalDate = new Date(endDate.val);

        while (currentDate <= finalDate) {
            dates.push(new Date(currentDate).toISOString().split("T")[0]);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dates;
    }

    // Extrait et dé-dup les absences : rows[mat] = [{mmotif, ddeb, dfin},…]
    function getRows() {
        const rows = {};
        const data = srh.vueApp.store._modules.root._children.absences._rawModule.state.absencesMatCtrDt;

        for (let mat of Object.keys(data)) {
            const row = [];
            const seen = new Set(); // ← reset pour chaque mat

            for (let dateKey of Object.keys(data[mat])) {
                const items = data[mat][dateKey];
                if (!Array.isArray(items)) continue;

                for (let item of items) {
                    // clé unique *par matricule*
                    const key = `${item.mmotif}|${item.name}|${item.ddeb}|${item.dfin}`;
                    if (seen.has(key)) continue;
                    seen.add(key);
                    row.push({
                        mmotif: { val: item.mmotif },
                        name: { val: item.name },
                        ddeb: { val: item.ddeb },
                        dfin: { val: item.dfin },
                    });
                }
            }

            rows[mat] = row;
        }

        return rows;
    }

    function addEmoji(cell, emoji) {
        if (!cell.textContent.includes(emoji)) {
            const s = document.createElement("span");
            s.id = "emoji";
            s.textContent = emoji;
            s.style.fontSize = "16px";
            s.style.display = "block";
            s.style.verticalAlign = "middle";
            cell.appendChild(s);
        }
    }

    function addEmojisToCalendar() {
        const rows = getRows();

        // 1) Récupère les deux tables
        const headerTable = document.querySelector(
            "table.srhcal.planning.right.thead"
        );
        const dataTable = document.querySelector(
            "table.srhcal.planning.right:not(.thead)"
        );
        if (!headerTable || !dataTable) {
            return console.error("Tables non trouvées");
        }

        // 2) Construit map(col → date) depuis le trth2
        const trth2 = headerTable.querySelector("tr.trth2");
        if (!trth2) {
            return console.error("Ligne des jours introuvable"); // :contentReference[oaicite:0]{index=0}
        }
        const ths = Array.from(trth2.querySelectorAll("th"));
        // Année & mois de départ
        let year = new Date().getFullYear(),
            month = new Date().getMonth();
        const lib = document.querySelector("#libMonth");
        if (lib) {
            const m = lib.textContent.match(/(\d{4})/);
            if (m) year = +m[1];
        }
        const colDate = new Map();
        let prevDay = 0;
        let curMon = month;
        ths.forEach((th, idx) => {
            const parts = th.innerHTML.trim().split("<br>");
            const d = parseInt(parts[1], 10);
            if (isNaN(d)) return;
            if (prevDay && prevDay - d > 20) curMon++;
            const ds = `${year}-${String(curMon + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            colDate.set(idx, ds);
            prevDay = d;
        });

        // 3) Prépare map(mat|date → motif)
        const dateMap = new Map();
        const motifNames = {}
        for (const [mat, absList] of Object.entries(rows)) {
            for (const { mmotif, name, ddeb, dfin } of absList) {
                motifNames[mmotif.val] = name.val;
                getDateRange(ddeb, dfin).forEach((date) =>
                    dateMap.set(`${mat.split("_")[0]}|${date}`, mmotif)
                );
            }
        }

        console.log(motifNames);

        // 4) Parcourt chaque ligne de noms pour trouver sa « l.n » et cibler le body
        const nameRows = document.querySelectorAll("table.srhcal.planning.listSal tr[data-me]");
        nameRows.forEach((pilot) => {
            const mat = pilot.getAttribute("data-me");
            const cls = Array.from(pilot.classList).find((c) =>
                c.startsWith("l.")
            );
            if (!cls) return;
            // converti l.3 → l_3 (correspond au body) :contentReference[oaicite:1]{index=1}
            const suffix = cls.replace(".", "_");
            const bodyRow = dataTable.querySelector(`tr.${suffix}`);
            if (!bodyRow) {
                return console.warn(`Pas de ligne data pour mat=${mat}`);
            }

            // 5) Injecte sur chaque <td>
            bodyRow.querySelectorAll("td").forEach((cell, ci) => {
                const date = colDate.get(ci);
                const motif = dateMap.get(`${mat}|${date}`);
                if (!motif || cell.className == "we") return;
                if (motif.val === "TTRV") addEmoji(cell, "💻");
                else if (["CONGP", "CETM", "ABRTT"].includes(motif.val)) {
                    addEmoji(cell, "☀️");
                } else addEmoji(cell, "📅");

                if (motifNames[motif.val] != undefined) cell.querySelector("span").innerText = motifNames[motif.val];
            });
        });

        console.ok("Emojis injectés avec succès !");
    }

    function init() {
        const elm = document.querySelector(`div[id="tab-planningForConges"] td[class="we"]`);
        if (!elm) return setTimeout(init, 100);
        let intervalId = setInterval(addEmojisToCalendar, 100);
        setTimeout(() => {clearInterval(intervalId);}, 5000);
    }

    init();
})();
