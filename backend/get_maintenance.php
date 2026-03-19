<?php
// get_maintenance.php - Fetch maintenance records
require_once "db.php";

$stmt = $pdo->query("SELECT * FROM maintenance_records ORDER BY id DESC");
$records = $stmt->fetchAll();

$result = array_map(function ($r) {
    return [
        "id" => "MNT-" . str_pad($r['id'], 3, "0", STR_PAD_LEFT),
        "assetId" => $r['asset_id'],
        "assetName" => $r['asset_name'],
        "serviceDate" => $r['service_date'],
        "description" => $r['description']
    ];
}, $records);

jsonResponse($result);
?>
