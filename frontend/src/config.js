/**
 * CivicLens Frontend Global Configuration
 * Central point for application branding and API configurations.
 */

export const APP_NAME = "CivicLens";
export const API_BASE = "/api";

export const ALLOWED_CATEGORIES = [
  "roads",
  "waste",
  "water supply",
  "sewage and drainage",
  "electricity and streetlights",
  "trees and parks",
  "encroachment",
  "noise and pollution",
  "stray animals",
  "other",
];

export const ALLOWED_SEVERITIES = ["Critical", "High", "Medium", "Low"];
export const ALLOWED_STATUSES = ["new", "assigned", "in_progress", "resolved"];

export const CATEGORY_LABELS = {
  "roads": "Roads & Footpaths",
  "waste": "Solid Waste Management",
  "water supply": "Drinking Water Supply",
  "sewage and drainage": "Sewage & Stormwater Drainage",
  "electricity and streetlights": "Electricity & Streetlights",
  "trees and parks": "Trees, Parks & Greenery",
  "encroachment": "Footpath & Land Encroachment",
  "noise and pollution": "Noise, Smoke & Environmental Pollution",
  "stray animals": "Stray Animals & Rabies Control",
  "other": "General Municipal Grievance",
};
