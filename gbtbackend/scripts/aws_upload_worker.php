<?php
// AWS Upload Worker Script for Android Play Store and iOS TestFlight

$id = isset($argv[1]) ? intval($argv[1]) : 0;
if ($id <= 0) {
    die("Invalid Artifact ID\n");
}

$logDir = __DIR__ . '/../logs';
if (!is_dir($logDir)) {
    mkdir($logDir, 0755, true);
}

$logFile = $logDir . '/fastlane_' . $id . '.log';

function writeLog($logFile, $message)
{
    file_put_contents($logFile, "[" . date('Y-m-d H:i:s') . "] " . $message . "\n", FILE_APPEND);
}

function updateArtifactStatus($conn, $id, $status, $message, $markUploaded = false)
{
    if ($markUploaded) {
        $stmt = $conn->prepare("UPDATE app_artifacts SET store_upload_status = ?, store_upload_message = ?, uploaded_to_store_at = NOW() WHERE id = ?");
        $stmt->bind_param("ssi", $status, $message, $id);
    } else {
        $stmt = $conn->prepare("UPDATE app_artifacts SET store_upload_status = ?, store_upload_message = ? WHERE id = ?");
        $stmt->bind_param("ssi", $status, $message, $id);
    }
    $stmt->execute();
}

file_put_contents($logFile, "[" . date('Y-m-d H:i:s') . "] Starting AWS Upload Worker for Artifact ID: $id\n");

// AWS Configuration
$awsIp = "107.21.88.198";
$pemPath = "/home/lmhaiss/domains/app6.lmh-ai.in/public_html/gbtbackend/scripts/gbt_dashboard.pem";
$sshUser = "ubuntu";

@chmod($pemPath, 0600);

// DB Connection
$db_host = "localhost";
$db_name = "lmhaiss_app4";
$db_user = "lmhaiss_app4";
$db_pass = "tedzZXe4EsSptezVsH7z";

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($conn->connect_error) {
    writeLog($logFile, "DB Connection failed: " . $conn->connect_error);
    exit;
}
$conn->set_charset("utf8mb4");

$stmt = $conn->prepare("SELECT * FROM app_artifacts WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$artifact = $stmt->get_result()->fetch_assoc();

if (!$artifact) {
    writeLog($logFile, "Artifact not found in DB");
    $conn->close();
    exit;
}

$platform = trim($artifact['platform'] ?? '');
$binaryName = trim($artifact['binary_file_name'] ?? '');
$binaryExt = strtolower(trim($artifact['binary_file_ext'] ?? pathinfo($binaryName, PATHINFO_EXTENSION)));

if ($binaryName === '') {
    $msg = "No binary file attached to this artifact.";
    writeLog($logFile, $msg);
    updateArtifactStatus($conn, $id, 'failed', $msg);
    $conn->close();
    exit;
}

$uploadDir = __DIR__ . '/../storage/apps/';
$localFilePath = $uploadDir . $binaryName;

if (!file_exists($localFilePath)) {
    $msg = "Local binary not found: $localFilePath";
    writeLog($logFile, $msg);
    updateArtifactStatus($conn, $id, 'failed', $msg);
    $conn->close();
    exit;
}

$packageName = !empty($artifact['package_name'])
    ? trim($artifact['package_name'])
    : "com.gbt." . preg_replace('/[^a-zA-Z0-9]/', '', strtolower($artifact['company'] ?? 'app'));

$releaseTrack = !empty($artifact['release_track']) ? trim($artifact['release_track']) : 'internal';

if ($platform === 'Android' && !in_array($binaryExt, ['aab', 'apk'], true)) {
    $msg = "Android upload requires .aab or .apk file. Current file: .$binaryExt";
    writeLog($logFile, $msg);
    updateArtifactStatus($conn, $id, 'failed', $msg);
    $conn->close();
    exit;
}

if ($platform === 'iOS' && $binaryExt !== 'ipa') {
    $msg = "iOS upload requires .ipa file. Current file: .$binaryExt";
    writeLog($logFile, $msg);
    updateArtifactStatus($conn, $id, 'failed', $msg);
    $conn->close();
    exit;
}

if ($packageName === '') {
    $msg = ($platform === 'iOS') ? "Bundle ID is required for iOS upload." : "Package name is required for Android upload.";
    writeLog($logFile, $msg);
    updateArtifactStatus($conn, $id, 'failed', $msg);
    $conn->close();
    exit;
}

$remoteFilePathRaw = "/opt/app_deployer/binaries/" . $binaryName;
$remoteFilePath = escapeshellarg($remoteFilePathRaw);

updateArtifactStatus($conn, $id, 'processing', 'Uploading binary to AWS...');

// Step 1: SCP upload
writeLog($logFile, "Transferring .$binaryExt to AWS via SCP...");

$scpCmd = sprintf(
    'timeout 600 scp -o BatchMode=yes -o ConnectTimeout=30 -o StrictHostKeyChecking=no -i %s %s %s@%s:%s 2>&1',
    escapeshellarg($pemPath),
    escapeshellarg($localFilePath),
    escapeshellarg($sshUser),
    escapeshellarg($awsIp),
    $remoteFilePath
);

writeLog($logFile, "Executing: $scpCmd");

$scpOutput = [];
$scpExitCode = 0;
exec($scpCmd, $scpOutput, $scpExitCode);
$scpResult = implode("\n", $scpOutput);

writeLog($logFile, "SCP Output:\n$scpResult");
writeLog($logFile, "SCP Exit Code: $scpExitCode");

if ($scpExitCode !== 0) {
    $msg = "SCP upload failed. Check log.";
    writeLog($logFile, $msg);
    updateArtifactStatus($conn, $id, 'failed', $msg);
    $conn->close();
    exit;
}

// Step 2: Run Fastlane via SSH
updateArtifactStatus($conn, $id, 'processing', 'Triggering Fastlane on AWS...');

writeLog($logFile, "Triggering Fastlane on AWS for platform: $platform...");

$timeoutSeconds = ($platform === 'iOS') ? 1800 : 1200;
$sshCmd = sprintf(
    'timeout %d ssh -o BatchMode=yes -o ConnectTimeout=30 -o StrictHostKeyChecking=no -i %s %s@%s %s 2>&1',
    $timeoutSeconds,
    escapeshellarg($pemPath),
    escapeshellarg($sshUser),
    escapeshellarg($awsIp),
    escapeshellarg('/opt/app_deployer/run_fastlane.sh') . ' ' .
    $remoteFilePath . ' ' .
    escapeshellarg($packageName) . ' ' .
    escapeshellarg($releaseTrack) . ' ' .
    escapeshellarg($platform)
);

writeLog($logFile, "Executing: $sshCmd");

$sshOutput = [];
$sshExitCode = 0;
exec($sshCmd, $sshOutput, $sshExitCode);
$sshResult = implode("\n", $sshOutput);

writeLog($logFile, "SSH Output:\n$sshResult");
writeLog($logFile, "SSH Exit Code: $sshExitCode");

// Step 3: Parse result
if ($sshExitCode === 0 && (strpos($sshResult, 'SUCCESS:') !== false || strpos($sshResult, 'Successfully uploaded') !== false)) {
    writeLog($logFile, "Deployment completed successfully.");

    $successMsg = ($platform === 'Android') ? 'Uploaded to Play Store' : 'Uploaded to TestFlight';
    updateArtifactStatus($conn, $id, 'success', $successMsg, true);
} else {
    writeLog($logFile, "Deployment failed.");

    $lower = strtolower($sshResult);
    if (strpos($sshResult, 'Invalid JWT Signature') !== false || strpos($lower, 'invalid_grant') !== false) {
        $errorMsg = "Store API key is invalid. Check Play Store JSON or App Store .p8 key.";
    } elseif (strpos($lower, 'version code') !== false) {
        $errorMsg = "Version code already used. Increase Android versionCode and retry.";
    } elseif (strpos($lower, 'bundle version') !== false || strpos($lower, 'cfbundleversion') !== false) {
        $errorMsg = "iOS build number already used. Increase CFBundleVersion and retry.";
    } elseif (strpos($lower, 'package') !== false || strpos($lower, 'bundle id') !== false || strpos($lower, 'app_identifier') !== false) {
        $errorMsg = "Package name / Bundle ID issue. Check package_name in artifact.";
    } elseif ($sshExitCode === 124) {
        $errorMsg = "Fastlane timed out.";
    } else {
        $errorMsg = "Deployment failed. Check log.";
    }

    updateArtifactStatus($conn, $id, 'failed', $errorMsg);
}

$conn->close();
?>