<?php
// add_allocation.php - Add new allocation
require_once "db.php";

$data = getInput();
if (!$data || !isset($data['assetId'], $data['assetName'], $data['userName'], $data['issueDate'], $data['returnDate'])) {
    jsonResponse(["error" => "Missing required fields"], 400);
}

$stmt = $pdo->prepare("INSERT INTO allocations (asset_id, asset_name, user_name, issue_date, return_date) VALUES (?, ?, ?, ?, ?)");
$stmt->execute([$data['assetId'], $data['assetName'], $data['userName'], $data['issueDate'], $data['returnDate']]);

// Update asset status
$stmt = $pdo->prepare("UPDATE assets SET status = 'Allocated' WHERE id = ?");
$stmt->execute([$data['assetId']]);

$id = $pdo->lastInsertId();

jsonResponse([
    "id" => "ALC-" . str_pad($id, 3, "0", STR_PAD_LEFT),
    "assetId" => $data['assetId'],
    "assetName" => $data['assetName'],
    "userName" => $data['userName'],
    "issueDate" => $data['issueDate'],
    "returnDate" => $data['returnDate']
], 201);
?>
