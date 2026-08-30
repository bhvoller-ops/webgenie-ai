import {
  Droplets,
  Flame,
  Wind,
  Shield,
  Home,
  Wrench,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
  Sparkles,
  Search,
} from 'lucide-react';
import type { IndustryConfig } from '../types';
import { SITE_ORIGIN } from '@/lib/site-url';

export const restorationConfig: IndustryConfig = {
  id: 'restoration',
  industryName: 'Restoration',
  businessName: 'RapidRestore 24/7',
  tagline: 'When Disaster Strikes, We Respond.',
  heroTitle: 'Restoring Your Property. Rebuilding Your Peace of Mind.',
  heroSubtitle:
    '24/7 emergency response for water, fire, mold, and storm damage. IICRC-certified technicians who get your home or business back to normal — fast.',
  phone: '(555) 456-7890',
  email: 'dispatch@rapidrestore247.com',
  serviceArea: 'Greater Metro Area & Surrounding Counties',
  hours: '24/7/365 Emergency Response',
  yearsExperience: '12+',
  licenseNumber: 'IICRC-5928473',

  colors: {
    primary: '#0C4A6E',
    primaryDark: '#082F49',
    primaryLight: '#E0F2FE',
    accent: '#B91C1C',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#0F172A',
    textMuted: '#64748B',
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

  heroImage: `${SITE_ORIGIN}/gallery-photos/restoration.jpg`,
  heroBadge: 'IICRC Certified • 24/7 Emergency Response',
  ctaPrimary: 'Call 24/7 Emergency Line',
  ctaSecondary: 'View Services',

  stats: [
    { value: '12+', label: 'Years Experience' },
    { value: '3,500+', label: 'Properties Restored' },
    { value: '< 60 min', label: 'Response Time' },
    { value: '4.9★', label: 'Average Rating' },
  ],

  services: [
    {
      icon: Droplets,
      title: 'Water Damage Restoration',
      description:
        'Rapid water extraction, drying, and dehumidification to prevent further damage and mold growth. We handle everything from burst pipes to flooding.',
      features: ['Water extraction', 'Structural drying', 'Dehumidification', 'Moisture monitoring'],
    },
    {
      icon: Flame,
      title: 'Fire & Smoke Damage',
      description:
        'Complete fire damage restoration including soot removal, odor elimination, and structural cleaning to make your property safe again.',
      features: ['Soot cleanup', 'Odor removal', 'Content cleaning', 'Board-up service'],
    },
    {
      icon: Shield,
      title: 'Mold Remediation',
      description:
        'Safe, thorough mold removal following IICRC protocols. We identify the source, contain the area, and eliminate mold at its root.',
      features: ['Mold inspection', 'Containment', 'HEPA cleaning', 'Prevention treatment'],
    },
    {
      icon: Wind,
      title: 'Storm Damage Cleanup',
      description:
        'Emergency response for wind, hail, and storm damage. Debris removal, tarping, and full restoration to pre-loss condition.',
      features: ['Debris removal', 'Emergency tarping', 'Tree removal', 'Temporary repairs'],
    },
    {
      icon: Home,
      title: 'Reconstruction',
      description:
        'Full reconstruction services to rebuild damaged areas. From drywall and flooring to complete rebuilds — one contractor, start to finish.',
      features: ['Drywall & paint', 'Flooring', 'Framing', 'Finish carpentry'],
    },
    {
      icon: Wrench,
      title: 'Contents Restoration',
      description:
        'Professional cleaning and restoration of your personal belongings, furniture, and documents affected by water, fire, or mold.',
      features: ['Pack-out service', 'Electronics cleaning', 'Document drying', 'Storage'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'IICRC Certified',
      description:
        'Our technicians hold IICRC certification — the industry standard for restoration. Every job follows strict protocols and standards.',
    },
    {
      icon: Clock,
      title: 'Under 60-Minute Response',
      description:
        'In an emergency, every minute counts. Our crews are dispatched immediately and typically arrive within one hour.',
    },
    {
      icon: Users,
      title: 'Direct Insurance Billing',
      description:
        'We work directly with all major insurance companies and handle the billing so you can focus on what matters — your family.',
    },
    {
      icon: ThumbsUp,
      title: 'One Contractor, Start to Finish',
      description:
        'From emergency mitigation to final reconstruction, we handle it all. No juggling multiple contractors during a stressful time.',
    },
  ],
  whyUsTitle: 'Why Property Owners Call RapidRestore',
  whyUsSubtitle:
    'When disaster hits, you need a team you can trust to handle everything — fast, professionally, and with compassion.',

  process: [
    {
      step: '01',
      title: 'Emergency Contact',
      description:
        'Call our 24/7 line. We gather initial information and dispatch a crew to your property immediately.',
    },
    {
      step: '02',
      title: 'Damage Assessment',
      description:
        'Our certified technicians assess the damage, document everything with photos, and create a restoration plan.',
    },
    {
      step: '03',
      title: 'Mitigation & Drying',
      description:
        'We stop further damage, extract water, set up drying equipment, and begin the cleanup process to protect your property.',
    },
    {
      step: '04',
      title: 'Restoration & Rebuild',
      description:
        'Once the property is stable and dry, we restore and rebuild to pre-loss condition — often better than before.',
    },
  ],
  processTitle: 'Our Response Process',
  processSubtitle: 'From emergency call to full restoration, we are with you every step.',

  testimonials: [
    {
      name: 'Karen W.',
      location: 'Lakeside Manor',
      rating: 5,
      text: 'Our basement flooded at 2am. RapidRestore was here within an hour, had the water out by sunrise, and handled everything with our insurance. We never felt alone in the process.',
    },
    {
      name: 'Michael P.',
      location: 'Ashford Park',
      rating: 5,
      text: 'A kitchen fire left soot throughout our home. Their team cleaned every surface, removed the smoke smell completely, and rebuilt the kitchen. You would never know it happened.',
    },
    {
      name: 'Susan L.',
      location: 'Fairfield Estates',
      rating: 5,
      text: 'They found mold behind our walls during a water damage job, contained it properly, and remediated it safely. Professional from start to finish. I cannot recommend them enough.',
    },
  ],
  testimonialsTitle: 'What Our Clients Say',
  testimonialsSubtitle: 'Real stories from property owners we helped when it mattered most.',

  faqs: [
    {
      question: 'How quickly can you respond to an emergency?',
      answer:
        'We are available 24/7/365. Our average response time is under 60 minutes. When you call, we dispatch a crew immediately — no matter the time of day or night.',
    },
    {
      question: 'Do you work with insurance companies?',
      answer:
        'Yes, we work with all major insurance carriers and bill them directly. We document everything thoroughly with photos and detailed reports to support your claim.',
    },
    {
      question: 'How long does the restoration process take?',
      answer:
        'Emergency mitigation typically takes 3-5 days for drying. Full reconstruction timelines vary by scope — we provide a detailed timeline after assessment. Most projects are completed within 2-6 weeks.',
    },
    {
      question: 'Can you handle both residential and commercial properties?',
      answer:
        'Yes, we service both residential and commercial properties. Our team has the equipment, personnel, and expertise to handle everything from single-family homes to large commercial facilities.',
    },
    {
      question: 'Is mold dangerous, and can you remove it completely?',
      answer:
        'Mold can cause health issues and should be addressed professionally. We follow IICRC mold remediation protocols to contain, remove, and prevent recurrence. Our process eliminates mold at its source.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Important answers when you need them most.',

  serviceAreas: [
    { name: 'Lakeside Manor' },
    { name: 'Ashford Park' },
    { name: 'Fairfield Estates' },
    { name: 'Downtown Core' },
    { name: 'Industrial District' },
    { name: 'Riverside' },
    { name: 'Westgate' },
    { name: 'Northpoint' },
  ],
  serviceAreasTitle: 'Communities We Proudly Serve',

  contactTitle: '24/7 Emergency Response — Call Now',
  contactSubtitle:
    'Do not wait. Whether it is water, fire, or storm damage, every minute matters. Call our emergency line or fill out the form below.',

  galleryTitle: 'Our Recent Restoration Projects',
  gallerySubtitle: 'From disaster to done — see our work.',
  galleryImages: ['/hero-restoration.webp', '/hero-cleaning.webp', '/hero-roofing.webp'],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'IICRC-certified professionals ready to respond when you need us most.',
  team: [
    { name: 'Chris Daniels', role: 'Restoration Director', bio: 'IICRC-certified with 12+ years in disaster restoration. Chris oversees every project from emergency response to final rebuild.' },
    { name: 'Rachel Kim', role: 'Mitigation Lead', bio: 'Specializes in water extraction and structural drying. Rachel is usually first on scene for emergency calls.' },
    { name: 'Tom Wright', role: 'Reconstruction Manager', bio: 'Handles the rebuild phase, turning damaged properties back into homes and businesses.' },
  ],

  pricingTitle: 'Restoration Service Options',
  pricingSubtitle: 'We work with all major insurance companies and bill them directly.',
  pricing: [
    { name: 'Emergency Response', price: 'Insurance', description: '24/7 rapid response for water, fire, or storm damage.', features: ['Under 60-min response', 'Water extraction', 'Emergency tarping', 'Insurance documentation'], popular: false },
    { name: 'Full Restoration', price: 'Insurance', description: 'Complete mitigation, drying, and reconstruction.', features: ['Damage assessment', 'Structural drying', 'Mold remediation', 'Full reconstruction', 'Direct insurance billing'], popular: true },
    { name: 'Mold Remediation', price: 'From $899', description: 'Safe, thorough mold removal following IICRC protocols.', features: ['Mold inspection', 'Containment', 'HEPA cleaning', 'Prevention treatment'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the RapidRestore 24/7 assistant. Are you dealing with an emergency?",
    placeholder: "Ask about our restoration services...",
    knowledgeBase: [
      "We offer water damage restoration, fire and smoke damage restoration, mold remediation, storm damage cleanup, reconstruction, and contents restoration.",
      "We are available 24/7/365 with an average response time of under 60 minutes. Call (555) 456-7890 for emergencies.",
      "We are IICRC-certified, which is the industry standard for restoration. Every job follows strict protocols.",
      "We work with all major insurance companies and bill them directly. We document everything with photos and detailed reports.",
      "Emergency mitigation typically takes 3-5 days for drying. Full reconstruction usually takes 2-6 weeks depending on scope.",
      "We service both residential and commercial properties of any size.",
      "Mold can cause health issues and should be addressed professionally. We follow IICRC mold remediation protocols to contain, remove, and prevent recurrence.",
      "We serve Lakeside Manor, Ashford Park, Fairfield Estates, Downtown Core, Industrial District, Riverside, Westgate, and Northpoint.",
      "We are a one-contractor solution from emergency mitigation to final reconstruction.",
      "We have 12+ years of experience and have restored over 3,500 properties.",
    ],
  },
};
