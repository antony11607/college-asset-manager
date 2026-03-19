<?php
// add_asset.php - Add a new asset
require_once "db.php";

$data = getInput();
if (!$data || !isset($data['name'], $data['category'], $data['purchaseDate'], $data['status'], $data['location'])) {
    jsonResponse(["error" => "Missing required fields"], 400);
}

// Generate next ID
$stmt = $pdo->query("SELECT COUNT(*) as count FROM assets");
$count = $stmt->fetch()['count'] + 1;
$id = "AST-" . str_pad($count, 3, "0", STR_PAD_LEFT);

$stmt = $pdo->prepare("INSERT INTO assets (id, name, category, purchase_date, status, location) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->execute([$id, $data['name'], $data['category'], $data['purchaseDate'], $data['status'], $data['location']]);

jsonResponse([
    "id" => $id,
    "name" => $data['name'],
    "category" => $data['category'],
    "purchaseDate" => $data['purchaseDate'],
    "status" => $data['status'],
    "location" => $data['location']
], 201);
?>
