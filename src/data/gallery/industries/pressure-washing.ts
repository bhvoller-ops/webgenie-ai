import {
  Droplets,
  Home,
  Building2,
  Cloud,
  Trees,
  Warehouse,
  Wind,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
  Search,
  Zap,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

const BASE_URL = 'https://images.pexels.com/photos/';

export const pressureWashingConfig: IndustryConfig = {
  id: 'pressure-washing',
  industryName: 'Pressure Washing',
  businessName: 'BlastOff Pressure Washing',
  tagline: 'We Make Surfaces Look New Again.',
  heroTitle: 'Professional Pressure Washing That Restores Your Property',
  heroSubtitle:
    'Driveways, houses, decks, roofs, and commercial properties. We use commercial-grade equipment and proven techniques to remove years of grime, mold, and stains — safely and effectively.',
  phone: '(555) 418-9920',
  email: 'info@blastoffwash.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Sat 7am-7pm',
  yearsExperience: '10+',
  licenseNumber: 'PW-3390-10',

  colors: {
    primary: '#0284C7',
    primaryDark: '#0369A1',
    primaryLight: '#E0F2FE',
    accent: '#1E293B',
    background: '#FFFFFF',
    surface: '#F0F9FF',
    text: '#0A1620',
    textMuted: '#5A6B78',
  },

  navLinks: [
    { label: 'Services', href: '#services' },
    { label: 'Why Us', href: '#why-us' },
    { label: 'Process', href: '#process' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Reviews', href: '#testimonials' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#contact' },
  ],

  heroImage: `${BASE_URL}4100431/pexels-photo-4100431.jpeg?auto=compress&cs=tinysrgb&w=1200`,
  heroBadge: 'Commercial-Grade Equipment • Satisfaction Guaranteed',
  ctaPrimary: 'Get Free Quote',
  ctaSecondary: 'View Services',

  stats: [
    { value: '10+', label: 'Years Experience' },
    { value: '4,500+', label: 'Properties Washed' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '100%', label: 'Satisfaction Guarantee' },
  ],

  services: [
    {
      icon: Droplets,
      title: 'Driveway & Sidewalk Cleaning',
      description:
        'Remove oil stains, tire marks, mold, and years of ground-in dirt from your concrete and pavers. Your driveway and walkways will look brand new.',
      features: ['Oil stain removal', 'Mold and mildew', 'Tire mark removal', 'Paver restoration'],
    },
    {
      icon: Home,
      title: 'House Washing',
      description:
        'Soft-wash exterior cleaning that removes algae, dirt, and pollution without damaging your siding, paint, or landscaping. Safe for vinyl, brick, stucco, and wood.',
      features: ['Soft-wash technique', 'Algae removal', 'Siding-safe', 'Window and trim included'],
    },
    {
      icon: Cloud,
      title: 'Roof Cleaning',
      description:
        'Low-pressure roof cleaning that kills moss, algae, and lichen at the source. We extend the life of your roof and restore its color without damaging shingles.',
      features: ['Moss removal', 'Algae treatment', 'Low-pressure safe', 'Shingle-safe methods'],
    },
    {
      icon: Trees,
      title: 'Deck & Fence Cleaning',
      description:
        'Restore weathered wood decks and fences to their natural color. We remove graying, mold, and stains, then prepare the surface for sealing or staining.',
      features: ['Wood restoration', 'Mold removal', 'Stain prep', 'Sealing available'],
    },
    {
      icon: Warehouse,
      title: 'Commercial Pressure Washing',
      description:
        'Parking lots, storefronts, loading docks, and fleet vehicles. We keep your business looking professional and safe with flexible scheduling that fits your hours.',
      features: ['Parking lots', 'Storefronts', 'Loading docks', 'Fleet washing'],
    },
    {
      icon: Wind,
      title: 'Gutter Cleaning',
      description:
        'Clear gutters and downspouts of leaves, debris, and clogs that cause water damage. We flush the system and inspect for issues so your gutters flow freely.',
      features: ['Debris removal', 'Downspout flushing', 'Flow inspection', 'Damage check'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Commercial-Grade Equipment',
      description:
        'We use professional pressure washers, surface cleaners, and soft-wash systems that deliver results consumer equipment simply cannot match. The difference shows.',
    },
    {
      icon: Clock,
      title: 'On-Time, Every Time',
      description:
        'We show up when we say we will and complete the work in the time we quote. Your time matters, and we respect it on every job, big or small.',
    },
    {
      icon: Users,
      title: 'Safe for Your Property',
      description:
        'We use the right pressure and technique for every surface. We protect your landscaping, siding, and surfaces from damage that high pressure can cause in the wrong hands.',
    },
    {
      icon: ThumbsUp,
      title: 'Satisfaction Guarantee',
      description:
        'If you are not happy with the results, we will re-wash the area at no charge. We do not leave a job until you are completely satisfied with the outcome.',
    },
  ],
  whyUsTitle: 'Why Property Owners Choose BlastOff',
  whyUsSubtitle:
    'Professional equipment, proven technique, and a guarantee that means you get results or you do not pay again.',

  process: [
    {
      step: '01',
      title: 'Free Quote',
      description:
        'Send us photos or request an on-site visit. We assess the surfaces and provide a clear, upfront quote with no hidden fees.',
    },
    {
      step: '02',
      title: 'Schedule',
      description:
        'Pick a date and time that works for you. We confirm the appointment and tell you exactly what to expect and how to prepare.',
    },
    {
      step: '03',
      title: 'We Wash',
      description:
        'Our crew arrives on time, protects your landscaping and property, and washes every surface to the agreed scope using the right pressure for each material.',
    },
    {
      step: '04',
      title: 'Final Walkthrough',
      description:
        'We walk the property with you to inspect the results. If anything needs attention, we handle it on the spot before we pack up.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'A simple, transparent process from quote to sparkling clean.',

  testimonials: [
    {
      name: 'Karen K.',
      location: 'Brookside',
      rating: 5,
      text: 'My driveway looked black from years of oil stains and I thought it was ruined. After BlastOff finished, it looked like new concrete. I could not believe the difference. Professional, on time, and thorough.',
    },
    {
      name: 'Thomas R.',
      location: 'Fairfield',
      rating: 5,
      text: 'They soft-washed my entire house and vinyl siding without damaging a single plant in my garden. The green algae is completely gone and the house looks freshly painted. Highly recommend.',
    },
    {
      name: 'Linda M.',
      location: 'Eastside',
      rating: 5,
      text: 'Our commercial parking lot had years of grime and oil. They came after hours, did the whole lot, and it looked brand new the next morning. Great communication and fair pricing. We use them quarterly now.',
    },
  ],
  testimonialsTitle: 'What Our Customers Say',
  testimonialsSubtitle: 'Dramatic before-and-after results and happy property owners.',

  faqs: [
    {
      question: 'Is pressure washing safe for my siding and landscaping?',
      answer:
        'Yes. For delicate surfaces like siding, stucco, and painted areas we use soft-washing, which relies on specialized cleaners and low pressure rather than force. We also pre-wet and protect your landscaping before we start.',
    },
    {
      question: 'How often should I have my property pressure washed?',
      answer:
        'Most homes benefit from annual washing. Driveways and decks may need it more often depending on shade, tree cover, and traffic. Commercial properties typically schedule quarterly or semi-annual cleaning.',
    },
    {
      question: 'Do you use your own water and power?',
      answer:
        'We bring our own equipment. We typically use your outdoor water supply, and we carry water tanks for jobs where access is limited. We will discuss any site requirements when we quote.',
    },
    {
      question: 'Will pressure washing damage my roof?',
      answer:
        'No — we use low-pressure roof cleaning with specialized treatments that kill moss, algae, and lichen at the source. High pressure can damage shingles, so we never blast roofs. Your roof is safe in our hands.',
    },
    {
      question: 'Do you offer recurring service plans?',
      answer:
        'Yes. We offer quarterly, semi-annual, and annual maintenance plans for homes and businesses. Recurring customers receive discounted rates and priority scheduling.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about our pressure washing services.',

  serviceAreas: [
    { name: 'Brookside' },
    { name: 'Fairfield' },
    { name: 'Eastside' },
    { name: 'Downtown Core' },
    { name: 'Midtown' },
    { name: 'Riverside' },
    { name: 'Uptown' },
    { name: 'Westgate' },
  ],
  serviceAreasTitle: 'Communities We Proudly Serve',

  contactTitle: 'Get Your Free Pressure Washing Quote',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day with a custom quote.',

  galleryTitle: 'Our Recent Pressure Washing Projects',
  gallerySubtitle: 'See the BlastOff difference.',
  galleryImages: [
    `${BASE_URL}4100431/pexels-photo-4100431.jpeg?auto=compress&cs=tinysrgb&w=1200`,
    `${BASE_URL}4100431/pexels-photo-4100431.jpeg?auto=compress&cs=tinysrgb&w=1200`,
    `${BASE_URL}4100431/pexels-photo-4100431.jpeg?auto=compress&cs=tinysrgb&w=1200`,
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Trained professionals who treat your property with care.',
  team: [
    { name: 'Mike Donovan', role: 'Owner & Lead Technician', bio: 'Ten years of pressure washing experience and certified in soft-wash and roof cleaning methods. Mike founded BlastOff to bring professional-grade exterior cleaning to the region.' },
    { name: 'Carlos Reyes', role: 'Senior Technician', bio: 'Our commercial and fleet specialist. Carlos handles large-scale jobs and after-hours commercial accounts with efficiency and attention to detail.' },
    { name: 'Jenna Park', role: 'Customer Care & Scheduling', bio: 'Your first point of contact. Jenna handles quotes, scheduling, and follow-up to make sure every customer has a smooth, easy experience from start to finish.' },
  ],

  pricingTitle: 'Service Packages',
  pricingSubtitle: 'Transparent pricing with no hidden fees.',
  pricing: [
    { name: 'Single Surface', price: 'From $149', description: 'One surface, such as a driveway or deck.', features: ['Up to 800 sq ft', 'Stain and mold removal', 'Surface-safe methods', 'Final walkthrough'], popular: false },
    { name: 'House Wash Package', price: 'From $349', description: 'Full exterior soft wash.', features: ['Full house soft-wash', 'Siding, trim, and windows', 'Driveway or walkway included', 'Landscaping protection', 'Satisfaction guarantee'], popular: true },
    { name: 'Full Property Package', price: 'From $599', description: 'Complete exterior restoration.', features: ['House soft-wash', 'Driveway and sidewalks', 'Deck or fence cleaning', 'Roof treatment', 'Gutter cleaning', 'Satisfaction guarantee'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the BlastOff Pressure Washing assistant. How can I help you today?",
    placeholder: "Ask about our pressure washing services...",
    knowledgeBase: [
      "We offer driveway and sidewalk cleaning, house washing, roof cleaning, deck and fence cleaning, commercial pressure washing, and gutter cleaning.",
      "Yes, we use soft-washing for delicate surfaces like siding and stucco, and we protect your landscaping by pre-wetting and covering plants before we start.",
      "Most homes benefit from annual washing. Driveways and decks may need it more often depending on shade and tree cover. Commercial properties usually schedule quarterly or semi-annual cleaning.",
      "We bring our own equipment and typically use your outdoor water supply. We carry water tanks for jobs where water access is limited.",
      "We use low-pressure roof cleaning with specialized treatments that kill moss, algae, and lichen at the source. We never use high pressure on roofs.",
      "Yes, we offer quarterly, semi-annual, and annual maintenance plans with discounted rates and priority scheduling for recurring customers.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are Monday through Saturday, 7am to 7pm.",
      "We have 10+ years of experience and have washed over 4,500 properties.",
      "To get a free quote, call us at (555) 418-9920 or fill out our contact form online.",
    ],
  },
};
