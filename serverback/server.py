from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import json
import os
from dotenv import load_dotenv

# Charger les variables d'environnement depuis le fichier .env
load_dotenv()

app = Flask(__name__)
CORS(app)  # Permet le partage de ressources entre serveurs

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Bienvenue sur le backend"}), 200

# Connexion à la base de données PostgreSQL
def get_db_connection():
    try:
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            dbname=os.getenv("DB_NAME"),
            port=os.getenv("DB_PORT")
        )
        return conn
    except psycopg2.Error as e:
        print(f"Erreur de connexion à la base de données: {e}")
        raise # Rélance l'exception pour que l'appelant puisse la gérer (ex: renvoyer 500)

# Création de la table si elle n'existe pas
def create_table_if_not_exists():
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS post (
                id SERIAL PRIMARY KEY,
                titre TEXT NOT NULL,
                description TEXT NOT NULL,
                prix TEXT,
                images TEXT NOT NULL, -- La colonne images stockera toujours du TEXT (chaîne JSON)
                type TEXT NOT NULL,
                sousType TEXT
            );
        """)
        conn.commit()
    except Exception as e:
        print(f"Erreur lors de la création de la table: {e}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Appel de la fonction au lancement de l'application
create_table_if_not_exists()

# Route pour ajouter un post
@app.route("/post", methods=["POST"])
def recevoir_post():
    data = request.get_json()
    titre = data.get("titre")
    description = data.get("description")
    type_ = data.get("type")
    sous_type = data.get("sousType")
    prix = data.get("prix")
    images = data.get("images") # Ceci devrait être un tableau d'URLs depuis le frontend

    if not titre or not description or not type_ or not images:
        return jsonify({"error": "Champs obligatoires (titre, description, type, images) manquants."}), 400

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        sql = """
        INSERT INTO post (titre, description, prix, images, type, sousType)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        # Convertit le tableau Python 'images' en une chaîne JSON pour le stockage en DB
        cursor.execute(sql, (
            titre,
            description,
            prix,
            json.dumps(images), # json.dumps() est ESSENTIEL ici pour stocker la liste correctement
            type_,
            sous_type
        ))
        conn.commit()
        return jsonify({"message": "Données insérées avec succès."}), 201

    except Exception as e:
        print("Erreur PostgreSQL lors de l'insertion:", e)
        return jsonify({"error": f"Erreur base de données lors de l'insertion: {str(e)}"}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Suppression d'un post par ID
@app.route('/delete/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM post WHERE id = %s', (item_id,))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"message": f"Élément avec l'ID {item_id} non trouvé."}), 404
        else:
            return jsonify({"message": f"Élément avec l'ID {item_id} supprimé avec succès."}), 200
    except psycopg2.Error as e:
        app.logger.error(f"Erreur PostgreSQL lors de la suppression: {e}")
        return jsonify({"error": "Erreur base de données lors de la suppression"}), 500
    except Exception as e:
        app.logger.error(f"Erreur interne lors de la suppression: {e}")
        return jsonify({"error": "Erreur interne du serveur lors de la suppression"}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Fonction utilitaire générique pour récupérer et parser (réintroduite pour la propreté)
# Cette fonction est interne et n'a pas de route associée.
def _fetch_and_parse_posts(query, params=None):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(query, params)
        posts = cursor.fetchall()

        posts_parsed = []
        column_names = [desc[0] for desc in cursor.description]
        for post in posts:
            post_dict = dict(zip(column_names, post))
            # C'est ICI que l'on s'assure que 'images' est un tableau pour le frontend
            if 'images' in post_dict and isinstance(post_dict['images'], str):
                try:
                    post_dict['images'] = json.loads(post_dict['images'])
                except json.JSONDecodeError:
                    # Si la chaîne n'est pas un JSON valide, ou si elle est vide/corrompue
                    post_dict['images'] = [] # Retourne un tableau vide pour éviter les erreurs
            posts_parsed.append(post_dict)
        return posts_parsed

    except Exception as e:
        print(f"Erreur lors de la récupération et du parsing des posts: {e}")
        # Rélance l'exception pour que les routes l'attrapent et renvoient une erreur 500
        raise
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Route GET pour tout récupérer
@app.route("/recup", methods=["GET"])
def get_all_posts():
    try:
        posts = _fetch_and_parse_posts("SELECT * FROM post")
        return jsonify(posts)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Routes spécifiques GET pour chaque type (codées "à la dure" comme demandé)
@app.route("/architecture", methods=["GET"])
def get_architecture():
    try:
        # Utilise la fonction utilitaire interne pour éviter la répétition de code
        # et assurer que 'images' est correctement parsé.
        posts = _fetch_and_parse_posts("SELECT * FROM post WHERE type = %s", ("architecture",))
        return jsonify(posts)
    except Exception as e:
        print(f"Erreur lors de la récupération des posts d'architecture: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/ecologique", methods=["GET"])
def get_ecologique():
    try:
        posts = _fetch_and_parse_posts("SELECT * FROM post WHERE type = %s", ("ecologique",))
        return jsonify(posts)
    except Exception as e:
        print(f"Erreur lors de la récupération des posts écologiques: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/terrain", methods=["GET"])
def get_terrain():
    try:
        posts = _fetch_and_parse_posts("SELECT * FROM post WHERE type = %s", ("terrain",))
        return jsonify(posts)
    except Exception as e:
        print(f"Erreur lors de la récupération des posts de terrain: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/classique", methods=["GET"])
def get_classique():
    try:
        posts = _fetch_and_parse_posts("SELECT * FROM post WHERE type = %s", ("classique",))
        return jsonify(posts)
    except Exception as e:
        print(f"Erreur lors de la récupération des posts classiques: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/etude", methods=["GET"])
def get_etude():
    try:
        posts = _fetch_and_parse_posts("SELECT * FROM post WHERE type = %s", ("etude",))
        return jsonify(posts)
    except Exception as e:
        print(f"Erreur lors de la récupération des posts d'étude: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))