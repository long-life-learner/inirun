<?php
// backend/api/podium.php
// GET /api/podium.php?category=5K&gender=M
// Returns: exactly ≤3 rows (rank 1,2,3), used directly by Three.js scene.

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require __DIR__ . '/../config/db.php';

$allowed_categories = ['5K', '10K', 'Half Marathon'];
$allowed_genders = ['M', 'F'];

$category = $_GET['category'] ?? null;
$gender = $_GET['gender'] ?? null;

if (
    !$category || !in_array($category, $allowed_categories, true) ||
    !$gender || !in_array($gender, $allowed_genders, true)
) {
    http_response_code(400);
    echo json_encode(['error' => 'Parameter category dan gender wajib dan harus valid']);
    exit;
}

$stmt = $pdo->prepare(
    "WITH ranked_results AS (
      SELECT bib, name, category, gender, age_group,
             gun_time, net_time, pace,
             rank_overall,
             ROW_NUMBER() OVER (PARTITION BY category, gender ORDER BY CASE WHEN gun_time = '00:00:00' THEN 1 ELSE 0 END ASC, gun_time ASC, net_time ASC) AS rank_category_gender,
              city, photo_url, checkpoint
      FROM inirun_results
     )
     SELECT *
     FROM ranked_results
     WHERE category = :category
       AND gender   = :gender
       AND rank_category_gender IN (1, 2, 3, 4, 5)
     ORDER BY rank_category_gender ASC"
);
$stmt->execute(['category' => $category, 'gender' => $gender]);
$rows = $stmt->fetchAll();

$result = array_map(fn($r) => [
    'bib' => $r['bib'],
    'name' => $r['name'],
    'category' => $r['category'],
    'gender' => $r['gender'],
    'ageGroup' => $r['age_group'],
    'gunTime' => $r['gun_time'],
    'netTime' => $r['net_time'],
    'pace' => $r['pace'],
    'rankOverall' => $r['rank_overall'] !== null ? (int) $r['rank_overall'] : null,
    'rankCategoryGender' => $r['rank_category_gender'] !== null ? (int) $r['rank_category_gender'] : null,
    'city' => $r['city'],
    'photoUrl' => $r['photo_url'],
    'checkpoint' => $r['checkpoint'] ?? null,
], $rows);

echo json_encode($result);
