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

class SupabaseRestLib {
    constructor() {
        this.id = null;
        this.mat = null;
        this.nom = null;
        this.prenom = null;
        this.avatar = null;
        this.banner = null;
        this.supabaseUrl = null;
        this.supabaseKey = null;
    }

    async connect(prenom, nom, mat, token) {
        let data = token.split("\n")[0];
        let u = data.split("_")[0];
        this.supabaseUrl = "https://" + u + ".supabase.co";
        this.supabaseKey = token.replace(u + "_", "");
        
        // Hash des données sensibles
        this.mat = await this.sha256(mat);
        this.nom = await this.sha256(nom.toLowerCase());
        this.prenom = await this.sha256(prenom.toLowerCase());

        this.id = await this.update(this.prenom, this.nom, this.mat);
        return this.id;
    }

    async sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async supabaseRequest(endpoint, method = 'GET', body = null, params = null) {
        let url = `${this.supabaseUrl}/rest/v1/${endpoint}`;
        
        if (params) {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    value.forEach(v => searchParams.append(key, v));
                } else {
                    searchParams.append(key, value);
                }
            });
            url += `?${searchParams.toString()}`;
        }

        const headers = {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };

        const config = {
            method,
            headers,
        };

        if (body && (method === 'POST' || method === 'PATCH')) {
            config.body = JSON.stringify(body);
        }

        const response = await fetch(url, config);
        
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Supabase error: ${response.status} - ${error}`);
        }

        return response.json();
    }

    async update(prenom, nom, mat) {
        try {
            // Chercher par mat et nom
            let users = await this.supabaseRequest('user', 'GET', null, {
                'mat': `eq.${mat}`,
                'nom': `eq.${nom}`
            });
            
            if (users && users.length > 0) {
                await this.supabaseRequest(`user?id=eq.${users[0].id}`, 'PATCH', { prenom });
                return users[0].id;
            }

            // Chercher par prenom et nom
            users = await this.supabaseRequest('user', 'GET', null, {
                'prenom': `eq.${prenom}`,
                'nom': `eq.${nom}`
            });
            
            if (users && users.length > 0) {
                await this.supabaseRequest(`user?id=eq.${users[0].id}`, 'PATCH', { mat });
                return users[0].id;
            }

            // Chercher par mat et prenom
            users = await this.supabaseRequest('user', 'GET', null, {
                'mat': `eq.${mat}`,
                'prenom': `eq.${prenom}`
            });
            
            if (users && users.length > 0) {
                await this.supabaseRequest(`user?id=eq.${users[0].id}`, 'PATCH', { nom });
                return users[0].id;
            }

            // Créer un nouveau utilisateur
            const newUsers = await this.supabaseRequest('user', 'POST', { prenom, nom, mat });
            return newUsers[0].id;

        } catch (error) {
            console.error("Erreur dans update :", error.message);
            return null;
        }
    }

    async updatePref(avatar, banner) {
        try {
            // Récupérer l'ancien profil
            const oldProfiles = await this.supabaseRequest('user_profile', 'GET', null, {
                'iduser': `eq.${this.id}`,
                'select': 'idprofile'
            });
            
            const oldProfileId = oldProfiles.length ? oldProfiles[0].idprofile : null;

            // Vérifier si le profil existe déjà
            const existingProfiles = await this.supabaseRequest('profile', 'GET', null, {
                'avatar': `eq.${avatar}`,
                'banner': `eq.${banner}`,
                'select': 'id'
            });
            
            let newProfileId;

            if (existingProfiles && existingProfiles.length > 0) {
                newProfileId = existingProfiles[0].id;
            } else {
                // Créer un nouveau profil
                const newProfiles = await this.supabaseRequest('profile', 'POST', { avatar, banner });
                newProfileId = newProfiles[0].id;
            }

            if (oldProfileId !== newProfileId) {
                // Supprimer l'ancienne association
                if (oldProfileId) {
                    await this.supabaseRequest(`user_profile?iduser=eq.${this.id}&idprofile=eq.${oldProfileId}`, 'DELETE');
                }

                // Créer la nouvelle association
                await this.supabaseRequest('user_profile', 'POST', { 
                    iduser: this.id, 
                    idprofile: newProfileId 
                });

                // Vérifier si l'ancien profil est encore utilisé
                if (oldProfileId) {
                    const usage = await this.supabaseRequest('user_profile', 'GET', null, {
                        'idprofile': `eq.${oldProfileId}`,
                        'select': 'iduser'
                    });
                    
                    if (usage.length === 0) {
                        // Supprimer l'ancien profil non utilisé
                        await this.supabaseRequest(`profile?id=eq.${oldProfileId}`, 'DELETE');
                        console.log("Ancien profil supprimé car plus utilisé.");
                    }
                }
            }

            console.log("Mise à jour du profil terminée avec succès.");
        } catch (error) {
            console.error("Erreur updatePref :", error.message);
        }
    }

    async profiles_avatar_banner() {
        try {
            // Requête avec jointure pour récupérer les utilisateurs qui ont personnalisé leur profil
            // On utilise une jointure entre user, user_profile et profile
            const profiles = await this.supabaseRequest('user', 'GET', null, {
                'select': 'nom,prenom,user_profile(profile(avatar,banner))',
                'user_profile.profile.avatar': 'not.is.null',
                'user_profile.profile.banner': 'not.is.null'
            });

            // Transformer les données pour avoir un format plus propre
            const result = profiles.map(user => ({
                nom: user.nom,
                prenom: user.prenom,
                avatar: user.user_profile?.[0]?.profile?.avatar || null,
                banner: user.user_profile?.[0]?.profile?.banner || null
            })).filter(user => user.avatar || user.banner); // Garde seulement ceux qui ont au moins avatar OU banner

            return result;

        } catch (error) {
            console.error("Erreur profiles_avatar_banner :", error.message);
            return [];
        }
    }
}

const db = new SupabaseRestLib();

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
        return true;

    } else if (message.type === "DB_CONNECT") {
        db.connect(message.prenom, message.nom, message.mat, message.token)
            .then(id => sendResponse({ success: true, userId: id }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;

    } else if (message.type === "DB_UPDATE_PROFILE") {
        db.updatePref(message.avatar, message.banner)
            .then(() => sendResponse({ success: true }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;

    } else if (message.type === "DB_GET_PROFILES") {
        db.profiles_avatar_banner()
            .then(r => sendResponse({ success: true, data:r }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;

    } else if (message.type === "DB_GET_AVATARS") {
        db.getAvatars()
            .then(r => sendResponse({ success: true, data:r }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;

    } else if (message.type === "DB_GET_BANNERS") {
        db.getBanners()
            .then(r => sendResponse({ success: true, data:r }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }
});

// Alternative: Fonction SQL brute avec Supabase
async function executeSQL(query, params = []) {
    const response = await fetch(`${db.supabaseUrl}/rest/v1/rpc/execute_sql`, {
        method: 'POST',
        headers: {
            'apikey': db.supabaseKey,
            'Authorization': `Bearer ${db.supabaseKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: query,
            params: params
        })
    });
    
    return response.json();
}
