# Quick Reference - Request-Approval Workflow

## Routes Added

| Route | Component | Role | Purpose |
|-------|-----------|------|---------|
| `/admin/requests` | Requests.tsx | Admin | Manage pending requests |
| `/user/my-requests` | MyRequests.tsx | User | View personal requests |

## Components Overview

### Admin Request Management (`/admin/requests`)
```typescript
// Features:
- Displays pending requests with Approve/Reject buttons
- Separate section for processed requests
- Automatic polling every 5 seconds
- Toast notification on new requests
- Handles loading states
```

**Key Props/State:**
- `requests` - Array of AssetRequest objects
- `approving` - Request ID being approved
- `rejecting` - Request ID being rejected
- `pollingRef` - Ref to polling interval

**Key Methods:**
- `handleApprove()` - Approve request and allocate asset
- `handleReject()` - Reject request

### User Request Tracking (`/user/my-requests`)
```typescript
// Features:
- Shows user's own requests
- Summary cards (pending/approved/rejected)
- Full request history
- Status legend explanation
```

**Key Props/State:**
- `requests` - Filtered user requests
- `loading` - Fetch loading state

### Updated Request Asset (`/user/request`)
```typescript
// Enhancements:
- Added quantity field (was missing)
- Clear workflow explanation box
- References to "My Requests" page
- Better error handling
```

**New Fields:**
- `quantity` - Number of items requested
- `submitting` - Submit state

## API Service Functions

```typescript
// src/services/api.ts

requestAssetAPI(payload)
// POST /api/request_asset.php
// Payload: {user_id, asset_id, quantity, reason}

getRequestsAPI(userId?)
// GET /api/get_requests.php
// Optional userId parameter filters by user

approveRequestAPI(payload)
// POST /api/approve_request.php
// Payload: {request_id}

rejectRequestAPI(payload)
// POST /api/reject_request.php
// Payload: {request_id}
```

## Data Model

```typescript
interface AssetRequest {
  id: string;                          // e.g., "REQ-001"
  userId: string;                      // user email
  userName: string;                    // user display name
  assetId: string;                     // asset ID
  assetName: string;                   // asset name
  quantity: number;                    // quantity requested
  status: "pending" | "approved" | "rejected";
  requestDate: string;                 // YYYY-MM-DD format
  reason?: string;                     // why user needs it
}
```

## Status Colors & Icons

| Status | Color | Icon | Background |
|--------|-------|------|------------|
| pending | warning | Clock | warning/10 |
| approved | success | CheckCircle2 | success/10 |
| rejected | destructive | XCircle | destructive/10 |

## Polling Configuration

```typescript
// Admin Requests Page
const POLLING_INTERVAL = 5000; // 5 seconds
const endpoint = getRequestsAPI();

// Check for new requests on each poll:
if (newCount > lastCountRef.current) {
  toast({ title: "New Asset Request", ... })
}
```

## Toast Notifications

```typescript
// User creates request
toast({
  title: "Success",
  description: "Request submitted for [Asset]. Admin will review shortly."
})

// Admin approves
toast({
  title: "Request Approved",
  description: "[Asset] approved for [User]"
})

// Admin rejects
toast({
  title: "Request Rejected",
  description: "[Asset] request from [User] has been rejected"
})

// Error
toast({
  title: "Error",
  description: "Failed to [action]",
  variant: "destructive"
})
```

## Sidebar Navigation

### Admin (AdminSidebar.tsx)
```typescript
{ title: "Requests", path: "/admin/requests", icon: ClipboardList }
// Added between "Allocation" and "Maintenance"
```

### User (UserSidebar.tsx)
```typescript
{ title: "My Requests", path: "/user/my-requests", icon: ClipboardList }
// Added between "Request Asset" and "Maintenance Requests"
```

## Request Workflow State Machine

```
┌─────────────┐
│   PENDING   │  ← User creates request
└──────┬──────┘
       │
       ├─→ [Approve] ──→ APPROVED ──→ [allocate asset]
       │
       └─→ [Reject] ───→ REJECTED

Pending:   Awaiting admin review
Approved:  Asset allocated to user
Rejected:  Request declined (no allocation)
```

## Security Checks

```typescript
// Role-based route protection
<ProtectedRoute role="admin">
  <Route path="/admin/requests" element={<Requests />} />
</ProtectedRoute>

<ProtectedRoute role="user">
  <Route path="/user/my-requests" element={<MyRequests />} />
</ProtectedRoute>

// User data filtering (in API)
if (userId) {
  // Only return requests for that user
  requests = requests.filter(r => r.userId === userId)
}
```

## File Changes Summary

| File | Change | Type |
|------|--------|------|
| `App.tsx` | Added 2 new routes | Updated |
| `AdminSidebar.tsx` | Added Requests link | Updated |
| `UserSidebar.tsx` | Added My Requests link | Updated |
| `RequestAsset.tsx` | Added quantity, workflow info | Updated |
| `mockData.ts` | Added AssetRequest interface | Updated |
| `Requests.tsx` | NEW admin page | Created |
| `MyRequests.tsx` | NEW user page | Created |
| `api.ts` | NEW service layer | Created |

## Development Checklist

- [ ] Create backend endpoints (4 total)
- [ ] Create asset_requests database table
- [ ] Update assets table with available_quantity
- [ ] Update API_BASE URL in api.ts
- [ ] Uncomment API calls in components
- [ ] Test request creation as user
- [ ] Test polling on admin page
- [ ] Test approve/reject functionality
- [ ] Test toast notifications
- [ ] Verify role-based access control
- [ ] Test with multiple users
- [ ] Monitor API response times
- [ ] Add error logging

## Common Code Patterns

### Using the API
```typescript
try {
  const data = await getRequestsAPI(userId);
  setRequests(data);
} catch (error) {
  toast({
    title: "Error",
    description: "Failed to fetch requests",
    variant: "destructive"
  });
}
```

### Polling Setup
```typescript
useEffect(() => {
  const interval = setInterval(async () => {
    // Fetch data
    // Check for new items
    // Show toast if needed
  }, 5000);

  return () => clearInterval(interval);
}, []);
```

### Form Submission with Loading
```typescript
const [submitting, setSubmitting] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  try {
    await apiCall();
    toast({ title: "Success" });
  } catch (error) {
    toast({ title: "Error", variant: "destructive" });
  } finally {
    setSubmitting(false);
  }
};
```

## Testing Scenarios

### Scenario 1: Basic Request Flow
```
1. Login as user
2. Go to Request Asset
3. Select asset, enter quantity, reason
4. Click Submit
5. See success toast
6. Go to My Requests
7. See request with "Pending" status
```

### Scenario 2: Admin Approval
```
1. Login as admin
2. Go to Asset Requests
3. See new request with approve/reject buttons
4. Click Approve
5. See success toast
6. Request moves to "Processed Requests"
7. Status shows "Approved"
```

### Scenario 3: Polling Notification
```
1. Login as admin
2. Open Asset Requests page
3. Switch to user in new tab
4. Create new request
5. Return to admin tab
6. Wait ≤5 seconds
7. New request appears with toast
```

## Key Imports to Remember

```typescript
// For components
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

// For API
import { 
  requestAssetAPI, 
  getRequestsAPI,
  approveRequestAPI,
  rejectRequestAPI 
} from "@/services/api";

// For types
import { AssetRequest } from "@/data/mockData";

// For icons
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ClipboardList,
  AlertCircle,
  Send 
} from "lucide-react";
```

## Performance Tips

- Polling interval: 5-10 seconds (not too frequent)
- Use React Query for data caching
- Implement request pagination for large lists
- Debounce search/filter operations
- Consider upgrading to WebSockets for real-time

## Debug Tips

1. **Check polling:** Open DevTools → Network tab, filter by XHR
2. **Check auth:** Verify user role with `useAuth()` hook
3. **Check routes:** Verify routes exist in App.tsx
4. **Check sidebar:** Verify sidebar shows navigation items
5. **Check API:** Verify API_BASE URL is correct
6. **Check console:** Look for React/TypeScript errors
