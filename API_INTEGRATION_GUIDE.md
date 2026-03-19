# Asset Request Management System - API Integration Guide

## Overview
This document describes the API endpoints needed to integrate the request-approval workflow with your backend system.

## Backend Endpoints Required

### 1. Create Asset Request
**Endpoint:** `POST /api/request_asset.php`

**Purpose:** Submit a new asset request from a user

**Request Body:**
```json
{
  "user_id": "user@college.edu",
  "asset_id": "AST-001",
  "quantity": 1,
  "reason": "Project work"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "request_id": "REQ-001",
  "message": "Request created successfully",
  "data": {
    "id": "REQ-001",
    "user_id": "user@college.edu",
    "asset_id": "AST-001",
    "quantity": 1,
    "status": "pending",
    "created_at": "2025-03-19T10:30:00Z"
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Error message"
}
```

---

### 2. Get Asset Requests
**Endpoint:** `GET /api/get_requests.php`

**Purpose:** Fetch asset requests (admin gets all, users get their own)

**Query Parameters:**
- `user_id` (optional): Filter requests for specific user. If not provided, return all requests.
- `status` (optional): Filter by status (pending, approved, rejected)

**Example URLs:**
```
GET /api/get_requests.php                    # Admin - all requests
GET /api/get_requests.php?user_id=user@college.edu # User - their requests
GET /api/get_requests.php?status=pending     # All pending requests
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "REQ-001",
      "user_id": "user@college.edu",
      "user_name": "Rahul Kumar",
      "asset_id": "AST-001",
      "asset_name": "Dell Latitude 5520",
      "quantity": 1,
      "reason": "Project work",
      "status": "pending",
      "created_at": "2025-03-19T10:30:00Z"
    },
    {
      "id": "REQ-002",
      "user_id": "user2@college.edu",
      "user_name": "Priya Singh",
      "asset_id": "AST-007",
      "asset_name": "Canon EOS R50",
      "quantity": 2,
      "reason": "Event photography",
      "status": "pending",
      "created_at": "2025-03-19T11:00:00Z"
    }
  ]
}
```

---

### 3. Approve Asset Request
**Endpoint:** `POST /api/approve_request.php`

**Purpose:** Admin approves a request, allocates asset, and reduces available quantity

**Request Body:**
```json
{
  "request_id": "REQ-001"
}
```

**Backend Logic:**
1. Update `asset_requests` table: `status = 'approved'`
2. Insert record into `allocations` table:
   - user_id
   - asset_id
   - quantity
   - issue_date (current date)
3. Update `assets` table: reduce `available_quantity` by requested quantity

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Request approved and asset allocated",
  "data": {
    "request_id": "REQ-001",
    "status": "approved",
    "allocation_id": "ALC-001",
    "updated_at": "2025-03-19T12:00:00Z"
  }
}
```

---

### 4. Reject Asset Request
**Endpoint:** `POST /api/reject_request.php`

**Purpose:** Admin rejects a request

**Request Body:**
```json
{
  "request_id": "REQ-001"
}
```

**Backend Logic:**
1. Update `asset_requests` table: `status = 'rejected'`

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Request rejected",
  "data": {
    "request_id": "REQ-001",
    "status": "rejected",
    "updated_at": "2025-03-19T12:00:00Z"
  }
}
```

---

## Database Schema

### asset_requests Table
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
  INDEX (status),
  INDEX (user_id),
  INDEX (created_at)
);
```

### Update assets Table
```sql
ALTER TABLE assets ADD COLUMN available_quantity INT NOT NULL DEFAULT 1;
```

---

## Frontend Implementation Details

### Components Created

#### 1. Admin Requests Page (`src/pages/admin/Requests.tsx`)
- Displays all pending requests with approve/reject buttons
- Shows processed requests (approved/rejected) below
- **Polling:** Fetches new requests every 5 seconds
- **Toast Notifications:** Shows "New Asset Request from [User]" when new request appears
- Only visible to admin role

#### 2. User My Requests Page (`src/pages/user/MyRequests.tsx`)
- Shows user's own requests with status
- Summary cards for pending/approved/rejected counts
- Status legend explanation
- Only visible to user role
- **Real-time updates:** Polling detects when admin approves/rejects

#### 3. Updated Request Asset Page (`src/pages/user/RequestAsset.tsx`)
- Users submit requests instead of directly allocating assets
- Form includes: asset selection, quantity, reason
- Shows request workflow explanation
- Displays user's request history with status

### API Service File
Location: `src/services/api.ts`

Functions:
- `requestAssetAPI()` - POST /request_asset.php
- `getRequestsAPI()` - GET /get_requests.php
- `approveRequestAPI()` - POST /approve_request.php
- `rejectRequestAPI()` - POST /reject_request.php

### Navigation Updates

**Admin Sidebar:**
- Added "Requests" link to `/admin/requests`
- Icon: ClipboardList

**User Sidebar:**
- Added "My Requests" link to `/user/my-requests`
- Icon: ClipboardList

---

## Polling Configuration

**Admin Dashboard Polling:**
- Interval: 5 seconds
- Endpoint: `GET /api/get_requests.php`
- Toast trigger: When request count increases

**User Dashboard Polling (Optional Enhancement):**
- Interval: 10 seconds
- Endpoint: `GET /api/get_requests.php?user_id=[user_id]`
- Toast trigger: When any request status changes

---

## Security Considerations

1. **Role-based Access Control:**
   - `/admin/requests` - only accessible by admin users
   - `/user/my-requests` - only accessible by authenticated users
   - Users can only see their own requests

2. **Backend Validation:**
   - Verify admin role before allowing approve/reject
   - Verify user owns the request before showing details
   - Validate asset availability before approval
   - Check quantity doesn't exceed available stock

3. **Authorization:**
   - Only authenticated users can create requests
   - Only admin can approve/reject requests
   - API should verify user role before processing requests

---

## Error Handling

### Frontend Toast Messages

| Event | Message |
|-------|---------|
| Request created | "Request submitted for [Asset]. Admin will review shortly." |
| Request approved | "[Asset] approved for [User]" |
| Request rejected | "[Asset] request from [User] has been rejected" |
| API error | "Failed to [action]" with variant="destructive" |

### Common Error Scenarios

| Scenario | Status Code | Response |
|----------|-------------|----------|
| Insufficient asset availability | 400 | `{"success": false, "message": "Insufficient quantity available"}` |
| Invalid asset ID | 400 | `{"success": false, "message": "Asset not found"}` |
| Unauthorized (user trying to approve) | 403 | `{"success": false, "message": "Unauthorized"}` |
| Request not found | 404 | `{"success": false, "message": "Request not found"}` |

---

## Integration Steps

1. **Create database tables** per schema above
2. **Create PHP endpoints** matching the specifications
3. **Update `src/services/api.ts`** with actual API base URL
4. **Uncomment API calls** in component files (search for `// Call API:`)
5. **Test workflow:**
   - Login as user, create request
   - Switch to admin, see new request notification
   - Approve/reject and verify user receives toast notification
6. **Monitor server logs** for any errors

---

## Example Implementation Flow

### Happy Path (Approval)

1. **User submits request:**
   ```
   POST /api/request_asset.php
   → asset_requests table: status = 'pending'
   ```

2. **Admin polls for requests:**
   ```
   GET /api/get_requests.php
   → Admin sees new request
   → Toast: "New Asset Request from [User]"
   ```

3. **Admin approves:**
   ```
   POST /api/approve_request.php
   → asset_requests: status = 'approved'
   → allocations: insert new record
   → assets: available_quantity -= quantity
   ```

4. **User sees update:**
   ```
   GET /api/get_requests.php?user_id=[user_id]
   → Status changed to 'approved'
   → Toast: "Request has been approved" (via polling)
   ```

---

## Notes for Backend Development

- All timestamps should be in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)
- Request IDs can be auto-generated (REQ-001, REQ-002, etc.)
- Allocation IDs should be unique (ALC-001, ALC-002, etc.)
- Consider adding indexes on frequently queried columns
- Use transactions for approve/reject to ensure data consistency
- Implement proper logging for audit trail
