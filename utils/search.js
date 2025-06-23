(function() {

    let originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.send = function(...args) {
        let originalOnReadyStateChange = this.onreadystatechange;

        this.onreadystatechange = function() {
            if (this.readyState === 4 && this.status >= 200 && this.status < 300) {
                if (this.responseText.match(new RegExp(`{("|)val("|)( |):( |)"AL"`)).length > 0) {
                    alert(this.responseText);
                    let p = prompt("JSON :");
                    if (p.length === 0) {
                        p = this.responseText
                    }
                    Object.defineProperty(this, "responseText", {
                        get: function() {
                            return p;
                        }
                    });
                }
            }

            // Appeler l'ancien gestionnaire (si défini)
            if (originalOnReadyStateChange) {
                originalOnReadyStateChange.apply(this, arguments);
            }
        };

        return originalSend.apply(this, args);
    };

})();