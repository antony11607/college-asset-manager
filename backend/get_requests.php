<?php
// get_requests.php - Fetch all requests (admin) or user-specific
require_once "db.php";

$user_id = $_GET['user_id'] ?? null;

if ($user_id) {
    $stmt = $pdo->prepare("SELECT * FROM asset_requests WHERE user_id = ? ORDER BY id DESC");
    $stmt->execute([$user_id]);
} else {
    $stmt = $pdo->query("SELECT * FROM asset_requests ORDER BY id DESC");
}

$requests = $stmt->fetchAll();

$result = array_map(function ($r) {
    return [
        "id" => "REQ-" . str_pad($r['id'], 3, "0", STR_PAD_LEFT),
        "user_id" => $r['user_id'],
        "asset_id" => $r['asset_id'],
        "quantity" => (int) $r['quantity'],
        "status" => $r['status'],
        "userName" => $r['user_name'],
        "assetName" => $r['asset_name'],
        "requestDate" => $r['request_date'],
        "reason" => $r['reason']
    ];
}, $requests);

jsonResponse($result);
?>
