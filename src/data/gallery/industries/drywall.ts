import {
  Construction,
  PaintRoller,
  SprayCan,
  Volume2,
  Droplets,
  PanelTop,
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

export const drywallConfig: IndustryConfig = {
  id: 'drywall',
  industryName: 'Drywall',
  businessName: 'SmoothWall Pros',
  tagline: 'Flawless Walls. Seamless Finish.',
  heroTitle: 'Expert Drywall Installation & Repair',
  heroSubtitle:
    'From new construction to patch repairs and texture matching, our drywall specialists deliver smooth, seamless results. Clean work, tight deadlines, and a finish you will be proud to paint.',
  phone: '(555) 318-4470',
  email: 'info@smoothwallpros.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Sat 7am-6pm',
  yearsExperience: '14+',
  licenseNumber: 'DW-4718293',

  colors: {
    primary: '#6B7280',
    primaryDark: '#4B5563',
    primaryLight: '#F3F4F6',
    accent: '#B45309',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textMuted: '#6B7280',
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
    'https://images.pexels.com/photos/11427055/pexels-photo-11427055.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'Licensed & Insured • Free Estimates',
  ctaPrimary: 'Get Free Quote',
  ctaSecondary: 'View Services',

  stats: [
    { value: '14+', label: 'Years Experience' },
    { value: '3,200+', label: 'Projects Completed' },
    { value: '4.8★', label: 'Average Rating' },
    { value: '100%', label: 'Satisfaction Guarantee' },
  ],

  services: [
    {
      icon: Construction,
      title: 'Drywall Installation',
      description:
        'Complete drywall hanging and finishing for new construction, additions, and remodels. Straight walls, tight seams, and a Level 5 finish when you need it.',
      features: ['New construction', 'Remodels & additions', 'Level 4 & 5 finish', 'Moisture-resistant board'],
    },
    {
      icon: Wrench,
      title: 'Drywall Repair',
      description:
        'Expert patch repair for holes, cracks, water damage, and settling. We match texture and paint so seamlessly you will never know it was damaged.',
      features: ['Hole & crack repair', 'Texture matching', 'Seam & corner repair', 'Paint matching'],
    },
    {
      icon: PaintRoller,
      title: 'Texture & Finishing',
      description:
        'Knockdown, orange peel, smooth, or custom textures applied with precision. We match existing textures or create a fresh new look throughout.',
      features: ['Knockdown texture', 'Orange peel', 'Smooth finish', 'Custom textures'],
    },
    {
      icon: Volume2,
      title: 'Soundproofing',
      description:
        'Reduce noise between rooms and floors with professional soundproofing solutions. Acoustic insulation, resilient channels, and double-layer drywall.',
      features: ['Acoustic insulation', 'Resilient channels', 'Double-layer board', 'Sound-dampening compound'],
    },
    {
      icon: Droplets,
      title: 'Water Damage Repair',
      description:
        'Fast response to water-damaged drywall. We remove compromised material, dry the area, treat for mold, and restore the wall to like-new condition.',
      features: ['Damage assessment', 'Mold treatment', 'Replacement & finish', 'Insurance documentation'],
    },
    {
      icon: PanelTop,
      title: 'Ceiling Installation',
      description:
        'New ceilings, popcorn removal, and ceiling repair. Smooth ceilings brighten any room and add a modern, clean look to your home.',
      features: ['New ceilings', 'Popcorn removal', 'Ceiling repair', 'Smooth ceiling finish'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Certified Finishers',
      description:
        'Our crew is trained in every level of drywall finish, from Level 1 to Level 5. We deliver the smooth, seamless walls that make a house feel finished.',
    },
    {
      icon: Clock,
      title: 'Fast, Clean Work',
      description:
        'We respect your timeline and your home. Dust containment, daily cleanup, and efficient crews mean minimal disruption and a tidy jobsite.',
    },
    {
      icon: Users,
      title: 'Texture Matching Experts',
      description:
        'Whether it is knockdown, orange peel, or a custom blend, we match your existing texture so repairs disappear completely into the surrounding wall.',
    },
    {
      icon: ThumbsUp,
      title: 'Satisfaction Guarantee',
      description:
        'If you see a flaw after we leave, we come back and fix it. No charge, no argument. Your walls are our reputation.',
    },
  ],
  whyUsTitle: 'Why Homeowners Trust SmoothWall Pros',
  whyUsSubtitle:
    'Clean work, tight seams, and a finish so smooth you will want to paint right away.',

  process: [
    {
      step: '01',
      title: 'Free Estimate',
      description:
        'We assess the scope, measure the area, and provide a clear, upfront quote. No hidden fees, no surprises.',
    },
    {
      step: '02',
      title: 'Prep & Protect',
      description:
        'We protect your floors and furniture, set up dust containment, and prepare the space for clean, efficient work.',
    },
    {
      step: '03',
      title: 'Hang & Finish',
      description:
        'Our crew hangs, tapes, and finishes the drywall to your specified level. Multiple coats and careful sanding for a seamless result.',
    },
    {
      step: '04',
      title: 'Final Inspection',
      description:
        'We do a light-check walkthrough, clean up thoroughly, and hand you a wall ready for paint. Your approval is the final step.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'From estimate to seamless finish in four simple steps.',

  testimonials: [
    {
      name: 'Karen P.',
      location: 'Brookfield',
      rating: 5,
      text: 'They repaired a huge hole my teenager put in the wall and you cannot tell it was ever there. The texture match was perfect. Fast, clean, and professional from start to finish.',
    },
    {
      name: 'Greg H.',
      location: 'Sunnyside',
      rating: 5,
      text: 'SmoothWall Pros finished my basement and the walls are dead flat. No waves, no visible seams. The crew was on time every day and left the space spotless. Excellent work.',
    },
    {
      name: 'Nina F.',
      location: 'Hillcrest',
      rating: 5,
      text: 'They removed the popcorn ceilings throughout my house and the result is stunning. Bright, smooth, modern. The dust containment was impressive — barely any cleanup needed.',
    },
  ],
  testimonialsTitle: 'What Our Clients Say',
  testimonialsSubtitle: 'Smooth walls and happy homeowners are what we do best.',

  faqs: [
    {
      question: 'How long does drywall installation take?',
      answer:
        'A typical room takes 2-3 days: one day to hang, one to two days for taping and finishing coats, plus drying time. Whole-house projects take 1-2 weeks. We provide a clear timeline up front.',
    },
    {
      question: 'Can you match my existing wall texture?',
      answer:
        'Yes. We are texture-matching experts. Bring us a sample or let us see the wall — we match knockdown, orange peel, skip-trowel, and custom textures so repairs blend perfectly.',
    },
    {
      question: 'Do you handle water-damaged drywall?',
      answer:
        'Absolutely. We remove compromised material, dry the area, treat for mold prevention, and install new drywall with a seamless finish. We also provide documentation for insurance claims.',
    },
    {
      question: 'How dusty is the process?',
      answer:
        'We use dust containment barriers, zip walls, and HEPA vacuums to minimize dust. For sanding, we offer dustless sanding systems. Your home stays as clean as possible during the project.',
    },
    {
      question: 'Do you paint after finishing the drywall?',
      answer:
        'We focus on drywall installation and finishing, leaving you with a paint-ready surface. We can recommend trusted painting partners or provide painting as an add-on service if requested.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about our drywall services.',

  serviceAreas: [
    { name: 'Brookfield' },
    { name: 'Sunnyside' },
    { name: 'Hillcrest' },
    { name: 'Downtown Core' },
    { name: 'Midtown' },
    { name: 'Riverside' },
    { name: 'Uptown' },
    { name: 'Westgate' },
  ],
  serviceAreasTitle: 'Communities We Proudly Serve',

  contactTitle: 'Get Your Free Drywall Estimate',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day with a custom quote.',

  galleryTitle: 'Our Recent Drywall Projects',
  gallerySubtitle: 'See the SmoothWall Pros difference.',
  galleryImages: [
    'https://images.pexels.com/photos/11427055/pexels-photo-11427055.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/8961065/pexels-photo-8961065.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/5824883/pexels-photo-5824883.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Certified drywall finishers who take pride in every seam and corner.',
  team: [
    { name: 'Dale Whitman', role: 'Lead Finisher', bio: 'Dale has 14 years of drywall finishing experience and is certified in Level 5 finishes and dustless sanding systems.' },
    { name: 'Maria Santos', role: 'Project Manager', bio: 'Maria coordinates schedules, estimates, and client communication to keep every project on time and on budget.' },
    { name: 'Kevin Brooks', role: 'Texture Specialist', bio: 'Kevin is our texture-matching expert, blending knockdown, orange peel, and custom finishes seamlessly.' },
  ],

  pricingTitle: 'Drywall Service Packages',
  pricingSubtitle: 'Transparent pricing with no hidden fees.',
  pricing: [
    { name: 'Patch Repair', price: 'From $150', description: 'Single-area repair and texture match.', features: ['Hole or crack repair', 'Texture matching', 'Paint-ready finish', '1-hour minimum'], popular: false },
    { name: 'Room Installation', price: 'From $1.75/sq ft', description: 'Full room hang, tape, and finish.', features: ['Hang drywall', 'Tape & mud', 'Level 4 finish', 'Sand & cleanup', 'Materials included'], popular: true },
    { name: 'Whole-Home Package', price: 'Custom Quote', description: 'Complete drywall for new builds or full remodels.', features: ['All rooms & ceilings', 'Level 5 finish option', 'Dust containment', 'Dedicated crew', 'Project management'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the SmoothWall Pros assistant. How can I help you today?",
    placeholder: "Ask about our drywall services...",
    knowledgeBase: [
      "We offer drywall installation, drywall repair, texture and finishing, soundproofing, water damage repair, and ceiling installation.",
      "A typical room takes 2-3 days for drywall installation: one day to hang, one to two days for taping and finishing coats, plus drying time.",
      "Yes, we are texture-matching experts. We match knockdown, orange peel, skip-trowel, and custom textures so repairs blend perfectly.",
      "We handle water-damaged drywall — removal, drying, mold treatment, and seamless restoration, plus insurance documentation.",
      "We use dust containment barriers, zip walls, HEPA vacuums, and dustless sanding systems to minimize dust during the project.",
      "We focus on drywall finishing and leave a paint-ready surface. Painting is available as an add-on service if requested.",
      "We offer free estimates with a clear, upfront quote and no hidden fees.",
      "We serve Brookfield, Sunnyside, Hillcrest, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are Monday through Saturday, 7am to 6pm.",
      "We have 14+ years of experience and have completed over 3,200 projects.",
    ],
  },
};
