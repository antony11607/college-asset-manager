<?php
// approve_request.php - Approve request + insert allocation + reduce quantity
require_once "db.php";

$data = getInput();

if (!$data || !isset($data['request_id'])) {
    jsonResponse(["error" => "Missing request_id"], 400);
}

// Extract numeric ID from "REQ-001" format
$request_id_raw = $data['request_id'];
$numeric_id = (int) preg_replace('/\D/', '', $request_id_raw);

$pdo->beginTransaction();

try {
    // Get the request details
    $stmt = $pdo->prepare("SELECT * FROM asset_requests WHERE id = ? AND status = 'pending'");
    $stmt->execute([$numeric_id]);
    $request = $stmt->fetch();

    if (!$request) {
        $pdo->rollBack();
        jsonResponse(["error" => "Request not found or already processed"], 404);
    }

    // Update request status to approved
    $stmt = $pdo->prepare("UPDATE asset_requests SET status = 'approved' WHERE id = ?");
    $stmt->execute([$numeric_id]);

    // Insert allocation record
    $stmt = $pdo->prepare("
        INSERT INTO allocations (asset_id, asset_name, user_name, issue_date, return_date)
        VALUES (?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 3 MONTH))
    ");
    $stmt->execute([$request['asset_id'], $request['asset_name'], $request['user_name']]);

    // Reduce available quantity / update asset status
    $stmt = $pdo->prepare("UPDATE assets SET status = 'Allocated' WHERE id = ?");
    $stmt->execute([$request['asset_id']]);

    $pdo->commit();
    jsonResponse(["message" => "Request approved and asset allocated"]);
} catch (Exception $e) {
    $pdo->rollBack();
    jsonResponse(["error" => "Approval failed: " . $e->getMessage()], 500);
}
?>
