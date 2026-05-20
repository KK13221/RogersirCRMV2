<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$rawInput = file_get_contents("php://input");
$jsonInput = json_decode($rawInput, true);

if (is_array($jsonInput)) {
    $_POST = array_merge($_POST, $jsonInput);
}

$cmd = $_POST['cmd'] ?? $_GET['cmd'] ?? '';
// ── CORS Headers ─────────────────────────────────────────────────────────────
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Handle pre-flight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

function normalizeAdminUrl($url)
{
    $adminUrl = trim((string) $url);

    if ($adminUrl === '') {
        return '';
    }

    if (!preg_match('~^https?://~i', $adminUrl)) {
        $adminUrl = 'https://' . $adminUrl;
    }

    $adminUrl = rtrim($adminUrl, '/');

    // Keep admin_url as base URL only. Full API paths are invalid.
    if (preg_match('~/eld_log/~i', $adminUrl)) {
        throw new Exception('Invalid admin URL. Please enter base URL only, for example https://admin.truckertraceeld.com');
    }

    if (!filter_var($adminUrl, FILTER_VALIDATE_URL)) {
        throw new Exception('Invalid admin URL format');
    }

    return $adminUrl;
}

function requireFields($data, $fields)
{
    foreach ($fields as $field) {
        if (empty(trim($data[$field] ?? ''))) {
            http_response_code(422);
            echo json_encode(['status' => 'error', 'message' => "Field '{$field}' is required"]);
            exit();
        }
    }
}


// Ensure companies table exists and has correct structure
try {
    $db->exec("CREATE TABLE IF NOT EXISTS companies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        package_name VARCHAR(255),
        owner_name VARCHAR(255) NOT NULL,
        owner_mobile VARCHAR(50) NOT NULL,
        owner_email VARCHAR(255) NOT NULL,
        address TEXT,
        admin_url VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");

    // Migration: Add updated_at if missing (MySQL doesn't support ADD COLUMN IF NOT EXISTS easily without MariaDB)
    // So we check if column exists first
    $check = $db->query("SHOW COLUMNS FROM companies LIKE 'updated_at'");
    if ($check->rowCount() == 0) {
        $db->exec("ALTER TABLE companies ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at");
    }
} catch (Exception $e) {
    // Log error but continue
    error_log("Database Migration Error: " . $e->getMessage());
}

// ── Route Handlers ─────────────────────────────────────────────────────────────
try {
    switch ($method) {

        // ── GET: List all companies ──────────────────────────────────────────────
        case 'GET':
            $query = "SELECT * FROM companies ORDER BY created_at DESC";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $companies = $stmt->fetchAll();

            echo json_encode([
                "status" => "success",
                "count" => count($companies),
                "data" => $companies
            ]);
            break;

        // ── POST: Create new company ─────────────────────────────────────────────
        case 'POST':
            $raw = file_get_contents("php://input");
            $data = json_decode($raw, true);

            if (!$data) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Invalid or empty JSON body"]);
                exit();
            }

            requireFields($data, ['company_name', 'owner_name', 'owner_mobile', 'owner_email', 'admin_url']);

            // Basic email validation
            if (!filter_var($data['owner_email'], FILTER_VALIDATE_EMAIL)) {
                http_response_code(422);
                echo json_encode(["status" => "error", "message" => "Invalid email address"]);
                exit();
            }

            $adminUrl = normalizeAdminUrl($data['admin_url']);

            $query = "INSERT INTO companies
                    (company_name, package_name, owner_name, owner_mobile, owner_email, address, admin_url)
                  VALUES
                    (:company_name, :package_name, :owner_name, :owner_mobile, :owner_email, :address, :admin_url)";

            $stmt = $db->prepare($query);
            $stmt->bindValue(':company_name', trim($data['company_name']));
            $stmt->bindValue(':package_name', trim($data['package_name'] ?? ''));
            $stmt->bindValue(':owner_name', trim($data['owner_name']));
            $stmt->bindValue(':owner_mobile', trim($data['owner_mobile']));
            $stmt->bindValue(':owner_email', trim($data['owner_email']));
            $stmt->bindValue(':address', trim($data['address'] ?? ''));
            $stmt->bindValue(':admin_url', $adminUrl);

            if ($stmt->execute()) {
                $newId = $db->lastInsertId();

                // Return the newly created record
                $fetch = $db->prepare("SELECT * FROM companies WHERE id = ?");
                $fetch->execute([$newId]);
                $newCompany = $fetch->fetch();

                http_response_code(201);
                echo json_encode([
                    "status" => "success",
                    "message" => "Company created successfully",
                    "data" => $newCompany
                ]);
            } else {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "Failed to create company"]);
            }
            break;

        // ── PUT: Update a company ─────────────────────────────────────────────
        case 'PUT':
            $id = intval($_GET['id'] ?? 0);
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true);

            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Valid company ID is required']);
                exit();
            }

            if (!$data) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid or empty JSON body']);
                exit();
            }

            requireFields($data, ['company_name', 'owner_name', 'owner_mobile', 'owner_email', 'admin_url']);

            if (!filter_var($data['owner_email'], FILTER_VALIDATE_EMAIL)) {
                http_response_code(422);
                echo json_encode(['status' => 'error', 'message' => 'Invalid email address']);
                exit();
            }

            $adminUrl = normalizeAdminUrl($data['admin_url']);

            $query = 'UPDATE companies SET
                    company_name = :company_name,
                    package_name = :package_name,
                    owner_name   = :owner_name,
                    owner_mobile = :owner_mobile,
                    owner_email  = :owner_email,
                    address      = :address,
                    admin_url    = :admin_url
                  WHERE id = :id';

            $stmt = $db->prepare($query);
            $stmt->bindValue(':company_name', trim($data['company_name']));
            $stmt->bindValue(':package_name', trim($data['package_name'] ?? ''));
            $stmt->bindValue(':owner_name', trim($data['owner_name']));
            $stmt->bindValue(':owner_mobile', trim($data['owner_mobile']));
            $stmt->bindValue(':owner_email', trim($data['owner_email']));
            $stmt->bindValue(':address', trim($data['address'] ?? ''));
            $stmt->bindValue(':admin_url', $adminUrl);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);

            if ($stmt->execute()) {
                if ($stmt->rowCount() >= 0) { // Changed back to >= 0 to allow updates with no changes
                    $fetch = $db->prepare('SELECT * FROM companies WHERE id = ?');
                    $fetch->execute([$id]);
                    echo json_encode(['status' => 'success', 'message' => 'Company updated', 'data' => $fetch->fetch()]);
                } else {
                    http_response_code(404);
                    echo json_encode(['status' => 'error', 'message' => 'Company not found']);
                }
            } else {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'Failed to update company']);
            }

            break;

        // ── DELETE: Remove a company ─────────────────────────────────────────────
        case 'DELETE':
            $id = intval($_GET['id'] ?? 0);

            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Valid company ID is required"]);
                exit();
            }

            $stmt = $db->prepare("DELETE FROM companies WHERE id = ?");
            if ($stmt->execute([$id])) {
                if ($stmt->rowCount() > 0) {
                    echo json_encode(["status" => "success", "message" => "Company deleted"]);
                } else {
                    http_response_code(404);
                    echo json_encode(["status" => "error", "message" => "Company not found"]);
                }
            } else {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "Failed to delete company"]);
            }
            break;

        // ── Method Not Allowed ───────────────────────────────────────────────────
        default:
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    }
} catch (PDOException $e) {
    $error = "Database error: " . $e->getMessage();
    file_put_contents('error_log.txt', date('[Y-m-d H:i:s] ') . $error . PHP_EOL, FILE_APPEND);
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $error]);
} catch (Exception $e) {
    $error = "Server error: " . $e->getMessage();
    file_put_contents('error_log.txt', date('[Y-m-d H:i:s] ') . $error . PHP_EOL, FILE_APPEND);
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $error]);
}
