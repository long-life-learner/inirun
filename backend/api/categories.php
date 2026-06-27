<?php
// backend/api/categories.php
// GET /api/categories.php
// Returns: [{ category: "5K", gender: "M" }, …] — used to populate filter chips.

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require __DIR__ . '/../config/db.php';

$stmt = $pdo->query(
  "SELECT DISTINCT category, gender
     FROM inirun_results
     ORDER BY
       FIELD(category, '5K', '10K', 'Half Marathon'),
       gender ASC"
);

echo json_encode($stmt->fetchAll());
