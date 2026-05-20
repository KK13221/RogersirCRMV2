<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';

function normalizeAdminUrl($url)
{
    $url = trim((string) $url);
    if ($url === '') {
        return '';
    }

    if (!preg_match('/^https?:\/\//i', $url)) {
        $url = 'https://' . $url;
    }

    // Companies table must store only the portal base URL. If a full ELD API URL was pasted, trim it.
    $url = preg_replace('/\/eld_log\/.*$/i', '', $url);
    return rtrim($url, '/');
}

function fetchJson($url, $postData = null)
{
    if (!function_exists('curl_init')) {
        return [
            '__error' => true,
            '__message' => 'PHP cURL extension is not enabled on this server',
            '__code' => 0,
            '__url' => $url
        ];
    }

    $ch = curl_init($url);
    $headers = [
        'Accept: application/json',
        'User-Agent: GBT-Dashboard-Live-Checker'
    ];

    $options = [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 25,
        CURLOPT_CONNECTTIMEOUT => 10,
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
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($body === false || $error) {
        return [
            '__error' => true,
            '__message' => $error ?: 'Curl failed',
            '__code' => $code,
            '__url' => $url
        ];
    }

    $json = json_decode($body, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        return [
            '__error' => true,
            '__message' => 'Invalid JSON response',
            '__code' => $code,
            '__url' => $url,
            '__raw' => substr($body, 0, 500)
        ];
    }

    if ($code >= 400) {
        $json['__http_error'] = true;
        $json['__code'] = $code;
        $json['__url'] = $url;
    }

    return $json;
}

function extractArray($response)
{
    if (!is_array($response)) {
        return [];
    }

    if (array_keys($response) === range(0, count($response) - 1)) {
        return $response;
    }

    // Most ELD APIs return: { status: SUCCESS, result: [...] }
    if (isset($response['result']) && is_array($response['result'])) {
        return $response['result'];
    }

    $keys = ['data', 'records', 'clients', 'vehicles', 'drivers', 'active_vehicles', 'activeVehicles'];
    foreach ($keys as $key) {
        if (isset($response[$key]) && is_array($response[$key])) {
            if (array_keys($response[$key]) === range(0, count($response[$key]) - 1)) {
                return $response[$key];
            }

            foreach ($keys as $nestedKey) {
                if (isset($response[$key][$nestedKey]) && is_array($response[$key][$nestedKey])) {
                    return $response[$key][$nestedKey];
                }
            }
        }
    }

    return [];
}

function getServerStatus($response)
{
    if (!is_array($response) || !empty($response['__error']) || !empty($response['__http_error'])) {
        return 'Offline';
    }

    $text = strtolower(json_encode($response));

    if (strpos($text, 'offline') !== false || strpos($text, 'down') !== false || strpos($text, 'failed') !== false || strpos($text, 'error') !== false) {
        return 'Offline';
    }

    if (strpos($text, 'warning') !== false || strpos($text, 'slow') !== false || strpos($text, 'issue') !== false) {
        return 'Warning';
    }

    return 'Online';
}

function monthYear()
{
    return date('M/Y');
}

function firstValue($row, $keys, $default = '')
{
    foreach ($keys as $key) {
        if (isset($row[$key]) && $row[$key] !== '' && $row[$key] !== null) {
            return $row[$key];
        }
    }
    return $default;
}

function normalizeAppType($value)
{
    $value = strtoupper(trim((string) $value));
    if ($value === 'REEFER' || $value === 'REFEER') return 'REEFER';
    if ($value === 'DASHCAM' || $value === 'DASH CAM' || $value === 'DASH_CAMERA') return 'DASHCAM';
    if ($value === 'GPS') return 'GPS';
    if ($value === 'ELD') return 'ELD';
    return '';
}

function appTypesForCompany($company)
{
    $types = [];

    foreach (['app_type', 'application_type', 'type'] as $key) {
        if (!empty($company[$key])) {
            $type = normalizeAppType($company[$key]);
            if ($type !== '') {
                $types[] = $type;
            }
        }
    }

    $haystack = strtolower(($company['company_name'] ?? '') . ' ' . ($company['package_name'] ?? ''));
    if (strpos($haystack, 'gps') !== false) $types[] = 'GPS';
    if (strpos($haystack, 'reefer') !== false || strpos($haystack, 'refer') !== false) $types[] = 'REEFER';
    if (strpos($haystack, 'dashcam') !== false || strpos($haystack, 'dash cam') !== false) $types[] = 'DASHCAM';
    if (strpos($haystack, 'eld') !== false || strpos($haystack, 'elog') !== false) $types[] = 'ELD';

    $types = array_values(array_unique(array_filter($types)));

    // Important: customer dashboard has a global selected-app filter.
    // If the companies table does not store app_type, expose the same real customer data under all app sections
    // so selecting GPS/Reefer/Dashcam does not show 0 just because the backend hard-coded ELD.
    return count($types) ? $types : ['ELD', 'GPS', 'REEFER', 'DASHCAM'];
}

function vehicleBelongsToClient($vehicle, $clientId)
{
    $clientId = (string) $clientId;
    if ($clientId === '' || $clientId === '0') {
        return false;
    }

    $vehicleClientId = firstValue($vehicle, ['clientId', 'client_id', 'companyId', 'company_id', 'customerId', 'customer_id'], null);
    return $vehicleClientId !== null && (string) $vehicleClientId === $clientId;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $debug = isset($_GET['debug']) && $_GET['debug'] == '1';
    $requestedApp = normalizeAppType($_GET['app'] ?? '');

    $stmt = $db->query("SELECT * FROM companies WHERE admin_url IS NOT NULL AND admin_url <> '' ORDER BY id DESC");
    $companies = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $rows = [];
    $debugRows = [];
    $rowId = 1;

    foreach ($companies as $company) {
        $adminUrl = normalizeAdminUrl($company['admin_url'] ?? '');
        if ($adminUrl === '') {
            continue;
        }

        $analyticsUrl = $adminUrl . '/eld_log/master/view_project_detail_analytics';
        $clientUrl = $adminUrl . '/eld_log/master/view_client';
        $vehicleUrl = $adminUrl . '/eld_log/master/view_active_vehicle';
        $driverUrl = $adminUrl . '/eld_log/master/view_driver_information';
        $serverUrl = $adminUrl . '/eld_log/dispatch/view_server_health';

        $analyticsResponse = fetchJson($analyticsUrl, new stdClass());
        $clientResponse = fetchJson($clientUrl, ['clientId' => 0]);
        $vehicleResponse = fetchJson($vehicleUrl, ['vehicleId' => 0, 'clientId' => 0]);
        $driverResponse = fetchJson($driverUrl, ['employeeId' => '0']);
        $serverResponse = fetchJson($serverUrl, new stdClass());

        $clients = extractArray($clientResponse);
        $vehicles = extractArray($vehicleResponse);
        $drivers = extractArray($driverResponse);
        $serverStatus = getServerStatus($serverResponse);

        $analytics = (is_array($analyticsResponse) && isset($analyticsResponse['result']) && is_array($analyticsResponse['result']))
            ? $analyticsResponse['result']
            : [];

        $totalVehicles = count($vehicles);
        if ($totalVehicles === 0 && isset($analytics['totalVehicles'])) {
            $totalVehicles = (int) $analytics['totalVehicles'];
        }

        $totalDrivers = count($drivers);
        if ($totalDrivers === 0 && isset($analytics['totalDrivers'])) {
            $totalDrivers = (int) $analytics['totalDrivers'];
        }

        $appTypes = $requestedApp !== '' ? [$requestedApp] : appTypesForCompany($company);

        // Main requirement: show every subcompany/client from each registered company portal.
        if (count($clients) > 0) {
            foreach ($clients as $client) {
                $clientId = firstValue($client, ['clientId', 'client_id', 'id', 'companyId', 'company_id'], '');
                $clientName = trim((string) firstValue($client, ['clientName', 'client_name', 'companyName', 'company_name', 'name'], ''));
                if ($clientName === '') {
                    $clientName = 'Subcompany #' . ($clientId ?: $rowId);
                }

                $clientVehicles = array_values(array_filter($vehicles, function ($vehicle) use ($clientId) {
                    return vehicleBelongsToClient($vehicle, $clientId);
                }));

                $activeCount = count($clientVehicles);

                foreach ($appTypes as $appType) {
                    $rows[] = [
                        'id' => $rowId++,
                        'companyId' => 'CMP-' . $company['id'] . ($clientId !== '' ? '-CL-' . $clientId : ''),
                        'parentCompanyId' => (int) $company['id'],
                        'parentCompany' => $company['company_name'],
                        'clientId' => $clientId,
                        'customer' => $clientName,
                        'monthYear' => monthYear(),
                        'app' => $appType,
                        'activeAtStart' => $activeCount,
                        'addedDuringMonth' => 0,
                        'deletedDuringMonth' => 0,
                        'serverStatus' => $serverStatus,
                        'locked' => true,
                        'dotNumber' => (string) firstValue($client, ['dotNo', 'dot_no', 'dotNumber', 'dot_number'], ''),
                        'liveSource' => $adminUrl,
                        'syncAt' => date('Y-m-d H:i:s'),
                        'rawCounts' => [
                            'activeVehicles' => $activeCount,
                            'totalPortalVehicles' => $totalVehicles,
                            'totalPortalDrivers' => $totalDrivers,
                            'totalPortalClients' => count($clients)
                        ]
                    ];
                }
            }
        } else {
            // Fallback: if a portal does not return subcompanies, still show the main company with real portal totals.
            foreach ($appTypes as $appType) {
                $rows[] = [
                    'id' => $rowId++,
                    'companyId' => 'CMP-' . $company['id'],
                    'parentCompanyId' => (int) $company['id'],
                    'parentCompany' => $company['company_name'],
                    'clientId' => '',
                    'customer' => $company['company_name'],
                    'monthYear' => monthYear(),
                    'app' => $appType,
                    'activeAtStart' => $totalVehicles,
                    'addedDuringMonth' => 0,
                    'deletedDuringMonth' => 0,
                    'serverStatus' => $serverStatus,
                    'locked' => true,
                    'dotNumber' => '',
                    'liveSource' => $adminUrl,
                    'syncAt' => date('Y-m-d H:i:s'),
                    'rawCounts' => [
                        'activeVehicles' => $totalVehicles,
                        'drivers' => $totalDrivers,
                        'clients' => 0
                    ]
                ];
            }
        }

        if ($debug) {
            $debugRows[] = [
                'company' => $company['company_name'],
                'admin_url' => $adminUrl,
                'app_types_returned' => $appTypes,
                'clients_found' => count($clients),
                'vehicles_found' => count($vehicles),
                'drivers_found' => count($drivers),
                'analytics_total_vehicles' => $analytics['totalVehicles'] ?? null,
                'server_status' => $serverStatus,
                'client_api_error' => $clientResponse['__message'] ?? null,
                'vehicle_api_error' => $vehicleResponse['__message'] ?? null,
                'analytics_api_error' => $analyticsResponse['__message'] ?? null,
            ];
        }
    }

    echo json_encode([
        'success' => true,
        'data' => $rows,
        'total' => count($rows),
        'debug' => $debug ? $debugRows : null
    ]);
    exit;

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Customer live dashboard failed',
        'error' => $e->getMessage(),
        'file' => basename($e->getFile()),
        'line' => $e->getLine()
    ]);
    exit;
}
