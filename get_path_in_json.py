import json
from typing import Any, List, Union

def find_paths(data: Any, target: Any, path: List[Union[str,int]] = None):
    """
    Générateur qui yield chaque chemin (liste de clés/index) où la valeur == target.
    """
    if path is None:
        path = []

    # Si on est sur une valeur atomique
    if not isinstance(data, (dict, list)):
        if data == target:
            yield path
        return

    # Si c'est un dict, on itère sur ses clés
    if isinstance(data, dict):
        for key, value in data.items():
            new_path = path + [key]
            yield from find_paths(value, target, new_path)

    # Si c'est une liste, on itère sur ses indices
    elif isinstance(data, list):
        for idx, item in enumerate(data):
            new_path = path + [idx]
            yield from find_paths(item, target, new_path)

if __name__ == "__main__":
    # Chemin du fichier JSON
    json_file = "C:/Users/kelian.maindron/Downloads/deepsearch_result(1).json"
    # Valeur à chercher
    cible = "Compteurs GTA"

    # Chargement du JSON (veillez à avoir assez de mémoire pour 2 Go,
    # ou adaptez pour un parse en streaming si nécessaire)
    with open(json_file, "r", encoding="utf-8") as f:
        contenu = json.load(f)

    # Récupération et affichage des chemins
    chemins = list(find_paths(contenu, cible))
    if chemins:
        print(f"Valeur '{cible}' trouvée aux chemins suivants :")
        for chemin in chemins:
            # Ex. ['niveau1', 'liste', 3, 'clé']
            print(" → " + " -> ".join(map(str, chemin)))
    else:
        print(f"Aucune occurrence de '{cible}' trouvée.")
