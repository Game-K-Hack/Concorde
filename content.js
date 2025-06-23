const initStorageValues = {
    pref_startHour: 6, 
    pref_endHour: 20, 
    pref_hourStep: 1,
};



function sendWebhook(type, description, name, email, id) {
    const TYPE = {
        "p": {"l": "Problème", "c": 16725301, "ch": "1345478826704244737", "t": "Iaj0lSrdmPmxkH7P-V6ENJRMML9agz6v7RbkiwBvmsudCdKVabpJN_wNACe2w-eVJ9vS"}, 
        "q": {"l": "Question", "c": 16758037, "ch": "1345492633144918167", "t": "Iklk9VspBcRnLgoAuP-XFWIfgOhG4QtPGVBeFkYQ_Qe7536gesBduAjzv5jgFASDRRdT"}, 
        "s": {"l": "Suggestion", "c": 1424895, "ch": "1345492677202022502", "t": "64O9H8bcQTfwqMX8J0iSugn6O4jbRebMyn3WclRRXwrxpA550z6v9Vh5j_7O_i1tafR_"}, 
    }

    chrome.runtime.sendMessage({
        type: "SEND_TO_DISCORD",
        url: "https://discord.com/api/webhooks/" + TYPE[type]["ch"] + "/" + TYPE[type]["t"],
        payload: {"content":null,"embeds":[{"title":TYPE[type]["l"],"description":description,"color":TYPE[type]["c"],"footer":{"text":name+" <"+email+">\nID: "+id}}]}
      }, response => {
        if (response.success) {
          console.log("Message envoyé à Discord !");
        } else {
          console.error("Erreur Discord :", response.error);
        }
      });
}

function injectModule(code, path="modules") {
    fetch(browser.runtime.getURL(`${path}/${code}.js`))
        .then(response => response.text())
        .then(text => {
            let matches = text.matchAll(/%file\.[a-zA-Z0-9._\/-]{1,50}%/g);
            matches = Array.from(matches);
            if (matches && matches.length > 0) {
                for (let match of matches) {
                    let key = match[0].split("%file.")[1];
                    key = key.substring(0, key.length - 1);
                    text = text.replace(match[0], chrome.runtime.getURL("assets/images/" + key));
                }
            }
            const script = document.createElement('script');
            script.textContent = text;
            document.documentElement.appendChild(script);
            script.remove();
        })
        .catch(err => console.error('Erreur de chargement du script:', err));
}

window.addEventListener("message", async (event) => {
    if (event.source !== window || !event.data?.source == "concorde") return;
    if (event.data.codeSRH != null || event.data.codeSRH != undefined) {
        injectModule(event.data.codeSRH);
    } else if (event.data.get_storage != null || event.data.get_storage != undefined) {
        browser.storage.local.get(event.data.get_storage).then((result) => {
            window.postMessage({source: "concorde", type: "GET_STORAGE", data: result, id: event.data.id}, "*");
        });
    } else if (event.data.set_storage != null || event.data.set_storage != undefined) {
        browser.storage.local.set(event.data.set_storage);
    } else if (event.data.webhook != null || event.data.webhook != undefined) {
        sendWebhook(event.data.webhook, event.data.description, event.data.name, event.data.email, event.data.id);
    }
});

function initStorage() {
    browser.storage.local.get(Object.keys(initStorageValues)).then(async (stored) => {
        const updates = {};
        for (const [key, defaultValue] of Object.entries(initStorageValues)) {
            if (stored[key] === undefined) { updates[key] = defaultValue; }
        }
        if (Object.keys(updates).length > 0) await browser.storage.local.set(updates);
    });
    let iframe = document.createElement("iframe");
    document.body.appendChild(iframe);
    iframe.contentWindow.console.log("[ OK ] Storage initialized");
}

function injectScript() {
    initStorage();

    const s = document.createElement("script");
    s.src = chrome.runtime.getURL("injected.js");
    s.type = "module"; // important pour pouvoir faire import dynamique ensuite
    (document.head || document.documentElement).appendChild(s);
    s.remove();

    injectModule("hash.lib");
    injectModule("supabase.lib.js");
    injectModule("__init__");
    
    let iframe = document.createElement("iframe");
    document.body.appendChild(iframe);
    iframe.contentWindow.console.log("[ OK ] injecting script");
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => injectScript());
} else {
    injectScript();
}
