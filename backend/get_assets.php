<?php
// get_assets.php - Fetch all assets
require_once "db.php";

$stmt = $pdo->query("SELECT id, name, category, purchase_date as purchaseDate, status, location, quantity FROM assets ORDER BY id");
$assets = $stmt->fetchAll();

jsonResponse($assets);
?>
