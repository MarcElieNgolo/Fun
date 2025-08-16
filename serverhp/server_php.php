<?php
// -------- CONFIG ------------------
$DB_HOST = "localhost";
$DB_NAME = "batipro";
$DB_USER = "postgres";
$DB_PASSWORD = "motdepasse";
$DB_PORT = "5432";

// -------- HEADERS ------------------
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// -------- DATABASE ------------------
function getDB() {
    global $DB_HOST, $DB_NAME, $DB_USER, $DB_PASSWORD, $DB_PORT;
    try {
        return new PDO(
            "pgsql:host=$DB_HOST;port=$DB_PORT;dbname=$DB_NAME",
            $DB_USER,
            $DB_PASSWORD,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Erreur DB : " . $e->getMessage()]);
        exit;
    }
}

// -------- INIT DB TABLE -------------
function createTableIfNotExists() {
    $db = getDB();
    $sql = "CREATE TABLE IF NOT EXISTS post (
        id SERIAL PRIMARY KEY,
        titre TEXT NOT NULL,
        description TEXT NOT NULL,
        prix TEXT,
        images TEXT NOT NULL,
        type TEXT NOT NULL,
        sousType TEXT
    );";
    $db->exec($sql);
}
createTableIfNotExists();

// -------- ROUTING -------------------
$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

// Route de base
if ($uri === '/' || $uri === '/backend.php') {
    echo json_encode(["message" => "Bienvenue sur le backend Batipro Ingenieurie"]);
    exit;
}

// Route POST /post
if ($uri === '/post' && $method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $titre = $data['titre'] ?? null;
    $description = $data['description'] ?? null;
    $type = $data['type'] ?? null;
    $sousType = $data['sousType'] ?? null;
    $prix = $data['prix'] ?? null;
    $images = $data['images'] ?? null;

    if (!$titre || !$description || !$type || !$images) {
        http_response_code(400);
        echo json_encode(["error" => "Champs obligatoires manquants."]);
        exit;
    }

    try {
        $db = getDB();
        $stmt = $db->prepare("INSERT INTO post (titre, description, prix, images, type, sousType) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $titre, $description, $prix,
            json_encode($images), $type, $sousType
        ]);
        http_response_code(201);
        echo json_encode(["message" => "Données insérées avec succès."]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Erreur base de données lors de l'insertion: " . $e->getMessage()]);
    }
    exit;
}

// Route DELETE /delete/:id
if (preg_match("#^/delete/(\d+)$#", $uri, $matches) && $method === 'DELETE') {
    $id = (int)$matches[1];
    try {
        $db = getDB();
        $stmt = $db->prepare("DELETE FROM post WHERE id = ?");
        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(["message" => "Élément avec l'ID $id non trouvé."]);
        } else {
            echo json_encode(["message" => "Élément avec l'ID $id supprimé avec succès."]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Erreur interne lors de la suppression"]);
    }
    exit;
}

// Utilitaire : récupérer les posts
function fetchPosts($sql, $params = [], $limit = null, $offset = null) {
    try {
        $db = getDB();

        if ($limit !== null) {
            $sql .= " LIMIT ?";
            $params[] = $limit;
        }
        if ($offset !== null) {
            $sql .= " OFFSET ?";
            $params[] = $offset;
        }

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($posts as &$post) {
            $post['images'] = json_decode($post['images'], true) ?? [];
        }

        return $posts;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Erreur récupération: " . $e->getMessage()]);
        exit;
    }
}

// Routes GET
$routes = [
    "/recup" => null,
    "/architecture" => "architecture",
    "/ecologique" => "construction_ecologique_btsc",
    "/terrain" => "terrain",
    "/classique" => "construction_classique_agglo",
    "/etude" => "etude"
];

foreach ($routes as $path => $filter) {
    if ($uri === $path && $method === 'GET') {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : null;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : null;

        if ($filter) {
            $sql = "SELECT * FROM post WHERE sousType = ? ORDER BY id DESC";
            $params = [$filter];
        } else {
            $sql = "SELECT * FROM post ORDER BY id DESC";
            $params = [];
        }

        $posts = fetchPosts($sql, $params, $limit, $offset);
        echo json_encode($posts);
        exit;
    }
}

// Si aucune route ne correspond
http_response_code(404);
echo json_encode(["error" => "Route non trouvée"]);
