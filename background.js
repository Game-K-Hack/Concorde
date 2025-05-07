chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "SEND_TO_DISCORD") {
      fetch(message.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(message.payload)
      })
      .then(response => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
  
      return true; // Permet la réponse asynchrone
    }
  });
  