<?php
// backend/config/db.php
// PDO connection. Reads credentials from .env in the same directory.
// Usage: require __DIR__ . '/db.php'; — $pdo is available after.

$_env = parse_ini_file(__DIR__ . '/.env');
if (!$_env) {
    http_response_code(500);
    echo json_encode(['error' => 'Server configuration error']);
    exit;
}

try {
    $pdo = new PDO(
        "mysql:host={$_env['DB_HOST']};dbname={$_env['DB_NAME']};charset=utf8mb4",
        $_env['DB_USER'],
        $_env['DB_PASS'],
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
} catch (PDOException $e) {
    // Never expose raw PDO error to client
    error_log('DB connection failed: ' . $e->getMessage());
    http_response_code(503);
    echo json_encode(['error' => 'Layanan sementara tidak tersedia']);
    exit;
}
