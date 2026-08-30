import {
  Home,
  ClipboardCheck,
  Building2,
  Radiation,
  Bug,
  Thermometer,
  ShieldCheck,
  Clock,
  Award,
  ThumbsUp,
  PhoneCall,
  Search,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const homeInspectionConfig: IndustryConfig = {
  id: 'home-inspection',
  industryName: 'Home Inspection',
  businessName: 'TrustPoint Home Inspections',
  tagline: 'Know Before You Buy.',
  heroTitle: 'Thorough Home Inspections You Can Trust',
  heroSubtitle:
    'Certified home inspections for buyers, sellers, and builders. Detailed reports, thermal imaging, and same-day results so you can make confident decisions.',
  phone: '(555) 245-9876',
  email: 'info@trustpointinspections.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Sat 8am-6pm',
  yearsExperience: '15+',
  licenseNumber: 'HI-4827193',

  colors: {
    primary: '#1E40AF',
    primaryDark: '#1E3A8A',
    primaryLight: '#DBEAFE',
    accent: '#B45309',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#0A1929',
    textMuted: '#5B6B7E',
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

  heroImage: 'https://images.pexels.com/photos/8293635/pexels-photo-8293635.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'Certified • Licensed & Insured',
  ctaPrimary: 'Book an Inspection',
  ctaSecondary: 'View Services',

  stats: [
    { value: '15+', label: 'Years Experience' },
    { value: '8,500+', label: 'Inspections Completed' },
    { value: '4.9★', label: 'Average Rating' },
    { value: 'Same Day', label: 'Report Delivery' },
  ],

  services: [
    {
      icon: Home,
      title: 'Pre-Purchase Inspections',
      description:
        'Comprehensive inspections for home buyers. We evaluate every major system so you know exactly what you are buying before closing.',
      features: ['Structural assessment', 'Roof & exterior', 'Plumbing & electrical', 'HVAC systems'],
    },
    {
      icon: ClipboardCheck,
      title: 'Pre-Listing Inspections',
      description:
        'Sellers benefit from knowing issues upfront. We identify concerns before buyers do, helping you price and prepare with confidence.',
      features: ['Pre-listing checklist', 'Repair recommendations', 'Negotiation leverage', 'Faster sales'],
    },
    {
      icon: Building2,
      title: 'New Construction Inspections',
      description:
        'Phase inspections at every stage of new construction. We catch builder mistakes early, before they become costly problems.',
      features: ['Foundation inspection', 'Pre-drywall inspection', 'Final walkthrough', 'Builder coordination'],
    },
    {
      icon: Radiation,
      title: 'Radon Testing',
      description:
        'Continuous radon monitoring to protect your family from this invisible, odorless gas. Accurate results in 48 hours.',
      features: ['48-hour testing', 'Continuous monitoring', 'EPA protocols', 'Detailed mitigation advice'],
    },
    {
      icon: Bug,
      title: 'Termite & Pest Inspection',
      description:
        'Wood-destroying organism inspections that uncover termite, carpenter ant, and powderpost beetle activity before damage spreads.',
      features: ['WDO inspection', 'Damage assessment', 'Treatment referrals', 'NPMA standards'],
    },
    {
      icon: Thermometer,
      title: 'Thermal Imaging',
      description:
        'Infrared thermal imaging detects hidden moisture, insulation gaps, and electrical hot spots that visual inspections cannot see.',
      features: ['Moisture detection', 'Insulation gaps', 'Electrical hot spots', 'Hidden leaks'],
    },
  ],

  whyUs: [
    {
      icon: ShieldCheck,
      title: 'Certified Inspectors',
      description:
        'Our inspectors are ASHI-certified and state-licensed with 15+ years of combined experience. You get expertise on every inspection.',
    },
    {
      icon: Clock,
      title: 'Same-Day Reports',
      description:
        'Receive your detailed, photo-rich inspection report the same day. No waiting, no delays — make decisions with the facts in hand.',
    },
    {
      icon: Award,
      title: 'Comprehensive Coverage',
      description:
        'We inspect every major system: roof, foundation, plumbing, electrical, HVAC, and more. Nothing is overlooked or rushed.',
    },
    {
      icon: ThumbsUp,
      title: 'Unbiased & Honest',
      description:
        'We work for you, not the seller or agent. Our reports are objective, thorough, and focused on protecting your investment.',
    },
  ],
  whyUsTitle: 'Why Buyers & Sellers Choose TrustPoint',
  whyUsSubtitle:
    'A home is the biggest purchase you will ever make. We give you the facts to make it with confidence.',

  process: [
    {
      step: '01',
      title: 'Schedule Online',
      description:
        'Book your inspection in under two minutes. Pick a date that works for you and we confirm availability immediately.',
    },
    {
      step: '02',
      title: 'We Inspect',
      description:
        'Our certified inspector spends 2-4 hours evaluating every major system of the home. You are welcome to attend.',
    },
    {
      step: '03',
      title: 'Receive Report',
      description:
        'Get your detailed, photo-documented report the same day via email. Review findings at your own pace.',
    },
    {
      step: '04',
      title: 'Ask Questions',
      description:
        'Call or email us anytime after the inspection. We answer your questions and help you understand every finding.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'A clear, straightforward inspection process from start to finish.',

  testimonials: [
    {
      name: 'Marcus T.',
      location: 'Brookside',
      rating: 5,
      text: 'TrustPoint found three issues the seller had not disclosed. Their report gave us the leverage to negotiate $12,000 in repairs. Worth every penny.',
    },
    {
      name: 'Diane K.',
      location: 'Fairfield',
      rating: 5,
      text: 'The thermal imaging caught a hidden roof leak that would have cost us thousands. The inspector was patient, thorough, and explained everything clearly.',
    },
    {
      name: 'James R.',
      location: 'Eastside',
      rating: 5,
      text: 'As a first-time buyer I was nervous. The same-day report was incredibly detailed with photos and clear recommendations. I felt confident moving forward.',
    },
  ],
  testimonialsTitle: 'What Our Clients Say',
  testimonialsSubtitle: 'Confident buyers and sellers, one inspection at a time.',

  faqs: [
    {
      question: 'How long does a home inspection take?',
      answer:
        'A typical home inspection takes 2-4 hours depending on the size, age, and condition of the home. Larger or older homes may take longer. You are welcome to attend the entire inspection.',
    },
    {
      question: 'When will I receive my inspection report?',
      answer:
        'You will receive your detailed, photo-documented report the same day as the inspection, usually within a few hours. Reports are delivered via email in an easy-to-read digital format.',
    },
    {
      question: 'Should I attend the inspection?',
      answer:
        'We encourage it. Attending lets you ask questions and see issues firsthand. If you cannot attend, we are happy to walk you through the report by phone afterward.',
    },
    {
      question: 'What does a home inspection cover?',
      answer:
        'We inspect all major systems: roof, exterior, foundation, structure, plumbing, electrical, HVAC, insulation, ventilation, and built-in appliances. Specialty add-ons include radon, termite, and thermal imaging.',
    },
    {
      question: 'Are you licensed and insured?',
      answer:
        'Yes. Our inspectors are ASHI-certified and state-licensed. We carry full general liability and errors & omissions insurance for your protection and peace of mind.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about our home inspection services.',

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

  contactTitle: 'Book Your Home Inspection',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day to schedule your inspection.',

  galleryTitle: 'Our Recent Inspection Projects',
  gallerySubtitle: 'See the detail and care behind every TrustPoint inspection.',
  galleryImages: [
    'https://images.pexels.com/photos/8293635/pexels-photo-8293635.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/8293635/pexels-photo-8293635.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/8293635/pexels-photo-8293635.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Certified, licensed inspectors dedicated to protecting your investment.',
  team: [
    { name: 'Robert Chen', role: 'Lead Inspector', bio: 'ASHI-certified with 15 years of inspection experience. Robert has performed over 5,000 inspections and specializes in older and historic homes.' },
    { name: 'Maria Lopez', role: 'Senior Inspector', bio: 'Licensed home inspector and former general contractor. Maria brings construction expertise to every inspection she performs.' },
    { name: 'David Park', role: 'Thermal Imaging Specialist', bio: 'Certified thermographer with expertise in moisture detection, insulation analysis, and electrical diagnostics using infrared technology.' },
  ],

  pricingTitle: 'Inspection Service Packages',
  pricingSubtitle: 'Transparent pricing with no hidden fees.',
  pricing: [
    { name: 'Pre-Purchase Inspection', price: 'From $425', description: 'Complete inspection for home buyers.', features: ['All major systems', '2-4 hour inspection', 'Same-day report', 'Photo documentation', 'Free phone consultation'], popular: true },
    { name: 'Pre-Listing Inspection', price: 'From $375', description: 'Inspection for sellers before listing.', features: ['Full system evaluation', 'Repair recommendations', 'Pre-listing checklist', 'Same-day report', 'Negotiation support'], popular: false },
    { name: 'New Construction', price: 'From $525', description: 'Multi-phase construction inspections.', features: ['Foundation inspection', 'Pre-drywall inspection', 'Final walkthrough', 'Builder coordination', 'Detailed phase reports'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the TrustPoint Home Inspections assistant. How can I help you today?",
    placeholder: "Ask about our inspection services...",
    knowledgeBase: [
      "We offer pre-purchase inspections, pre-listing inspections, new construction inspections, radon testing, termite and pest inspections, and thermal imaging.",
      "A typical home inspection takes 2-4 hours depending on the size, age, and condition of the home. You are welcome to attend the entire inspection.",
      "You will receive your detailed, photo-documented inspection report the same day, usually within a few hours of the inspection.",
      "We encourage clients to attend the inspection so you can ask questions and see issues firsthand. If you cannot attend, we walk you through the report by phone.",
      "Our inspectors are ASHI-certified and state-licensed, and we carry full general liability and errors and omissions insurance.",
      "We inspect all major systems: roof, exterior, foundation, structure, plumbing, electrical, HVAC, insulation, ventilation, and built-in appliances.",
      "Specialty add-ons include radon testing with 48-hour results, termite and wood-destroying organism inspections, and infrared thermal imaging.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are Monday through Saturday, 8am to 6pm.",
      "We have 15+ years of experience and have completed over 8,500 inspections with a 4.9-star average rating.",
    ],
  },
};
