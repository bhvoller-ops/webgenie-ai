import {
  Trash2,
  Building2,
  HardHat,
  Sofa,
  Package,
  Leaf,
  Recycle,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
  Search,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const junkRemovalConfig: IndustryConfig = {
  id: 'junk-removal',
  industryName: 'Junk Removal',
  businessName: 'ClearOut Junk Solutions',
  tagline: 'We Haul It All, You Do Nothing.',
  heroTitle: 'Fast, Affordable Junk Removal & Cleanouts',
  heroSubtitle:
    'From single items to full estate cleanouts, our uniformed crews do all the heavy lifting, loading, and cleanup. Same-day service, upfront pricing, and responsible disposal every time.',
  phone: '(555) 883-4471',
  email: 'info@clearoutjunk.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Sat 7am-7pm',
  yearsExperience: '12+',
  licenseNumber: 'JR-2049583',

  colors: {
    primary: '#DC2626',
    primaryDark: '#991B1B',
    primaryLight: '#FEE2E2',
    accent: '#1F2937',
    background: '#FFFFFF',
    surface: '#FEF2F2',
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
    'https://images.pexels.com/photos/11849101/pexels-photo-11849101.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'Licensed & Insured • Same-Day Service',
  ctaPrimary: 'Get Free Quote',
  ctaSecondary: 'View Services',

  stats: [
    { value: '12+', label: 'Years Experience' },
    { value: '15,000+', label: 'Cleanouts Completed' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '100%', label: 'Satisfaction Guarantee' },
  ],

  services: [
    {
      icon: Trash2,
      title: 'Residential Junk Removal',
      description:
        'Old furniture, appliances, electronics, yard waste, and general clutter. We haul it all from anywhere on your property — attics, basements, garages, and yards.',
      features: ['Furniture & appliances', 'Electronics & TVs', 'Mattresses & box springs', 'General household clutter'],
    },
    {
      icon: Building2,
      title: 'Commercial Cleanouts',
      description:
        'Office furniture, retail fixtures, warehouse clearance, and tenant move-outs. We work after hours and on weekends to minimize business disruption.',
      features: ['Office furniture', 'Retail fixtures', 'Warehouse clearance', 'Tenant move-outs'],
    },
    {
      icon: HardHat,
      title: 'Construction Debris',
      description:
        'Post-construction and renovation debris removal. Drywall, lumber, tile, roofing materials, and packaging hauled away so you can enjoy the finished space.',
      features: ['Drywall & lumber', 'Tile & flooring', 'Roofing materials', 'Packaging & pallets'],
    },
    {
      icon: Sofa,
      title: 'Furniture & Appliance Disposal',
      description:
        'Single-item or multi-item pickup for sofas, refrigerators, washers, dryers, and more. We recycle and donate whenever possible to keep items out of landfills.',
      features: ['Sofas & sectionals', 'Refrigerators & freezers', 'Washers & dryers', 'Stoves & dishwashers'],
    },
    {
      icon: Package,
      title: 'Estate Cleanouts',
      description:
        'Compassionate, thorough estate cleanout services. We sort, donate, recycle, and dispose with respect for your family and the property.',
      features: ['Full-house cleanout', 'Donation sorting', 'Document shredding', 'Sensitive handling'],
    },
    {
      icon: Leaf,
      title: 'Yard Waste Removal',
      description:
        'Branches, leaves, sod, dirt, and storm debris hauled away. Seasonal cleanups, post-landscaping waste, and fallen tree removal.',
      features: ['Branches & brush', 'Leaves & sod', 'Storm debris', 'Post-landscaping cleanup'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Upfront, Honest Pricing',
      description:
        'We quote before we load. No hidden fees, no surprise charges, no haggling. You approve the price, we do the work — simple as that.',
    },
    {
      icon: Clock,
      title: 'Same-Day Service',
      description:
        'Call in the morning, gone by afternoon. We offer same-day and next-day appointments throughout the service area because junk waits for no one.',
    },
    {
      icon: Users,
      title: 'We Do All the Work',
      description:
        'You point, we haul. Our uniformed, background-checked crews do all the lifting, loading, sweeping, and cleanup. You never lift a finger.',
    },
    {
      icon: ThumbsUp,
      title: 'Eco-Friendly Disposal',
      description:
        'We recycle, donate, and responsibly dispose of everything we haul. We partner with local charities and recycling centers to keep junk out of landfills.',
    },
  ],
  whyUsTitle: 'Why Homeowners Choose ClearOut Junk Solutions',
  whyUsSubtitle:
    'Upfront pricing, same-day service, and crews who do all the heavy lifting for you.',

  process: [
    {
      step: '01',
      title: 'Get a Quote',
      description:
        'Call or book online. We ask what you need hauled and give you an upfront price based on volume. No on-site estimate required for most jobs.',
    },
    {
      step: '02',
      title: 'Schedule Pickup',
      description:
        'Choose a time that works for you — same day, next day, or later this week. We confirm by text and email with a two-hour arrival window.',
    },
    {
      step: '03',
      title: 'We Haul It Away',
      description:
        'Our uniformed crew arrives, confirms the price, loads everything, sweeps up, and hauls it away. You do not lift a finger.',
    },
    {
      step: '04',
      title: 'Responsible Disposal',
      description:
        'We sort your items for donation, recycling, and disposal. You get a receipt for donated items and the peace of mind that it was handled right.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'From quote to clean space in four simple steps.',

  testimonials: [
    {
      name: 'Theresa A.',
      location: 'Fairmont',
      rating: 5,
      text: 'I called in the morning and they were at my house by noon. Cleared out an entire garage in 45 minutes. Upfront price, no surprises, super friendly crew. I will definitely use them again.',
    },
    {
      name: 'Derek J.',
      location: 'Summit Ridge',
      rating: 5,
      text: 'They handled my mother-in-law\'s estate cleanout with so much respect and care. They sorted donations, recycled what they could, and left the house spotless. Truly grateful for their service.',
    },
    {
      name: 'Megan K.',
      location: 'Creekside',
      rating: 5,
      text: 'After our kitchen remodel there was debris everywhere. ClearOut hauled all of it away the same day I called. The crew was fast, professional, and the price was exactly what they quoted. Excellent.',
    },
  ],
  testimonialsTitle: 'What Our Clients Say',
  testimonialsSubtitle: 'Clean spaces and happy clients are what we do best.',

  faqs: [
    {
      question: 'How is pricing determined?',
      answer:
        'Pricing is based on the volume of junk you need removed — how much space it takes in our truck. We give you an upfront quote before we load, so you know the exact price with no surprises.',
    },
    {
      question: 'Do I need to be present for pickup?',
      answer:
        'For most jobs, yes — we need you to confirm the items and approve the price. For exterior jobs like yard waste, we can often complete the pickup and collect payment by phone. Just ask when booking.',
    },
    {
      question: 'What items will you not take?',
      answer:
        'We do not take hazardous materials like paint, chemicals, asbestos, or biological waste. We also cannot take vehicles or tires in some areas. Call us and we will let you know what we can and cannot haul.',
    },
    {
      question: 'Do you donate or recycle?',
      answer:
        'Yes! We donate usable furniture, clothing, and appliances to local charities and recycle metal, electronics, and cardboard whenever possible. We provide donation receipts for tax purposes.',
    },
    {
      question: 'How quickly can you come out?',
      answer:
        'We offer same-day and next-day service throughout the service area. Call before noon and we can often be there the same day. Larger jobs may require scheduling a day or two out.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about our junk removal services.',

  serviceAreas: [
    { name: 'Fairmont' },
    { name: 'Summit Ridge' },
    { name: 'Creekside' },
    { name: 'Downtown Core' },
    { name: 'Midtown' },
    { name: 'Riverside' },
    { name: 'Uptown' },
    { name: 'Westgate' },
  ],
  serviceAreasTitle: 'Communities We Proudly Serve',

  contactTitle: 'Get Your Free Junk Removal Quote',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day with a custom quote.',

  galleryTitle: 'Our Recent Cleanout Projects',
  gallerySubtitle: 'See the ClearOut Junk Solutions difference.',
  galleryImages: [
    'https://images.pexels.com/photos/11849101/pexels-photo-11849101.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/2768961/pexels-photo-2768961.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Uniformed, background-checked crews who do all the heavy lifting for you.',
  team: [
    { name: 'Vince Caruso', role: 'Operations Manager', bio: 'Vince oversees scheduling, routing, and crew assignments to ensure every job is completed on time and on budget.' },
    { name: 'Tasha Green', role: 'Customer Service Lead', bio: 'Tasha handles bookings, quotes, and client communication, making sure every customer gets a clear, upfront price.' },
    { name: 'Omar Patel', role: 'Crew Lead', bio: 'Omar leads our hauling crews in the field, ensuring safe, efficient loading and thorough cleanup on every job.' },
  ],

  pricingTitle: 'Junk Removal Service Packages',
  pricingSubtitle: 'Transparent pricing with no hidden fees.',
  pricing: [
    { name: 'Single Item Pickup', price: 'From $89', description: 'One large item hauled away.', features: ['One sofa or appliance', 'Curbside or in-home', 'Same-day available', 'Eco-friendly disposal'], popular: false },
    { name: 'Full Load', price: 'From $399', description: 'Up to a full truckload of junk.', features: ['Up to 16 cubic yards', 'Multiple items', 'All labor included', 'Sweep-up cleanup', 'Donation receipts'], popular: true },
    { name: 'Estate Cleanout', price: 'Custom Quote', description: 'Whole-property cleanout service.', features: ['Full-house cleanout', 'Donation sorting', 'Recycling & disposal', 'Document shredding', 'Final broom-sweep'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the ClearOut Junk Solutions assistant. How can I help you today?",
    placeholder: "Ask about our junk removal services...",
    knowledgeBase: [
      "We offer residential junk removal, commercial cleanouts, construction debris removal, furniture and appliance disposal, estate cleanouts, and yard waste removal.",
      "Pricing is based on the volume of junk — how much space it takes in our truck. We give you an upfront quote before we load, so there are no surprises.",
      "For most jobs you need to be present to confirm items and approve the price. For exterior jobs like yard waste, we can often complete pickup and collect payment by phone.",
      "We do not take hazardous materials like paint, chemicals, asbestos, or biological waste. We also cannot take vehicles or tires in some areas.",
      "Yes, we donate usable furniture, clothing, and appliances to local charities and recycle metal, electronics, and cardboard whenever possible. We provide donation receipts.",
      "We offer same-day and next-day service throughout the service area. Call before noon and we can often be there the same day.",
      "Our uniformed, background-checked crews do all the lifting, loading, sweeping, and cleanup. You never lift a finger.",
      "We serve Fairmont, Summit Ridge, Creekside, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are Monday through Saturday, 7am to 7pm.",
      "We have 12+ years of experience and have completed over 15,000 cleanouts.",
    ],
  },
};
