<?php
require_once __DIR__ . '/../gbtbackend/config/database.php';

function normalizeAdminUrl($url)
{
    $url = trim((string) $url);
    if ($url === '')
        return '';
    if (!preg_match('/^https?:\/\//i', $url)) {
        $url = 'https://' . $url;
    }
    $url = preg_replace('/\/eld_log\/.*$/i', '', $url);
    return rtrim($url, '/');
}

function fetchJson($url, $postData = null)
{
    $ch = curl_init($url);
    $headers = [
        'Accept: application/json',
        'User-Agent: GBT-Dashboard-Live-Checker'
    ];

    $options = [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
        CURLOPT_FOLLOWLOCATION => true,
    ];

    if ($postData !== null) {
        $options[CURLOPT_POST] = true;
        $options[CURLOPT_POSTFIELDS] = json_encode($postData);
        $headers[] = 'Content-Type: application/json';
    }

    $options[CURLOPT_HTTPHEADER] = $headers;
    curl_setopt_array($ch, $options);

    $body = curl_exec($ch);
    $error = curl_error($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($body === false || $error) {
        return [
            '__error' => true,
            '__message' => $error ?: 'Curl failed',
            '__code' => $code
        ];
    }

    $json = json_decode($body, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        return [
            '__error' => true,
            '__message' => 'Invalid JSON response',
            '__code' => $code,
            '__raw' => substr($body, 0, 500)
        ];
    }

    return $json;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $stmt = $db->query("SELECT id, company_name, admin_url FROM companies");
    $companies = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "Found " . count($companies) . " companies in DB:\n";
    foreach ($companies as $c) {
        echo "----------------------------------------\n";
        echo "ID: {$c['id']}\n";
        echo "Name: {$c['company_name']}\n";
        echo "Admin URL: {$c['admin_url']}\n";
        
        $adminUrl = normalizeAdminUrl($c['admin_url']);
        echo "Normalized URL: {$adminUrl}\n";
        
        if (empty($adminUrl)) {
            echo "Skipping (empty URL)\n";
            continue;
        }

        // 1. Try single view_project_detail_analytics
        $analyticsUrl = $adminUrl . '/eld_log/master/view_project_detail_analytics';
        echo "Fetching from: {$analyticsUrl}\n";
        $analyticsResponse = fetchJson($analyticsUrl, new stdClass());
        echo "Response code: " . ($analyticsResponse['__code'] ?? 'OK') . "\n";
        echo "Response excerpt: " . substr(json_encode($analyticsResponse), 0, 800) . "\n";

        // 2. Try individual endpoints
        $vehicleUrl = $adminUrl . '/eld_log/master/view_active_vehicle';
        echo "Fetching active vehicles from: {$vehicleUrl}\n";
        $vehicleResponse = fetchJson($vehicleUrl, ['vehicleId' => 0, 'clientId' => 0]);
        echo "Active vehicles response: " . substr(json_encode($vehicleResponse), 0, 800) . "\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
