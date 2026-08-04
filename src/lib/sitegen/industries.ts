import type { IndustryKey, IndustryProfile } from "@/lib/sitegen/types";

/**
 * Industry profiles.
 *
 * The quality of a generated site lives almost entirely in this file. Every
 * service, trust point, and FAQ answer here is written the way a good local
 * business would write it — specific, plain, and answering the question the
 * buyer actually has.
 */

export const INDUSTRIES: Record<IndustryKey, IndustryProfile> = {
  plumber: {
    key: "plumber",
    label: "Licensed Plumber",
    plural: "Plumbers",
    schemaType: "Plumber",
    primary: "#1D4ED8",
    primaryDark: "#1E3A8A",
    heroSub:
      "Fast, reliable plumbing services you can count on. Proudly serving {city} and the surrounding communities.",
    ctaLabel: "Call Now",
    ctaSub: "Free estimates · No obligation · Available 7 days a week",
    emergency: true,
    services: [
      { name: "Emergency Repairs", blurb: "Burst pipes, major leaks, and no-water emergencies handled the same day.", icon: "wrench" },
      { name: "Drain Cleaning", blurb: "Slow or blocked drains cleared properly, with the cause found rather than guessed at.", icon: "droplet" },
      { name: "Water Heater Install", blurb: "Repair, replacement, and tankless upgrades sized correctly for your home.", icon: "flame" },
      { name: "Leak Detection", blurb: "Hidden leaks located without tearing out walls, then fixed and verified.", icon: "shield" },
      { name: "Pipe Repair & Repipe", blurb: "From a single failed section to a full repipe, with a clear quote first.", icon: "wrench" },
      { name: "Bathroom Remodel", blurb: "Fixture upgrades and full bathroom plumbing, done to code and on schedule.", icon: "home" },
    ],
    trust: [
      { title: "Licensed & Insured", blurb: "Fully licensed and insured, so you are covered before we start.", icon: "shield" },
      { title: "Fast Response", blurb: "Most calls answered same day, with a real arrival window you can plan around.", icon: "clock" },
      { title: "Upfront Pricing", blurb: "You approve the price before any work begins. No surprises on the invoice.", icon: "thumbsUp" },
      { title: "Workmanship Warranty", blurb: "Our work is guaranteed. If something we fixed fails, we come back.", icon: "award" },
    ],
    faq: [
      { q: "Do you charge for estimates?", a: "No. Estimates are free, and you approve the price before we begin any work." },
      { q: "How quickly can you get here?", a: "Most calls are handled the same day. For emergencies like a burst pipe or no water, we prioritise you and give a real arrival window." },
      { q: "Are you licensed and insured?", a: "Yes, fully licensed and insured. We are happy to provide our licence number before we arrive." },
      { q: "Do you offer emergency service?", a: "Yes. Burst pipes, sewage backups, and no-water situations are handled outside normal hours." },
      { q: "What areas do you serve?", a: "We serve {city} and the surrounding communities. Call and we will confirm we cover your address." },
    ],
  },

  hvac: {
    key: "hvac",
    label: "Heating & Air Specialist",
    plural: "HVAC Companies",
    schemaType: "HVACBusiness",
    primary: "#0369A1",
    primaryDark: "#075985",
    heroSub:
      "Heating and cooling repair, installation, and maintenance across {city}. Comfortable homes, honest pricing.",
    ctaLabel: "Schedule Service",
    ctaSub: "Free estimates on replacements · Financing available · Same-day service",
    emergency: true,
    services: [
      { name: "AC Repair", blurb: "Diagnosed properly and repaired the same day wherever parts allow.", icon: "droplet" },
      { name: "Heating Repair", blurb: "Furnace and heat pump faults found and fixed before the cold sets in.", icon: "flame" },
      { name: "System Installation", blurb: "Correctly sized systems installed to manufacturer spec, with financing available.", icon: "home" },
      { name: "Maintenance Plans", blurb: "Twice-yearly tune-ups that catch failures before they become breakdowns.", icon: "calendar" },
      { name: "Duct Cleaning & Sealing", blurb: "Leaking ductwork found and sealed, which is often the real cause of high bills.", icon: "wrench" },
      { name: "Indoor Air Quality", blurb: "Filtration, humidity control, and ventilation for allergy and asthma households.", icon: "sparkles" },
    ],
    trust: [
      { title: "Certified Technicians", blurb: "Factory-trained and certified on the systems we install and service.", icon: "award" },
      { title: "Same-Day Service", blurb: "No heat or no cooling is treated as urgent, not scheduled for next week.", icon: "clock" },
      { title: "Honest Recommendations", blurb: "We will tell you when a repair makes more sense than a replacement.", icon: "thumbsUp" },
      { title: "Financing Available", blurb: "Approved financing on new systems, so a failure is not a crisis.", icon: "shield" },
    ],
    faq: [
      { q: "Should I repair or replace my system?", a: "As a rule of thumb, if the unit is over twelve years old and the repair costs more than a third of a replacement, replacing usually wins. We will show you both numbers and let you decide." },
      { q: "How often should I service my system?", a: "Twice a year — heating before winter and cooling before summer. Most breakdowns we attend were preventable at a tune-up." },
      { q: "Do you offer emergency service?", a: "Yes. No heat in winter and no cooling in extreme heat are treated as emergencies." },
      { q: "How long does an installation take?", a: "Most residential replacements are completed in one day. Larger or more complex jobs may take two." },
      { q: "Do you offer financing?", a: "Yes, we offer approved financing on new system installations. Ask when you call and we will explain the options." },
    ],
  },

  electrician: {
    key: "electrician",
    label: "Licensed Electrician",
    plural: "Electricians",
    schemaType: "Electrician",
    primary: "#B45309",
    primaryDark: "#92400E",
    heroSub:
      "Safe, code-compliant electrical work for homes and businesses across {city}.",
    ctaLabel: "Request a Quote",
    ctaSub: "Licensed & insured · Free quotes · Emergency service available",
    emergency: true,
    services: [
      { name: "Panel Upgrades", blurb: "Older panels replaced safely to handle modern household load.", icon: "zap" },
      { name: "Outlets & Wiring", blurb: "New circuits, outlet additions, and rewiring done to current code.", icon: "wrench" },
      { name: "Lighting Installation", blurb: "Interior, exterior, and landscape lighting installed and tested.", icon: "sparkles" },
      { name: "EV Charger Install", blurb: "Home charging stations installed with the correct circuit and permit.", icon: "car" },
      { name: "Troubleshooting", blurb: "Tripping breakers and dead circuits traced to the actual cause.", icon: "shield" },
      { name: "Safety Inspections", blurb: "Full inspection with a written report — essential before buying or selling.", icon: "award" },
    ],
    trust: [
      { title: "Licensed & Insured", blurb: "Fully licensed, insured, and permitted for the work we perform.", icon: "shield" },
      { title: "Code Compliant", blurb: "Every job meets current electrical code and passes inspection.", icon: "award" },
      { title: "Upfront Quotes", blurb: "Written quotes before work starts. The price you approve is the price you pay.", icon: "thumbsUp" },
      { title: "Clean Workmanship", blurb: "Tidy installations, labelled panels, and a clean site when we leave.", icon: "star" },
    ],
    faq: [
      { q: "Do I need a permit for electrical work?", a: "Most panel work, new circuits, and EV chargers require a permit. We handle the permit and the inspection as part of the job." },
      { q: "How do I know if my panel needs upgrading?", a: "Frequent breaker trips, a fuse box rather than breakers, or anything under 100 amps in a modern home are all signs. An inspection gives you a definite answer." },
      { q: "Do you offer emergency service?", a: "Yes. Burning smells, sparking outlets, and total power loss are treated as emergencies." },
      { q: "Are your quotes free?", a: "Yes. We provide a written quote at no cost, and you approve it before any work begins." },
      { q: "Can you install an EV charger?", a: "Yes. We assess your panel capacity, install the correct circuit, and handle the permit and inspection." },
    ],
  },

  roofer: {
    key: "roofer",
    label: "Roofing Contractor",
    plural: "Roofing Companies",
    schemaType: "RoofingContractor",
    primary: "#B91C1C",
    primaryDark: "#7F1D1D",
    heroSub:
      "Roof repair, replacement, and storm damage restoration across {city}. Free inspections, honest assessments.",
    ctaLabel: "Free Roof Inspection",
    ctaSub: "Free inspection · Insurance claims assistance · Workmanship warranty",
    emergency: true,
    services: [
      { name: "Roof Replacement", blurb: "Full tear-off and replacement with a written warranty on materials and labour.", icon: "home" },
      { name: "Roof Repair", blurb: "Leaks traced to the actual source and repaired, not patched over.", icon: "wrench" },
      { name: "Storm Damage", blurb: "Emergency tarping, full damage assessment, and help with your claim.", icon: "shield" },
      { name: "Gutter Systems", blurb: "Gutters and downspouts installed to move water away from the foundation.", icon: "droplet" },
      { name: "Skylights & Ventilation", blurb: "Correctly flashed skylights and attic ventilation that protects the deck.", icon: "sparkles" },
      { name: "Free Inspections", blurb: "A full photographic inspection with a written report — free, no obligation.", icon: "award" },
    ],
    trust: [
      { title: "Licensed & Insured", blurb: "Fully licensed and carrying full liability and workers' compensation cover.", icon: "shield" },
      { title: "Insurance Claims Help", blurb: "We document the damage properly and deal with the adjuster alongside you.", icon: "thumbsUp" },
      { title: "Written Warranty", blurb: "Workmanship warranty in writing, on top of the manufacturer's cover.", icon: "award" },
      { title: "Honest Assessments", blurb: "If your roof has years left, we will say so rather than sell you one.", icon: "star" },
    ],
    faq: [
      { q: "Is the inspection really free?", a: "Yes. We inspect, photograph, and give you a written report at no cost and with no obligation." },
      { q: "Will my insurance cover a new roof?", a: "It depends on whether the damage is storm-related and on your policy. We document everything properly and can meet the adjuster on site." },
      { q: "How long does a roof replacement take?", a: "Most residential roofs are completed in one to two days, weather permitting." },
      { q: "How do I know if I need a repair or a replacement?", a: "Age, the extent of damage, and how many layers are already on the roof all matter. Our inspection gives you a straight answer with photographs." },
      { q: "Do you offer a warranty?", a: "Yes — a written workmanship warranty from us, plus the manufacturer's warranty on materials." },
    ],
  },

  landscaper: {
    key: "landscaper",
    label: "Landscaping & Lawn Care",
    plural: "Landscapers",
    schemaType: "LandscapingBusiness",
    primary: "#15803D",
    primaryDark: "#14532D",
    heroSub:
      "Lawn care, landscape design, and outdoor living spaces across {city}. Reliable crews, tidy work.",
    ctaLabel: "Get a Free Estimate",
    ctaSub: "Free estimates · Weekly & bi-weekly plans · Fully insured",
    emergency: false,
    services: [
      { name: "Lawn Maintenance", blurb: "Weekly or bi-weekly mowing, edging, and cleanup on a schedule you can rely on.", icon: "leaf" },
      { name: "Landscape Design", blurb: "Planting plans designed for your light, soil, and how you actually use the space.", icon: "sparkles" },
      { name: "Hardscaping", blurb: "Patios, walkways, and retaining walls built to last through freeze and thaw.", icon: "home" },
      { name: "Irrigation", blurb: "Sprinkler installation, repair, and seasonal start-up and winterisation.", icon: "droplet" },
      { name: "Seasonal Cleanup", blurb: "Spring and autumn cleanups, leaf removal, and bed preparation.", icon: "tree" },
      { name: "Mulch & Bed Care", blurb: "Fresh mulch, edging, and weed control that keeps beds looking maintained.", icon: "leaf" },
    ],
    trust: [
      { title: "Reliable Schedule", blurb: "We turn up on the day we say. If weather moves us, you hear from us first.", icon: "clock" },
      { title: "Fully Insured", blurb: "Full liability cover, so your property is protected while we work.", icon: "shield" },
      { title: "Tidy Crews", blurb: "Clippings cleared, paths blown down, gates closed. Every visit.", icon: "star" },
      { title: "No Long Contracts", blurb: "Seasonal plans without a lock-in. Stay because the work is good.", icon: "thumbsUp" },
    ],
    faq: [
      { q: "Do you offer one-off visits or only contracts?", a: "Both. Many customers start with a one-off cleanup and move to a regular schedule once they have seen the work." },
      { q: "How much does weekly lawn care cost?", a: "It depends on lot size and what is included. We quote after seeing the property, and the estimate is free." },
      { q: "What happens if it rains on my service day?", a: "We move you to the next available day and let you know. We do not skip a week without telling you." },
      { q: "Are you insured?", a: "Yes, we carry full liability insurance and can provide a certificate on request." },
      { q: "Do you handle irrigation repairs?", a: "Yes — installation, repair, seasonal start-up, and winterisation." },
    ],
  },

  tree_care: {
    key: "tree_care",
    label: "Tree Care Specialist",
    plural: "Tree Services",
    schemaType: "LandscapingBusiness",
    primary: "#166534",
    primaryDark: "#14532D",
    heroSub:
      "Tree removal, trimming, and emergency storm response across {city}. Safe, insured, and tidy.",
    ctaLabel: "Get a Free Quote",
    ctaSub: "Free quotes · Emergency storm response · Fully insured crews",
    emergency: true,
    services: [
      { name: "Tree Removal", blurb: "Safe removal of hazardous and unwanted trees, including tight-access sites.", icon: "tree" },
      { name: "Trimming & Pruning", blurb: "Structural pruning that protects the tree's health, not just its shape.", icon: "leaf" },
      { name: "Emergency Storm Work", blurb: "Fallen and hanging limbs cleared urgently, day or night.", icon: "shield" },
      { name: "Stump Grinding", blurb: "Stumps ground below grade and the area left ready to plant or turf.", icon: "wrench" },
      { name: "Tree Health Assessment", blurb: "Disease, decay, and stability assessed before you decide to remove.", icon: "award" },
      { name: "Lot Clearing", blurb: "Selective or full clearing for building, access, or fire safety.", icon: "home" },
    ],
    trust: [
      { title: "Fully Insured", blurb: "Full liability and workers' compensation cover. Always ask any tree service for this.", icon: "shield" },
      { title: "Safe Rigging", blurb: "Proper rigging and controlled lowering near roofs, fences, and power lines.", icon: "award" },
      { title: "Complete Cleanup", blurb: "Debris removed, site raked, and driveway blown down before we leave.", icon: "star" },
      { title: "Free Quotes", blurb: "On-site assessment and a written quote at no cost.", icon: "thumbsUp" },
    ],
    faq: [
      { q: "Are you insured?", a: "Yes, full liability and workers' compensation. We provide certificates on request — and you should ask every tree service for them." },
      { q: "Do you clean up afterwards?", a: "Yes. Debris is removed, the site is raked, and hard surfaces are blown down as standard." },
      { q: "Can you work near power lines?", a: "We handle work near service lines safely. Anything touching primary utility lines has to be coordinated with the utility, and we will tell you if that applies." },
      { q: "Do you offer emergency service?", a: "Yes. Storm-damaged and hanging limbs are treated as urgent." },
      { q: "How much does tree removal cost?", a: "It depends on size, access, and proximity to structures. The on-site quote is free and firm." },
    ],
  },

  cleaning: {
    key: "cleaning",
    label: "Cleaning Service",
    plural: "Cleaning Services",
    schemaType: "HousePainter",
    primary: "#0D9488",
    primaryDark: "#115E59",
    heroSub:
      "Dependable home and office cleaning across {city}. Bonded, insured, and consistently thorough.",
    ctaLabel: "Get a Free Quote",
    ctaSub: "Free quotes · Bonded & insured · Satisfaction guaranteed",
    emergency: false,
    services: [
      { name: "Recurring Cleaning", blurb: "Weekly, fortnightly, or monthly visits with the same team each time.", icon: "calendar" },
      { name: "Deep Cleaning", blurb: "Top-to-bottom clean including skirting, appliances, and inside cabinets.", icon: "sparkles" },
      { name: "Move In / Move Out", blurb: "Full property clean to meet inspection and deposit standards.", icon: "home" },
      { name: "Office Cleaning", blurb: "After-hours commercial cleaning on a schedule that suits your business.", icon: "shield" },
      { name: "Post-Construction", blurb: "Dust, residue, and debris removed so the space is genuinely liveable.", icon: "wrench" },
      { name: "One-Off Cleans", blurb: "Before guests, after a party, or whenever you simply need a reset.", icon: "star" },
    ],
    trust: [
      { title: "Bonded & Insured", blurb: "Fully bonded and insured, with every cleaner background-checked.", icon: "shield" },
      { title: "Same Team Each Visit", blurb: "You get the same people, so they learn your home and your preferences.", icon: "star" },
      { title: "Satisfaction Guarantee", blurb: "If something is missed, tell us within 24 hours and we return to fix it.", icon: "thumbsUp" },
      { title: "Flexible Scheduling", blurb: "Reschedule without penalty when life gets in the way.", icon: "clock" },
    ],
    faq: [
      { q: "Do I need to be home?", a: "No. Most customers give us access instructions and go about their day. Whatever you are comfortable with works." },
      { q: "Do you bring supplies?", a: "Yes, we bring everything. If you prefer specific products for allergies or surfaces, we will use yours." },
      { q: "Are your cleaners background-checked?", a: "Yes. Every member of our team is background-checked, and we are bonded and insured." },
      { q: "What if I am not happy with the clean?", a: "Tell us within 24 hours and we come back and put it right at no charge." },
      { q: "How much does a clean cost?", a: "It depends on size and condition. We quote after a short conversation or walkthrough, and the quote is free." },
    ],
  },

  auto_repair: {
    key: "auto_repair",
    label: "Auto Repair Shop",
    plural: "Auto Repair Shops",
    schemaType: "AutoRepair",
    primary: "#374151",
    primaryDark: "#1F2937",
    heroSub:
      "Honest diagnostics and quality repairs in {city}. Certified technicians, fair pricing, work explained.",
    ctaLabel: "Schedule Service",
    ctaSub: "Free estimates · Certified technicians · Warranty on parts & labour",
    emergency: false,
    services: [
      { name: "Diagnostics", blurb: "Check engine lights read properly and the actual fault identified.", icon: "zap" },
      { name: "Brake Service", blurb: "Pads, rotors, and fluid inspected and replaced before they become unsafe.", icon: "shield" },
      { name: "Oil & Routine Service", blurb: "Scheduled maintenance that keeps your warranty and your engine intact.", icon: "droplet" },
      { name: "Tyres & Alignment", blurb: "Fitting, balancing, and alignment that stops uneven wear.", icon: "car" },
      { name: "AC & Heating", blurb: "Cabin climate faults diagnosed and repaired, including leak testing.", icon: "flame" },
      { name: "Transmission", blurb: "Service, repair, and honest advice on whether a rebuild is worth it.", icon: "wrench" },
    ],
    trust: [
      { title: "Certified Technicians", blurb: "Qualified technicians working on modern diagnostic equipment.", icon: "award" },
      { title: "We Explain the Work", blurb: "You see the problem and understand the fix before you approve it.", icon: "thumbsUp" },
      { title: "Fair Pricing", blurb: "Written estimates up front, and we call before doing anything extra.", icon: "star" },
      { title: "Warranty Backed", blurb: "Parts and labour warranty on the repairs we carry out.", icon: "shield" },
    ],
    faq: [
      { q: "Do you charge for estimates?", a: "Estimates are free. Where a fault needs diagnostic time, we tell you that cost up front and apply it to the repair if you go ahead." },
      { q: "Will you call before doing extra work?", a: "Always. Nothing beyond the approved estimate happens without your authorisation." },
      { q: "Do you offer a warranty?", a: "Yes, we warranty both parts and labour. Terms depend on the repair and we will explain them clearly." },
      { q: "How long will my car be in?", a: "Routine work is usually same day. We give you a realistic time when you book rather than an optimistic one." },
      { q: "Can you service my car under warranty?", a: "In most cases yes — routine servicing at an independent shop does not void a manufacturer warranty. Bring your book and we will keep it stamped." },
    ],
  },

  dentist: {
    key: "dentist",
    label: "Dental Practice",
    plural: "Dental Practices",
    schemaType: "Dentist",
    primary: "#0E7490",
    primaryDark: "#155E75",
    heroSub:
      "Gentle, modern dentistry in {city}. Same-week appointments and treatment explained before it starts.",
    ctaLabel: "Book an Appointment",
    ctaSub: "New patients welcome · Most insurance accepted · Financing available",
    emergency: true,
    services: [
      { name: "Cleanings & Checkups", blurb: "Routine care that catches problems while they are still small and cheap.", icon: "sparkles" },
      { name: "Cosmetic Dentistry", blurb: "Veneers, bonding, and whitening with the outcome agreed beforehand.", icon: "star" },
      { name: "Dental Implants", blurb: "Permanent replacement for missing teeth, planned and placed in-house.", icon: "tooth" },
      { name: "Clear Aligners", blurb: "Discreet alignment treatment with a clear timeline and cost.", icon: "heart" },
      { name: "Emergency Care", blurb: "Pain, breakage, and lost fillings seen urgently rather than next month.", icon: "shield" },
      { name: "Family Dentistry", blurb: "Care for every age, so the whole household can be seen in one place.", icon: "home" },
    ],
    trust: [
      { title: "Same-Week Appointments", blurb: "You will not wait a month to be seen, and emergencies are seen sooner.", icon: "clock" },
      { title: "Treatment Explained", blurb: "You see the images and understand the plan and cost before agreeing.", icon: "thumbsUp" },
      { title: "Insurance & Financing", blurb: "Most plans accepted, with payment options for treatment that is not covered.", icon: "shield" },
      { title: "Comfort First", blurb: "Anxiety is normal. Tell us and we will adjust how we work with you.", icon: "heart" },
    ],
    faq: [
      { q: "Are you accepting new patients?", a: "Yes, we are currently accepting new patients and can usually offer an appointment within the week." },
      { q: "Do you take my insurance?", a: "We accept most major plans. Call with your provider and we will confirm before you come in." },
      { q: "What does treatment cost?", a: "It depends on what you need. You will always get a written estimate before treatment starts, and we will never begin work you have not approved." },
      { q: "I am anxious about the dentist. Can you help?", a: "Yes, and you are far from alone. Tell us when you book and we will take more time, explain each step, and stop whenever you need." },
      { q: "Do you handle dental emergencies?", a: "Yes. Call us — pain, breakage, and swelling are prioritised for same-day care wherever possible." },
    ],
  },

  med_spa: {
    key: "med_spa",
    label: "Medical Spa",
    plural: "Med Spas",
    schemaType: "MedicalClinic",
    primary: "#9333EA",
    primaryDark: "#6B21A8",
    heroSub:
      "Advanced aesthetic treatments in {city}, delivered by licensed medical professionals.",
    ctaLabel: "Book a Consultation",
    ctaSub: "Free consultations · Licensed providers · Financing available",
    emergency: false,
    services: [
      { name: "Injectables", blurb: "Wrinkle relaxers and dermal filler, placed conservatively and reviewed.", icon: "sparkles" },
      { name: "Laser Treatments", blurb: "Resurfacing, pigmentation, and hair reduction on medical-grade devices.", icon: "zap" },
      { name: "Medical Facials", blurb: "Chemical peels and advanced facials matched to your skin, not a menu.", icon: "heart" },
      { name: "Body Contouring", blurb: "Non-surgical fat reduction and skin tightening with realistic expectations set.", icon: "star" },
      { name: "Skin Health Plans", blurb: "Medical-grade skincare regimens built around your actual concerns.", icon: "shield" },
      { name: "Wellness & IV Therapy", blurb: "Hydration and vitamin therapy administered by licensed clinicians.", icon: "droplet" },
    ],
    trust: [
      { title: "Licensed Providers", blurb: "Treatments performed by licensed medical professionals, not technicians.", icon: "award" },
      { title: "Honest Expectations", blurb: "We will tell you when a treatment will not achieve what you are hoping for.", icon: "thumbsUp" },
      { title: "Free Consultations", blurb: "A proper consultation and plan before you commit to anything.", icon: "calendar" },
      { title: "Discreet & Comfortable", blurb: "Private treatment rooms and a team that respects your confidentiality.", icon: "heart" },
    ],
    faq: [
      { q: "Is the consultation free?", a: "Yes. We assess, discuss options, and give you a plan and pricing with no obligation to book." },
      { q: "Who performs the treatments?", a: "All medical treatments are performed by licensed medical professionals under medical direction." },
      { q: "How much does treatment cost?", a: "It varies by treatment and by how much is needed. You will have exact pricing at consultation, before anything is booked." },
      { q: "Is there downtime?", a: "It depends entirely on the treatment — some have none, others need a few days. We will tell you honestly so you can plan around it." },
      { q: "Do you offer financing?", a: "Yes, we offer payment plans on larger treatment packages. Ask at your consultation." },
    ],
  },

  chiropractor: {
    key: "chiropractor",
    label: "Chiropractic Clinic",
    plural: "Chiropractors",
    schemaType: "MedicalClinic",
    primary: "#0F766E",
    primaryDark: "#115E59",
    heroSub:
      "Relief from back, neck, and joint pain in {city}. Evidence-based care with a clear treatment plan.",
    ctaLabel: "Book a Consultation",
    ctaSub: "New patient consultations · Most insurance accepted · Same-week appointments",
    emergency: false,
    services: [
      { name: "Back & Neck Pain", blurb: "The most common reason people come to us, and the most treatable.", icon: "shield" },
      { name: "Spinal Adjustment", blurb: "Manual adjustment following a proper assessment, never before one.", icon: "heart" },
      { name: "Sciatica Relief", blurb: "Nerve pain traced to its source and treated with a structured plan.", icon: "zap" },
      { name: "Sports Injuries", blurb: "Assessment, treatment, and a return-to-activity plan you can follow.", icon: "star" },
      { name: "Auto Injury Care", blurb: "Whiplash and collision injuries documented properly for your claim.", icon: "car" },
      { name: "Massage Therapy", blurb: "Soft tissue work alongside adjustment, where it helps recovery.", icon: "sparkles" },
    ],
    trust: [
      { title: "Proper Assessment First", blurb: "A full assessment before any treatment. No adjustment on a first guess.", icon: "award" },
      { title: "Clear Treatment Plans", blurb: "You will know how many visits, why, and what progress should look like.", icon: "thumbsUp" },
      { title: "Insurance Accepted", blurb: "Most major plans accepted, including auto injury claims.", icon: "shield" },
      { title: "Same-Week Appointments", blurb: "Pain does not wait, and neither should your first appointment.", icon: "clock" },
    ],
    faq: [
      { q: "What happens at the first visit?", a: "A full history and physical assessment, imaging if it is needed, and a discussion of findings. Treatment usually begins the same day if it is appropriate." },
      { q: "How many visits will I need?", a: "It depends on the condition and how long you have had it. You will get an honest estimate at the first visit rather than an open-ended plan." },
      { q: "Does an adjustment hurt?", a: "Most people describe relief rather than pain. If anything is uncomfortable, tell us and we adjust the approach." },
      { q: "Do you take insurance?", a: "We accept most major plans and handle auto injury claims. Call with your details and we will verify before you come in." },
      { q: "Do I need a referral?", a: "In most cases no. Some insurance plans require one — we can check that for you." },
    ],
  },

  restoration: {
    key: "restoration",
    label: "Restoration Company",
    plural: "Restoration Companies",
    schemaType: "GeneralContractor",
    primary: "#1E40AF",
    primaryDark: "#1E3A8A",
    heroSub:
      "24/7 water, fire, and mould restoration across {city}. On site fast, insurance handled.",
    ctaLabel: "Call 24/7 Emergency Line",
    ctaSub: "Available 24/7 · Insurance claims handled · Certified technicians",
    emergency: true,
    services: [
      { name: "Water Damage", blurb: "Extraction, structural drying, and moisture monitoring until it is genuinely dry.", icon: "droplet" },
      { name: "Fire & Smoke", blurb: "Soot removal, odour neutralisation, and contents restoration.", icon: "flame" },
      { name: "Mould Remediation", blurb: "Containment, removal, and clearance testing to confirm the job is done.", icon: "shield" },
      { name: "Storm Damage", blurb: "Emergency board-up and tarping, then full structural repair.", icon: "home" },
      { name: "Sewage Cleanup", blurb: "Category 3 water handled with proper containment and sanitisation.", icon: "wrench" },
      { name: "Reconstruction", blurb: "Full rebuild after mitigation, so you deal with one company throughout.", icon: "award" },
    ],
    trust: [
      { title: "Available 24/7", blurb: "Water does not wait for business hours. Neither do we.", icon: "clock" },
      { title: "Certified Technicians", blurb: "Industry-certified in water, fire, and mould remediation.", icon: "award" },
      { title: "We Handle the Claim", blurb: "Documented properly and billed directly to your insurer wherever possible.", icon: "thumbsUp" },
      { title: "Verified Dry", blurb: "Moisture readings recorded until the structure is proven dry, not assumed dry.", icon: "shield" },
    ],
    faq: [
      { q: "How quickly can you get here?", a: "We aim to be on site within the hour for active water losses. Call the emergency line and we will give you a real time." },
      { q: "Will my insurance cover this?", a: "Most sudden and accidental water and fire damage is covered. We document thoroughly and work directly with your adjuster." },
      { q: "How long does drying take?", a: "Typically three to five days depending on materials and how far the water travelled. We monitor daily and show you the readings." },
      { q: "Do I need to leave my home?", a: "Usually not for a contained water loss. For significant fire or sewage damage we will advise honestly about safety." },
      { q: "Do you handle the repairs too?", a: "Yes. We mitigate and then rebuild, so you are not managing two separate contractors." },
    ],
  },

  contractor: {
    key: "contractor",
    label: "General Contractor",
    plural: "Contractors",
    schemaType: "GeneralContractor",
    primary: "#C2410C",
    primaryDark: "#9A3412",
    heroSub:
      "Remodelling and construction across {city}. Clear quotes, realistic timelines, work you can inspect.",
    ctaLabel: "Get a Free Estimate",
    ctaSub: "Free estimates · Licensed & insured · Financing available",
    emergency: false,
    services: [
      { name: "Kitchen Remodel", blurb: "Full kitchen renovation managed end to end, with a fixed scope and price.", icon: "home" },
      { name: "Bathroom Remodel", blurb: "From refresh to full gut, waterproofed properly and built to last.", icon: "droplet" },
      { name: "Additions", blurb: "Room and second-storey additions, permitted and inspected throughout.", icon: "wrench" },
      { name: "Basement Finishing", blurb: "Unused space turned into living space, with moisture handled first.", icon: "shield" },
      { name: "Flooring", blurb: "Hardwood, tile, and luxury vinyl installed level and finished cleanly.", icon: "star" },
      { name: "Exterior & Siding", blurb: "Siding, windows, and decks that improve both weatherproofing and value.", icon: "award" },
    ],
    trust: [
      { title: "Licensed & Insured", blurb: "Fully licensed and insured, with permits pulled for every job that needs them.", icon: "shield" },
      { title: "Fixed Written Scope", blurb: "You know exactly what is included before we start. Changes are agreed in writing.", icon: "thumbsUp" },
      { title: "Realistic Timelines", blurb: "We give you a schedule we can hold to, not the one you want to hear.", icon: "clock" },
      { title: "Workmanship Warranty", blurb: "Our work is warranted, and we come back if something is not right.", icon: "award" },
    ],
    faq: [
      { q: "Are estimates free?", a: "Yes. We visit, discuss the scope, and provide a detailed written estimate at no cost." },
      { q: "Do you handle permits?", a: "Yes. We pull the permits and manage the inspections as part of the project." },
      { q: "How long will my project take?", a: "It depends on scope. A bathroom is typically two to three weeks, a kitchen four to six. You get a written schedule before we start." },
      { q: "Do you offer financing?", a: "Yes, we offer approved financing on larger projects. Ask when we quote." },
      { q: "What if I want changes mid-project?", a: "That is normal. Changes are quoted and agreed in writing before we proceed, so there are no surprises on the final invoice." },
    ],
  },

  salon: {
    key: "salon",
    label: "Hair Salon",
    plural: "Salons",
    schemaType: "HairSalon",
    primary: "#BE185D",
    primaryDark: "#9D174D",
    heroSub:
      "Colour, cuts, and styling in {city}. Skilled stylists and a proper consultation every time.",
    ctaLabel: "Book Now",
    ctaSub: "Online booking · New client consultations · Walk-ins when available",
    emergency: false,
    services: [
      { name: "Cut & Style", blurb: "A cut built around your hair type and how much time you actually have.", icon: "sparkles" },
      { name: "Colour & Highlights", blurb: "Full colour, balayage, and correction by stylists who specialise in it.", icon: "star" },
      { name: "Blowouts", blurb: "Professional finish for events, photos, or simply a good week.", icon: "heart" },
      { name: "Treatments", blurb: "Bond repair, gloss, and smoothing treatments matched to your hair's condition.", icon: "droplet" },
      { name: "Extensions", blurb: "Length and volume applied and maintained without damaging your own hair.", icon: "award" },
      { name: "Bridal & Events", blurb: "Trials and day-of styling for the whole party, on schedule.", icon: "calendar" },
    ],
    trust: [
      { title: "Proper Consultation", blurb: "We talk through what will work for your hair before a single scissor moves.", icon: "thumbsUp" },
      { title: "Experienced Stylists", blurb: "Continuously trained on current technique, especially in colour.", icon: "award" },
      { title: "Easy Booking", blurb: "Book online in under a minute, and reschedule without a phone call.", icon: "calendar" },
      { title: "Honest Advice", blurb: "If a look will not suit your hair or your routine, we will say so.", icon: "star" },
    ],
    faq: [
      { q: "Do you offer consultations before colour?", a: "Yes, and we recommend it for any significant change or correction. Consultations are free." },
      { q: "How far ahead should I book?", a: "For colour, one to two weeks is typical. Cuts can often be accommodated sooner, and we take walk-ins when we have space." },
      { q: "How much does colour cost?", a: "It depends on length, thickness, and what you are starting from. Your consultation includes exact pricing before you commit." },
      { q: "Can you fix colour done elsewhere?", a: "Yes, colour correction is one of our specialisms. Bring photos of where you are and where you want to be." },
      { q: "Do you do bridal parties?", a: "Yes — trials, day-of styling, and scheduling for the whole party." },
    ],
  },
};

export const INDUSTRY_LIST = Object.values(INDUSTRIES);

export function industryOf(key: IndustryKey) {
  return INDUSTRIES[key];
}
