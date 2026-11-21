/**
 * CivicLens API Client Service
 * Interacts with FastAPI backend endpoints.
 */

import { API_BASE } from "../config";

export async function submitComplaint(formData) {
  const response = await fetch(`${API_BASE}/complaints`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Failed to submit civic complaint.");
  }
  return data;
}

export async function trackComplaint(ticketId) {
  const cleanId = encodeURIComponent(ticketId.trim().toUpperCase());
  const response = await fetch(`${API_BASE}/complaints/${cleanId}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Complaint record not found.");
  }
  return data;
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
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Failed to load municipal ticket queue.");
  }
  return data;
}

export async function getTicketDetail(ticketId) {
  const cleanId = encodeURIComponent(ticketId.trim().toUpperCase());
  const response = await fetch(`${API_BASE}/officer/tickets/${cleanId}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Failed to load ticket details.");
  }
  return data;
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
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Failed to update ticket.");
  }
  return data;
}

export async function getAnalytics() {
  const response = await fetch(`${API_BASE}/analytics`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Failed to fetch municipal analytics.");
  }
  return data;
}
