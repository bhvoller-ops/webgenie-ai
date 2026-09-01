import type { GalleryIndustryKey } from "@/lib/sitegen/types";

/**
 * A deliberately tiny, hand-off-the-real-data extract — {key, label,
 * heroImage, category} for each of the 59 Gallery industries, nothing
 * else. Exists ONLY so client-bundled code (the industry picker, Finder's
 * photo-override placeholders) never has to import the full
 * data/gallery/industries/* configs, which carry testimonials, FAQs,
 * pricing tiers, and a chatbot knowledge base per industry — genuinely
 * large, and irrelevant to picking a name off a list. Importing the full
 * configs into a client bundle for that purpose was tried first and
 * roughly tripled Finder/Audit/New Project's page weight; this file is
 * the fix, not a style preference.
 *
 * Generated once from the real data (data/gallery/industries/index.ts +
 * data/gallery/categories.ts), not hand-typed — if a Gallery industry's
 * name, hero photo, or category ever changes, regenerate this list rather
 * than editing it by hand, so it can't silently drift from the source of
 * truth. GALLERY_INDUSTRIES in gallery-industries.ts (the full configs)
 * remains the actual source of truth and is what generateGallerySite()
 * renders from server-side.
 */
export interface GalleryIndustrySummary {
  key: GalleryIndustryKey;
  label: string;
  heroImage: string;
  category: string;
}

export const GALLERY_INDUSTRY_SUMMARY: GalleryIndustrySummary[] = [
  { key: "accounting-tax", label: "Accounting & Tax", heroImage: "https://images.pexels.com/photos/7821914/pexels-photo-7821914.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Professional Services" },
  { key: "appliance-repair", label: "Appliance Repair", heroImage: "https://app.vibelabsagency.com/gallery-photos/appliance-repair.jpg", category: "Home Services" },
  { key: "author-writer", label: "Author / Writer", heroImage: "https://images.pexels.com/photos/261909/pexels-photo-261909.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Professional Services" },
  { key: "auto-body", label: "Auto Body", heroImage: "https://images.pexels.com/photos/4480507/pexels-photo-4480507.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Automotive" },
  { key: "auto-detailing", label: "Auto Detailing", heroImage: "https://app.vibelabsagency.com/gallery-photos/restoration.jpg", category: "Automotive" },
  { key: "bakery", label: "Bakery", heroImage: "https://images.pexels.com/photos/7405059/pexels-photo-7405059.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Creative & Events" },
  { key: "barber-shop", label: "Barber Shop", heroImage: "https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Beauty & Personal Care" },
  { key: "boutique", label: "Boutique & Clothing", heroImage: "https://images.pexels.com/photos/1488470/pexels-photo-1488470.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Retail" },
  { key: "car-wash", label: "Car Wash", heroImage: "https://images.pexels.com/photos/4870702/pexels-photo-4870702.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Automotive" },
  { key: "catering", label: "Catering", heroImage: "https://images.pexels.com/photos/2337843/pexels-photo-2337843.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Creative & Events" },
  { key: "coach-consultant", label: "Coach / Consultant", heroImage: "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Professional Services" },
  { key: "coffee-shop", label: "Coffee Shop", heroImage: "https://images.pexels.com/photos/6612572/pexels-photo-6612572.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Retail" },
  { key: "dance-studio", label: "Dance Studio", heroImage: "https://images.pexels.com/photos/3901644/pexels-photo-3901644.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Education" },
  { key: "deck-patio", label: "Deck & Patio", heroImage: "https://images.pexels.com/photos/10847167/pexels-photo-10847167.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Home Services" },
  { key: "dj-entertainment", label: "DJ & Entertainment", heroImage: "https://images.pexels.com/photos/5949085/pexels-photo-5949085.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Creative & Events" },
  { key: "dog-training", label: "Dog Training", heroImage: "https://images.pexels.com/photos/19017771/pexels-photo-19017771.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Pet Services" },
  { key: "driving-school", label: "Driving School", heroImage: "https://images.pexels.com/photos/9518244/pexels-photo-9518244.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Education" },
  { key: "drywall", label: "Drywall", heroImage: "https://images.pexels.com/photos/11427055/pexels-photo-11427055.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Home Services" },
  { key: "event-planning", label: "Event Planning", heroImage: "https://images.pexels.com/photos/31107306/pexels-photo-31107306.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Creative & Events" },
  { key: "financial-advisor", label: "Financial Advisor", heroImage: "https://images.pexels.com/photos/8353820/pexels-photo-8353820.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Professional Services" },
  { key: "flooring", label: "Flooring", heroImage: "https://images.pexels.com/photos/1388944/pexels-photo-1388944.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Home Services" },
  { key: "florist", label: "Florist", heroImage: "https://images.pexels.com/photos/5409690/pexels-photo-5409690.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Creative & Events" },
  { key: "gift-shop", label: "Gift Shop", heroImage: "https://images.pexels.com/photos/8889507/pexels-photo-8889507.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Retail" },
  { key: "gutters", label: "Gutters", heroImage: "https://images.pexels.com/photos/11698047/pexels-photo-11698047.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Home Services" },
  { key: "hair-braiding", label: "Hair Braiding Shop", heroImage: "https://images.pexels.com/photos/3993465/pexels-photo-3993465.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Beauty & Personal Care" },
  { key: "home-inspection", label: "Home Inspection", heroImage: "https://images.pexels.com/photos/8293635/pexels-photo-8293635.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Real Estate & Property" },
  { key: "insurance-agency", label: "Insurance Agency", heroImage: "https://images.pexels.com/photos/8297423/pexels-photo-8297423.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Professional Services" },
  { key: "interior-design", label: "Interior Design", heroImage: "https://images.pexels.com/photos/12885119/pexels-photo-12885119.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Real Estate & Property" },
  { key: "it-services", label: "IT Services", heroImage: "https://images.pexels.com/photos/37730211/pexels-photo-37730211.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Professional Services" },
  { key: "junk-removal", label: "Junk Removal", heroImage: "https://images.pexels.com/photos/11849101/pexels-photo-11849101.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Home Services" },
  { key: "legal-services", label: "Legal Services / Law Firm", heroImage: "https://images.pexels.com/photos/5668772/pexels-photo-5668772.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Professional Services" },
  { key: "locksmith", label: "Locksmith", heroImage: "https://images.pexels.com/photos/264819/pexels-photo-264819.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Professional Services" },
  { key: "makeup-artist", label: "Makeup Artist", heroImage: "https://images.pexels.com/photos/5149734/pexels-photo-5149734.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Beauty & Personal Care" },
  { key: "marketing-agency", label: "Marketing Agency", heroImage: "https://images.pexels.com/photos/8117415/pexels-photo-8117415.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Professional Services" },
  { key: "masonry", label: "Masonry", heroImage: "https://images.pexels.com/photos/9497822/pexels-photo-9497822.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Home Services" },
  { key: "medical-wellness", label: "Medical / Wellness", heroImage: "https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Health & Wellness" },
  { key: "mental-health", label: "Mental Health Counseling", heroImage: "https://images.pexels.com/photos/5699493/pexels-photo-5699493.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Health & Wellness" },
  { key: "mortgage-broker", label: "Mortgage Broker", heroImage: "https://images.pexels.com/photos/8292888/pexels-photo-8292888.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Real Estate & Property" },
  { key: "moving", label: "Moving", heroImage: "https://app.vibelabsagency.com/gallery-photos/restoration.jpg", category: "Real Estate & Property" },
  { key: "music-lessons", label: "Music Lessons", heroImage: "https://images.pexels.com/photos/7447185/pexels-photo-7447185.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Education" },
  { key: "nail-salon", label: "Nail Salon", heroImage: "https://images.pexels.com/photos/14267565/pexels-photo-14267565.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Beauty & Personal Care" },
  { key: "nonprofit-charity", label: "Nonprofit / Charity", heroImage: "https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Community & Nonprofit" },
  { key: "optometry", label: "Optometry", heroImage: "https://images.pexels.com/photos/26167588/pexels-photo-26167588.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Health & Wellness" },
  { key: "pest-control", label: "Pest Control", heroImage: "https://app.vibelabsagency.com/gallery-photos/pest-control.jpg", category: "Home Services" },
  { key: "pet-boarding", label: "Pet Boarding & Daycare", heroImage: "https://images.pexels.com/photos/16465605/pexels-photo-16465605.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Pet Services" },
  { key: "photographer-videographer", label: "Photographer / Videographer", heroImage: "https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Creative & Events" },
  { key: "physical-therapy", label: "Physical Therapy", heroImage: "https://images.pexels.com/photos/20860596/pexels-photo-20860596.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Health & Wellness" },
  { key: "pressure-washing", label: "Pressure Washing", heroImage: "https://images.pexels.com/photos/4100431/pexels-photo-4100431.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Home Services" },
  { key: "property-management", label: "Property Management Services", heroImage: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Real Estate & Property" },
  { key: "restaurants-cafes", label: "Restaurants & Cafes", heroImage: "https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Creative & Events" },
  { key: "spa-massage", label: "Spa & Massage", heroImage: "https://images.pexels.com/photos/9146381/pexels-photo-9146381.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Beauty & Personal Care" },
  { key: "tattoo-studio", label: "Tattoo Studio", heroImage: "https://images.pexels.com/photos/6593432/pexels-photo-6593432.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Beauty & Personal Care" },
  { key: "tire-shop", label: "Tire Shop", heroImage: "https://images.pexels.com/photos/16023877/pexels-photo-16023877.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Automotive" },
  { key: "towing", label: "Towing", heroImage: "https://images.pexels.com/photos/17429097/pexels-photo-17429097.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Automotive" },
  { key: "tutoring", label: "Tutoring", heroImage: "https://images.pexels.com/photos/4173338/pexels-photo-4173338.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Education" },
  { key: "urgent-care", label: "Urgent Care", heroImage: "https://images.pexels.com/photos/8948301/pexels-photo-8948301.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Health & Wellness" },
  { key: "veterinary-clinic", label: "Veterinary Clinic", heroImage: "https://images.pexels.com/photos/7468978/pexels-photo-7468978.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Pet Services" },
  { key: "wedding-services", label: "Wedding Services", heroImage: "https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=1200", category: "Creative & Events" },
  { key: "windows-doors", label: "Windows & Doors", heroImage: "https://app.vibelabsagency.com/gallery-photos/restoration.jpg", category: "Home Services" },
];
