import {
  Wrench,
  Gauge,
  Cog,
  Settings,
  Snowflake,
  CircleDot,
  ShieldCheck,
  Clock,
  Users,
  ThumbsUp,
  Car,
  ClipboardCheck,
  Search,
  Zap,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

const BASE_URL = 'https://images.pexels.com/photos/';

export const autoRepairConfig: IndustryConfig = {
  id: 'auto-repair',
  industryName: 'Auto Repair',
  businessName: 'Apex Auto Repair',
  tagline: 'Expert Care for Every Mile.',
  heroTitle: 'Keep Your Vehicle Running Like New',
  heroSubtitle:
    'Full-service auto repair you can trust. ASE-certified technicians, honest pricing, and a 12-month / 12,000-mile warranty on most repairs. From brakes to transmissions, we have you covered.',
  phone: '(555) 247-8830',
  email: 'service@apexautorepair.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Fri 7am-6pm, Sat 8am-4pm',
  yearsExperience: '18+',
  licenseNumber: 'ASE-AU-552310',

  colors: {
    primary: '#DC2626',
    primaryDark: '#991B1B',
    primaryLight: '#FEE2E2',
    accent: '#1F2937',
    background: '#FFFFFF',
    surface: '#FEF2F2',
    text: '#1A0A0A',
    textMuted: '#6B5B5B',
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

  heroImage: `${BASE_URL}3802570/pexels-photo-3802570.jpeg?auto=compress&cs=tinysrgb&w=1200`,
  heroBadge: 'ASE Certified • 12-Month Warranty',
  ctaPrimary: 'Book Appointment',
  ctaSecondary: 'View Services',

  stats: [
    { value: '18+', label: 'Years in Business' },
    { value: '45,000+', label: 'Vehicles Serviced' },
    { value: '4.8★', label: 'Average Rating' },
    { value: '12-Mo', label: 'Repair Warranty' },
  ],

  services: [
    {
      icon: CircleDot,
      title: 'Brake Repair',
      description:
        'Complete brake service including pads, rotors, calipers, and fluid flushes. Stop safely with factory-grade parts and expert installation.',
      features: ['Brake pad replacement', 'Rotor resurfacing', 'Caliper service', 'Brake fluid flush'],
    },
    {
      icon: Gauge,
      title: 'Oil Change',
      description:
        'Fast, full-service oil changes with synthetic, blend, or conventional oil. Includes multipoint inspection to catch issues early.',
      features: ['Synthetic oil options', 'Filter replacement', 'Multipoint inspection', 'Fluid top-off'],
    },
    {
      icon: Search,
      title: 'Engine Diagnostics',
      description:
        'Advanced computer diagnostics to pinpoint check-engine lights, performance issues, and electrical faults with precision.',
      features: ['OBD-II scanning', 'Performance analysis', 'Electrical testing', 'Detailed report'],
    },
    {
      icon: Cog,
      title: 'Transmission Service',
      description:
        'Transmission fluid flushes, filter replacements, and major repairs for both automatic and manual transmissions.',
      features: ['Fluid flush', 'Filter replacement', 'Clutch service', 'Full rebuilds'],
    },
    {
      icon: Snowflake,
      title: 'AC Repair',
      description:
        'Keep cool with complete automotive AC service — recharge, leak detection, compressor repair, and full system restoration.',
      features: ['Recharge & recharge', 'Leak detection', 'Compressor repair', 'System restoration'],
    },
    {
      icon: CircleDot,
      title: 'Tire Services',
      description:
        'Tire rotation, balancing, alignment, and replacement. Extend tire life and improve safety with proper maintenance.',
      features: ['Rotation & balancing', 'Wheel alignment', 'Tire replacement', 'Pressure check'],
    },
  ],

  whyUs: [
    {
      icon: ShieldCheck,
      title: 'ASE-Certified Technicians',
      description:
        'Our mechanics are ASE-certified and continuously trained on the latest vehicle technology. Your car is in expert hands.',
    },
    {
      icon: Clock,
      title: 'Fast Turnaround',
      description:
        'Most repairs completed same-day. We respect your schedule and get you back on the road as quickly as possible.',
    },
    {
      icon: Users,
      title: 'Honest, Upfront Pricing',
      description:
        'No surprises. We provide a detailed estimate before any work begins and only proceed with your approval.',
    },
    {
      icon: ThumbsUp,
      title: '12-Month Warranty',
      description:
        'Most repairs are backed by our 12-month / 12,000-mile warranty. If something is not right, we fix it free.',
    },
  ],
  whyUsTitle: 'Why Drivers Trust Apex Auto Repair',
  whyUsSubtitle:
    'Certified expertise, transparent pricing, and a commitment to keeping you safely on the road.',

  process: [
    {
      step: '01',
      title: 'Book Appointment',
      description:
        'Call or book online. Tell us your vehicle make, model, and the issue you are experiencing. We will schedule a time that works for you.',
    },
    {
      step: '02',
      title: 'Diagnose & Estimate',
      description:
        'Our technicians perform a thorough inspection and provide a clear, itemized estimate. No work begins without your approval.',
    },
    {
      step: '03',
      title: 'Expert Repair',
      description:
        'ASE-certified mechanics complete the repair using quality parts and proven procedures. Most jobs are done the same day.',
    },
    {
      step: '04',
      title: 'Quality Inspection',
      description:
        'Every vehicle gets a post-repair inspection and test drive before it is returned to you, backed by our 12-month warranty.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'Straightforward service from start to finish.',

  testimonials: [
    {
      name: 'Marcus T.',
      location: 'Brookside',
      rating: 5,
      text: 'My check engine light came on and two other shops could not figure it out. Apex diagnosed it in an hour, gave me a fair price, and had it fixed the same day. I will not go anywhere else now.',
    },
    {
      name: 'Diana R.',
      location: 'Fairfield',
      rating: 5,
      text: 'They told me my brakes had another 5,000 miles left when another shop wanted to replace them immediately. That honesty earned a customer for life. The work they do is top-notch.',
    },
    {
      name: 'Kevin O.',
      location: 'Eastside',
      rating: 5,
      text: 'Transmission rebuild on my truck was done in three days for thousands less than the dealer quoted. Runs better than it has in years. The 12-month warranty gave me real peace of mind.',
    },
  ],
  testimonialsTitle: 'What Our Customers Say',
  testimonialsSubtitle: 'Thousands of drivers trust us with their vehicles every year.',

  faqs: [
    {
      question: 'Do you service all makes and models?',
      answer:
        'Yes. Our ASE-certified technicians service all domestic, Asian, and European makes and models, including hybrids and many EVs. If you have a specific vehicle, just ask and we will confirm we can help.',
    },
    {
      question: 'Do you provide a warranty on repairs?',
      answer:
        'Most repairs are backed by our 12-month / 12,000-mile warranty on parts and labor. Some parts carry an extended manufacturer warranty. We will explain the specific coverage before any work begins.',
    },
    {
      question: 'Can you help with check engine light diagnostics?',
      answer:
        'Absolutely. We use advanced OBD-II diagnostic equipment to read the trouble codes, then perform targeted testing to identify the root cause — not just the symptom. You get a clear explanation and an upfront estimate.',
    },
    {
      question: 'Do you use OEM or aftermarket parts?',
      answer:
        'We offer both. OEM (Original Equipment Manufacturer) parts come from your vehicle manufacturer, while quality aftermarket parts can offer savings. We will explain the options and let you choose what fits your budget and needs.',
    },
    {
      question: 'Do you offer shuttle service or loaner cars?',
      answer:
        'Yes, we offer a complimentary local shuttle within a 5-mile radius and loaner vehicles for repairs expected to take more than one day, subject to availability. Ask when you book your appointment.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about our auto repair services.',

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

  contactTitle: 'Book Your Service Appointment',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day to confirm your appointment.',

  galleryTitle: 'Our Recent Repair Work',
  gallerySubtitle: 'See the Apex Auto Repair difference.',
  galleryImages: [
    `${BASE_URL}3802570/pexels-photo-3802570.jpeg?auto=compress&cs=tinysrgb&w=1200`,
    `${BASE_URL}3806249/pexels-photo-3806249.jpeg?auto=compress&cs=tinysrgb&w=1200`,
    `${BASE_URL}3807277/pexels-photo-3807277.jpeg?auto=compress&cs=tinysrgb&w=1200`,
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'ASE-certified mechanics who treat your vehicle like their own.',
  team: [
    { name: 'Frank Delgado', role: 'Master Technician / Owner', bio: 'ASE Master Certified with 22 years under the hood. Frank founded Apex to bring honest, expert repair to the community.' },
    { name: 'Sandra Kim', role: 'Lead Diagnostic Tech', bio: 'Specializes in engine diagnostics and electrical systems. Sandra holds 6 ASE certifications and trains our junior techs.' },
    { name: 'Tony Reeves', role: 'Transmission Specialist', bio: '20 years specializing in automatic and manual transmissions, including full rebuilds and clutch replacement.' },
  ],

  pricingTitle: 'Service Pricing',
  pricingSubtitle: 'Transparent pricing with no hidden fees.',
  pricing: [
    { name: 'Oil Change', price: 'From $49', description: 'Full-service oil change with inspection.', features: ['Up to 5 qts oil', 'New filter', 'Multipoint inspection', 'Fluid top-off'], popular: false },
    { name: 'Brake Service', price: 'From $199', description: 'Front or rear brake pad replacement.', features: ['Premium pads', 'Rotor resurfacing', 'Caliper inspection', '12-mo warranty'], popular: true },
    { name: 'Major Service', price: 'From $399', description: '30k/60k/90k scheduled maintenance.', features: ['All fluids & filters', 'Belt & hose check', 'Full inspection', 'Battery test'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the Apex Auto Repair assistant. How can I help you today?",
    placeholder: "Ask about our repair services...",
    knowledgeBase: [
      "We offer brake repair, oil changes, engine diagnostics, transmission service, AC repair, and tire services for all makes and models.",
      "Our technicians are ASE-certified and we service domestic, Asian, and European vehicles, including hybrids and many EVs.",
      "Most repairs are backed by our 12-month / 12,000-mile warranty on parts and labor.",
      "We provide a clear, itemized estimate before any work begins and only proceed with your approval.",
      "We offer both OEM and quality aftermarket parts and will explain the options so you can choose.",
      "Most repairs are completed same-day. We offer a complimentary local shuttle within 5 miles and loaner vehicles for longer jobs.",
      "We use advanced OBD-II diagnostics to pinpoint check engine lights and electrical issues.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are Monday through Friday 7am to 6pm, and Saturday 8am to 4pm.",
      "We have 18+ years of experience and have serviced over 45,000 vehicles.",
    ],
  },
};
