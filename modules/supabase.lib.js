(function () {
    const module_name = "supabase";
    let iframe = document.createElement("iframe");
    document.body.appendChild(iframe);
    console.log = iframe.contentWindow.console.log;
    console.debug = function(...data) { console.log("[DEBUG] (lib:" + module_name + ") " + data); }
    console.error = function(...data) { console.log("[ERROR] (lib:" + module_name + ") " + data); }
    console.info = function(...data) { console.log("[INFO] (lib:" + module_name + ") " + data); }
    console.ok = function(...data) { console.log("[ OK ] (lib:" + module_name + ") " + data); }

    console.debug("loaded");

    class SupabaseLib {
        constructor() {
            this.id = null;
            this.mat = null;
            this.nom = null;
            this.prenom = null;
            this.avatar = null;
            this.banner = null;
        }

        async connect(prenom, nom, mat) {
            this.mat = mat;
            this.nom = nom;
            this.prenom = prenom;
            this.id = update(prenom, nom, mat);
        }

        async update(prenom, nom, mat) {
            // 1. Vérifier si un utilisateur existe avec mat + nom ➜ mettre à jour prénom
            let { data: user1, error: error1 } = await supabase.from("user").select("*").eq("mat", mat).eq("nom", nom).single();

            if (user1 && !error1) {
                const { data, error } = await supabase.from("user").update({ prenom }).eq("id", user1.id);

                if (error) {
                    console.error("Erreur mise à jour prénom :", error.message);
                    return null;
                }

                return user1.id;
            }

            // 2. Vérifier si un utilisateur existe avec prenom + nom ➜ mettre à jour mat
            let { data: user2, error: error2 } = await supabase.from("user").select("*").eq("prenom", prenom).eq("nom", nom).single();

            if (user2 && !error2) {
                const { data, error } = await supabase.from("user").update({ mat }).eq("id", user2.id);

                if (error) {
                    console.error("Erreur mise à jour mat :", error.message);
                    return null;
                }

                return user2.id;
            }

            // 3. Vérifier si un utilisateur existe avec mat + prenom ➜ mettre à jour nom
            let { data: user3, error: error3 } = await supabase.from("user").select("*").eq("mat", mat).eq("prenom", prenom).single();

            if (user3 && !error3) {
                const { data, error } = await supabase.from("user").update({ nom }).eq("id", user3.id);

                if (error) {
                    console.error("Erreur mise à jour nom :", error.message);
                    return null;
                }

                return user3.id;
            }

            // 4. Aucun match ➜ créer un nouvel utilisateur
            const { data: newUser, error: insertError } = await supabase.from("user").insert([{ prenom, nom, mat }]).select().single();

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
            // Création du profil
            const { data: profile, error: profileError } = await supabase.from("profile").insert([{ avatar, banner }]).select().single();

            if (profileError) {
                console.error("Erreur création profil :", profileError.message);
                return;
            }

            // Lier au profil
            const { error: linkError } = await supabase.from("user_profile").insert([{ iduser: this.id, idprofile: profile.id }]);

            if (linkError) {
                console.error("Erreur liaison user-profile :", linkError.message);
                return;
            }

            console.log("Utilisateur mis à jour / créé et profil lié avec succès.");
        }

    }
})();
