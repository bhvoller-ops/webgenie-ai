import {
  Truck,
  Home,
  Building2,
  Box,
  Package,
  Heart,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import type { IndustryConfig } from '../types';
import { SITE_ORIGIN } from '@/lib/site-url';

export const movingConfig: IndustryConfig = {
  id: 'moving',
  industryName: 'Moving',
  businessName: 'SmoothMove Movers',
  tagline: 'Stress-Free Moves. Handled With Heart.',
  heroTitle: 'Your Move, Made Effortless',
  heroSubtitle:
    'Local and long-distance moving done right. Careful crews, transparent pricing, and zero stress — whether you are moving across town or across the state.',
  phone: '(555) 234-5678',
  email: 'info@smoothmovemovers.com',
  serviceArea: 'Greater Metro Area & Statewide Long-Distance',
  hours: 'Mon-Sun 6am-8pm',
  yearsExperience: '18+',
  licenseNumber: 'MV-4950617',

  colors: {
    primary: '#1E40AF',
    primaryDark: '#1E3A8A',
    primaryLight: '#DBEAFE',
    accent: '#92400E',
    background: '#FFFFFF',
    surface: '#F8FAFF',
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
  heroBadge: 'Licensed & Insured • Free In-Home Estimates',
  ctaPrimary: 'Get Free Quote',
  ctaSecondary: 'View Services',

  stats: [
    { value: '18+', label: 'Years Experience' },
    { value: '10,000+', label: 'Moves Completed' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '99.6%', label: 'On-Time Arrival' },
  ],

  services: [
    {
      icon: Home,
      title: 'Residential Moving',
      description:
        'From apartments to family homes, we move your belongings with care so you can focus on settling in, not stressing out.',
      features: ['Apartment moves', 'House moves', 'Packing available', 'Furniture protection'],
    },
    {
      icon: Building2,
      title: 'Commercial Moving',
      description:
        'Office relocations planned around your schedule to minimize downtime. Desks, equipment, and files moved and reorganized.',
      features: ['Office relocation', 'Equipment moving', 'After-hours service', 'IT equipment care'],
    },
    {
      icon: Box,
      title: 'Packing Services',
      description:
        'Full or partial packing by trained professionals using quality materials. We label everything so unpacking is a breeze.',
      features: ['Full packing', 'Fragile-only packing', 'Quality materials', 'Detailed labeling'],
    },
    {
      icon: Package,
      title: 'Storage',
      description:
        'Secure, climate-controlled short- and long-term storage for belongings between moves or when downsizing.',
      features: ['Short-term storage', 'Long-term storage', 'Climate-controlled', 'Containerized'],
    },
    {
      icon: Truck,
      title: 'Long Distance',
      description:
        'Statewide and interstate moves with dedicated crews and guaranteed delivery windows. Your items stay on one truck.',
      features: ['Statewide moves', 'Interstate moves', 'Dedicated truck', 'Delivery guarantees'],
    },
    {
      icon: Heart,
      title: 'Piano & Specialty',
      description:
        'Pianos, safes, artwork, and antiques require special handling — and we have the equipment and training to do it safely.',
      features: ['Piano moving', 'Safe moving', 'Fine art handling', 'Antiques & heirlooms'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Licensed & Insured',
      description:
        'Fully licensed (MV-4950617) and insured for your protection. Your belongings are covered from pickup to delivery.',
    },
    {
      icon: Clock,
      title: 'Guaranteed On-Time',
      description:
        'We commit to arrival and delivery windows — and we meet them. Our 99.6% on-time record speaks for itself.',
    },
    {
      icon: Users,
      title: 'Trained, Careful Crews',
      description:
        'Every mover is background-checked and trained in safe lifting, packing, and furniture protection. No day laborers.',
    },
    {
      icon: ThumbsUp,
      title: 'Transparent Pricing',
      description:
        'Flat-rate or hourly, you get a binding quote before moving day. No surprise fuel charges, stair fees, or add-ons.',
    },
  ],
  whyUsTitle: 'Why Movers Choose SmoothMove',
  whyUsSubtitle:
    'Moving is stressful enough. We make the actual move the easy part.',

  process: [
    {
      step: '01',
      title: 'Free In-Home Estimate',
      description:
        'We visit your home (or do a video survey) to assess your move and provide a binding, no-surprise quote.',
    },
    {
      step: '02',
      title: 'Plan & Schedule',
      description:
        'We confirm your moving date, assign your crew, and walk you through the plan so you know exactly what to expect.',
    },
    {
      step: '03',
      title: 'Moving Day',
      description:
        'Our crew arrives on time, protects your home and furniture, loads carefully, and transports everything safely.',
    },
    {
      step: '04',
      title: 'Unload & Settle',
      description:
        'We unload, place furniture where you want it, reassemble anything we took apart, and do a final walkthrough.',
    },
  ],
  processTitle: 'How Your Move Works',
  processSubtitle: 'A clear plan from quote to final box unpacked.',

  testimonials: [
    {
      name: 'Latisha J.',
      location: 'New Harbor',
      rating: 5,
      text: 'SmoothMove handled our cross-town move with three kids and a dog in tow. They were fast, careful, and actually fun to have around. Not a single scratch on anything.',
    },
    {
      name: 'Greg and Pam W.',
      location: 'Old Mill',
      rating: 5,
      text: 'We moved a baby grand piano and a full house. The crew was incredibly professional and treated our piano like it was their own. The price was exactly what they quoted.',
    },
    {
      name: 'Victor N.',
      location: 'Summit Hills',
      rating: 5,
      text: 'Office move over a weekend — they had us unpacked and operational by Monday morning. Zero downtime, zero stress. Will use them again for our expansion.',
    },
  ],
  testimonialsTitle: 'What Our Customers Say',
  testimonialsSubtitle: 'Real reviews from families and businesses we have moved.',

  faqs: [
    {
      question: 'How do you charge for a move?',
      answer:
        'Local moves are charged hourly with a three-hour minimum, while long-distance moves are flat-rate based on distance and inventory. You receive a binding quote after your in-home or video estimate, so there are no surprises on moving day.',
    },
    {
      question: 'Do you provide packing materials and services?',
      answer:
        'Yes. We offer full and partial packing services using quality boxes, paper, and protective wrap. You can also purchase a materials kit to pack yourself. We label every box by room to make unpacking easy.',
    },
    {
      question: 'Are my belongings insured during the move?',
      answer:
        'Yes. Every move includes basic valuation coverage at no charge, and we offer full-value protection plans for an additional fee. We are fully licensed (MV-4950617) and insured, and we will explain your options during the estimate.',
    },
    {
      question: 'Can you move specialty items like pianos or safes?',
      answer:
        'Absolutely. We have the equipment and trained crews to move pianos, safes, fine art, and antiques safely. These items are quoted separately based on weight, stairs, and access. Just let us know during your estimate.',
    },
    {
      question: 'What happens if something is damaged?',
      answer:
        'In the rare event of damage, notify us within 72 hours and we will process a claim under your chosen coverage. We take responsibility seriously — our claims team responds within one business day to make it right.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know before moving day.',

  serviceAreas: [
    { name: 'New Harbor' },
    { name: 'Old Mill' },
    { name: 'Summit Hills' },
    { name: 'Bayview' },
    { name: 'Crestwood' },
    { name: 'Lakeshore' },
    { name: 'Fairmont' },
    { name: 'Stonebridge' },
  ],
  serviceAreasTitle: 'Communities We Proudly Move',

  contactTitle: 'Get Your Free Moving Quote',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day with a binding estimate.',

  galleryTitle: 'Our Recent Moves',
  gallerySubtitle: 'A look at the homes and offices we have moved.',
  galleryImages: ['/hero-restoration.webp', '/hero-cleaning.webp', '/hero-fencing.webp'],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'The crew leaders who make your move smooth.',
  team: [
    { name: 'Andre Coleman', role: 'Founder & Move Coordinator', bio: '18+ years in the moving industry. Andre started SmoothMove to bring honest pricing and careful crews to every move.' },
    { name: 'Sophie Lin', role: 'Operations Manager', bio: 'Plans every move down to the truck and crew assignment. Sophie is your point of contact from quote to final box.' },
    { name: 'Marcus Webb', role: 'Lead Mover & Specialty Expert', bio: 'Certified in piano and safe moving. Marcus leads our most complex jobs with precision and care.' },
  ],

  pricingTitle: 'Moving Service Packages',
  pricingSubtitle: 'Transparent pricing with binding quotes. No hidden fees.',
  pricing: [
    { name: 'Studio / 1-Bedroom', price: 'From $399', description: 'Perfect for small apartments and local moves.', features: ['2 movers', '2-hour minimum', 'Truck & equipment', 'Furniture protection', 'Basic valuation coverage'], popular: false },
    { name: '2-3 Bedroom Home', price: 'From $899', description: 'Our most popular package for families.', features: ['3-4 movers', '4-hour minimum', 'Truck & equipment', 'Full furniture protection', 'Enhanced valuation coverage', 'Wardrobe boxes included'], popular: true },
    { name: 'Long Distance', price: 'Custom Quote', description: 'Statewide and interstate moves with guaranteed delivery.', features: ['Dedicated truck', 'Guaranteed delivery window', 'Full packing available', 'Full-value protection', 'Specialty item handling', 'Move coordinator'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the SmoothMove Movers assistant. How can I help with your move today?",
    placeholder: "Ask about quotes, services, or scheduling...",
    knowledgeBase: [
      "We offer residential moving, commercial moving, packing services, storage, long-distance moving, and piano and specialty item moving.",
      "We are fully licensed (MV-4950617) and insured. Your belongings are covered from pickup to delivery.",
      "Local moves are charged hourly with a three-hour minimum. Long-distance moves are flat-rate based on distance and inventory.",
      "Yes, we offer full and partial packing services using quality materials, and we label every box by room.",
      "Every move includes basic valuation coverage at no charge, and full-value protection plans are available for an additional fee.",
      "We can move pianos, safes, fine art, and antiques — these are quoted separately based on weight and access.",
      "We offer free in-home or video estimates and provide a binding quote so there are no surprises on moving day.",
      "We serve New Harbor, Old Mill, Summit Hills, Bayview, Crestwood, Lakeshore, Fairmont, and Stonebridge, plus statewide long-distance.",
      "Our hours are Monday through Sunday, 6am to 8pm.",
      "We have 18+ years of experience, completed over 10,000 moves, and hold a 99.6% on-time arrival record.",
    ],
  },
};
