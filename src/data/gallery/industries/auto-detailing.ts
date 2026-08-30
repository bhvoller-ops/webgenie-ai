import {
  Car,
  SprayCan,
  Sparkles,
  Shield,
  Star,
  Wrench,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
} from 'lucide-react';
import type { IndustryConfig } from '../types';
import { SITE_ORIGIN } from '@/lib/site-url';

export const autoDetailingConfig: IndustryConfig = {
  id: 'auto-detailing',
  industryName: 'Auto Detailing',
  businessName: 'ShowroomShine Detailing',
  tagline: 'Showroom Shine. Every Single Time.',
  heroTitle: 'Your Car, Better Than the Day You Bought It',
  heroSubtitle:
    'Professional auto detailing that restores, protects, and turns heads. From quick refreshes to full ceramic coatings — we treat your vehicle like a showpiece.',
  phone: '(555) 456-7890',
  email: 'info@showroomshinedetailing.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Sat 7am-7pm | Sun By Appointment',
  yearsExperience: '8+',
  licenseNumber: 'AD-6172839',

  colors: {
    primary: '#B91C1C',
    primaryDark: '#991B1B',
    primaryLight: '#FEE2E2',
    accent: '#1E3A5F',
    background: '#FFFFFF',
    surface: '#FFF7F7',
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
  heroBadge: 'Licensed & Insured • Mobile Service Available',
  ctaPrimary: 'Book Detailing',
  ctaSecondary: 'View Services',

  stats: [
    { value: '8+', label: 'Years Experience' },
    { value: '4,500+', label: 'Cars Detailed' },
    { value: '5.0★', label: 'Average Rating' },
    { value: '100%', label: 'Satisfaction Guarantee' },
  ],

  services: [
    {
      icon: SprayCan,
      title: 'Exterior Detailing',
      description:
        'Hand wash, decontamination, clay bar, and paint correction that removes swirls and restores a deep, glossy shine.',
      features: ['Hand wash', 'Clay bar treatment', 'Paint correction', 'Tire & wheel detail'],
    },
    {
      icon: Sparkles,
      title: 'Interior Detailing',
      description:
        'Deep cleaning of seats, carpets, dash, and glass — steam, extraction, and conditioning that makes the cabin feel new.',
      features: ['Steam cleaning', 'Carpet extraction', 'Leather conditioning', 'Glass restoration'],
    },
    {
      icon: Car,
      title: 'Full Detail',
      description:
        'The complete inside-and-out transformation — our most popular package for vehicles that need the full showroom treatment.',
      features: ['Exterior & interior', 'Paint correction', 'Engine bay clean', 'Trim restoration'],
    },
    {
      icon: Shield,
      title: 'Ceramic Coating',
      description:
        'Long-lasting ceramic protection that bonds to your paint for years of UV, water, and contaminant resistance with insane gloss.',
      features: ['Multi-year protection', 'Hydrophobic finish', 'UV protection', 'Scratch resistance'],
    },
    {
      icon: Star,
      title: 'Headlight Restoration',
      description:
        'Cloudy, yellow headlights restored to crystal clarity — improving night visibility and the look of your vehicle instantly.',
      features: ['Oxidation removal', 'Clarity restoration', 'UV sealant', 'Night visibility boost'],
    },
    {
      icon: Wrench,
      title: 'Mobile Detailing',
      description:
        'We bring the full detailing experience to your driveway or office. Water and power on-board — you do not lift a finger.',
      features: ['On-site service', 'Self-contained unit', 'Home or office', 'Flexible scheduling'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Licensed & Insured',
      description:
        'Fully licensed (AD-6172839) and insured. Whether we detail at our shop or your driveway, your vehicle is in professional hands.',
    },
    {
      icon: Clock,
      title: 'On-Time, Every Time',
      description:
        'We respect your schedule. Appointments start when we say they will, and we text you when your vehicle is ready for pickup.',
    },
    {
      icon: Users,
      title: 'Trained Detailers',
      description:
        'Our team is trained in paint correction, ceramic coating application, and interior care. We use premium, vehicle-safe products.',
    },
    {
      icon: ThumbsUp,
      title: 'Satisfaction Guarantee',
      description:
        'If you are not thrilled with the results, we will re-detail the affected area within 48 hours at no charge. No questions asked.',
    },
  ],
  whyUsTitle: 'Why Drivers Choose ShowroomShine',
  whyUsSubtitle:
    'We obsess over the details so your vehicle looks its absolute best.',

  process: [
    {
      step: '01',
      title: 'Book & Assess',
      description:
        'Reserve your slot and tell us about your vehicle. On arrival, we assess the paint, interior, and any problem areas.',
    },
    {
      step: '02',
      title: 'Tailored Plan',
      description:
        'Based on the assessment, we confirm the services and products that will deliver the best results for your vehicle.',
    },
    {
      step: '03',
      title: 'Expert Detailing',
      description:
        'Our detailers get to work — hand washing, correcting, cleaning, and protecting with premium products and proven techniques.',
    },
    {
      step: '04',
      title: 'Inspection & Handoff',
      description:
        'We do a final inspection under proper lighting, walk you through the results, and provide care tips to keep it looking fresh.',
    },
  ],
  processTitle: 'Our Detailing Process',
  processSubtitle: 'A meticulous approach from assessment to final shine.',

  testimonials: [
    {
      name: 'Devin S.',
      location: 'Motor City',
      rating: 5,
      text: 'My black SUV was covered in swirl marks. After a full detail and paint correction, it looks better than it did at the dealership. The gloss is unreal. Worth every dollar.',
    },
    {
      name: 'Aisha M.',
      location: 'Highland Acres',
      rating: 5,
      text: 'They came to my office and detailed my car in the parking lot. Came out to a spotless interior and a gleaming exterior. The mobile service is a game-changer for busy parents.',
    },
    {
      name: 'Craig T.',
      location: 'Vista Ridge',
      rating: 5,
      text: 'Got a ceramic coating on my new truck. Six months later water still beads like crazy and it looks freshly waxed every time it rains. Professional and knowledgeable crew.',
    },
  ],
  testimonialsTitle: 'What Our Customers Say',
  testimonialsSubtitle: 'Real reviews from drivers who love their cars.',

  faqs: [
    {
      question: 'How long does a full detail take?',
      answer:
        'A full detail typically takes 3-5 hours depending on vehicle size and condition. Larger vehicles like SUVs and trucks, or cars with heavy soiling, may take longer. We will give you an accurate estimate when you book.',
    },
    {
      question: 'What is ceramic coating and is it worth it?',
      answer:
        'Ceramic coating is a liquid polymer applied to your paint that bonds chemically, creating a durable protective layer. It lasts 2-5 years, resists UV, water, and contaminants, and makes cleaning far easier. For most owners who keep their cars, it is absolutely worth it.',
    },
    {
      question: 'Do you offer mobile detailing at my home or office?',
      answer:
        'Yes. Our mobile detailing unit is fully self-contained with water and power on-board. We can detail your vehicle in your driveway or office parking lot, as long as we have space to work around the vehicle.',
    },
    {
      question: 'Can you remove scratches and swirl marks?',
      answer:
        'Most light scratches and swirl marks can be removed with our paint correction process. Deeper scratches that have gone through the clear coat cannot be fully removed, but we can minimize their appearance. We will assess and be honest about what is possible.',
    },
    {
      question: 'How often should I get my car detailed?',
      answer:
        'For daily drivers, we recommend a full detail every 4-6 months with maintenance washes in between. Vehicles with ceramic coating need less frequent detailing but still benefit from periodic decontamination washes. We will set up a schedule that fits your vehicle.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know before booking a detail.',

  serviceAreas: [
    { name: 'Motor City' },
    { name: 'Highland Acres' },
    { name: 'Vista Ridge' },
    { name: 'Crestline' },
    { name: 'Summit Drive' },
    { name: 'Ironwood' },
    { name: 'Sterling Park' },
    { name: 'Grandview' },
  ],
  serviceAreasTitle: 'Communities We Proudly Detail',

  contactTitle: 'Book Your Detailing Appointment',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day to confirm your slot.',

  galleryTitle: 'Our Recent Details',
  gallerySubtitle: 'See the transformations from dull to showroom shine.',
  galleryImages: ['/hero-restoration.webp', '/hero-cleaning.webp', '/hero-fencing.webp'],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'The detailers who make your car shine.',
  team: [
    { name: 'Tony Rizzuto', role: 'Founder & Master Detailer', bio: '8+ years detailing everything from daily drivers to exotics. Tony started ShowroomShine to bring show-quality care to every vehicle.' },
    { name: 'Brianna Holt', role: 'Operations Manager', bio: 'Keeps the schedule tight and the shop running smoothly. Brianna is your point of contact for bookings and special requests.' },
    { name: 'Marcus Lee', role: 'Ceramic Coating Specialist', bio: 'Certified in multi-layer ceramic coating application. Marcus handles our most advanced paint protection jobs.' },
  ],

  pricingTitle: 'Detailing Service Packages',
  pricingSubtitle: 'Transparent pricing. Final quote depends on vehicle size and condition.',
  pricing: [
    { name: 'Express Detail', price: 'From $79', description: 'A quick refresh for a clean, sharp look.', features: ['Hand wash & dry', 'Tire & wheel clean', 'Interior vacuum', 'Glass cleaning', 'Quick wax'], popular: false },
    { name: 'Full Detail', price: 'From $199', description: 'Inside and out, the complete transformation.', features: ['Exterior wash & decontaminate', 'Paint correction', 'Interior deep clean', 'Leather & trim conditioning', 'Engine bay clean', 'Sealant protection'], popular: true },
    { name: 'Ceramic Coating', price: 'From $899', description: 'Multi-year paint protection with insane gloss.', features: ['Full detail included', 'Paint correction', 'Multi-layer ceramic coating', '2-5 year protection', 'Hydrophobic finish', 'Maintenance wash kit'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the ShowroomShine Detailing assistant. How can I help your car today?",
    placeholder: "Ask about detailing, pricing, or booking...",
    knowledgeBase: [
      "We offer exterior detailing, interior detailing, full details, ceramic coating, headlight restoration, and mobile detailing.",
      "We are licensed (AD-6172839) and fully insured, whether we detail at our shop or your location.",
      "A full detail typically takes 3-5 hours depending on vehicle size and condition.",
      "Ceramic coating is a durable protective layer that lasts 2-5 years, resists UV and water, and makes cleaning much easier.",
      "Yes, we offer fully mobile detailing with on-board water and power at your home or office.",
      "Most light scratches and swirl marks can be removed with our paint correction process.",
      "We recommend a full detail every 4-6 months for daily drivers, with maintenance washes in between.",
      "We serve Motor City, Highland Acres, Vista Ridge, Crestline, Summit Drive, Ironwood, Sterling Park, and Grandview.",
      "Our hours are Monday-Saturday 7am-7pm, with Sunday appointments available on request.",
      "We have 8+ years of experience, detailed over 4,500 cars, and hold a perfect 5.0-star average rating.",
    ],
  },
};
