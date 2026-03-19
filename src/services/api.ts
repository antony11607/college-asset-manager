// API Service for Asset Management System
// Replace these with actual API endpoints when backend is ready

const API_BASE = "http://localhost/api"; // Update with your actual API URL

export interface RequestAssetPayload {
  user_id: string;
  asset_id: string;
  quantity: number;
  reason?: string;
}

export interface ApproveRequestPayload {
  request_id: string;
}

export interface RejectRequestPayload {
  request_id: string;
}

// Asset Requests API
export const requestAssetAPI = async (payload: RequestAssetPayload) => {
  try {
    const response = await fetch(`${API_BASE}/request_asset.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Failed to create request");
    return await response.json();
  } catch (error) {
    console.error("Request asset error:", error);
    throw error;
  }
};

export const getRequestsAPI = async (userId?: string) => {
  try {
    const params = userId ? `?user_id=${userId}` : "";
    const response = await fetch(`${API_BASE}/get_requests.php${params}`);
    if (!response.ok) throw new Error("Failed to fetch requests");
    return await response.json();
  } catch (error) {
    console.error("Get requests error:", error);
    throw error;
  }
};

export const approveRequestAPI = async (payload: ApproveRequestPayload) => {
  try {
    const response = await fetch(`${API_BASE}/approve_request.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Failed to approve request");
    return await response.json();
  } catch (error) {
    console.error("Approve request error:", error);
    throw error;
  }
};

export const rejectRequestAPI = async (payload: RejectRequestPayload) => {
  try {
    const response = await fetch(`${API_BASE}/reject_request.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Failed to reject request");
    return await response.json();
  } catch (error) {
    console.error("Reject request error:", error);
    throw error;
  }
};
