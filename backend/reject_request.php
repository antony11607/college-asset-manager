<?php
// reject_request.php - Update request status to rejected
require_once "db.php";

$data = getInput();

if (!$data || !isset($data['request_id'])) {
    jsonResponse(["error" => "Missing request_id"], 400);
}

$numeric_id = (int) preg_replace('/\D/', '', $data['request_id']);

$stmt = $pdo->prepare("SELECT id FROM asset_requests WHERE id = ? AND status = 'pending'");
$stmt->execute([$numeric_id]);

if (!$stmt->fetch()) {
    jsonResponse(["error" => "Request not found or already processed"], 404);
}

$stmt = $pdo->prepare("UPDATE asset_requests SET status = 'rejected' WHERE id = ?");
$stmt->execute([$numeric_id]);

jsonResponse(["message" => "Request rejected"]);
?>
