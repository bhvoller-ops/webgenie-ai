import type { Project, WebsiteReference } from "./types";

export const projects: Project[] = [
  {
    id: "wg-demo-001",
    name: "Atlas Roofing Redesign",
    industry: "Roofing Contractor",
    primaryGoal: "Lead generation",
    primaryCta: "Request a free inspection",
    status: "active"
  },
  {
    id: "wg-demo-002",
    name: "BrightSmile Dental",
    industry: "Dental Practice",
    primaryGoal: "Appointment booking",
    primaryCta: "Book an appointment",
    status: "draft"
  }
];

export const references: WebsiteReference[] = [
  {
    id: "ref-001",
    projectId: "wg-demo-001",
    url: "https://example.com",
    role: "competitor",
    label: "Local competitor",
    priority: 3
  }
];
