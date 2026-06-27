<?php
// router.php
// Local router script for PHP built-in web server.
// Usage: php -S localhost:8080 router.php

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Route /backend/api/ to the backend folder
if (strpos($uri, '/backend/api/') === 0) {
    $file = __DIR__ . $uri;
    if (file_exists($file)) {
        require_once $file;
        exit;
    }
}

// Otherwise, serve static files from the frontend folder
$file = __DIR__ . '/frontend' . $uri;

if ($uri === '/' || $uri === '') {
    $file = __DIR__ . '/frontend/index.html';
}

if (is_file($file)) {
    $ext = pathinfo($file, PATHINFO_EXTENSION);
    $mimeTypes = [
        'html' => 'text/html; charset=utf-8',
        'css'  => 'text/css; charset=utf-8',
        'js'   => 'application/javascript; charset=utf-8',
        'json' => 'application/json; charset=utf-8',
        'png'  => 'image/png',
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif'  => 'image/gif',
        'svg'  => 'image/svg+xml',
        'ico'  => 'image/x-icon',
        'webp' => 'image/webp',
    ];
    
    if (isset($mimeTypes[$ext])) {
        header('Content-Type: ' . $mimeTypes[$ext]);
    }
    readfile($file);
    exit;
}

// Return 404
http_response_code(404);
echo "404 Not Found";
exit;
