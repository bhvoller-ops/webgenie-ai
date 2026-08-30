import {
  Home,
  Building2,
  Wand2,
  Palette,
  Armchair,
  Box,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  Ruler,
  Lightbulb,
  Sparkles,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const interiorDesignConfig: IndustryConfig = {
  id: 'interior-design',
  industryName: 'Interior Design',
  businessName: 'Aether Design Studio',
  tagline: 'Spaces That Tell Your Story.',
  heroTitle: 'Thoughtful Interior Design for Modern Living',
  heroSubtitle:
    'Residential and commercial interior design that balances beauty and function. From concept to completion, we craft spaces that feel unmistakably yours.',
  phone: '(555) 642-1180',
  email: 'studio@aetherdesign.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Fri 9am-6pm, Sat by appointment',
  yearsExperience: '12+',
  licenseNumber: 'ID-5829471',

  colors: {
    primary: '#7C2D12',
    primaryDark: '#571C0F',
    primaryLight: '#FEF3C7',
    accent: '#0D9488',
    background: '#FFFFFF',
    surface: '#FEFCE8',
    text: '#1A0F08',
    textMuted: '#6B5B4F',
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

  heroImage: 'https://images.pexels.com/photos/12885119/pexels-photo-12885119.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'Award-Winning • Full-Service Studio',
  ctaPrimary: 'Book a Consultation',
  ctaSecondary: 'View Services',

  stats: [
    { value: '12+', label: 'Years Experience' },
    { value: '340+', label: 'Projects Completed' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '15+', label: 'Design Awards' },
  ],

  services: [
    {
      icon: Home,
      title: 'Residential Design',
      description:
        'Full-home interior design that reflects how you live. We handle every detail from space planning to styling for a cohesive, livable result.',
      features: ['Whole-home design', 'Space planning', 'Furniture selection', 'Styling & finishing'],
    },
    {
      icon: Building2,
      title: 'Commercial Design',
      description:
        'Workplace, retail, and hospitality design that elevates your brand and supports how your team and customers experience the space.',
      features: ['Office design', 'Retail environments', 'Hospitality spaces', 'Brand integration'],
    },
    {
      icon: Wand2,
      title: 'Room Makeovers',
      description:
        'Transform a single room without a full renovation. Strategic furniture, color, and lighting changes create dramatic results on any budget.',
      features: ['Single-room redesign', 'Furniture & decor', 'Lighting updates', 'One-day transformations'],
    },
    {
      icon: Palette,
      title: 'Color & Material Consultation',
      description:
        'Expert guidance on color palettes, finishes, and materials. We help you make confident choices that work together beautifully.',
      features: ['Color palette development', 'Material selection', 'Finish coordination', 'Sample boards'],
    },
    {
      icon: Armchair,
      title: 'Custom Furniture',
      description:
        'Bespoke furniture designed and built for your space. We collaborate with skilled craftspeople to create pieces that fit perfectly.',
      features: ['Custom upholstery', 'Built-in cabinetry', 'One-of-a-kind pieces', 'Sustainable materials'],
    },
    {
      icon: Box,
      title: '3D Design Renderings',
      description:
        'Photorealistic 3D renderings let you see your space before any work begins. Make decisions with confidence and avoid costly mistakes.',
      features: ['Photorealistic visuals', 'Virtual walkthroughs', 'Material visualization', 'Revision cycles'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Award-Winning Studio',
      description:
        'Our work has been recognized with 15+ design awards. We bring a level of craft and creativity that transforms ordinary spaces into extraordinary ones.',
    },
    {
      icon: Clock,
      title: 'On-Time, On-Budget',
      description:
        'We respect your timeline and your budget. Detailed project plans and transparent communication keep everything on track from start to finish.',
    },
    {
      icon: Users,
      title: 'Collaborative Process',
      description:
        'Your input shapes every decision. We listen first, then design spaces that reflect your taste, lifestyle, and the way you actually use your space.',
    },
    {
      icon: ThumbsUp,
      title: 'End-to-End Management',
      description:
        'From concept to installation, we manage every detail. Contractors, vendors, timelines — we handle it all so you do not have to.',
    },
  ],
  whyUsTitle: 'Why Clients Choose Aether Design Studio',
  whyUsSubtitle:
    'We design spaces that are as functional as they are beautiful, with a process that is actually enjoyable.',

  process: [
    {
      step: '01',
      title: 'Discovery Consultation',
      description:
        'We meet to understand your needs, style, and budget. This is where we learn how you live and what you want your space to feel like.',
    },
    {
      step: '02',
      title: 'Concept & Design',
      description:
        'We present a design concept with mood boards, 3D renderings, and material samples. You review, refine, and approve the direction.',
    },
    {
      step: '03',
      title: 'Sourcing & Coordination',
      description:
        'We source furniture, materials, and manage contractors. We handle all ordering, scheduling, and vendor coordination for you.',
    },
    {
      step: '04',
      title: 'Installation & Reveal',
      description:
        'We install everything, style the space, and reveal your transformed room. You walk in to a finished, polished, ready-to-enjoy space.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'A collaborative design process from concept to reveal.',

  testimonials: [
    {
      name: 'Emily & Tom R.',
      location: 'Brookside',
      rating: 5,
      text: 'Aether transformed our entire home. They listened to how we actually live and designed spaces that are beautiful and practical. The 3D renderings sold us immediately.',
    },
    {
      name: 'Marcus W.',
      location: 'Fairfield',
      rating: 5,
      text: 'Our office redesign boosted team morale and client impressions. They handled every contractor and vendor. We just showed up to a finished space. Worth every penny.',
    },
    {
      name: 'Sophia L.',
      location: 'Eastside',
      rating: 5,
      text: 'I was nervous about hiring a designer, but they made it fun. The color and material consultation alone was worth it. My living room finally feels like me.',
    },
  ],
  testimonialsTitle: 'What Our Clients Say',
  testimonialsSubtitle: 'Beautiful spaces and delighted clients are our signature.',

  faqs: [
    {
      question: 'How much does an interior design project cost?',
      answer:
        'Every project is unique. After our initial consultation, we provide a detailed proposal with a clear fee structure and estimated budget. We work within your budget, not against it.',
    },
    {
      question: 'Do you work with existing furniture and decor?',
      answer:
        'Absolutely. We incorporate pieces you love and want to keep, then build the design around them. A mix of old and new often creates the most personal, layered spaces.',
    },
    {
      question: 'How long does a typical project take?',
      answer:
        'Timelines vary by scope. A single-room makeover can take 4-6 weeks, while a full-home design may take 3-6 months. We provide a detailed timeline during the design phase.',
    },
    {
      question: 'Do you offer virtual design services?',
      answer:
        'Yes. We offer e-design packages for clients who want professional guidance remotely. You receive a design concept, shopping list, and setup guide all delivered digitally.',
    },
    {
      question: 'Can you manage contractors and installation?',
      answer:
        'Yes. We offer full project management including contractor coordination, delivery scheduling, and final installation. You can be as involved or hands-off as you prefer.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about our interior design services.',

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

  contactTitle: 'Start Your Design Journey',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day to schedule your consultation.',

  galleryTitle: 'Our Recent Design Projects',
  gallerySubtitle: 'See how thoughtful design transforms a space.',
  galleryImages: [
    'https://images.pexels.com/photos/12885119/pexels-photo-12885119.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/12885119/pexels-photo-12885119.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/12885119/pexels-photo-12885119.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Award-winning designers who listen first and design with intention.',
  team: [
    { name: 'Olivia Bennett', role: 'Principal Designer', bio: 'Founder and lead designer with 12 years of experience. Olivia has won 15 design awards and leads every residential project from concept to completion.' },
    { name: 'Daniel Foster', role: 'Commercial Design Lead', bio: 'Specializes in workplace and hospitality design. Daniel brings brand strategy and user experience thinking to every commercial project.' },
    { name: 'Maya Patel', role: 'Design Associate', bio: 'Manages 3D renderings, material sourcing, and project coordination. Maya ensures every detail is documented and delivered on time.' },
  ],

  pricingTitle: 'Design Service Packages',
  pricingSubtitle: 'Flexible options for projects of every scale.',
  pricing: [
    { name: 'Design Consultation', price: 'From $350', description: 'Two-hour in-home consultation.', features: ['2-hour session', 'Color & layout advice', 'Material suggestions', 'Written summary', 'Action plan'], popular: false },
    { name: 'Room Makeover', price: 'From $1,800', description: 'Complete single-room redesign.', features: ['Concept & mood board', '3D renderings', 'Furniture & decor sourcing', 'Installation & styling', 'Two revision rounds'], popular: true },
    { name: 'Full-Home Design', price: 'From $8,500', description: 'Whole-home design & management.', features: ['Complete home design', 'Space planning', 'Custom furniture options', 'Full project management', 'Contractor coordination'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the Aether Design Studio assistant. How can I help you today?",
    placeholder: "Ask about our design services...",
    knowledgeBase: [
      "We offer residential design, commercial design, room makeovers, color and material consultation, custom furniture, and 3D design renderings.",
      "Every project is unique. After our initial consultation, we provide a detailed proposal with a clear fee structure and estimated budget that works within your means.",
      "Yes, we incorporate existing furniture and decor you love and want to keep, then build the design around those pieces.",
      "Timelines vary by scope. A single-room makeover takes 4-6 weeks, while a full-home design may take 3-6 months.",
      "We offer e-design packages for remote clients, including a design concept, shopping list, and setup guide delivered digitally.",
      "We offer full project management including contractor coordination, delivery scheduling, and final installation.",
      "Our design process includes discovery consultation, concept and design, sourcing and coordination, and installation and reveal.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are Monday through Friday 9am to 6pm, and Saturday by appointment.",
      "We have 12+ years of experience, completed over 340 projects, and won 15+ design awards with a 4.9-star average rating.",
    ],
  },
};
