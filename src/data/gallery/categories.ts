export interface IndustryCategory {
  id: string;
  label: string;
  icon: string;
}

export const industryCategories: IndustryCategory[] = [
  { id: "all", label: "All Industries", icon: "Briefcase" },
  { id: "home-services", label: "Home Services", icon: "Home" },
  { id: "automotive", label: "Automotive", icon: "Car" },
  { id: "health-wellness", label: "Health & Wellness", icon: "Heart" },
  { id: "beauty-personal-care", label: "Beauty & Personal Care", icon: "Sparkles" },
  { id: "real-estate-property", label: "Real Estate & Property", icon: "Building2" },
  { id: "professional-services", label: "Professional Services", icon: "Briefcase" },
  { id: "creative-events", label: "Creative & Events", icon: "Camera" },
  { id: "pet-services", label: "Pet Services", icon: "PawPrint" },
  { id: "community-nonprofit", label: "Community & Nonprofit", icon: "HeartHandshake" },
  { id: "education", label: "Education", icon: "GraduationCap" },
  { id: "retail", label: "Retail", icon: "ShoppingBag" },
];

/**
 * Ported from a Bolt.new "Multi-Industry Website Template" export (28 Aug
 * 2026) — 84 industries total there, only 64 here. The other 20 are held
 * back because their hero photos turned out to be unusable when actually
 * opened and looked at: literal screenshots of other companies' live
 * websites (fake brand names, nav bars, lead forms baked into the pixels —
 * same defect class as the "Magnific" watermark incident documented
 * elsewhere in this file's history), a WordPress theme-marketplace demo
 * screenshot, one image with a real, possibly-identifying residential
 * address visible, and a handful never individually checked at all. See
 * CLAUDE.md for the full per-industry breakdown. Re-add an entry here (and
 * its industries/<id>.ts + industryList import) once it has a real,
 * checked, sourced-from-Pexels-or-equivalent photo — never re-add the
 * original bundled image untouched.
 */
export const industryCategoryMap: Record<string, string> = {
  // Home Services
  restoration: "home-services",
  "windows-doors": "home-services",
  "appliance-repair": "home-services",
  "pest-control": "home-services",
  "pressure-washing": "home-services",
  flooring: "home-services",
  drywall: "home-services",
  gutters: "home-services",
  "deck-patio": "home-services",
  masonry: "home-services",
  "junk-removal": "home-services",
  // Automotive
  "auto-detailing": "automotive",
  "auto-repair": "automotive",
  towing: "automotive",
  "tire-shop": "automotive",
  "car-wash": "automotive",
  "auto-body": "automotive",
  // Health & Wellness
  "med-spa": "health-wellness",
  dental: "health-wellness",
  chiropractic: "health-wellness",
  "medical-wellness": "health-wellness",
  optometry: "health-wellness",
  "physical-therapy": "health-wellness",
  "mental-health": "health-wellness",
  "urgent-care": "health-wellness",
  // Beauty & Personal Care
  "barber-shop": "beauty-personal-care",
  "hair-braiding": "beauty-personal-care",
  "nail-salon": "beauty-personal-care",
  "spa-massage": "beauty-personal-care",
  "tattoo-studio": "beauty-personal-care",
  "makeup-artist": "beauty-personal-care",
  // Real Estate & Property
  "property-management": "real-estate-property",
  moving: "real-estate-property",
  "home-inspection": "real-estate-property",
  "mortgage-broker": "real-estate-property",
  "interior-design": "real-estate-property",
  // Professional Services
  "author-writer": "professional-services",
  "coach-consultant": "professional-services",
  "legal-services": "professional-services",
  locksmith: "professional-services",
  "accounting-tax": "professional-services",
  "insurance-agency": "professional-services",
  "marketing-agency": "professional-services",
  "it-services": "professional-services",
  "financial-advisor": "professional-services",
  // Creative & Events
  "photographer-videographer": "creative-events",
  "wedding-services": "creative-events",
  "restaurants-cafes": "creative-events",
  catering: "creative-events",
  "event-planning": "creative-events",
  florist: "creative-events",
  bakery: "creative-events",
  "dj-entertainment": "creative-events",
  // Pet Services
  "veterinary-clinic": "pet-services",
  "dog-training": "pet-services",
  "pet-boarding": "pet-services",
  // Community & Nonprofit
  "nonprofit-charity": "community-nonprofit",
  // Education
  tutoring: "education",
  "music-lessons": "education",
  "dance-studio": "education",
  "driving-school": "education",
  // Retail
  boutique: "retail",
  "coffee-shop": "retail",
  "gift-shop": "retail",
};

export function getIndustryCategory(industryId: string): string {
  return industryCategoryMap[industryId] || "home-services";
}

export function getCategoryCount(categoryId: string): number {
  if (categoryId === "all") return Object.keys(industryCategoryMap).length;
  return Object.values(industryCategoryMap).filter((c) => c === categoryId).length;
}
