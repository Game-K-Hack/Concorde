from PIL import Image
import os

def resize_and_save(image_path, output_folder, sizes=[16, 32, 48, 64, 128, 256], fill_color=(0, 0, 0, 0)):
    # Ouvrir l'image d'origine
    img = Image.open(image_path)
    
    # Créer le dossier de sortie s'il n'existe pas
    os.makedirs(output_folder, exist_ok=True)

    # Parcourir les tailles souhaitées
    for size in sizes:
        # Redimensionner l'image en conservant le ratio
        img_copy = img.copy()
        img_copy.thumbnail((size, size), Image.LANCZOS)
        
        # Créer une nouvelle image carrée avec la taille cible et un fond de couleur
        new_img = Image.new('RGBA', (size, size), fill_color)
        
        # Calculer les coordonnées pour centrer l'image redimensionnée dans l'image carrée
        left = (size - img_copy.width) // 2
        top = (size - img_copy.height) // 2
        new_img.paste(img_copy, (left, top))

        # Générer le nom de fichier
        base_name = os.path.splitext(os.path.basename(image_path))[0]
        new_filename = f"icon-{size}.png"
        output_path = os.path.join(output_folder, new_filename)
        
        # Sauvegarder l'image redimensionnée
        new_img.save(output_path)

    print("Images redimensionnées et sauvegardées avec succès.")

# Exemple d'utilisation
if __name__ == "__main__":
    image_path = "./assets/concorde-nbg-shadow.png"  # Remplace par le chemin de ton image
    output_folder = "./assets/icons"
    resize_and_save(image_path, output_folder)
