import {
  LayoutGrid,
  Home,
  Building2,
  Sun,
  Shield,
  Wrench,
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

export const windowsDoorsConfig: IndustryConfig = {
  id: 'windows-doors',
  industryName: 'Windows & Doors',
  businessName: 'ClearView Windows & Doors',
  tagline: 'Clear Views. Lasting Quality. Every Opening.',
  heroTitle: 'Your Trusted Local Window & Door Experts',
  heroSubtitle:
    'From energy-efficient window replacements to custom entry doors, our certified installers deliver precision craftsmanship that enhances comfort, security, and curb appeal.',
  phone: '(555) 456-7890',
  email: 'info@clearviewwindows.com',
  serviceArea: 'Greater Metro Area & Surrounding Counties',
  hours: 'Mon-Fri 8am-6pm | Sat 9am-4pm',
  yearsExperience: '20+',
  licenseNumber: 'WD-9384756',

  colors: {
    primary: '#0284C7',
    primaryDark: '#075985',
    primaryLight: '#E0F2FE',
    accent: '#92400E',
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
  heroBadge: 'Licensed & Insured • Free In-Home Consultations',
  ctaPrimary: 'Get Free Estimate',
  ctaSecondary: 'View Services',

  stats: [
    { value: '20+', label: 'Years Experience' },
    { value: '7,500+', label: 'Installations Completed' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '100%', label: 'Satisfaction Guarantee' },
  ],

  services: [
    {
      icon: LayoutGrid,
      title: 'Window Installation',
      description:
        'Professional window installation for new construction and additions, with precise fitting, flashing, and insulation for lasting performance.',
      features: ['Double & triple pane', 'Casement & awning', 'Bay & bow windows', 'Custom sizing'],
    },
    {
      icon: Home,
      title: 'Door Installation',
      description:
        'Entry, patio, and interior door installation that improves security, energy efficiency, and the look of your home inside and out.',
      features: ['Entry doors', 'Patio doors', 'French doors', 'Interior doors'],
    },
    {
      icon: Building2,
      title: 'Window Replacement',
      description:
        'Full window replacement for older homes with drafty, foggy, or failing windows, upgrading comfort and energy efficiency in days.',
      features: ['Full-frame replacement', 'Insert windows', 'Energy Star rated', 'Low-E glass'],
    },
    {
      icon: Sun,
      title: 'Energy Efficient',
      description:
        'Energy-efficient window and door upgrades with advanced glazing and insulation that lower your utility bills and improve comfort.',
      features: ['Low-E coatings', 'Argon gas fill', 'Energy Star certified', 'UV protection'],
    },
    {
      icon: Shield,
      title: 'Custom Glass',
      description:
        'Custom glass solutions including decorative inserts, transoms, and specialty shapes that add character and natural light to any room.',
      features: ['Decorative glass', 'Transoms & sidelights', 'Specialty shapes', 'Frosted & textured'],
    },
    {
      icon: Wrench,
      title: 'Repair',
      description:
        'Window and door repair for broken seals, cracked glass, sticking sashes, and hardware failures that extend the life of your openings.',
      features: ['Glass replacement', 'Seal repair', 'Hardware replacement', 'Sash & track repair'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Licensed & Insured',
      description:
        'Fully licensed (WD-9384756) and insured for your protection. Our installers are certified and trained on all major window and door brands.',
    },
    {
      icon: Clock,
      title: 'On-Time, Every Time',
      description:
        'We respect your schedule. Detailed timelines, daily progress updates, and crews that show up when we say they will and finish on time.',
    },
    {
      icon: Users,
      title: 'Local Family Business',
      description:
        'A family-owned company serving our community for over 20 years. We treat every home like it is our own.',
    },
    {
      icon: ThumbsUp,
      title: 'Workmanship Guarantee',
      description:
        'Our installation is backed by a 10-year workmanship warranty on top of manufacturer product warranties for total peace of mind.',
    },
  ],
  whyUsTitle: 'Why Homeowners Choose ClearView',
  whyUsSubtitle:
    'We have built our reputation on precision, quality, and lasting results. Here is what sets us apart.',

  process: [
    {
      step: '01',
      title: 'Free Consultation',
      description:
        'We visit your home, measure every opening, discuss your goals and budget, and show you product samples — no pressure, no obligation.',
    },
    {
      step: '02',
      title: 'Detailed Estimate',
      description:
        'You receive a clear, itemized quote with product options, timeline, and warranty info within 48 hours of your consultation.',
    },
    {
      step: '03',
      title: 'Expert Installation',
      description:
        'Our certified crew arrives on schedule, protects your home, and installs every window and door to manufacturer specifications.',
    },
    {
      step: '04',
      title: 'Final Walkthrough',
      description:
        'We clean up thoroughly, test every opening for smooth operation, and hand over your warranty documentation.',
    },
  ],
  processTitle: 'Our Proven Process',
  processSubtitle: 'From first consultation to final inspection, we make window and door replacement stress-free.',

  testimonials: [
    {
      name: 'Jennifer M.',
      location: 'Oakwood Heights',
      rating: 5,
      text: 'We replaced all 18 windows in our 1970s home with energy-efficient units. The difference in comfort and quiet is incredible, and our heating bill dropped almost 30%. The crew was meticulous and left the house spotless.',
    },
    {
      name: 'Robert K.',
      location: 'Cedar Valley',
      rating: 5,
      text: 'ClearView installed a custom fiberglass entry door with sidelights and a transom. The craftsmanship is outstanding — it looks like it came with the house. They measured three times and installed once. True professionals.',
    },
    {
      name: 'Sandra T.',
      location: 'Maple Ridge',
      rating: 5,
      text: 'Two of our windows had broken seals and were fogging up. I was sure I needed full replacements, but they were able to just replace the glass and save me thousands. Honest advice and clean work. I highly recommend them.',
    },
  ],
  testimonialsTitle: 'What Our Neighbors Say',
  testimonialsSubtitle: 'Real reviews from real homeowners we have served.',

  faqs: [
    {
      question: 'How do I know if I need window replacement or just repair?',
      answer:
        'Signs you may need replacement include drafts, foggy glass (broken seals), difficulty opening or closing, rotting frames, and windows over 20 years old. If only the glass is foggy, we can often replace just the glass unit. Our free consultation will give you honest options.',
    },
    {
      question: 'How much can I save on energy bills with new windows?',
      answer:
        'Energy Star-certified windows can reduce heating and cooling costs by 12-30% depending on your current windows and climate. Most homeowners see the biggest improvement in comfort and noise reduction, with energy savings paying back over time.',
    },
    {
      question: 'How long does a typical window replacement take?',
      answer:
        'A standard window takes about 30-60 minutes to install. A full-home replacement of 10-20 windows is typically completed in 1-2 days. We provide a specific timeline in your estimate and keep you updated throughout the project.',
    },
    {
      question: 'What warranties do you offer?',
      answer:
        'We provide a 10-year workmanship warranty on our installation labor, plus manufacturer product warranties that typically range from 20 years to lifetime on the glass, frame, and hardware depending on the product you choose.',
    },
    {
      question: 'Are you licensed and insured?',
      answer:
        'Absolutely. We are fully licensed (WD-9384756) and carry both liability insurance and workers compensation. We are happy to provide documentation before any work begins.',
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

  contactTitle: 'Get Your Free Window & Door Estimate',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day — no pressure, no obligation.',

  galleryTitle: 'Our Recent Window & Door Projects',
  gallerySubtitle: 'See the quality of our work across the region.',
  galleryImages: ['/hero-restoration.webp', '/hero-painting.webp', '/hero-salon.webp'],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'The experienced professionals behind every installation we complete.',
  team: [
    { name: 'Paul Anderson', role: 'Founder & Master Installer', bio: '20+ years in window and door installation. Paul started ClearView after years as a lead installer and built a team known for precision and care.' },
    { name: 'Maya Rodriguez', role: 'Project Manager', bio: 'Ensures every project runs on time and on budget. Maya is your main point of contact from consultation to final walkthrough.' },
    { name: 'Kevin Brooks', role: 'Lead Installer', bio: 'Certified in all major window and door brands. Kevin leads our installation crews with meticulous attention to detail and clean workmanship.' },
  ],

  pricingTitle: 'Window & Door Service Packages',
  pricingSubtitle: 'Transparent pricing with no hidden fees. Free in-home consultations for every project.',
  pricing: [
    { name: 'Glass Replacement', price: 'From $199', description: 'Replace foggy or cracked glass in existing window frames.', features: ['Single or double pane', 'Seal repair', 'Low-E glass option', '5-year warranty'], popular: false },
    { name: 'Window Replacement', price: 'From $650', description: 'Full window replacement with energy-efficient units.', features: ['Energy Star rated', 'Low-E & argon fill', 'Full-frame or insert', '10-year workmanship warranty', 'Manufacturer warranty'], popular: true },
    { name: 'Full Home Package', price: 'From $8,500', description: 'Complete home window and door replacement package.', features: ['10+ windows', 'Entry door included', 'Custom sizing', '10-year workmanship warranty', 'Volume discount'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the ClearView Windows & Doors assistant. How can I help you today?",
    placeholder: "Ask about our window and door services...",
    knowledgeBase: [
      "We offer window installation, door installation, window replacement, energy-efficient upgrades, custom glass, and window and door repair services.",
      "We are licensed (WD-9384756) and fully insured with liability and workers compensation coverage.",
      "We offer free in-home consultations with product samples, measurements, and no obligation.",
      "Energy Star-certified windows can reduce heating and cooling costs by 12-30% depending on your current windows and climate.",
      "A standard window takes 30-60 minutes to install. A full-home replacement of 10-20 windows is typically completed in 1-2 days.",
      "We provide a 10-year workmanship warranty on installation plus manufacturer warranties ranging from 20 years to lifetime.",
      "Signs you may need replacement: drafts, foggy glass, difficulty opening, rotting frames, or windows over 20 years old.",
      "We serve Oakwood Heights, Cedar Valley, Maple Ridge, Pinebrook, Riverside, Highland Park, Greenwood, and Brookfield.",
      "Our hours are Mon-Fri 8am-6pm and Sat 9am-4pm.",
      "We have 20+ years of experience and have completed over 7,500 window and door installations.",
    ],
  },
};
