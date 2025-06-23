(function () {
  // Fonctions de chiffrement et déchiffrement pour la console du navigateur
  // Utilise l'API Web Crypto disponible dans tous les navigateurs modernes

  class MessageCrypto {
    // Convertit une chaîne en ArrayBuffer
    static textToArrayBuffer(text) {
      return new TextEncoder().encode(text);
    }

    // Convertit un ArrayBuffer en chaîne
    static arrayBufferToText(buffer) {
      return new TextDecoder().decode(buffer);
    }

    // Convertit un ArrayBuffer en chaîne base64
    static arrayBufferToBase64(buffer) {
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }

    // Convertit une chaîne base64 en ArrayBuffer
    static base64ToArrayBuffer(base64) {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes.buffer;
    }

    // Génère une clé à partir du mot de passe
    static async generateKey(password, salt) {
      const passwordBuffer = this.textToArrayBuffer(password);
      const importedKey = await crypto.subtle.importKey(
        "raw",
        passwordBuffer,
        "PBKDF2",
        false,
        ["deriveKey"]
      );

      return crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: salt,
          iterations: 100000,
          hash: "SHA-256",
        },
        importedKey,
        {
          name: "AES-GCM",
          length: 256,
        },
        false,
        ["encrypt", "decrypt"]
      );
    }

    // Chiffre un message
    static async encrypt(message, password) {
      try {
        // Génère un salt et un IV aléatoirement
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));

        // Génère la clé
        const key = await this.generateKey(password, salt);

        // Chiffre le message
        const messageBuffer = this.textToArrayBuffer(message);
        const encrypted = await crypto.subtle.encrypt(
          { name: "AES-GCM", iv: iv },
          key,
          messageBuffer
        );

        // Combine salt + iv + données chiffrées
        const combined = new Uint8Array(
          salt.length + iv.length + encrypted.byteLength
        );
        combined.set(salt, 0);
        combined.set(iv, salt.length);
        combined.set(new Uint8Array(encrypted), salt.length + iv.length);

        return this.arrayBufferToBase64(combined.buffer);
      } catch (error) {
        throw new Error("Erreur lors du chiffrement: " + error.message);
      }
    }

    // Déchiffre un message
    static async decrypt(encryptedMessage, password) {
      try {
        // Décode le message base64
        const combined = new Uint8Array(
          this.base64ToArrayBuffer(encryptedMessage)
        );

        // Extrait salt, iv et données chiffrées
        const salt = combined.slice(0, 16);
        const iv = combined.slice(16, 28);
        const encrypted = combined.slice(28);

        // Génère la clé
        const key = await this.generateKey(password, salt);

        // Déchiffre le message
        const decrypted = await crypto.subtle.decrypt(
          { name: "AES-GCM", iv: iv },
          key,
          encrypted
        );

        return this.arrayBufferToText(decrypted);
      } catch (error) {
        throw new Error("Erreur lors du déchiffrement: " + error.message);
      }
    }
  }

  // Fonctions simplifiées pour utilisation dans la console
  async function chiffrer(message, motDePasse=srh.data.client.lib) {
    try {
      const resultat = await MessageCrypto.encrypt(message, motDePasse);
      console.log("Message chiffré:", resultat);
      return resultat;
    } catch (error) {
      console.error("Erreur:", error.message);
      return null;
    }
  }

  async function dechiffrer(messageChiffre, motDePasse=srh.data.client.lib) {
    try {
      const resultat = await MessageCrypto.decrypt(messageChiffre, motDePasse);
      console.log("Message déchiffré:", resultat);
      return resultat;
    } catch (error) {
      console.error("Erreur:", error.message);
      return null;
    }
  }

  window.chiffrer = chiffrer;
  window.dechiffrer = dechiffrer;

})();
