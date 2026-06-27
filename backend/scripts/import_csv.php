<?php
// backend/scripts/import_csv.php
// CLI only: php import_csv.php path/to/hasil.csv
// Clears results table and bulk-inserts from CSV.
// Expected columns (order flexible — matched by header name):
//   bib, name, category, gender, age_group, gun_time, net_time,
//   pace, rank_overall, rank_category_gender, city, photo_url

if (PHP_SAPI !== 'cli') { die("CLI only\n"); }
if (empty($argv[1]))    { die("Usage: php import_csv.php path/to/hasil.csv\n"); }

$file = $argv[1];
if (!file_exists($file)) { die("File not found: $file\n"); }

require __DIR__ . '/../config/db.php';

$fh = fopen($file, 'r');
if (!$fh) { die("Cannot open file\n"); }

// Read header row — case-insensitive, trim whitespace
$raw_headers = fgetcsv($fh);
$headers = array_map(fn($h) => strtolower(trim($h)), $raw_headers);

// Flexible header aliases
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
        die("Kolom wajib tidak ditemukan: '$r'. Header CSV: " . implode(', ', $headers) . "\n");
    }
}

$pdo->beginTransaction();

// Truncate existing data
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
$errors = 0;
$line = 1;

while (($row = fgetcsv($fh)) !== false) {
    $line++;
    if (count($row) !== count($headers)) {
        fwrite(STDERR, "Baris $line: jumlah kolom tidak cocok, dilewati\n");
        $errors++;
        continue;
    }
    $data = array_combine($headers, $row);

    // Normalize gender
    $g = strtoupper(trim($data['gender'] ?? ''));
    $gender_map = ['L' => 'M', 'PUTRA' => 'M', 'LAKI' => 'M', 'MALE' => 'M',
                   'P' => 'F', 'PUTRI' => 'F', 'WANITA' => 'F', 'FEMALE' => 'F'];
    $data['gender'] = $gender_map[$g] ?? (in_array($g, ['M','F']) ? $g : null);
    if (!$data['gender']) {
        fwrite(STDERR, "Baris $line: gender tidak dikenal '$g', dilewati\n");
        $errors++;
        continue;
    }

    // Null-ify empty optionals
    foreach (['age_group','pace','rank_overall','rank_category_gender','city','photo_url','checkpoint'] as $f) {
        if (!isset($data[$f]) || trim($data[$f]) === '') $data[$f] = null;
    }
    // Cast ints
    if ($data['rank_overall']        !== null) $data['rank_overall']        = (int)$data['rank_overall'];
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
        fwrite(STDERR, "Baris $line error: " . $e->getMessage() . "\n");
        $errors++;
    }
}

fclose($fh);
$pdo->commit();

echo "Import selesai: $count baris berhasil, $errors baris dilewati.\n";
