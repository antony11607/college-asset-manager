# Request-Approval Workflow - Implementation Guide

## What Was Added

### New Pages
1. **Admin Asset Requests** (`/admin/requests`)
   - View all pending requests with approve/reject buttons
   - Separate section for processed requests
   - Auto-polling every 5 seconds for new requests
   - Toast notification: "New Asset Request from [User]"

2. **User My Requests** (`/user/my-requests`)
   - View personal requests and their status
   - Summary cards (pending/approved/rejected counts)
   - Status legend for reference

### Updated Pages
- **Request Asset** (`/user/request`) - Enhanced with quantity field and workflow explanation

### Sidebar Updates
- **Admin Sidebar** - Added "Requests" link with ClipboardList icon
- **User Sidebar** - Added "My Requests" link with ClipboardList icon

### New Data Model
- `AssetRequest` interface in `src/data/mockData.ts`
- Fields: id, userId, userName, assetId, assetName, quantity, status, requestDate, reason

### API Service Layer
- New file: `src/services/api.ts`
- Functions for all CRUD operations
- Ready for backend integration

---

## Current State (With Mock Data)

The system is fully functional with mock data. You can:

1. ✅ Create asset requests as a user
2. ✅ View pending requests as an admin
3. ✅ Click approve/reject buttons
4. ✅ See status changes in real-time
5. ✅ Receive toast notifications
6. ✅ View request history as a user

---

## To Connect Real Backend

### Step 1: Update API Configuration
Edit `src/services/api.ts` line 4:
```typescript
const API_BASE = "http://localhost/api"; // Update to your server
```

### Step 2: Uncomment API Calls

In `src/pages/admin/Requests.tsx` (line 48):
```typescript
// Change from mock to:
const data = await getRequestsAPI();
```

In `src/pages/user/RequestAsset.tsx` (line 43):
```typescript
// Uncomment:
await requestAssetAPI({
  user_id: user.email,
  asset_id: form.assetId,
  quantity: form.quantity,
  reason: form.reason,
});
```

### Step 3: Create Backend Endpoints

See `API_INTEGRATION_GUIDE.md` for detailed specifications:
- POST `/api/request_asset.php`
- GET `/api/get_requests.php`
- POST `/api/approve_request.php`
- POST `/api/reject_request.php`

### Step 4: Database Schema

Create `asset_requests` table per the guide. Update `assets` table with `available_quantity` column.

---

## Features Implemented

### 1. Request-Approval Workflow ✅
- Users create requests instead of direct allocation
- Admin approves/rejects requests
- Proper status tracking

### 2. Real-time Notifications ✅
- Toast: "New Asset Request from [User]" when created
- Toast: "Request Approved/Rejected" on action
- Admin polling detects new requests every 5 seconds

### 3. User Experience ✅
- Clear workflow explanation in request form
- Status legend on My Requests page
- Summary cards showing request counts
- Icon indicators (clock for pending, check for approved, X for rejected)

### 4. Security ✅
- Role-based route protection (ProtectedRoute)
- Users only see their own requests
- Only admin can approve/reject
- Users can't directly allocate assets

### 5. Design Consistency ✅
- Matches existing color palette and design
- Responsive layout
- Tailwind CSS styling
- Same card/button component pattern

---

## Testing the Mock Version

### As User (user@college.edu / user123):
1. Go to "Request Asset"
2. Select "Dell Latitude 5520", enter quantity 1, reason "Test"
3. Click "Submit Request"
4. Go to "My Requests" to see the pending request
5. Status will show as "Pending"

### As Admin (admin@college.edu / admin123):
1. Go to "Asset Requests"
2. See the pending request from the user
3. Click "Approve" or "Reject"
4. See the toast notification
5. Request moves to "Processed Requests" section
6. Status updates accordingly

### Testing Polling:
1. Keep admin page open
2. Submit request as user in another tab/window
3. Wait max 5 seconds - new request appears on admin page with toast

---

## File Structure

```
src/
  services/
    api.ts                          # API endpoints (NEW)
  pages/
    admin/
      Requests.tsx                  # Admin requests page (NEW)
    user/
      MyRequests.tsx                # User requests page (NEW)
      RequestAsset.tsx              # Updated with new workflow
  components/
    AdminSidebar.tsx                # Updated with Requests link
    UserSidebar.tsx                 # Updated with My Requests link
  data/
    mockData.ts                     # Updated with AssetRequest interface
  App.tsx                           # Updated with new routes
```

---

## Notification Flow

### When User Creates Request:
```
User submits form
  ↓
Frontend: POST /request_asset.php
  ↓
Backend: Create record in asset_requests table (status='pending')
  ↓
Frontend: Show success toast to user
  ↓
Admin page polls GET /requests
  ↓
Admin sees new request (via polling)
  ↓
Toast: "New Asset Request from [User]"
```

### When Admin Approves:
```
Admin clicks Approve
  ↓
Frontend: POST /approve_request.php
  ↓
Backend:
  - Update request status to 'approved'
  - Insert into allocations table
  - Reduce asset available_quantity
  ↓
Frontend: Show success toast to admin
  ↓
User polls GET /requests (next cycle)
  ↓
User sees "Approved" status
  ↓
Toast: "Your request has been approved"
```

---

## Next Steps

1. **Backend Development:** Create the 4 PHP endpoints
2. **Database:** Create asset_requests table
3. **Integration:** Update API_BASE URL and uncomment API calls
4. **Testing:** Test full workflow end-to-end
5. **Enhancement:** Add email notifications, status history, etc.

---

## Troubleshooting

### New pages not showing?
- Check that routes are added to App.tsx
- Verify sidebar navigation links are updated

### Polling not working?
- Check browser console for API errors
- Verify API_BASE URL is correct
- Check CORS settings on backend

### Toast not appearing?
- Verify Toaster component is mounted in App.tsx
- Check console for JavaScript errors

### Approve/Reject buttons not working?
- Check browser Network tab for API responses
- Verify backend is returning correct status codes
- Check user role (only admin can approve/reject)

---

## Performance Notes

- Polling interval: 5 seconds for admin, 10 seconds for users (configurable)
- Consider upgrading to WebSockets for real-time updates
- Add request pagination for large datasets
- Implement request caching with React Query (already setup)

---

## Future Enhancements

- [ ] Email notifications to users
- [ ] Attachment support for requests
- [ ] Request comments/discussion
- [ ] Return date specification
- [ ] Bulk request actions
- [ ] Request reason templates
- [ ] Admin approval rules/policies
- [ ] Request history and audit logs
