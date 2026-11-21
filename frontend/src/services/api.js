/**
 * CivicLens API Client Service
 * Interacts with FastAPI backend endpoints.
 */

import { API_BASE } from "../config";

async function readApiResponse(response, fallbackMessage) {
  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        `Backend API did not return JSON (HTTP ${response.status}). Verify VITE_API_BASE_URL and CORS_ORIGIN.`
      );
    }
  }

  if (!response.ok) {
    throw new Error(data?.detail || fallbackMessage);
  }
  return data;
}

export async function submitComplaint(formData) {
  let payload = formData;

  if (!(formData instanceof FormData)) {
    payload = new FormData();
    if (formData.text?.trim()) payload.append("raw_text", formData.text.trim());
    if (formData.photo) payload.append("photo", formData.photo);
    if (formData.locationText?.trim()) payload.append("location_text", formData.locationText.trim());
    if (formData.latitude != null) payload.append("latitude", String(formData.latitude));
    if (formData.longitude != null) payload.append("longitude", String(formData.longitude));
    if (formData.contactNumber?.trim()) payload.append("contact_number", formData.contactNumber.trim());
  }

  const response = await fetch(`${API_BASE}/complaints`, {
    method: "POST",
    body: payload,
  });

  return readApiResponse(response, "Failed to submit civic complaint.");
}

export async function trackComplaint(ticketId) {
  const cleanId = encodeURIComponent(ticketId.trim().toUpperCase());
  const response = await fetch(`${API_BASE}/complaints/${cleanId}`);
  return readApiResponse(response, "Complaint record not found.");
}

export async function getOfficerTickets(filters = {}) {
  const params = new URLSearchParams();
  if (filters.department) params.append("department", filters.department);
  if (filters.category) params.append("category", filters.category);
  if (filters.severity) params.append("severity", filters.severity);
  if (filters.status) params.append("status", filters.status);
  if (filters.needs_review !== undefined && filters.needs_review !== null) {
    params.append("needs_review", filters.needs_review);
  }
  if (filters.search) params.append("search", filters.search);
  if (filters.include_duplicates) params.append("include_duplicates", "true");

  const url = `${API_BASE}/officer/tickets?${params.toString()}`;
  const response = await fetch(url);
  return readApiResponse(response, "Failed to load municipal ticket queue.");
}

export async function getTicketDetail(ticketId) {
  const cleanId = encodeURIComponent(ticketId.trim().toUpperCase());
  const response = await fetch(`${API_BASE}/officer/tickets/${cleanId}`);
  return readApiResponse(response, "Failed to load ticket details.");
}

export async function updateTicket(ticketId, payload) {
  const cleanId = encodeURIComponent(ticketId.trim().toUpperCase());
  const response = await fetch(`${API_BASE}/officer/tickets/${cleanId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return readApiResponse(response, "Failed to update ticket.");
}

export async function getAnalytics() {
  const response = await fetch(`${API_BASE}/analytics`);
  return readApiResponse(response, "Failed to fetch municipal analytics.");
}

export async function loginUser(payload) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return readApiResponse(response, "Authentication failed.");
}

export async function resolveTicketWithProof(ticketId, formData) {
  const cleanId = encodeURIComponent(ticketId.trim().toUpperCase());
  const response = await fetch(`${API_BASE}/officer/tickets/${cleanId}/resolve`, {
    method: "POST",
    body: formData,
  });
  return readApiResponse(response, "Failed to submit resolution proof.");
}

export async function getOfficerLogs(filters = {}) {
  const params = new URLSearchParams();
  if (filters.limit) params.append("limit", filters.limit);
  if (filters.action) params.append("action", filters.action);
  if (filters.ticket_id) params.append("ticket_id", filters.ticket_id);

  const url = `${API_BASE}/officer/logs?${params.toString()}`;
  const response = await fetch(url);
  return readApiResponse(response, "Failed to fetch audit logs.");
}

