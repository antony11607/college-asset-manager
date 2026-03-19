<?php
// get_allocations.php - Fetch allocations (all or user-specific)
require_once "db.php";

$user_id = $_GET['user_id'] ?? null;

if ($user_id) {
    $stmt = $pdo->prepare("SELECT * FROM allocations WHERE user_name = (SELECT name FROM users WHERE email = ?) ORDER BY id DESC");
    $stmt->execute([$user_id]);
} else {
    $stmt = $pdo->query("SELECT * FROM allocations ORDER BY id DESC");
}

$allocations = $stmt->fetchAll();

$result = array_map(function ($a) {
    return [
        "id" => "ALC-" . str_pad($a['id'], 3, "0", STR_PAD_LEFT),
        "assetId" => $a['asset_id'],
        "assetName" => $a['asset_name'],
        "userName" => $a['user_name'],
        "issueDate" => $a['issue_date'],
        "returnDate" => $a['return_date']
    ];
}, $allocations);

jsonResponse($result);
?>
