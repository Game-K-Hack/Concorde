import json
import time
from websocket import create_connection

def generate_edits_from_global_coords(line_global, col_start_global, text, timestamp, flag=1):
    """
    Génère les edits à partir d'une ligne et d'une colonne globales.
    - line_global : numéro de ligne (0-indexé, infini)
    - col_start_global : numéro de colonne de départ (0-indexé, infini)
    """
    edits = []
    # Calcul des coordonnées de bloc et intra-bloc
    block_y = line_global // 8
    y_inblock = line_global % 8
    block_x = col_start_global // 16
    x_inblock = col_start_global % 16
    by, bx = block_y, block_x
    xi = x_inblock
    
    for ch in text:
        # Si dépassement intra-bloc en X → bloc suivant à droite
        if xi > 15:
            xi = 0
            bx += 1
        edits.append([by, bx, y_inblock, xi, timestamp, ch, flag])
        xi += 1
    return edits

def write_line(ws, request_id, line_global, col_start_global, text, timestamp=None):
    """
    Envoie un message write pour écrire `text` sur la ligne `line_global`,
    à partir de la colonne `col_start_global`.
    """
    if timestamp is None:
        timestamp = int(time.time() * 1000)
    
    edits = generate_edits_from_global_coords(line_global, col_start_global, text, timestamp)
    message = {
        "kind": "write",
        "request_id": request_id,
        "edits": edits
    }
    ws.send(json.dumps(message))
    print(f"[req={request_id}] Écrit ligne {line_global} @col {col_start_global} : \"{text}\"")

def fetch_rectangle(ws, request_id, min_x, min_y, max_x, max_y):
    """
    Envoie une requête fetch pour lire une zone rectangulaire.
    - min_x, min_y : coordonnées du coin supérieur gauche (en blocs)
    - max_x, max_y : coordonnées du coin inférieur droit (en blocs)
    """
    message = {
        "kind": "fetch",
        "request_id": request_id,
        "fetchRectangles": [{
            "minX": min_x,
            "minY": min_y,
            "maxX": max_x,
            "maxY": max_y
        }]
    }
    ws.send(json.dumps(message))
    print(f"[req={request_id}] Demande de lecture zone ({min_x},{min_y}) à ({max_x},{max_y})")

def parse_tiles_to_text(tiles_data):
    """
    Convertit les données de tiles JSON en texte lisible.
    Reconstruit le texte ligne par ligne à partir des coordonnées des tiles.
    """
    if not tiles_data or "tiles" not in tiles_data:
        return "Aucune donnée reçue"
    
    tiles = tiles_data["tiles"]
    
    # Regrouper les tiles par ligne globale
    lines = {}
    
    for coord, tile in tiles.items():
        if tile is None:
            continue
            
        # Parse les coordonnées "block_y,block_x"
        parts = coord.split(',')
        if len(parts) != 2:
            continue
            
        try:
            block_y, block_x = int(parts[0]), int(parts[1])
        except ValueError:
            continue
        
        content = tile.get("content", "")
        if not content.strip():  # Ignorer les tiles vides
            continue
        
        # Calculer les lignes globales pour ce bloc (chaque bloc = 8 lignes)
        for y_inblock in range(8):
            line_global = block_y * 8 + y_inblock
            
            # Extraire le contenu de cette ligne spécifique
            # Chaque bloc fait 16 caractères de large
            start_idx = y_inblock * 16
            end_idx = start_idx + 16
            
            if start_idx < len(content):
                line_content = content[start_idx:end_idx]
                if line_content.strip():  # Si la ligne n'est pas vide
                    if line_global not in lines:
                        lines[line_global] = {}
                    # Calculer la colonne globale de départ pour ce bloc
                    col_global_start = block_x * 16
                    lines[line_global][col_global_start] = line_content
    
    # Construire le texte final
    result = []
    for line_num in sorted(lines.keys()):
        line_parts = lines[line_num]
        # Reconstituer la ligne complète en triant par position de colonne
        full_line = ""
        for col_start in sorted(line_parts.keys()):
            # Ajouter des espaces si nécessaire pour combler les trous
            while len(full_line) < col_start:
                full_line += " "
            full_line += line_parts[col_start]
        
        result.append(f"Ligne {line_num}: {repr(full_line.rstrip())}")
    
    return "\n".join(result) if result else "Aucun contenu trouvé"

def wait_for_fetch_response(ws, expected_request_id, timeout=10):
    """
    Attend spécifiquement une réponse fetch avec le request_id attendu.
    Ignore les autres messages (channel, etc.).
    """
    ws.settimeout(timeout)
    start_time = time.time()
    
    while time.time() - start_time < timeout:
        try:
            response = ws.recv()
            data = json.loads(response)
            
            print(f"Message reçu: kind={data.get('kind')}, request_id={data.get('request_id')}")
            
            # Vérifier si c'est la réponse fetch qu'on attend
            if (data.get("kind") == "fetch" and 
                data.get("request_id") == expected_request_id):
                return data
                
        except Exception as e:
            print(f"Erreur lors de la réception : {e}")
            break
    
    print(f"Timeout: aucune réponse fetch avec request_id={expected_request_id} reçue")
    return None

def connect_websocket(ws_url, max_retries=3):
    """
    Connecte au WebSocket avec gestion des erreurs et retry.
    """
    for attempt in range(max_retries):
        try:
            ws = create_connection(ws_url, header={
                "Origin": "https://www.yourworldoftext.com"
            })
            print(f"Connecté au WebSocket (tentative {attempt + 1})")
            return ws
        except Exception as e:
            print(f"Erreur de connexion (tentative {attempt + 1}) : {e}")
            if attempt < max_retries - 1:
                time.sleep(2)
    return None

def main():
    ws_url = "wss://www.yourworldoftext.com/~TesTemporaireLXZGHYK/ws/"
    
    # Connexion pour l'écriture
    ws = connect_websocket(ws_url)
    if not ws:
        print("Impossible de se connecter pour l'écriture")
        return
    
    try:
        # Exemple d'écriture
        print("\n=== ÉCRITURE ===")
        write_line(ws, request_id=5, line_global=0, col_start_global=0, text="3417cfdf67c51b20fe0424bc47d5692e8759fb06b36d4828a6ad1c654a9dc367gf1a71797c7582f76dd7310c839e8285ab5d0296cb896a42625772c6e773ad6f6gc47d5692e8759fb06b36d4828a6ad1c654a9dc367h1373015260465987705h1349849614227865711")
        time.sleep(0.5)  # Délai entre les écritures
        
        write_line(ws, request_id=6, line_global=1, col_start_global=0, text="39d8525951f9a7b362a97cf9607431f3cba4629aef4a965d756daf71fd881632g92b340236ed9b530177e977809b25429bbb0be47a3c1c9b442058df416fd0fbbg93654b454b7bc1eea6739e8ca279d028a9f2650c4f3e8843abc47fc5a8893300h")
        # time.sleep(0.5)
        
        # write_line(ws, request_id=7, line_global=2, col_start_global=0, text="Le problème est que la connexion WebSocket se ferme. Cela peut arriver avec YourWorldOfText si on fait trop de requêtes rapidement ou si le serveur ferme la connexion.")
        # time.sleep(2)  # Attendre que l'écriture soit traitée
        
    except Exception as e:
        print(f"Erreur lors de l'écriture : {e}")
    finally:
        try:
            ws.close()
        except:
            pass
    
    # Nouvelle connexion pour la lecture (plus stable)
    print("\n=== LECTURE ===")
    ws = connect_websocket(ws_url)
    if not ws:
        print("Impossible de se connecter pour la lecture")
        return
    
    try:
        # Attendre un peu avant de faire la requête
        time.sleep(1)
        
        fetch_rectangle(ws, request_id=1, min_x=0, min_y=0, max_x=20, max_y=1)  # Zone plus petite
        
        # Attendre la réponse fetch spécifique
        response = wait_for_fetch_response(ws, expected_request_id=1)
        if response:
            print("Réponse reçue :")
            print(json.dumps(response, indent=2, ensure_ascii=False))
            
            print("\n=== TEXTE PARSÉ ===")
            parsed_text = parse_tiles_to_text(response)
            print(parsed_text)
        else:
            print("Aucune réponse reçue")
        
    except Exception as e:
        print(f"Erreur lors de la lecture : {e}")
    finally:
        try:
            ws.close()
            print("\nConnexion fermée.")
        except:
            pass

if __name__ == "__main__":
    main()

