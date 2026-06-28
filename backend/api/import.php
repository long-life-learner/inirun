<?php
// backend/api/import.php
// Web API for bulk CSV import.
// Receives multipart/form-data upload, parses, truncates database, and inserts records.

header('Content-Type: application/json; charset=utf-8');

// Basic password protection or API token if needed, or simple local access.
// Since we want this easy to deploy, let's secure it with a simple password check or token if specified,
// but for simplicity, we allow standard POST upload and validate file structure.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

if (!isset($_FILES['csv_file']) || $_FILES['csv_file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'File upload error atau file tidak ditemukan']);
    exit;
}

$tmpPath = $_FILES['csv_file']['tmp_name'];

require __DIR__ . '/../config/db.php';

$fh = fopen($tmpPath, 'r');
if (!$fh) {
    http_response_code(500);
    echo json_encode(['error' => 'Gagal membuka file terunggah']);
    exit;
}

// Read header row
$raw_headers = fgetcsv($fh);
if (!$raw_headers) {
    http_response_code(400);
    echo json_encode(['error' => 'File CSV kosong atau format salah']);
    fclose($fh);
    exit;
}

$headers = array_map(fn($h) => strtolower(trim($h)), $raw_headers);

// Aliases map
$alias = [
    'bib_number' => 'bib',
    'no_bib'     => 'bib',
    'full_name'  => 'name',
    'nama'       => 'name',
    'jarak'      => 'category',
    'kelamin'    => 'gender',
    'usia_group' => 'age_group',
    'gun'        => 'gun_time',
    'chip'       => 'net_time',
    'net'        => 'net_time',
    'rank'       => 'rank_overall',
    'rank_cat'   => 'rank_category_gender',
    'kota'       => 'city',
    'foto'       => 'photo_url',
    'cp'         => 'checkpoint',
    'check'      => 'checkpoint',
];
$headers = array_map(fn($h) => $alias[$h] ?? $h, $headers);

// Required fields
$required = ['bib', 'name', 'category', 'gender', 'gun_time', 'net_time'];
foreach ($required as $r) {
    if (!in_array($r, $headers, true)) {
        http_response_code(400);
        echo json_encode([
            'error' => "Kolom wajib tidak ditemukan: '$r'",
            'csv_headers' => $raw_headers
        ]);
        fclose($fh);
        exit;
    }
}

try {
    $pdo->beginTransaction();

    // Clear existing data before bulk-import
    $pdo->exec('TRUNCATE TABLE inirun_results');

    $stmt = $pdo->prepare(
        "INSERT INTO inirun_results
           (bib, name, category, gender, age_group, gun_time, net_time,
            pace, rank_overall, rank_category_gender, city, photo_url, checkpoint)
         VALUES
           (:bib, :name, :category, :gender, :age_group, :gun_time, :net_time,
            :pace, :rank_overall, :rank_category_gender, :city, :photo_url, :checkpoint)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name), gender = VALUES(gender),
           age_group = VALUES(age_group), gun_time = VALUES(gun_time),
           net_time = VALUES(net_time), pace = VALUES(pace),
           rank_overall = VALUES(rank_overall),
           rank_category_gender = VALUES(rank_category_gender),
           city = VALUES(city), photo_url = VALUES(photo_url),
           checkpoint = VALUES(checkpoint)"
    );

    $count = 0;
    $errors = [];
    $line = 1;

    while (($row = fgetcsv($fh)) !== false) {
        $line++;
        if (count($row) !== count($headers)) {
            $errors[] = "Baris $line: jumlah kolom tidak cocok (" . count($row) . " vs " . count($headers) . ")";
            continue;
        }
        $data = array_combine($headers, $row);

        // Normalize gender
        $g = strtoupper(trim($data['gender'] ?? ''));
        $gender_map = [
            'L' => 'M', 'PUTRA' => 'M', 'LAKI' => 'M', 'MALE' => 'M',
            'P' => 'F', 'PUTRI' => 'F', 'WANITA' => 'F', 'FEMALE' => 'F'
        ];
        $data['gender'] = $gender_map[$g] ?? (in_array($g, ['M','F']) ? $g : null);
        if (!$data['gender']) {
            $errors[] = "Baris $line: gender tidak dikenal '$g'";
            continue;
        }

        // Null-ify empty optionals
        foreach (['age_group','pace','rank_overall','rank_category_gender','city','photo_url','checkpoint'] as $f) {
            if (!isset($data[$f]) || trim($data[$f]) === '') $data[$f] = null;
        }
        // Cast ints
        if ($data['rank_overall'] !== null)        $data['rank_overall'] = (int)$data['rank_overall'];
        if ($data['rank_category_gender'] !== null) $data['rank_category_gender'] = (int)$data['rank_category_gender'];

        try {
            $stmt->execute([
                ':bib'                  => trim($data['bib']),
                ':name'                 => trim($data['name']),
                ':category'             => trim($data['category']),
                ':gender'               => $data['gender'],
                ':age_group'            => $data['age_group'],
                ':gun_time'             => trim($data['gun_time']),
                ':net_time'             => trim($data['net_time']),
                ':pace'                 => $data['pace'],
                ':rank_overall'         => $data['rank_overall'],
                ':rank_category_gender' => $data['rank_category_gender'],
                ':city'                 => $data['city'],
                ':photo_url'            => $data['photo_url'],
                ':checkpoint'           => $data['checkpoint'],
            ]);
            $count++;
        } catch (PDOException $e) {
            $errors[] = "Baris $line error: " . $e->getMessage();
        }
    }

    fclose($fh);
    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => "Import selesai: $count baris sukses, " . count($errors) . " baris dilewati.",
        'imported_count' => $count,
        'error_count' => count($errors),
        'errors' => array_slice($errors, 0, 100) // cap to 100 entries to keep json size clean
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => 'Database transaction failed: ' . $e->getMessage()]);
}
