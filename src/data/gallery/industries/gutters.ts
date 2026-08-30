import {
  Droplets,
  Cloud,
  ShieldCheck,
  GitBranch,
  Waves,
  Leaf,
  Wrench,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
  Search,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const guttersConfig: IndustryConfig = {
  id: 'gutters',
  industryName: 'Gutters',
  businessName: 'FlowGuard Gutters',
  tagline: 'Protect Your Home From Top to Bottom.',
  heroTitle: 'Professional Gutter Installation & Maintenance',
  heroSubtitle:
    'Keep water away from your foundation with seamless gutters, gutter guards, and expert maintenance. We install, clean, and repair gutter systems that protect your home for decades.',
  phone: '(555) 472-9913',
  email: 'info@flowguardgutters.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Sat 7am-6pm',
  yearsExperience: '16+',
  licenseNumber: 'GT-6291047',

  colors: {
    primary: '#0F766E',
    primaryDark: '#115E59',
    primaryLight: '#CCFBF1',
    accent: '#B45309',
    background: '#FFFFFF',
    surface: '#F0FDFA',
    text: '#042F2E',
    textMuted: '#5B7B78',
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

  heroImage:
    'https://images.pexels.com/photos/11698047/pexels-photo-11698047.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'Licensed & Insured • Free Estimates',
  ctaPrimary: 'Get Free Quote',
  ctaSecondary: 'View Services',

  stats: [
    { value: '16+', label: 'Years Experience' },
    { value: '5,400+', label: 'Gutters Installed' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '100%', label: 'Satisfaction Guarantee' },
  ],

  services: [
    {
      icon: Waves,
      title: 'Gutter Installation',
      description:
        'Custom-fit seamless gutter installation in aluminum, copper, and steel. We measure on-site and fabricate to your home for a perfect, leak-free fit.',
      features: ['Aluminum gutters', 'Copper gutters', 'Steel gutters', 'Custom colors'],
    },
    {
      icon: Cloud,
      title: 'Gutter Cleaning',
      description:
        'Thorough gutter and downspout cleaning that removes leaves, debris, and clogs. Protect your home from water damage and extend gutter life.',
      features: ['Debris removal', 'Downspout flushing', 'Flow testing', 'Before & after photos'],
    },
    {
      icon: ShieldCheck,
      title: 'Gutter Guards',
      description:
        'Premium gutter guard installation that keeps leaves and debris out while letting water flow freely. Stop climbing ladders every season.',
      features: ['Mesh guards', 'Reverse-curve guards', 'Micro-mesh filters', 'Lifetime warranty options'],
    },
    {
      icon: GitBranch,
      title: 'Downspout Extensions',
      description:
        'Direct water away from your foundation with properly sized and positioned downspout extensions. Prevent erosion, basement leaks, and structural damage.',
      features: ['Above-ground extensions', 'Underground drains', 'Splash blocks', 'Pop-up emitters'],
    },
    {
      icon: Droplets,
      title: 'Seamless Gutters',
      description:
        'On-site fabricated seamless gutters with no joints to leak. Continuous runs up to 150 feet mean fewer weak points and a cleaner look.',
      features: ['On-site fabrication', 'No leak-prone seams', '5" & 6" profiles', '20+ color options'],
    },
    {
      icon: Wrench,
      title: 'Gutter Repair',
      description:
        'Fast, reliable gutter repair for leaks, sagging, loose fasteners, and damaged sections. We fix the problem before it becomes a costly one.',
      features: ['Leak sealing', 'Re-securing sagging gutters', 'Hanger replacement', 'Downspout repair'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Seamless Specialists',
      description:
        'We fabricate seamless gutters on-site for a perfect fit. No joints, no leaks, no weak points — just clean, continuous water management.',
    },
    {
      icon: Clock,
      title: 'Same-Day Service',
      description:
        'Most installations and repairs are completed in a single day. We respect your time and your property, leaving everything clean and working.',
    },
    {
      icon: Users,
      title: 'Foundation Protection Focus',
      description:
        'We do not just install gutters — we engineer water flow away from your foundation. Proper sizing, slope, and drainage protect your home for decades.',
    },
    {
      icon: ThumbsUp,
      title: '20-Year Warranty',
      description:
        'Our seamless gutters come with a 20-year warranty on materials and workmanship. If anything fails, we fix it — no questions asked.',
    },
  ],
  whyUsTitle: 'Why Homeowners Choose FlowGuard Gutters',
  whyUsSubtitle:
    'Seamless gutters, expert installation, and water management that protects your home from top to bottom.',

  process: [
    {
      step: '01',
      title: 'Free Inspection',
      description:
        'We inspect your roofline, measure for seamless gutters, and assess drainage. You get a clear recommendation and upfront quote.',
    },
    {
      step: '02',
      title: 'Color & Style Selection',
      description:
        'Choose from 20+ colors and multiple profiles to match your home. We help you pick the right size and material for your climate.',
    },
    {
      step: '03',
      title: 'On-Site Fabrication',
      description:
        'Our mobile machine extrudes seamless gutters to exact lengths right at your home. No seams, no waiting, no measuring errors.',
    },
    {
      step: '04',
      title: 'Installation & Cleanup',
      description:
        'We install, test water flow, secure downspouts, and clean up thoroughly. Your new gutters are ready to work the moment we leave.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'From inspection to installation in four simple steps.',

  testimonials: [
    {
      name: 'Patricia M.',
      location: 'Lakeside',
      rating: 5,
      text: 'After FlowGuard installed seamless gutters and guards, I have not had to climb a ladder once. No more clogs, no more overflow. The crew was fast and professional. Highly recommend.',
    },
    {
      name: 'Steven K.',
      location: 'Pine Valley',
      rating: 5,
      text: 'They fixed the downspout drainage that was flooding my basement every storm. The underground extension works perfectly and the yard stays dry. Wish I had called them years ago.',
    },
    {
      name: 'Diane R.',
      location: 'Eastbrook',
      rating: 5,
      text: 'The copper gutters they installed are absolutely beautiful and the craftsmanship is top-notch. They took the time to explain the maintenance and the 20-year warranty gave me real peace of mind.',
    },
  ],
  testimonialsTitle: 'What Our Clients Say',
  testimonialsSubtitle: 'Dry foundations and happy homeowners are what we do best.',

  faqs: [
    {
      question: 'How often should gutters be cleaned?',
      answer:
        'Twice a year — once in spring and once in fall. Homes with many trees may need cleaning three or four times annually. Gutter guards can reduce cleaning to once every few years.',
    },
    {
      question: 'What are seamless gutters and why are they better?',
      answer:
        'Seamless gutters are extruded on-site in one continuous length, so there are no joints or seams except at corners and downspouts. Fewer seams mean fewer leaks and a cleaner appearance.',
    },
    {
      question: 'Do gutter guards really work?',
      answer:
        'Yes, quality gutter guards dramatically reduce debris buildup. Micro-mesh guards block even pine needles. They do not make gutters maintenance-free, but they cut cleaning from twice a year to once every few years.',
    },
    {
      question: 'How long does gutter installation take?',
      answer:
        'Most residential installations are completed in one day. Larger homes or complex rooflines may take two days. We clean up thoroughly and test water flow before we leave.',
    },
    {
      question: 'What size gutters do I need?',
      answer:
        'Standard homes use 5-inch gutters. Larger roofs, steep pitches, or areas with heavy rainfall benefit from 6-inch gutters. We assess your roof size, pitch, and local rainfall to recommend the right size.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about our gutter services.',

  serviceAreas: [
    { name: 'Lakeside' },
    { name: 'Pine Valley' },
    { name: 'Eastbrook' },
    { name: 'Downtown Core' },
    { name: 'Midtown' },
    { name: 'Riverside' },
    { name: 'Uptown' },
    { name: 'Westgate' },
  ],
  serviceAreasTitle: 'Communities We Proudly Serve',

  contactTitle: 'Get Your Free Gutter Estimate',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day with a custom quote.',

  galleryTitle: 'Our Recent Gutter Projects',
  gallerySubtitle: 'See the FlowGuard Gutters difference.',
  galleryImages: [
    'https://images.pexels.com/photos/11698047/pexels-photo-11698047.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/1390478/pexels-photo-1390478.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/209266/pexels-photo-209266.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Gutter specialists who protect your home one seamless run at a time.',
  team: [
    { name: 'Hank Morrison', role: 'Installation Lead', bio: 'Hank runs our seamless gutter fabrication and installation crews with 16 years of hands-on experience.' },
    { name: 'Lori Chen', role: 'Customer Coordinator', bio: 'Lori handles scheduling, estimates, and client communication to keep every project smooth and on time.' },
    { name: 'Ricky Adams', role: 'Maintenance Technician', bio: 'Ricky leads our cleaning and repair teams, keeping existing gutter systems flowing and leak-free.' },
  ],

  pricingTitle: 'Gutter Service Packages',
  pricingSubtitle: 'Transparent pricing with no hidden fees.',
  pricing: [
    { name: 'Gutter Cleaning', price: 'From $149', description: 'Single-visit cleaning and flush.', features: ['Debris removal', 'Downspout flushing', 'Flow test', 'Before & after photos'], popular: false },
    { name: 'Seamless Installation', price: 'From $8.50/ft', description: 'Custom seamless gutter installation.', features: ['On-site fabrication', '5" or 6" profile', '20+ color options', 'Downspouts included', '20-year warranty'], popular: true },
    { name: 'Guard Package', price: 'From $12/ft', description: 'Gutters plus premium guards.', features: ['Seamless gutters', 'Micro-mesh guards', 'Downspout extensions', 'Lifetime guard warranty', 'Annual inspection'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the FlowGuard Gutters assistant. How can I help you today?",
    placeholder: "Ask about our gutter services...",
    knowledgeBase: [
      "We offer gutter installation, gutter cleaning, gutter guards, downspout extensions, seamless gutters, and gutter repair.",
      "Gutters should be cleaned twice a year, in spring and fall. Homes with many trees may need cleaning three or four times annually.",
      "Seamless gutters are extruded on-site in one continuous length with no joints, meaning fewer leaks and a cleaner appearance.",
      "Yes, quality gutter guards dramatically reduce debris buildup. Micro-mesh guards cut cleaning from twice a year to once every few years.",
      "Most residential gutter installations are completed in one day. Larger homes or complex rooflines may take two days.",
      "Standard homes use 5-inch gutters. Larger roofs, steep pitches, or heavy rainfall areas benefit from 6-inch gutters.",
      "Our seamless gutters come with a 20-year warranty on materials and workmanship.",
      "We serve Lakeside, Pine Valley, Eastbrook, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are Monday through Saturday, 7am to 6pm.",
      "We have 16+ years of experience and have installed over 5,400 gutters.",
    ],
  },
};
