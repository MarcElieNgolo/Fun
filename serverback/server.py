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
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        dbname=os.getenv("DB_NAME"),
        port=os.getenv("DB_PORT")
    )

# Création de la table si elle n'existe pas
def create_table_if_not_exists():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS post (
            id SERIAL PRIMARY KEY,
            titre TEXT NOT NULL,
            description TEXT NOT NULL,
            prix TEXT,
            images TEXT NOT NULL,
            type TEXT NOT NULL,
            sousType TEXT
        );
    """)
    conn.commit()
    cursor.close()
    conn.close()

# Appel de la fonction au lancement
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
    images = data.get("images")

    if not titre or not description or not type_ or not images:
        return jsonify({"error": "Champs obligatoires manquants."}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        sql = """
        INSERT INTO post (titre, description, prix, images, type, sousType)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (
            titre,
            description,
            prix,
            json.dumps(images),
            type_,
            sous_type
        ))
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Données insérées avec succès."}), 201

    except Exception as e:
        print("Erreur PostgreSQL:", e)
        return jsonify({"error": "Erreur base de données."}), 500

# Suppression d'un post par ID
@app.route('/delete/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM post WHERE id = %s', (item_id,))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"message": f"Élément avec l'ID {item_id} non trouvé."}), 404
        else:
            return jsonify({"message": f"Élément avec l'ID {item_id} supprimé avec succès."}), 200
    except psycopg2.Error as e:
        app.logger.error(f"Erreur PostgreSQL lors de la suppression: {e}")
        return jsonify({"error": "Erreur base de données"}), 500
    except Exception as e:
        app.logger.error(f"Erreur interne: {e}")
        return jsonify({"error": "Erreur interne du serveur"}), 500
    finally:
        conn.close()

# Route GET pour tout récupérer
@app.route("/recup", methods=["GET"])
def get_all_posts():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM post")
        posts = cursor.fetchall()
        conn.close()
        return jsonify(posts)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Fonction utilitaire de filtre par type
def get_posts_by_type(type_):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM post WHERE type = %s", (type_,))
        posts = cursor.fetchall()
        conn.close()
        return jsonify(posts)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Routes spécifiques GET
@app.route("/architecture", methods=["GET"])
def get_architecture():
    return get_posts_by_type("architecture")

@app.route("/ecologique", methods=["GET"])
def get_ecologique():
    return get_posts_by_type("ecologique")

@app.route("/terrain", methods=["GET"])
def get_terrain():
    return get_posts_by_type("terrain")

@app.route("/classique", methods=["GET"])
def get_classique():
    return get_posts_by_type("classique")

@app.route("/etude", methods=["GET"])
def get_etude():
    return get_posts_by_type("etude")

if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
