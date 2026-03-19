<?php
// request_asset.php - Insert new asset request (status = pending)
require_once "db.php";

$data = getInput();

if (!$data || !isset($data['user_id'], $data['asset_id'], $data['quantity'])) {
    jsonResponse(["error" => "Missing required fields: user_id, asset_id, quantity"], 400);
}

$user_id = $data['user_id'];
$asset_id = $data['asset_id'];
$quantity = (int) $data['quantity'];
$reason = $data['reason'] ?? '';

// Fetch asset name for display
$stmt = $pdo->prepare("SELECT name FROM assets WHERE id = ?");
$stmt->execute([$asset_id]);
$asset = $stmt->fetch();

if (!$asset) {
    jsonResponse(["error" => "Asset not found"], 404);
}

// Fetch user name
$stmt = $pdo->prepare("SELECT name FROM users WHERE email = ?");
$stmt->execute([$user_id]);
$user = $stmt->fetch();

$stmt = $pdo->prepare("
    INSERT INTO asset_requests (user_id, asset_id, quantity, reason, status, request_date, user_name, asset_name)
    VALUES (?, ?, ?, ?, 'pending', CURDATE(), ?, ?)
");
$stmt->execute([$user_id, $asset_id, $quantity, $reason, $user['name'] ?? $user_id, $asset['name']]);

$id = $pdo->lastInsertId();

jsonResponse([
    "id" => "REQ-" . str_pad($id, 3, "0", STR_PAD_LEFT),
    "user_id" => $user_id,
    "asset_id" => $asset_id,
    "quantity" => $quantity,
    "reason" => $reason,
    "status" => "pending",
    "userName" => $user['name'] ?? $user_id,
    "assetName" => $asset['name'],
    "requestDate" => date("Y-m-d")
], 201);
?>
