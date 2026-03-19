<?php
// get_users.php - Fetch users list for dropdowns
require_once "db.php";

$stmt = $pdo->query("SELECT id, name FROM users ORDER BY name");
$users = $stmt->fetchAll();

jsonResponse($users);
?>
