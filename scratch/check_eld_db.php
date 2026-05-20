<?php
require_once __DIR__ . '/../gbtbackend/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    echo "--- company_api_configs ---\n";
    $stmt = $db->query("SELECT * FROM company_api_configs");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        print_r($row);
    }

    echo "\n--- eld_company_summary ---\n";
    $stmt = $db->query("SELECT * FROM eld_company_summary");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        print_r($row);
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
