const initStorageValues = {
    pref_startHour: 6, 
    pref_endHour: 20, 
    pref_hourStep: 1,
};



function injectModule(code) {
    fetch(browser.runtime.getURL(`modules/${code}.js`))
        .then(response => response.text())
        .then(text => {
            let m = text.match(/%file\.[a-zA-Z0-9._-]{1,50}%/);
            if (m != null || m != undefined) {
                for (let key of m) {
                    key = key.split("%file.")[1]
                    key = key.substring(0, key.length - 1);
                    text = text.replace("%file." + key + "%", chrome.runtime.getURL("assets/" + key));
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
    let iframe = document.createElement("iframe");
    document.body.appendChild(iframe);
    iframe.contentWindow.console.log("[ OK ] injecting script");
    initStorage();

    const s = document.createElement("script");
    s.src = chrome.runtime.getURL("injected.js");
    s.type = "module"; // important pour pouvoir faire import dynamique ensuite
    (document.head || document.documentElement).appendChild(s);
    s.remove();

    injectModule("__init__");
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => injectScript());
} else {
    injectScript();
}
