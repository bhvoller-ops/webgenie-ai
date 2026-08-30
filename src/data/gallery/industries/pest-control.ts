import {
  Bug,
  Shield,
  SprayCan,
  Rat,
  Trash2,
  Leaf,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
  Star,
} from 'lucide-react';
import type { IndustryConfig } from '../types';
import { SITE_ORIGIN } from '@/lib/site-url';

export const pestControlConfig: IndustryConfig = {
  id: 'pest-control',
  industryName: 'Pest Control',
  businessName: 'BugShield Pest Control',
  tagline: 'Pests Out. Peace of Mind In.',
  heroTitle: 'Your Trusted Local Pest Control Experts',
  heroSubtitle:
    'From ants and roaches to termites and rodents, our licensed technicians deliver effective, family-safe treatments that keep your home pest-free year-round.',
  phone: '(555) 234-5678',
  email: 'info@bugshieldpest.com',
  serviceArea: 'Greater Metro Area & Surrounding Counties',
  hours: 'Mon-Fri 8am-6pm | Sat 9am-3pm',
  yearsExperience: '12+',
  licenseNumber: 'PC-7263849',

  colors: {
    primary: '#15803D',
    primaryDark: '#166534',
    primaryLight: '#DCFCE7',
    accent: '#78350F',
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

  heroImage: `${SITE_ORIGIN}/gallery-photos/pest-control.jpg`,
  heroBadge: 'Licensed & Insured • Family & Pet Safe Treatments',
  ctaPrimary: 'Get Free Inspection',
  ctaSecondary: 'View Services',

  stats: [
    { value: '12+', label: 'Years Experience' },
    { value: '15,000+', label: 'Homes Treated' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '100%', label: 'Satisfaction Guarantee' },
  ],

  services: [
    {
      icon: Bug,
      title: 'Ant & Roach',
      description:
        'Targeted treatments that eliminate ant and roach colonies at the source and prevent reinfestation with long-lasting barrier protection.',
      features: ['Colony elimination', 'Gel bait application', 'Crack & crevice treatment', 'Preventive barrier'],
    },
    {
      icon: Rat,
      title: 'Rodent Control',
      description:
        'Complete rodent control that removes rats and mice from your home and seals entry points to keep them from coming back.',
      features: ['Trapping & removal', 'Entry point sealing', 'Attic & crawl space', 'Sanitation advice'],
    },
    {
      icon: Shield,
      title: 'Termite',
      description:
        'Advanced termite detection and treatment that protects your home\'s structure with liquid barriers and baiting systems.',
      features: ['Termite inspection', 'Liquid barrier treatment', 'Bait station installation', 'Annual monitoring'],
    },
    {
      icon: SprayCan,
      title: 'Mosquito',
      description:
        'Season-long mosquito control that reduces populations around your yard so you can enjoy your outdoor space again.',
      features: ['Yard fogging', 'Larvicide treatment', 'Breeding site elimination', 'Monthly treatments'],
    },
    {
      icon: Trash2,
      title: 'Bed Bug',
      description:
        'Discreet, thorough bed bug elimination using heat and targeted treatments that eradicate all life stages in a single visit.',
      features: ['Heat treatment', 'Deep crack & crevice', 'Mattress encasements', 'Follow-up inspection'],
    },
    {
      icon: Leaf,
      title: 'Quarterly Treatment',
      description:
        'Year-round protection with scheduled quarterly treatments that prevent pests before they become a problem.',
      features: ['Seasonal treatments', 'Unlimited call-backs', 'Exterior barrier', 'Interior as needed'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Licensed & Insured',
      description:
        'Fully licensed (PC-7263849) and insured for your protection. Our technicians are trained and certified in safe, effective application.',
    },
    {
      icon: Clock,
      title: 'Same-Day Service',
      description:
        'Pest problems cannot wait. We offer same-day and next-day appointments so you get relief fast, without the runaround.',
    },
    {
      icon: Users,
      title: 'Family & Pet Safe',
      description:
        'Our treatments are formulated to be safe for your children and pets when applied according to label directions. We use eco-conscious products.',
    },
    {
      icon: ThumbsUp,
      title: 'Satisfaction Guarantee',
      description:
        'If pests return between scheduled visits, so do we — at no extra charge. Your peace of mind is our promise.',
    },
  ],
  whyUsTitle: 'Why Homeowners Choose BugShield',
  whyUsSubtitle:
    'We have built our reputation on effective, safe, and reliable pest control. Here is what sets us apart.',

  process: [
    {
      step: '01',
      title: 'Free Inspection',
      description:
        'We thoroughly inspect your home inside and out, identify pests and entry points, and document everything with photos.',
    },
    {
      step: '02',
      title: 'Custom Plan',
      description:
        'Based on our findings, we recommend a targeted treatment plan with clear pricing and no pressure to commit.',
    },
    {
      step: '03',
      title: 'Expert Treatment',
      description:
        'Our licensed technician applies treatments safely and thoroughly, targeting pests at the source and building preventive barriers.',
    },
    {
      step: '04',
      title: 'Follow-Up',
      description:
        'We schedule follow-up visits as needed and provide ongoing protection with quarterly treatments to keep pests out for good.',
    },
  ],
  processTitle: 'Our Service Process',
  processSubtitle: 'From first inspection to pest-free home, we make it simple and effective.',

  testimonials: [
    {
      name: 'Jennifer M.',
      location: 'Oakwood Heights',
      rating: 5,
      text: 'We had roaches in the kitchen and were at our wits end. BugShield came out the same day, found the nest behind the dishwasher, and we have not seen a single roach since. Incredibly thorough.',
    },
    {
      name: 'Robert K.',
      location: 'Cedar Valley',
      rating: 5,
      text: 'Termites were eating our garage framing. Their inspection was the most detailed I have seen, the treatment was clean and professional, and the annual monitoring gives me total peace of mind.',
    },
    {
      name: 'Sandra T.',
      location: 'Maple Ridge',
      rating: 5,
      text: 'The quarterly plan is worth every penny. We used to have ants every spring and mosquitoes all summer. Now we barely see a bug and the technicians are always friendly and on time.',
    },
  ],
  testimonialsTitle: 'What Our Neighbors Say',
  testimonialsSubtitle: 'Real reviews from real homeowners we have served.',

  faqs: [
    {
      question: 'Are your treatments safe for my kids and pets?',
      answer:
        'Yes. We use EPA-registered products applied according to label directions, which are safe for children and pets once dry — typically 30 minutes to 1 hour after treatment. We will give you specific re-entry instructions before we begin.',
    },
    {
      question: 'How often should I get pest control treatments?',
      answer:
        'For most homes, quarterly treatments provide year-round protection by targeting seasonal pest activity before it becomes an infestation. Severe problems like termites or bed bugs may require more intensive initial treatment followed by maintenance.',
    },
    {
      question: 'Do I need to leave my home during treatment?',
      answer:
        'For most standard treatments, you do not need to leave. We ask that you keep pets and children away from treated areas until dry. For certain treatments like whole-home bed bug heat treatment, you will need to vacate for several hours.',
    },
    {
      question: 'What if the pests come back after treatment?',
      answer:
        'Our satisfaction guarantee means if pests return between scheduled visits, we come back at no extra charge. Simply call us and we will schedule a follow-up as quickly as possible.',
    },
    {
      question: 'Are you licensed and insured?',
      answer:
        'Absolutely. We are fully licensed (PC-7263849) and carry both liability insurance and workers compensation. We are happy to provide documentation before any treatment begins.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know before we get started.',

  serviceAreas: [
    { name: 'Oakwood Heights' },
    { name: 'Cedar Valley' },
    { name: 'Maple Ridge' },
    { name: 'Pinebrook' },
    { name: 'Riverside' },
    { name: 'Highland Park' },
    { name: 'Greenwood' },
    { name: 'Brookfield' },
  ],
  serviceAreasTitle: 'Communities We Proudly Serve',

  contactTitle: 'Get Your Free Pest Inspection',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day — no pressure, no obligation.',

  galleryTitle: 'Our Recent Pest Control Projects',
  gallerySubtitle: 'See the quality of our work across the region.',
  galleryImages: ['/hero-landscaping.webp', '/hero-cleaning.webp', '/hero-tree-care.webp'],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'The experienced professionals behind every pest-free home.',
  team: [
    { name: 'Carlos Mendez', role: 'Founder & Lead Technician', bio: '12+ years in pest control. Carlos started BugShield after seeing a need for honest, family-safe pest services in his community.' },
    { name: 'Rachel Kim', role: 'Operations Manager', bio: 'Keeps every appointment on schedule and every customer informed. Rachel is your main point of contact from inspection to follow-up.' },
    { name: 'Devon Walker', role: 'Senior Pest Technician', bio: 'Certified in termite detection and bed bug heat treatment. Devon handles our most challenging infestations with precision and care.' },
  ],

  pricingTitle: 'Pest Control Service Packages',
  pricingSubtitle: 'Transparent pricing with no hidden fees. Free inspections for every home.',
  pricing: [
    { name: 'One-Time Treatment', price: 'From $149', description: 'Targeted treatment for a specific pest problem.', features: ['Single pest target', 'Interior & exterior', 'Free follow-up if needed', '30-day guarantee'], popular: false },
    { name: 'Quarterly Plan', price: '$79/mo', description: 'Year-round protection with seasonal treatments.', features: ['4 treatments per year', 'Unlimited call-backs', 'Exterior barrier', 'Interior as needed', 'Multiple pest coverage'], popular: true },
    { name: 'Termite Protection', price: 'From $599', description: 'Comprehensive termite treatment and monitoring.', features: ['Full inspection', 'Liquid barrier treatment', 'Bait stations', 'Annual monitoring', 'Transferable warranty'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the BugShield Pest Control assistant. How can I help you today?",
    placeholder: "Ask about our pest control services...",
    knowledgeBase: [
      "We offer ant and roach control, rodent control, termite treatment, mosquito control, bed bug elimination, and quarterly pest prevention plans.",
      "We are licensed (PC-7263849) and fully insured with liability and workers compensation coverage.",
      "Our treatments are safe for children and pets once dry, typically 30 minutes to 1 hour after application.",
      "For most homes, quarterly treatments provide year-round protection against seasonal pest activity.",
      "We offer same-day and next-day appointments for urgent pest problems.",
      "Our satisfaction guarantee means if pests return between scheduled visits, we come back at no extra charge.",
      "For most treatments you do not need to leave your home, though bed bug heat treatment requires several hours of vacating.",
      "We serve Oakwood Heights, Cedar Valley, Maple Ridge, Pinebrook, Riverside, Highland Park, Greenwood, and Brookfield.",
      "Our hours are Mon-Fri 8am-6pm and Sat 9am-3pm.",
      "We have 12+ years of experience and have treated over 15,000 homes.",
    ],
  },
};
