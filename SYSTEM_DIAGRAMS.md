# System Flowcharts & Diagrams

## 1. Asset Request Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                   ASSET REQUEST LIFECYCLE                       │
└─────────────────────────────────────────────────────────────────┘

USER CREATES REQUEST
        ↓
    [/user/request]
        ↓
    Form: Asset, Quantity, Reason
        ↓
    Submit Button → POST /api/request_asset.php
        ↓
    ✅ Success → Show Toast "Request submitted"
        ↓
    [Request stored in DB]
        ↓
    Status = 'pending'
        ↓

ADMIN REVIEWS (on /admin/requests page)
        ↓
    GET /api/get_requests.php (every 5 sec)
        ↓
    Displays: Request ID, User, Asset, Qty, Status
        ↓
    🔔 Toast: "New Asset Request from [User]"
        ↓
    Two Actions Available:
        ├─→ [APPROVE BUTTON]
        │       ↓
        │   POST /api/approve_request.php
        │       ↓
        │   1. Update: request.status = 'approved'
        │   2. Insert: allocations table
        │   3. Update: assets.available_quantity -= qty
        │       ↓
        │   ✅ Success → Toast "Approved"
        │       ↓
        │   User sees approved status on /user/my-requests
        │
        └─→ [REJECT BUTTON]
                ↓
            POST /api/reject_request.php
                ↓
            1. Update: request.status = 'rejected'
                ↓
            ✅ Success → Toast "Rejected"
                ↓
            User sees rejected status on /user/my-requests

END STATES:
├─ PENDING: Awaiting admin action
├─ APPROVED: Asset allocated, in user's inventory
└─ REJECTED: Request denied, no allocation
```

---

## 2. User Interface Navigation

```
┌─────────────────────────────────────────────────────────────────┐
│                    NAVIGATION STRUCTURE                          │
└─────────────────────────────────────────────────────────────────┘

LOGIN PAGE
    ↓
    ├─ USER ROLE
    │   ↓
    │   [USER DASHBOARD] (/user/dashboard)
    │   │
    │   ├─→ [My Allocations] (/user/allocations)
    │   │
    │   ├─→ [Request Asset] (/user/request) ⭐ CREATE REQUESTS HERE
    │   │
    │   ├─→ [My Requests] (/user/my-requests) ⭐ NEW - TRACK REQUESTS
    │   │
    │   ├─→ [Maintenance Requests] (/user/maintenance)
    │   │
    │   └─→ [Profile] (/user/profile)
    │
    └─ ADMIN ROLE
        ↓
        [ADMIN DASHBOARD] (/admin/dashboard)
        │
        ├─→ [Assets] (/admin/assets)
        │
        ├─→ [Allocation] (/admin/allocation)
        │
        ├─→ [Requests] (/admin/requests) ⭐ NEW - APPROVE/REJECT HERE
        │
        ├─→ [Maintenance] (/admin/maintenance)
        │
        └─→ [Reports] (/admin/reports)

⭐ = NEW FEATURES
```

---

## 3. Polling & Notification Flow

```
┌─────────────────────────────────────────────────────────────────┐
│           ADMIN POLLING & NOTIFICATION SYSTEM                   │
└─────────────────────────────────────────────────────────────────┘

[Admin Opens /admin/requests]
        ↓
    Initial fetch: GET /api/get_requests.php
        ↓
    Display all requests
        ↓
    Start polling interval (every 5 seconds)
        ↓
    LOOP BEGINS:
    ├─→ Wait 5 seconds
    │       ↓
    │   GET /api/get_requests.php
    │       ↓
    │   Compare request count with last count
    │       ↓
    │   New requests detected?
    │       ├─ YES: Show toast "New Asset Request from [User]"
    │       │       Update lastCount
    │       │       Display new request in table
    │       │
    │       └─ NO: Continue polling
    │
    └─→ Loop continues until page closes
        ↓
    [Admin Leaves /admin/requests]
        ↓
    Polling stops (cleanup on unmount)

EXAMPLE FLOW:
Time 0s:    Admin opens page
            GET /api/get_requests.php → 2 requests
            lastCount = 2

Time 5s:    GET /api/get_requests.php → 3 requests
            3 > 2? YES
            🔔 Toast: "New Asset Request from Rahul Kumar"
            lastCount = 3
            Add new row to table

Time 10s:   GET /api/get_requests.php → 3 requests
            3 > 3? NO
            Continue polling

Time 15s:   Admin clicks "Approve"
            POST /api/approve_request.php
            Request status updates to 'approved'
            Move request to "Processed" section
            Show toast: "Request Approved"
```

---

## 4. Database State Changes

```
┌─────────────────────────────────────────────────────────────────┐
│               DATABASE STATE TRANSITIONS                         │
└─────────────────────────────────────────────────────────────────┘

INITIAL STATE:
┌──────────────────┐        ┌──────────────────┐
│  asset_requests  │        │     assets       │
├──────────────────┤        ├──────────────────┤
│ REQ-001 PENDING  │        │ AST-001: Qty=10  │
└──────────────────┘        └──────────────────┘

USER SUBMITS REQUEST:
  INSERT INTO asset_requests
  VALUES (REQ-001, user@email, AST-001, 2, 'pending')

┌──────────────────────────────┐
│      asset_requests          │
├──────────────────────────────┤
│ REQ-001                      │
│ user: user@email             │
│ asset: AST-001               │
│ qty: 2                       │
│ status: PENDING ← NEW        │
│ created: 2025-03-19T10:30Z   │
└──────────────────────────────┘

ADMIN APPROVES REQUEST:
  UPDATE asset_requests
    SET status = 'approved'
    WHERE id = 'REQ-001'

  INSERT INTO allocations
    VALUES (ALC-001, user@email, AST-001, 2, 2025-03-19, 'active')

  UPDATE assets
    SET available_quantity = available_quantity - 2
    WHERE id = 'AST-001'

FINAL STATE:
┌──────────────────────────────┐    ┌─────────────────────────┐
│      asset_requests          │    │        assets           │
├──────────────────────────────┤    ├─────────────────────────┤
│ REQ-001                      │    │ AST-001:                │
│ status: APPROVED ← CHANGED   │    │ Qty: 8 ← REDUCED BY 2   │
│ updated: 2025-03-19T10:45Z   │    └─────────────────────────┘
└──────────────────────────────┘

┌─────────────────────────────────┐
│       allocations (NEW ROW)      │
├─────────────────────────────────┤
│ ALC-001                         │
│ user: user@email                │
│ asset: AST-001                  │
│ qty: 2                          │
│ issue_date: 2025-03-19          │
│ status: active                  │
└─────────────────────────────────┘

IF REJECTED:
  UPDATE asset_requests
    SET status = 'rejected'
    WHERE id = 'REQ-001'

  (no other changes)

  Asset quantity remains: 10
  No allocation created
```

---

## 5. Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPONENT HIERARCHY                           │
└─────────────────────────────────────────────────────────────────┘

App
├── Router
│   ├── Login
│   ├── AdminLayout
│   │   └── Routes
│   │       ├── Dashboard
│   │       ├── Assets
│   │       ├── Allocation
│   │       ├── Requests ⭐ NEW
│   │       │   ├── Pending Requests Table
│   │       │   │   ├── Request Rows (with Approve/Reject buttons)
│   │       │   │   └── Button handlers
│   │       │   └── Processed Requests Table
│   │       ├── Maintenance
│   │       └── Reports
│   └── UserLayout
│       └── Routes
│           ├── Dashboard
│           ├── MyAllocations
│           ├── RequestAsset
│           │   ├── Request Form
│           │   └── My Requests History Table
│           ├── MyRequests ⭐ NEW
│           │   ├── Summary Cards
│           │   ├── Request History Table
│           │   └── Status Legend
│           ├── Maintenance
│           └── Profile
└── Toast/Sonner (Global notifications)

SIDEBAR UPDATES:
- AdminSidebar: Added "Requests" link
- UserSidebar: Added "My Requests" link

API SERVICE:
- api.ts
  ├── requestAssetAPI()
  ├── getRequestsAPI()
  ├── approveRequestAPI()
  └── rejectRequestAPI()
```

---

## 6. State Management Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT                              │
└─────────────────────────────────────────────────────────────────┘

ADMIN REQUESTS PAGE STATE:

const [requests, setRequests] = useState<AssetRequest[]>([...])
      ↓
      Contains all fetched requests
      Updated every 5 seconds from API

const [loading, setLoading] = useState(false)
      ↓
      During initial fetch

const [approving, setApproving] = useState<string | null>(null)
      ↓
      Request ID being approved (for button disable state)

const [rejecting, setRejecting] = useState<string | null>(null)
      ↓
      Request ID being rejected (for button disable state)

const pollingRef = useRef<NodeJS.Timeout | null>(null)
      ↓
      Reference to polling interval (for cleanup)

const lastCountRef = useRef(mockRequests.length)
      ↓
      Track previous request count to detect new requests

USER REQUESTS PAGE STATE:

const [requests, setRequests] = useState<AssetRequest[]>([...])
      ↓
      User's own requests only

const [loading, setLoading] = useState(false)
      ↓
      During fetch

REQUEST ASSET PAGE STATE:

const [requests, setRequests] = useState<AssetRequest[]>([...])
      ↓
      User's request history

const [form, setForm] = useState({
  assetId: string,
  quantity: number,
  reason: string
})
      ↓
      Form input state

const [submitting, setSubmitting] = useState(false)
      ↓
      Submit button state
```

---

## 7. Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   ERROR HANDLING FLOW                            │
└─────────────────────────────────────────────────────────────────┘

API CALL
    ↓
TRY BLOCK
    ├─→ Success (200)
    │   ├─ Update state
    │   ├─ Show success toast
    │   └─ Proceed
    │
    └─→ Error (400, 404, 500, etc)
        ↓
        CATCH BLOCK
        ├─ Log error to console
        ├─ Show error toast
        │   Title: "Error"
        │   Message: "Failed to [action]"
        │   Variant: "destructive"
        ├─ Revert state if needed
        └─ Allow user retry

SPECIFIC ERROR SCENARIOS:

Scenario: Asset not found
├─ HTTP Status: 400
├─ Response: {"success": false, "message": "Asset not found"}
├─ Frontend: Show toast "Failed to create request"
├─ User can: Retry with different asset

Scenario: Insufficient quantity
├─ HTTP Status: 400
├─ Response: {"success": false, "message": "Insufficient quantity"}
├─ Frontend: Show toast "Not enough assets available"
├─ User can: Request smaller quantity

Scenario: Network error
├─ HTTP Status: 0 (network fail)
├─ Frontend: Show toast "Failed to [action]"
├─ User can: Check connection and retry

Scenario: Server down
├─ HTTP Status: 500/503
├─ Frontend: Show toast "Server error, please try later"
├─ User can: Wait and retry

BUTTON HANDLING:

Button Click
    ↓
setLoading(true) / setApproving(requestId)
    ↓
API Call
    ├─→ Success
    │   ├─ Update state/UI
    │   └─ setApproving(null) to re-enable button
    │
    └─→ Error
        ├─ Show error toast
        └─ setApproving(null) to re-enable button

Result: User can always retry or proceed
```

---

## 8. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATA FLOW DIAGRAM                           │
└─────────────────────────────────────────────────────────────────┘

USER CREATES REQUEST:

┌──────────────┐
│ User Form    │
├──────────────┤
│ asset_id     │
│ quantity     │
│ reason       │
└──────────────┘
      ↓
  [Submit Button]
      ↓
┌──────────────────────────────────┐
│  requestAssetAPI() in frontend   │
│  - Validate inputs              │
│  - Format payload               │
│  - Set submitting=true          │
└──────────────────────────────────┘
      ↓
POST /api/request_asset.php
      ↓
┌──────────────────────────────────┐
│  Backend (PHP)                   │
│  - Validate user exists          │
│  - Validate asset exists         │
│  - Generate request ID           │
│  - Create DB record              │
└──────────────────────────────────┘
      ↓
Response: {success: true, request_id: "REQ-001"}
      ↓
┌──────────────────────────────────┐
│  Frontend Process Response       │
│  - setSubmitting(false)          │
│  - Show success toast            │
│  - Reset form                    │
│  - Add to local state            │
└──────────────────────────────────┘
      ↓
[Request visible in My Requests page]
      ↓

ADMIN APPROVES REQUEST:

[Admin sees request on /admin/requests]
      ↓
[Admin clicks Approve button]
      ↓
┌──────────────────────────────────┐
│  approveRequestAPI()             │
│  - Set approving state           │
│  - Disable button                │
└──────────────────────────────────┘
      ↓
POST /api/approve_request.php
      ↓
┌──────────────────────────────────┐
│  Backend (PHP)                   │
│  - Validate request exists       │
│  - Start transaction             │
│  - Update request status         │
│  - Insert allocation             │
│  - Update asset quantity         │
│  - Commit transaction            │
└──────────────────────────────────┘
      ↓
Response: {success: true, allocation_id: "ALC-001"}
      ↓
┌──────────────────────────────────┐
│  Frontend Process Response       │
│  - Update request status         │
│  - Show success toast            │
│  - Move to processed section     │
│  - setApproving(null)            │
└──────────────────────────────────┘
      ↓
[Request visible as "Approved" to user]
[Asset quantity reduced]
[Allocation created]
```

---

## 9. Status Transition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│              REQUEST STATUS TRANSITIONS                          │
└─────────────────────────────────────────────────────────────────┘

                    ┌────────────────┐
                    │    PENDING     │
                    │  Status Badge  │
                    │  Clock Icon    │
                    │  Orange Color  │
                    └────────┬───────┘
                             │
                    ┌────────┴────────┐
                    │                 │
            ┌───────▼──────┐    ┌─────▼──────┐
            │   APPROVED   │    │  REJECTED  │
            │Status Badge  │    │Status Badge│
            │Check Icon    │    │X Icon     │
            │Green Color   │    │Red Color  │
            └──────────────┘    └───────────┘
                    │                 │
                    │                 │
         [Allocation Created]  [No action]
         [Asset allocated]     [No changes]
         [Qty reduced]

TRANSITIONS ALLOWED:
- pending → approved (via Approve button)
- pending → rejected (via Reject button)

TRANSITIONS NOT ALLOWED:
- approved → anything (immutable)
- rejected → anything (immutable)
- approved → rejected
- rejected → approved

VISUAL DISPLAY:
Admin View:
├── Pending section: Shows pending status
├── Processed section: Shows approved/rejected status
└── Status icon + color coding for quick identification

User View:
├── Summary cards: Counts by status
├── Status badges: Color-coded display
├── Legend: Explains each status
└── Request history: Full timeline
```

---

## 10. Performance Timeline

```
┌─────────────────────────────────────────────────────────────────┐
│             TYPICAL PERFORMANCE TIMELINE                         │
└─────────────────────────────────────────────────────────────────┘

USER CREATES REQUEST:
0ms    - User clicks Submit
50ms   - Form validation
100ms  - API call sent (network delay)
500ms  - Backend processing
600ms  - Response received
650ms  - State updated, toast shown
700ms  - UI re-rendered
TOTAL:  ~700ms to user sees confirmation

ADMIN POLLING CYCLE:
T0s    - Admin opens /admin/requests page
100ms  - Initial GET /api/get_requests.php
250ms  - Display requests in table
5000ms - Wait for next poll
5100ms - GET /api/get_requests.php
5200ms - Compare counts, check for new
5201ms - If new: show toast, update table
TOTAL PER CYCLE: ~100ms API time + 5s wait

REQUEST APPROVAL:
0ms    - Admin clicks Approve button
10ms   - Button disabled, loading state
100ms  - API call sent
600ms  - Backend: update status
700ms  - Backend: create allocation
800ms  - Backend: update asset qty
900ms  - Backend: transaction commit
950ms  - Response sent
1000ms - State updated, button re-enabled
1050ms - Toast shown, table updated
TOTAL:  ~1s to complete

PERCEIVED PERFORMANCE:
- Instant: Form validation, button response
- Quick: API calls, toast display
- Fast: Table updates, re-renders
- Responsive: Polling updates
```

---

## Legend & Icons

```
┌─────────────────────────────────────────────────────────────────┐
│                  ICONS & SYMBOLS USED                            │
└─────────────────────────────────────────────────────────────────┘

SYMBOLS:
→   Information flow direction
↓   Process step
├─  Branch point
└─  End of branch
⭐  New/Important feature
✅  Completed/Success
❌  Failed/Error
🔔  Notification

STATUS COLORS:
🟠 Warning/Pending (Orange)
🟢 Success/Approved (Green)
🔴 Danger/Rejected (Red)
🔵 Info/Active (Blue)

COMPONENTS:
┌──────┐
│ Box  │  = Component/State/Entity
└──────┘

[Button] = User action/Click point

API METHODS:
POST    = Create/Action
GET     = Read/Fetch
PUT     = Update
DELETE  = Remove
```

---

This document provides visual representations of:
- ✅ Request lifecycle
- ✅ Navigation structure
- ✅ Polling system
- ✅ Database changes
- ✅ Component hierarchy
- ✅ State management
- ✅ Error handling
- ✅ Data flow
- ✅ Status transitions
- ✅ Performance metrics

Use these diagrams for presentations, documentation, or team discussions.
