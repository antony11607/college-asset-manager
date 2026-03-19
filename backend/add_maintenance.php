<?php
// add_maintenance.php - Add maintenance record
require_once "db.php";

$data = getInput();
if (!$data || !isset($data['assetId'], $data['assetName'], $data['serviceDate'], $data['description'])) {
    jsonResponse(["error" => "Missing required fields"], 400);
}

$stmt = $pdo->prepare("INSERT INTO maintenance_records (asset_id, asset_name, service_date, description) VALUES (?, ?, ?, ?)");
$stmt->execute([$data['assetId'], $data['assetName'], $data['serviceDate'], $data['description']]);

$id = $pdo->lastInsertId();

jsonResponse([
    "id" => "MNT-" . str_pad($id, 3, "0", STR_PAD_LEFT),
    "assetId" => $data['assetId'],
    "assetName" => $data['assetName'],
    "serviceDate" => $data['serviceDate'],
    "description" => $data['description']
], 201);
?>
