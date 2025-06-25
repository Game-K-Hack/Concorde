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

    const baseurl = "https://raw.githubusercontent.com/Game-K-Hack/Concorde/refs/heads/master/base";

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

        async connect(prenom, nom, mat) {
            this.mat = mat;
            this.nom = nom;
            this.prenom = prenom;
            fetch(baseurl).then(response => {
                if (!response.ok) {
                    throw new Error(`Erreur HTTP : ${response.status}`);
                }
                return response.text();
            }).then(data => {
                window.dechiffrer(data, srh.data.client.lib).then(clair => {
                    data = clair.split("\n")[0];
                    u = data.split("_")[0];
                    this.supabase = window.supabase.createClient(u, "sb_secret_" + data.replace(u + "_", ""));
                    this.id = update(prenom, nom, mat);
                });
            })
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
})();
