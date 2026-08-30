import {
  Heart,
  CalendarCheck,
  Flower2,
  MapPin,
  UtensilsCrossed,
  Music,
  Award,
  Clock,
  Users,
  ThumbsUp,
  Sparkles,
  PhoneCall,
  ClipboardCheck,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

const BASE_URL = 'https://images.pexels.com/photos/';

export const weddingServicesConfig: IndustryConfig = {
  id: 'wedding-services',
  industryName: 'Wedding Services',
  businessName: 'Eternal Vows Wedding Co.',
  tagline: 'Your Day, Perfectly Planned.',
  heroTitle: 'The Wedding of Your Dreams, Beautifully Orchestrated',
  heroSubtitle:
    'Full-service wedding planning and coordination. From the first spark of an idea to the last dance, we handle every detail so you can be fully present for every moment.',
  phone: '(555) 247-8830',
  email: 'hello@eternalvows.co',
  serviceArea: 'Greater Metro Area & Surrounding Counties',
  hours: 'Mon-Sat 9am-7pm',
  yearsExperience: '12+',
  licenseNumber: 'WP-5821043',

  colors: {
    primary: '#BE185D',
    primaryDark: '#9F1239',
    primaryLight: '#FCE7F3',
    accent: '#B45309',
    background: '#FFFFFF',
    surface: '#FDF2F8',
    text: '#1A0A12',
    textMuted: '#6B555F',
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

  heroImage: `${BASE_URL}1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=1200`,
  heroBadge: 'Award-Winning Planners • 300+ Weddings',
  ctaPrimary: 'Book a Consultation',
  ctaSecondary: 'View Services',

  stats: [
    { value: '12+', label: 'Years Experience' },
    { value: '300+', label: 'Weddings Planned' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '100%', label: 'On-Time Guarantee' },
  ],

  services: [
    {
      icon: Heart,
      title: 'Full Wedding Planning',
      description:
        'End-to-end planning from engagement to honeymoon. We manage vendors, timelines, budgets, and every tiny detail so you can simply enjoy being engaged.',
      features: ['Vendor sourcing', 'Budget management', 'Timeline creation', 'Day-of oversight'],
    },
    {
      icon: CalendarCheck,
      title: 'Day-of Coordination',
      description:
        'Already planned your wedding? We step in for the final weeks and run the day itself so you and your loved ones can be guests at your own wedding.',
      features: ['Final timeline build', 'Vendor confirmation', 'Ceremony rehearsal', 'Full day-of management'],
    },
    {
      icon: Flower2,
      title: 'Floral Design',
      description:
        'Custom floral arrangements crafted to match your palette and theme. Bouquets, centerpieces, ceremony arches, and installations that take your breath away.',
      features: ['Bridal bouquets', 'Centerpieces', 'Ceremony arches', 'Boutonnieres & corsages'],
    },
    {
      icon: MapPin,
      title: 'Venue Selection',
      description:
        'Access to our curated network of venues, from grand ballrooms to rustic barns and seaside estates. We find the space that fits your vision and guest count.',
      features: ['Curated venue tours', 'Capacity matching', 'Contract negotiation', 'Site visits'],
    },
    {
      icon: UtensilsCrossed,
      title: 'Catering Coordination',
      description:
        'From tasting to table service, we coordinate caterers and bar services so every guest raves about the food and the flow of the evening.',
      features: ['Tasting sessions', 'Menu design', 'Dietary accommodations', 'Bar & beverage service'],
    },
    {
      icon: Music,
      title: 'DJ & Entertainment',
      description:
        'Hand-picked DJs, live bands, and performers who read the room and keep your dance floor packed from first dance to last song.',
      features: ['DJ & MC services', 'Live bands', 'Lighting design', 'Sound & AV setup'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Award-Winning Team',
      description:
        'Recognized by The Knot and WeddingWire for excellence in planning. Our work has been featured in regional and national publications.',
    },
    {
      icon: Clock,
      title: 'On-Time, Every Time',
      description:
        'We build detailed timelines and hold every vendor to them. Your ceremony starts when you planned, and the day flows exactly as designed.',
    },
    {
      icon: Users,
      title: 'Trusted Vendor Network',
      description:
        'Twelve years of relationships mean we get the best vendors, the best rates, and priority booking even during peak season.',
    },
    {
      icon: ThumbsUp,
      title: 'Stress-Free Experience',
      description:
        'You should feel like a guest at your own wedding. We absorb the stress, handle the surprises, and protect your peace of mind all day long.',
    },
  ],
  whyUsTitle: 'Why Couples Choose Eternal Vows',
  whyUsSubtitle:
    'We treat every wedding as if it were our own — with obsessive attention to detail and genuine care for your story.',

  process: [
    {
      step: '01',
      title: 'Discovery Call',
      description:
        'We start with a complimentary consultation to learn your vision, style, budget, and must-haves. No pressure, just a conversation.',
    },
    {
      step: '02',
      title: 'Custom Proposal',
      description:
        'Within a week you receive a tailored proposal with recommended vendors, a preliminary timeline, and a transparent budget breakdown.',
    },
    {
      step: '03',
      title: 'Planning & Design',
      description:
        'We bring the vision to life — booking vendors, designing the aesthetic, and meeting with you regularly to refine every detail.',
    },
    {
      step: '04',
      title: 'Your Wedding Day',
      description:
        'We arrive early, run the rehearsal, and manage the entire day from setup to send-off. You focus on the moments. We handle the rest.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'A calm, clear path from engaged to happily ever after.',

  testimonials: [
    {
      name: 'Megan & Tyler R.',
      location: 'Rosewood Estate',
      rating: 5,
      text: 'Eternal Vows made our wedding day absolutely flawless. We never had to think about a single logistics problem. They anticipated issues before we even knew they existed. Worth every penny.',
    },
    {
      name: 'Jasmine & David L.',
      location: 'The Grand Ballroom',
      rating: 5,
      text: 'From the first call to the last dance, the team was professional, warm, and incredibly organized. Our timeline was perfect and every vendor showed up on time. We could just enjoy the day.',
    },
    {
      name: 'Priya & Arjun K.',
      location: 'Seaview Pavilion',
      rating: 5,
      text: 'They planned our multi-day Indian wedding with so much care and cultural respect. The floral design was stunning and the coordination across three events was seamless. Highly recommend.',
    },
  ],
  testimonialsTitle: 'What Our Couples Say',
  testimonialsSubtitle: 'Real weddings, real love stories, real five-star reviews.',

  faqs: [
    {
      question: 'How far in advance should we book?',
      answer:
        'For peak season (May through October), we recommend booking 12 to 18 months out. For off-peak dates, 6 to 9 months is usually sufficient. We do accommodate last-minute planning when our calendar allows.',
    },
    {
      question: 'What is included in full-service planning?',
      answer:
        'Full-service planning covers vendor sourcing and management, budget tracking, timeline creation, design direction, guest list support, RSVP tracking, the ceremony rehearsal, and complete day-of coordination.',
    },
    {
      question: 'Do you work within our budget?',
      answer:
        'Absolutely. We are transparent about costs from the first meeting and never push vendors outside your range. Our job is to maximize what you get for the budget you have, not to inflate it.',
    },
    {
      question: 'Can you plan a wedding in a venue we already booked?',
      answer:
        'Yes. Many couples come to us with a venue secured. We work with your chosen location, coordinate with venue management, and build the rest of the wedding around it.',
    },
    {
      question: 'Do you handle destination weddings?',
      answer:
        'We do. We have planned weddings across the region and coordinate travel, lodging blocks, local vendors, and on-the-ground logistics so a destination wedding feels effortless for you and your guests.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about planning with Eternal Vows.',

  serviceAreas: [
    { name: 'Rosewood' },
    { name: 'Fairfield' },
    { name: 'Eastside' },
    { name: 'Downtown Core' },
    { name: 'Midtown' },
    { name: 'Riverside' },
    { name: 'Uptown' },
    { name: 'Westgate' },
  ],
  serviceAreasTitle: 'Communities We Proudly Serve',

  contactTitle: 'Start Planning Your Perfect Day',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day to schedule your complimentary consultation.',

  galleryTitle: 'Recent Weddings We Have Planned',
  gallerySubtitle: 'A glimpse of the moments we have helped create.',
  galleryImages: [
    `${BASE_URL}1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=1200`,
    `${BASE_URL}265722/pexels-photo-265722.jpeg?auto=compress&cs=tinysrgb&w=1200`,
    `${BASE_URL}169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=1200`,
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Experienced planners and designers who treat your wedding like their own.',
  team: [
    { name: 'Sophia Bennett', role: 'Lead Planner & Founder', bio: 'Twelve years of wedding planning experience and a certified master wedding planner. Sophia founded Eternal Vows to bring calm, joy, and precision to every couple she works with.' },
    { name: 'Marcus Hill', role: 'Design Director', bio: 'Former set designer turned floral and event design specialist. Marcus transforms venues into immersive experiences tailored to each couple.' },
    { name: 'Ava Rodriguez', role: 'Day-of Coordinator', bio: 'The calm voice in your ear all day. Ava runs the timeline, wrangles vendors, and makes sure nothing slips through the cracks.' },
  ],

  pricingTitle: 'Wedding Planning Packages',
  pricingSubtitle: 'Transparent packages that scale with your needs.',
  pricing: [
    { name: 'Day-of Coordination', price: 'From $1,800', description: 'Final-month and day-of management.', features: ['Final timeline build', 'Vendor confirmation', 'Ceremony rehearsal', 'Full day-of management'], popular: false },
    { name: 'Partial Planning', price: 'From $3,500', description: 'Planning support for the final 3-6 months.', features: ['Vendor referrals', 'Design consultation', 'Budget guidance', 'RSVP tracking', 'Day-of coordination'], popular: true },
    { name: 'Full-Service Planning', price: 'From $6,500', description: 'End-to-end planning from engagement to honeymoon.', features: ['Full vendor management', 'Custom design direction', 'Budget & timeline management', 'Guest list support', 'Rehearsal & day-of coordination', 'Unlimited consultations'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the Eternal Vows assistant. How can I help you plan your wedding today?",
    placeholder: "Ask about our wedding services...",
    knowledgeBase: [
      "We offer full wedding planning, day-of coordination, floral design, venue selection, catering coordination, and DJ and entertainment services.",
      "For peak season we recommend booking 12 to 18 months in advance. For off-peak dates, 6 to 9 months is usually enough.",
      "Full-service planning includes vendor sourcing and management, budget tracking, timeline creation, design direction, guest list support, RSVP tracking, the rehearsal, and complete day-of coordination.",
      "We work within your budget and are transparent about costs from the first meeting. We never push vendors outside your range.",
      "Yes, we can plan a wedding at a venue you already booked. We coordinate with venue management and build the rest around it.",
      "We handle destination weddings, including travel, lodging blocks, local vendors, and on-the-ground logistics.",
      "We serve Rosewood, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are Monday through Saturday, 9am to 7pm.",
      "We have 12+ years of experience and have planned over 300 weddings.",
      "We offer a complimentary initial consultation. Call us at (555) 247-8830 to book yours.",
    ],
  },
};
