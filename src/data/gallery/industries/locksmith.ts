import {
  KeyRound,
  Lock,
  Building,
  ShieldCheck,
  Car,
  LockKeyhole,
  Copy,
  Smartphone,
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

export const locksmithConfig: IndustryConfig = {
  id: 'locksmith',
  industryName: 'Locksmith',
  businessName: 'SecureKey Locksmith',
  tagline: 'Locked Out? We Are On the Way.',
  heroTitle: 'Fast, Reliable Locksmith Service 24/7',
  heroSubtitle:
    'Emergency lockout help, residential and commercial lock installation, automotive service, and smart lock upgrades. Licensed, bonded, and insured — with transparent pricing and a 20-minute average response time.',
  phone: '(555) 902-4471',
  email: 'dispatch@securekey.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: '24/7 Emergency Service',
  yearsExperience: '18+',
  licenseNumber: 'LK-7712-18',

  colors: {
    primary: '#1E40AF',
    primaryDark: '#1E3A8A',
    primaryLight: '#DBEAFE',
    accent: '#DC2626',
    background: '#FFFFFF',
    surface: '#EFF6FF',
    text: '#0A0F1E',
    textMuted: '#5A6478',
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

  heroImage: `${BASE_URL}264819/pexels-photo-264819.jpeg?auto=compress&cs=tinysrgb&w=1200`,
  heroBadge: 'Licensed • Bonded • Insured',
  ctaPrimary: 'Call for Emergency Service',
  ctaSecondary: 'View Services',

  stats: [
    { value: '18+', label: 'Years Experience' },
    { value: '20 min', label: 'Avg. Response Time' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '24/7', label: 'Emergency Service' },
  ],

  services: [
    {
      icon: KeyRound,
      title: 'Emergency Lockout',
      description:
        'Locked out of your home, business, or car? We dispatch a technician immediately and get you back inside fast, with no damage to your locks or doors.',
      features: ['Home lockouts', 'Car lockouts', 'Business lockouts', 'Non-destructive entry'],
    },
    {
      icon: Lock,
      title: 'Residential Locks',
      description:
        'Lock installation, rekeying, and upgrades for your home. We install deadbolts, smart locks, and high-security locks to keep your family safe.',
      features: ['Lock installation', 'Rekeying', 'Deadbolt upgrades', 'Security assessment'],
    },
    {
      icon: Building,
      title: 'Commercial Locks',
      description:
        'Master key systems, access control, and high-traffic commercial hardware. We secure your business with solutions that scale and stand up to daily use.',
      features: ['Master key systems', 'Access control', 'Panic bars', 'File cabinet locks'],
    },
    {
      icon: Car,
      title: 'Automotive Locksmith',
      description:
        'Lost your car key or locked out? We cut and program transponder keys, remotes, and smart keys for most makes and models — at a fraction of dealer pricing.',
      features: ['Transponder keys', 'Key fob programming', 'Ignition repair', 'Spare key cutting'],
    },
    {
      icon: LockKeyhole,
      title: 'Safe Installation',
      description:
        'Sales, installation, and combination changes for home and business safes. We help you choose the right safe and secure it properly to protect what matters.',
      features: ['Safe sales', 'Professional installation', 'Combination changes', 'Safe opening'],
    },
    {
      icon: Smartphone,
      title: 'Key Duplication & Smart Locks',
      description:
        'Duplicate any key and upgrade to smart locks you control from your phone. Keyless entry, remote access, and integration with your smart home.',
      features: ['Key duplication', 'Smart lock install', 'App-based access', 'Smart home integration'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Licensed, Bonded & Insured',
      description:
        'Every technician is licensed, background-checked, and fully insured. Your property and your security are in trustworthy, accountable hands.',
    },
    {
      icon: Clock,
      title: '20-Minute Average Response',
      description:
        'For emergencies, we dispatch immediately and arrive fast. We track our response times and hold ourselves to a 20-minute average across our service area.',
    },
    {
      icon: Users,
      title: 'Upfront, Honest Pricing',
      description:
        'You get a price quote before we start work — no surprise fees, no bait-and-switch. The price we quote is the price you pay, every time.',
    },
    {
      icon: ThumbsUp,
      title: 'Non-Destructive Methods',
      description:
        'We open locks without damaging them whenever possible. Our technicians are trained in precision techniques that protect your hardware and save you money.',
    },
  ],
  whyUsTitle: 'Why Customers Trust SecureKey',
  whyUsSubtitle:
    'Fast response, honest pricing, and technicians who treat your security like their own.',

  process: [
    {
      step: '01',
      title: 'Call or Book Online',
      description:
        'Call us anytime for emergencies or book a service online. We confirm your details and give you an upfront price quote.',
    },
    {
      step: '02',
      title: 'Fast Dispatch',
      description:
        'For emergencies, we dispatch the nearest technician immediately. For scheduled work, we arrive within your chosen time window.',
    },
    {
      step: '03',
      title: 'Professional Service',
      description:
        'Our licensed technician completes the work efficiently using non-destructive methods whenever possible. You see exactly what is being done.',
    },
    {
      step: '04',
      title: 'Secure & Satisfied',
      description:
        'We test every lock and key before we leave, answer your questions, and back our work with a service warranty. You are secure and satisfied.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'From locked out to locked in — fast, simple, and secure.',

  testimonials: [
    {
      name: 'Rachel T.',
      location: 'Brookside',
      rating: 5,
      text: 'Locked out of my house at 11pm with a sleeping toddler. They arrived in 18 minutes, got me in without damaging the lock, and the price was exactly what they quoted on the phone. Lifesavers.',
    },
    {
      name: 'David O.',
      location: 'Fairfield',
      rating: 5,
      text: 'I needed a master key system for my small business and they did a fantastic job. Professional, knowledgeable, and they explained all my options clearly. The access control setup has been flawless.',
    },
    {
      name: 'Sandra K.',
      location: 'Eastside',
      rating: 5,
      text: 'Lost my only car key and the dealer wanted $600. SecureKey cut and programmed a new transponder key for less than half that and came to my driveway. Fast, fair, and friendly. Highly recommend.',
    },
  ],
  testimonialsTitle: 'What Our Customers Say',
  testimonialsSubtitle: 'Real emergencies, real solutions, real five-star reviews.',

  faqs: [
    {
      question: 'How fast can you get here for an emergency?',
      answer:
        'Our average emergency response time is 20 minutes across our service area. When you call, we give you an estimated arrival time and dispatch the nearest available technician immediately.',
    },
    {
      question: 'Do you give price quotes before starting work?',
      answer:
        'Yes. We provide an upfront price quote based on the service you need. The price we quote is the price you pay — no surprise fees or add-ons after the work is done.',
    },
    {
      question: 'Can you unlock my door without damaging the lock?',
      answer:
        'In most cases, yes. Our technicians are trained in non-destructive entry techniques. In rare cases of high-security or damaged locks, we will explain the situation and options before proceeding.',
    },
    {
      question: 'Do you make car keys with chips and remotes?',
      answer:
        'Yes. We cut and program transponder keys, key fobs, and smart keys for most makes and models. This is typically much faster and less expensive than going to the dealership.',
    },
    {
      question: 'Are your technicians licensed and insured?',
      answer:
        'Every SecureKey technician is licensed, background-checked, bonded, and fully insured. We carry liability insurance and back all our work with a service warranty.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Answers to common questions about our locksmith services.',

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

  contactTitle: 'Need a Locksmith? Call Anytime.',
  contactSubtitle:
    'For emergencies, call us 24/7. For scheduled service, fill out the form and we respond within one business day.',

  galleryTitle: 'Our Work',
  gallerySubtitle: 'Locks, safes, and smart security installations.',
  galleryImages: [
    `${BASE_URL}264819/pexels-photo-264819.jpeg?auto=compress&cs=tinysrgb&w=1200`,
    `${BASE_URL}264819/pexels-photo-264819.jpeg?auto=compress&cs=tinysrgb&w=1200`,
    `${BASE_URL}264819/pexels-photo-264819.jpeg?auto=compress&cs=tinysrgb&w=1200`,
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Licensed technicians who respond fast and work clean.',
  team: [
    { name: 'Robert Hayes', role: 'Owner & Master Locksmith', bio: 'Eighteen years in the trade and certified by the Associated Locksmiths of America. Robert founded SecureKey to bring fast, honest, professional locksmith service to the region.' },
    { name: 'Tony Morales', role: 'Lead Technician', bio: 'Our automotive specialist. Tony programs transponder keys and smart fobs for nearly every make and model and is known for his speed on emergency lockouts.' },
    { name: 'Karen Liu', role: 'Commercial Security Tech', bio: 'Designs and installs master key systems and access control for businesses. Karen holds certifications in high-security hardware and electronic access systems.' },
  ],

  pricingTitle: 'Service Pricing',
  pricingSubtitle: 'Transparent pricing with no hidden fees.',
  pricing: [
    { name: 'Service Call', price: 'From $39', description: 'Trip charge for non-emergency visits.', features: ['On-site assessment', 'Upfront quote', 'No obligation', 'Applied to service if hired'], popular: false },
    { name: 'Emergency Lockout', price: 'From $89', description: '24/7 emergency lockout service.', features: ['20-min avg response', 'Non-destructive entry', 'Home, car, or business', 'Upfront pricing', 'Licensed technician'], popular: true },
    { name: 'Lock Installation & Rekey', price: 'From $129', description: 'Residential or commercial lock work.', features: ['Lock installation', 'Rekeying service', 'Deadbolt upgrades', 'Smart lock install', 'Security assessment', 'Service warranty'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the SecureKey Locksmith assistant. How can I help you today?",
    placeholder: "Ask about our locksmith services...",
    knowledgeBase: [
      "We offer emergency lockout service, residential locks, commercial locks, automotive locksmith service, safe installation, and key duplication and smart lock installation.",
      "For emergencies, our average response time is 20 minutes across our service area. Call us anytime at (555) 902-4471.",
      "Yes, we provide an upfront price quote before starting any work. The price we quote is the price you pay, with no surprise fees.",
      "In most cases we can unlock your door without damaging the lock using non-destructive entry techniques.",
      "Yes, we cut and program transponder keys, key fobs, and smart keys for most makes and models, usually faster and cheaper than the dealership.",
      "Every technician is licensed, background-checked, bonded, and fully insured. We back all our work with a service warranty.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "We are available 24/7 for emergency service. For scheduled work, our office hours are Monday through Friday, 8am to 6pm.",
      "We have 18+ years of experience and a 20-minute average emergency response time.",
      "For emergency service, call us anytime at (555) 902-4471. For scheduled service, fill out our contact form and we respond within one business day.",
    ],
  },
};
