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
    return jsonify({"message": "Bienvenue sur le backend Batipro Ingenieurie"}), 200

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
        print(f"Erreur CRITIQUE de connexion à la base de données: {e}")
        raise # Rélancer l'exception pour être gérée par les routes.

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
                images TEXT NOT NULL, -- Stockera le JSON des images sous forme de texte
                type TEXT NOT NULL,   -- Champ 'type' (ex: realisation)
                sousType TEXT         -- Champ 'sousType' (ex: architecture, ecologique)
            );
        """)
        conn.commit()
        print("Table 'post' vérifiée/créée avec succès.")
    except Exception as e:
        print(f"Erreur lors de la vérification/création de la table: {e}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Appel de la fonction au lancement de l'application
create_table_if_not_exists()

# Route pour ajouter un post
@app.route("/post", methods=["POST"])
def add_post():
    data = request.get_json()
    titre = data.get("titre")
    description = data.get("description")
    type_ = data.get("type")
    sous_type = data.get("sousType")
    prix = data.get("prix")
    images = data.get("images") # Devrait être une liste d'URLs ou de Data URLs

    # Validation des champs obligatoires
    if not all([titre, description, type_, images]):
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
        # Convertit la liste Python 'images' en une chaîne JSON pour le stockage en TEXT dans la DB
        cursor.execute(sql, (
            titre,
            description,
            prix,
            json.dumps(images), # json.dumps est ESSENTIEL pour stocker une liste
            type_,
            sous_type
        ))
        conn.commit()
        return jsonify({"message": "Données insérées avec succès."}), 201

    except Exception as e:
        print(f"Erreur PostgreSQL lors de l'insertion d'un post: {e}")
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

# Fonction utilitaire interne pour récupérer et désérialiser les posts avec pagination
def _fetch_posts(query, params=None, limit=None, offset=None):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Construire la requête avec LIMIT et OFFSET si fournis
        full_query = query
        query_params = list(params) if params else []

        if limit is not None:
            full_query += " LIMIT %s"
            query_params.append(limit)
        if offset is not None:
            full_query += " OFFSET %s"
            query_params.append(offset)

        cursor.execute(full_query, tuple(query_params))
        posts_raw = cursor.fetchall()

        posts_processed = []
        column_names = [desc[0] for desc in cursor.description]

        for post_tuple in posts_raw:
            post_dict = dict(zip(column_names, post_tuple))
            # Désérialisation du champ 'images' de chaîne JSON à liste Python
            if 'images' in post_dict and isinstance(post_dict['images'], str):
                try:
                    post_dict['images'] = json.loads(post_dict['images'])
                except json.JSONDecodeError:
                    # Gérer les cas où la chaîne n'est pas un JSON valide ou est vide
                    print(f"Avertissement: Impossible de parser le champ images '{post_dict['images']}'. Retourne une liste vide.")
                    post_dict['images'] = []
            posts_processed.append(post_dict)
        return posts_processed

    except Exception as e:
        print(f"Erreur lors de l'exécution de la requête ou du traitement des posts: {e}")
        raise # Rélancer l'exception pour que la route gère l'erreur 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Route GET pour tout récupérer (maintenant avec pagination optionnelle)
@app.route("/recup", methods=["GET"])
def get_all_posts():
    limit = request.args.get('limit', type=int)
    offset = request.args.get('offset', type=int)
    try:
        posts = _fetch_posts("SELECT * FROM post ORDER BY id DESC", limit=limit, offset=offset)
        return jsonify(posts)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Routes spécifiques GET pour chaque type/sousType (maintenant avec pagination)
@app.route("/architecture", methods=["GET"])
def get_architecture_posts():
    limit = request.args.get('limit', type=int)
    offset = request.args.get('offset', type=int)
    try:
        posts = _fetch_posts("SELECT * FROM post WHERE sousType = %s ORDER BY id DESC", ("architecture",), limit=limit, offset=offset)
        return jsonify(posts)
    except Exception as e:
        print(f"Erreur lors de la récupération des posts 'architecture': {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/ecologique", methods=["GET"])
def get_ecologique_posts():
    limit = request.args.get('limit', type=int)
    offset = request.args.get('offset', type=int)
    try:
        posts = _fetch_posts("SELECT * FROM post WHERE sousType = %s ORDER BY id DESC", ("construction_ecologique_btsc",), limit=limit, offset=offset)
        return jsonify(posts)
    except Exception as e:
        print(f"Erreur lors de la récupération des posts 'ecologique': {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/terrain", methods=["GET"])
def get_terrain_posts():
    limit = request.args.get('limit', type=int)
    offset = request.args.get('offset', type=int)
    try:
        posts = _fetch_posts("SELECT * FROM post WHERE sousType = %s ORDER BY id DESC", ("terrain",), limit=limit, offset=offset)
        return jsonify(posts)
    except Exception as e:
        print(f"Erreur lors de la récupération des posts 'terrain': {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/classique", methods=["GET"])
def get_classique_posts():
    limit = request.args.get('limit', type=int)
    offset = request.args.get('offset', type=int)
    try:
        posts = _fetch_posts("SELECT * FROM post WHERE sousType = %s ORDER BY id DESC", ("construction_classique_agglo",), limit=limit, offset=offset)
        return jsonify(posts)
    except Exception as e:
        print(f"Erreur lors de la récupération des posts 'classique': {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/etude", methods=["GET"])
def get_etude_posts():
    limit = request.args.get('limit', type=int)
    offset = request.args.get('offset', type=int)
    try:
        posts = _fetch_posts("SELECT * FROM post WHERE sousType = %s ORDER BY id DESC", ("etude",), limit=limit, offset=offset)
        return jsonify(posts)
    except Exception as e:
        print(f"Erreur lors de la récupération des posts 'etude': {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # debug=True est utile en développement pour avoir des messages d'erreur détaillés.
    # EN PRODUCTION, METTEZ debug=False.
    app.run(debug=False, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
