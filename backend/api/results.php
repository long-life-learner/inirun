<?php
// backend/api/results.php
// GET /api/results.php?category=5K&gender=M&search=budi&page=1&limit=50
// Returns: JSON array of ResultEntry objects, camelCase, paginated.

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *'); // ponytail: tighten to frontend domain in production

require __DIR__ . '/../config/db.php';

// --- Whitelist validation ---
$allowed_categories = ['5K', '10K', 'Half Marathon'];
$allowed_genders = ['M', 'F'];

$category = isset($_GET['category']) && in_array($_GET['category'], $allowed_categories, true)
    ? $_GET['category'] : null;

$gender = isset($_GET['gender']) && in_array($_GET['gender'], $allowed_genders, true)
    ? $_GET['gender'] : null;

$search = isset($_GET['search']) ? trim($_GET['search']) : null;
$page = max(1, (int) ($_GET['page'] ?? 1));
$limit = min(200, max(10, (int) ($_GET['limit'] ?? 50)));
$offset = ($page - 1) * $limit;

// --- Build query ---
$where = [];
$params = [];

if ($category) {
    $where[] = 'category = :category';
    $params['category'] = $category;
}
if ($gender) {
    $where[] = 'gender = :gender';
    $params['gender'] = $gender;
}
if ($search !== null && $search !== '') {
    $where[] = '(name LIKE :search OR bib LIKE :search_bib)';
    $params['search'] = '%' . $search . '%';
    $params['search_bib'] = '%' . $search . '%';
}

$where_sql = $where ? ('WHERE ' . implode(' AND ', $where)) : '';

// Count for pagination
$count_stmt = $pdo->prepare("SELECT COUNT(*) FROM inirun_results $where_sql");
$count_stmt->execute($params);
$total = (int) $count_stmt->fetchColumn();

$sort_sql = ($category && $gender) ? 'rank_category_gender ASC' : 'rank_overall ASC';

// Fetch page
$stmt = $pdo->prepare(
    "WITH ranked_results AS (
      SELECT bib, name, category, gender, age_group,
             gun_time, net_time, pace,
             ROW_NUMBER() OVER (ORDER BY gun_time ASC, net_time ASC) AS rank_overall,
             ROW_NUMBER() OVER (PARTITION BY category, gender ORDER BY gun_time ASC, net_time ASC) AS rank_category_gender,
             city, photo_url, checkpoint
      FROM inirun_results
     )
     SELECT *
     FROM ranked_results
     $where_sql
     ORDER BY $sort_sql
     LIMIT :limit OFFSET :offset"
);
// Bind page params separately (PDO needs explicit int binding for LIMIT/OFFSET)
foreach ($params as $k => $v) {
    $stmt->bindValue($k, $v);
}
$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$rows = $stmt->fetchAll();

/** @param array $r snake_case row → camelCase ResultEntry */
function map_row(array $r): array
{
    return [
        'name' => $r['name'],
        'pace' => $r['pace'],
        'gunTime' => $r['gun_time'],
        'bib' => $r['bib'],
        'category' => $r['category'],
        'gender' => $r['gender'],
        'ageGroup' => $r['age_group'],
        'netTime' => $r['net_time'],
        'rankOverall' => $r['rank_overall'] !== null ? (int) $r['rank_overall'] : null,
        'rankCategoryGender' => $r['rank_category_gender'] !== null ? (int) $r['rank_category_gender'] : null,
        'city' => $r['city'],
        'photoUrl' => $r['photo_url'],
        'checkpoint' => $r['checkpoint'],
    ];
}

echo json_encode([
    'total' => $total,
    'page' => $page,
    'limit' => $limit,
    'pages' => (int) ceil($total / $limit),
    'results' => array_map('map_row', $rows),
]);
