# Deployment & Backend Setup Guide

## Pre-Deployment Checklist

### Frontend Code Review
- [x] All components compile without errors
- [x] TypeScript types are correct
- [x] Routes are properly configured
- [x] Navigation links are updated
- [x] Toast notifications are working
- [x] Error handling is in place
- [x] Loading states are managed
- [x] Responsive design verified

### Testing Completed
- [x] Create request flow works
- [x] Admin approval works
- [x] Admin rejection works
- [x] Polling updates requests
- [x] Toast notifications display
- [x] Navigation works
- [x] Form validation works
- [x] Status changes display correctly

## Backend Development Guide

### Step 1: Database Setup

#### Create asset_requests Table
```sql
CREATE TABLE asset_requests (
  id VARCHAR(20) PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  asset_id VARCHAR(20) NOT NULL,
  asset_name VARCHAR(100) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  reason TEXT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(email),
  FOREIGN KEY (asset_id) REFERENCES assets(id),
  INDEX idx_status (status),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);
```

#### Update assets Table
```sql
ALTER TABLE assets ADD COLUMN available_quantity INT NOT NULL DEFAULT 1;
```

#### Update allocations Table (if not already present)
```sql
CREATE TABLE IF NOT EXISTS allocations (
  id VARCHAR(20) PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  asset_id VARCHAR(20) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  issue_date DATE NOT NULL,
  return_date DATE,
  status ENUM('active', 'returned') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(email),
  FOREIGN KEY (asset_id) REFERENCES assets(id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);
```

### Step 2: Create API Endpoints

#### Endpoint 1: Create Asset Request
**File:** `api/request_asset.php`

```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!$input || !isset($input['user_id']) || !isset($input['asset_id']) || !isset($input['quantity'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

try {
    // Connect to database
    $db = new mysqli('localhost', 'user', 'password', 'database');
    
    // Validate user exists
    $userStmt = $db->prepare('SELECT email FROM users WHERE email = ?');
    $userStmt->bind_param('s', $input['user_id']);
    $userStmt->execute();
    $userResult = $userStmt->get_result();
    
    if ($userResult->num_rows === 0) {
        throw new Exception('User not found');
    }
    $user = $userResult->fetch_assoc();
    
    // Validate asset exists
    $assetStmt = $db->prepare('SELECT id, name FROM assets WHERE id = ?');
    $assetStmt->bind_param('s', $input['asset_id']);
    $assetStmt->execute();
    $assetResult = $assetStmt->get_result();
    
    if ($assetResult->num_rows === 0) {
        throw new Exception('Asset not found');
    }
    $asset = $assetResult->fetch_assoc();
    
    // Generate request ID
    $idStmt = $db->prepare('SELECT MAX(CAST(SUBSTRING(id, 5) AS UNSIGNED)) as max_id FROM asset_requests');
    $idStmt->execute();
    $idResult = $idStmt->get_result();
    $row = $idResult->fetch_assoc();
    $newId = 'REQ-' . str_pad(($row['max_id'] ?? 0) + 1, 3, '0', STR_PAD_LEFT);
    
    // Insert request
    $insertStmt = $db->prepare(
        'INSERT INTO asset_requests (id, user_id, user_name, asset_id, asset_name, quantity, reason, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    
    $status = 'pending';
    $reason = $input['reason'] ?? null;
    $insertStmt->bind_param('ssssisis', $newId, $input['user_id'], $user['email'], $input['asset_id'], $asset['name'], $input['quantity'], $reason, $status);
    
    if (!$insertStmt->execute()) {
        throw new Exception($db->error);
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'request_id' => $newId,
        'message' => 'Request created successfully',
        'data' => [
            'id' => $newId,
            'user_id' => $input['user_id'],
            'asset_id' => $input['asset_id'],
            'quantity' => $input['quantity'],
            'status' => $status,
            'created_at' => date('c')
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
```

#### Endpoint 2: Get Asset Requests
**File:** `api/get_requests.php`

```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

try {
    $db = new mysqli('localhost', 'user', 'password', 'database');
    
    // Build query
    $query = 'SELECT * FROM asset_requests WHERE 1=1';
    $types = '';
    $params = [];
    
    // Filter by user_id if provided
    if (isset($_GET['user_id'])) {
        $query .= ' AND user_id = ?';
        $types .= 's';
        $params[] = $_GET['user_id'];
    }
    
    // Filter by status if provided
    if (isset($_GET['status'])) {
        $query .= ' AND status = ?';
        $types .= 's';
        $params[] = $_GET['status'];
    }
    
    $query .= ' ORDER BY created_at DESC';
    
    // Execute query
    $stmt = $db->prepare($query);
    if ($types) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    
    $requests = [];
    while ($row = $result->fetch_assoc()) {
        $requests[] = [
            'id' => $row['id'],
            'userId' => $row['user_id'],
            'userName' => $row['user_name'],
            'assetId' => $row['asset_id'],
            'assetName' => $row['asset_name'],
            'quantity' => (int)$row['quantity'],
            'reason' => $row['reason'],
            'status' => $row['status'],
            'requestDate' => date('Y-m-d', strtotime($row['created_at'])),
            'created_at' => $row['created_at']
        ];
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $requests
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
```

#### Endpoint 3: Approve Request
**File:** `api/approve_request.php`

```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['request_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing request_id']);
    exit;
}

try {
    $db = new mysqli('localhost', 'user', 'password', 'database');
    $db->begin_transaction();
    
    // Get request details
    $reqStmt = $db->prepare('SELECT * FROM asset_requests WHERE id = ?');
    $reqStmt->bind_param('s', $input['request_id']);
    $reqStmt->execute();
    $reqResult = $reqStmt->get_result();
    
    if ($reqResult->num_rows === 0) {
        throw new Exception('Request not found');
    }
    
    $request = $reqResult->fetch_assoc();
    
    // Update request status to approved
    $updateReqStmt = $db->prepare('UPDATE asset_requests SET status = ? WHERE id = ?');
    $status = 'approved';
    $updateReqStmt->bind_param('ss', $status, $input['request_id']);
    
    if (!$updateReqStmt->execute()) {
        throw new Exception('Failed to update request status');
    }
    
    // Create allocation record
    $allocId = 'ALC-' . str_pad(rand(1, 999999), 3, '0', STR_PAD_LEFT);
    $issueDate = date('Y-m-d');
    $allocStmt = $db->prepare(
        'INSERT INTO allocations (id, user_id, asset_id, quantity, issue_date, status) 
         VALUES (?, ?, ?, ?, ?, ?)'
    );
    
    $allocStatus = 'active';
    $allocStmt->bind_param('sssiss', $allocId, $request['user_id'], $request['asset_id'], $request['quantity'], $issueDate, $allocStatus);
    
    if (!$allocStmt->execute()) {
        throw new Exception('Failed to create allocation');
    }
    
    // Update asset available_quantity
    $updateAssetStmt = $db->prepare(
        'UPDATE assets SET available_quantity = available_quantity - ? WHERE id = ?'
    );
    $updateAssetStmt->bind_param('is', $request['quantity'], $request['asset_id']);
    
    if (!$updateAssetStmt->execute()) {
        throw new Exception('Failed to update asset quantity');
    }
    
    $db->commit();
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Request approved and asset allocated',
        'data' => [
            'request_id' => $input['request_id'],
            'status' => 'approved',
            'allocation_id' => $allocId,
            'updated_at' => date('c')
        ]
    ]);
    
} catch (Exception $e) {
    $db->rollback();
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
```

#### Endpoint 4: Reject Request
**File:** `api/reject_request.php`

```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['request_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing request_id']);
    exit;
}

try {
    $db = new mysqli('localhost', 'user', 'password', 'database');
    
    // Verify request exists
    $checkStmt = $db->prepare('SELECT id FROM asset_requests WHERE id = ?');
    $checkStmt->bind_param('s', $input['request_id']);
    $checkStmt->execute();
    
    if ($checkStmt->get_result()->num_rows === 0) {
        throw new Exception('Request not found');
    }
    
    // Update status to rejected
    $updateStmt = $db->prepare('UPDATE asset_requests SET status = ? WHERE id = ?');
    $status = 'rejected';
    $updateStmt->bind_param('ss', $status, $input['request_id']);
    
    if (!$updateStmt->execute()) {
        throw new Exception('Failed to reject request');
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Request rejected',
        'data' => [
            'request_id' => $input['request_id'],
            'status' => 'rejected',
            'updated_at' => date('c')
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
```

### Step 3: Frontend Integration

#### Update API Configuration
Edit `src/services/api.ts` line 4:
```typescript
const API_BASE = "http://your-server.com/api"; // Update with your server URL
```

#### Uncomment API Calls

In `src/pages/admin/Requests.tsx` around line 48:
```typescript
// Replace:
// setRequests(mockRequests);

// With:
const data = await getRequestsAPI();
setRequests(data);
```

In `src/pages/user/RequestAsset.tsx` around line 43:
```typescript
// Uncomment these lines:
await requestAssetAPI({
  user_id: user.email,
  asset_id: form.assetId,
  quantity: form.quantity,
  reason: form.reason,
});
```

In `src/pages/admin/Requests.tsx` in handleApprove():
```typescript
// Uncomment:
await approveRequestAPI({ request_id: requestId });
```

In `src/pages/admin/Requests.tsx` in handleReject():
```typescript
// Uncomment:
await rejectRequestAPI({ request_id: requestId });
```

### Step 4: Testing Backend

#### Test 1: Create Request
```bash
curl -X POST http://localhost/api/request_asset.php \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user@college.edu",
    "asset_id": "AST-001",
    "quantity": 1,
    "reason": "Test request"
  }'
```

#### Test 2: Get Requests
```bash
curl http://localhost/api/get_requests.php
curl http://localhost/api/get_requests.php?user_id=user@college.edu
curl http://localhost/api/get_requests.php?status=pending
```

#### Test 3: Approve Request
```bash
curl -X POST http://localhost/api/approve_request.php \
  -H "Content-Type: application/json" \
  -d '{"request_id": "REQ-001"}'
```

#### Test 4: Reject Request
```bash
curl -X POST http://localhost/api/reject_request.php \
  -H "Content-Type: application/json" \
  -d '{"request_id": "REQ-002"}'
```

## Deployment Steps

### 1. Development Environment
```bash
# Install dependencies if needed
npm install

# Start development server
npm run dev

# Build for testing
npm run build
```

### 2. Production Deployment

#### Frontend
```bash
# Build production bundle
npm run build

# Deploy to your web server
# Copy dist/ folder to your server
```

#### Backend
```bash
# Upload API endpoints to server
# Place PHP files in /api directory

# Run database migrations
# Execute SQL scripts to create tables
```

#### Configuration
```bash
# Update .env or config file with:
VITE_API_BASE=https://your-domain.com/api

# Rebuild if using environment variables
npm run build
```

### 3. Verification

- [ ] Frontend loads without errors
- [ ] Sidebar shows new links
- [ ] Admin can access /admin/requests
- [ ] User can access /user/my-requests
- [ ] Create request form works
- [ ] API endpoints respond
- [ ] Data persists in database
- [ ] Notifications display
- [ ] Polling updates requests

## Rollback Plan

If issues occur during deployment:

1. **Frontend Rollback:** Revert to previous build
2. **API Rollback:** Disable new endpoints
3. **Database Rollback:** Restore from backup

```sql
-- If needed, drop tables and restore:
DROP TABLE asset_requests;
ALTER TABLE assets DROP COLUMN available_quantity;
```

## Monitoring & Maintenance

### Key Metrics to Monitor
- API response times (<200ms)
- Error rates (target: <1%)
- Request queue backlog
- Database performance

### Log Locations
- Frontend: Browser console
- Backend: `/var/log/apache2/error.log` or similar
- Database: MySQL error log

### Performance Tips
- Enable database query caching
- Implement API rate limiting
- Add request indexing
- Monitor polling load
- Consider upgrading to WebSockets

## Security Checklist

- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (use prepared statements)
- [ ] User authentication verified
- [ ] Role authorization checked
- [ ] HTTPS enabled in production
- [ ] Sensitive data not logged
- [ ] Database credentials secured
- [ ] API rate limiting implemented
- [ ] Error messages don't expose internals

## Support & Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| API returns 404 | Check API_BASE URL and endpoint paths |
| CORS error | Update CORS headers on backend |
| Database connection fails | Verify credentials and host |
| Requests disappear | Check if database is auto-saving |
| Polling stops | Check for JavaScript errors in console |

### Getting Help

Refer to:
- API_INTEGRATION_GUIDE.md - Detailed API specs
- REQUEST_WORKFLOW_SETUP.md - System setup
- QUICK_REFERENCE.md - Development reference
- Browser console - JavaScript errors
- Server logs - Backend errors

## Success Criteria

✅ All API endpoints working
✅ Requests properly stored in database
✅ Admin can approve/reject
✅ Allocations created on approval
✅ Asset quantities reduced
✅ Notifications display
✅ No errors in logs
✅ Performance acceptable
✅ Security requirements met

## Timeline

- Backend Development: 3-4 hours
- Testing: 1-2 hours
- Deployment: 30 minutes
- Monitoring: Ongoing

Total estimate: 4-6 hours
