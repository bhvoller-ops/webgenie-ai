import {
  Trees,
  Sun,
  Flower2,
  Wrench,
  Layers,
  UtensilsCrossed,
  Home,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
  Search,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const deckPatioConfig: IndustryConfig = {
  id: 'deck-patio',
  industryName: 'Deck & Patio',
  businessName: 'Outdoor Living Co.',
  tagline: 'Bring Your Outdoors to Life.',
  heroTitle: 'Custom Deck & Patio Construction',
  heroSubtitle:
    'From cedar decks to stone patios, pergolas to outdoor kitchens, we design and build outdoor spaces that extend your living room into the open air. Built to last, made to enjoy.',
  phone: '(555) 634-2218',
  email: 'info@outdoorlivingco.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Sat 7am-6pm',
  yearsExperience: '20+',
  licenseNumber: 'DP-8193047',

  colors: {
    primary: '#15803D',
    primaryDark: '#166534',
    primaryLight: '#DCFCE7',
    accent: '#92400E',
    background: '#FFFFFF',
    surface: '#F0FDF4',
    text: '#052E16',
    textMuted: '#5B7B62',
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
    'https://images.pexels.com/photos/10847167/pexels-photo-10847167.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'Licensed & Insured • Free Design Consultation',
  ctaPrimary: 'Get Free Quote',
  ctaSecondary: 'View Services',

  stats: [
    { value: '20+', label: 'Years Experience' },
    { value: '1,800+', label: 'Decks & Patios Built' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '100%', label: 'Satisfaction Guarantee' },
  ],

  services: [
    {
      icon: Trees,
      title: 'Deck Construction',
      description:
        'Custom deck design and construction in cedar, redwood, pressure-treated, and composite. Built to code, engineered to last, and finished to impress.',
      features: ['Cedar & redwood', 'Pressure-treated', 'Multi-level designs', 'Railings & stairs'],
    },
    {
      icon: Layers,
      title: 'Patio Installation',
      description:
        'Beautiful patios in natural stone, pavers, stamped concrete, and flagstone. We grade, base, and install for drainage and durability.',
      features: ['Natural stone', 'Concrete pavers', 'Stamped concrete', 'Flagstone'],
    },
    {
      icon: Sun,
      title: 'Pergolas & Gazebos',
      description:
        'Add shade and style with custom pergolas and gazebos. Cedar, vinyl, or aluminum — freestanding or attached, sized to your space.',
      features: ['Cedar pergolas', 'Vinyl pergolas', 'Aluminum shade structures', 'Retractable canopies'],
    },
    {
      icon: Wrench,
      title: 'Deck Repair',
      description:
        'Board replacement, structural reinforcement, railing repair, and refinishing. We restore safety and beauty to aging decks.',
      features: ['Board replacement', 'Structural repair', 'Railing repair', 'Power washing & sealing'],
    },
    {
      icon: Home,
      title: 'Composite Decking',
      description:
        'Low-maintenance composite and PVC decking that never needs staining. Premium brands like Trex, TimberTech, and Fiberon installed to spec.',
      features: ['Trex & TimberTech', 'Hidden fasteners', '20+ year warranties', 'No staining required'],
    },
    {
      icon: UtensilsCrossed,
      title: 'Outdoor Kitchens',
      description:
        'Fully equipped outdoor kitchens with grills, countertops, storage, and refrigeration. Extend your cooking and entertaining into the backyard.',
      features: ['Built-in grills', 'Stone countertops', 'Outdoor refrigeration', 'Bar seating'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Design-Build Experts',
      description:
        'We handle everything from the first sketch to the final screw. Our in-house designers and builders work together so your vision becomes reality without the hassle.',
    },
    {
      icon: Clock,
      title: 'Built to Last',
      description:
        'We use premium materials and proven construction techniques. Proper footings, flashing, and fasteners mean your deck or patio stands strong for decades.',
    },
    {
      icon: Users,
      title: 'Permits Handled',
      description:
        'We pull every permit and schedule every inspection. Your project is code-compliant and documented, protecting your investment and your home value.',
    },
    {
      icon: ThumbsUp,
      title: '10-Year Structural Warranty',
      description:
        'Every deck and patio comes with a 10-year structural warranty. If something we built fails, we fix it. Materials carry additional manufacturer warranties.',
    },
  ],
  whyUsTitle: 'Why Homeowners Choose Outdoor Living Co.',
  whyUsSubtitle:
    'Design-build expertise, premium materials, and outdoor spaces built to be enjoyed for decades.',

  process: [
    {
      step: '01',
      title: 'Design Consultation',
      description:
        'We visit your property, discuss your vision, and create a 3D design. You see exactly what you are getting before construction begins.',
    },
    {
      step: '02',
      title: 'Material Selection',
      description:
        'Choose your decking or patio material, color, railing style, and finishes. We provide samples and help you compare options.',
    },
    {
      step: '03',
      title: 'Permits & Prep',
      description:
        'We pull permits, call utility locates, and prepare the site. Footings are dug, inspected, and poured to code before framing begins.',
    },
    {
      step: '04',
      title: 'Construction & Reveal',
      description:
        'Our crew builds your deck or patio with precision. We clean up, do a final walkthrough, and hand you the keys to your new outdoor living space.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'From design consultation to outdoor reveal in four simple steps.',

  testimonials: [
    {
      name: 'Robert C.',
      location: 'Greenwood',
      rating: 5,
      text: 'Outdoor Living Co. built our composite deck and it is the best investment we have made in our home. The 3D design let us see it before they started and the finished product exceeded expectations.',
    },
    {
      name: 'Janet W.',
      location: 'Brookmeadow',
      rating: 5,
      text: 'The pergola they built over our patio transformed the whole backyard. Beautiful craftsmanship, perfect shade, and the crew was respectful and clean. We use it every single evening.',
    },
    {
      name: 'Carlos D.',
      location: 'Willow Park',
      rating: 5,
      text: 'They installed a stamped concrete patio and outdoor kitchen. The quality is outstanding and they handled every permit and inspection. Entertaining has never been better. Five stars.',
    },
  ],
  testimonialsTitle: 'What Our Clients Say',
  testimonialsSubtitle: 'Beautiful outdoor spaces and happy homeowners are what we do best.',

  faqs: [
    {
      question: 'How long does deck or patio construction take?',
      answer:
        'Most decks take 1-2 weeks from breaking ground to final inspection. Patios take 3-7 days. Complex designs, outdoor kitchens, or weather delays can extend timelines. We provide a clear schedule up front.',
    },
    {
      question: 'What is the difference between wood and composite decking?',
      answer:
        'Wood decks cost less upfront but require staining every 1-2 years. Composite costs more initially but needs no staining and lasts 25+ years. We help you compare total cost of ownership during your consultation.',
    },
    {
      question: 'Do you handle permits and inspections?',
      answer:
        'Yes. We pull all required permits, schedule inspections, and ensure your project meets local building codes. This protects your investment and is required for most deck and patio projects.',
    },
    {
      question: 'Can you repair an existing deck instead of replacing it?',
      answer:
        'Often, yes. We assess the structure and replace rotted boards, reinforce framing, repair railings, and refinish the surface. If the frame is sound, repair is far more affordable than full replacement.',
    },
    {
      question: 'What maintenance does a deck or patio need?',
      answer:
        'Wood decks need cleaning and staining every 1-2 years. Composite needs occasional cleaning with soap and water. Patios need occasional weed control in joints and resealing every few years depending on material.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about our deck and patio services.',

  serviceAreas: [
    { name: 'Greenwood' },
    { name: 'Brookmeadow' },
    { name: 'Willow Park' },
    { name: 'Downtown Core' },
    { name: 'Midtown' },
    { name: 'Riverside' },
    { name: 'Uptown' },
    { name: 'Westgate' },
  ],
  serviceAreasTitle: 'Communities We Proudly Serve',

  contactTitle: 'Get Your Free Design Consultation',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day to schedule your consultation.',

  galleryTitle: 'Our Recent Deck & Patio Projects',
  gallerySubtitle: 'See the Outdoor Living Co. difference.',
  galleryImages: [
    'https://images.pexels.com/photos/10847167/pexels-photo-10847167.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/261101/pexels-photo-261101.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/2595886/pexels-photo-2595886.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Designers and builders who turn backyards into outdoor living spaces.',
  team: [
    { name: 'Phil Castellano', role: 'Lead Designer', bio: 'Phil creates custom 3D deck and patio designs, blending aesthetics, function, and budget into plans clients love.' },
    { name: 'Aisha Brown', role: 'Project Manager', bio: 'Aisha coordinates permits, schedules, and inspections to keep every build on time and fully code-compliant.' },
    { name: 'Doug Mercer', role: 'Master Carpenter', bio: 'Doug leads our construction crews with 20 years of deck and patio building experience and meticulous attention to detail.' },
  ],

  pricingTitle: 'Deck & Patio Service Packages',
  pricingSubtitle: 'Transparent pricing with no hidden fees.',
  pricing: [
    { name: 'Deck Repair', price: 'From $499', description: 'Restore an existing deck to safe, beautiful condition.', features: ['Board replacement', 'Structural repair', 'Railing repair', 'Power wash & seal'], popular: false },
    { name: 'Custom Deck Build', price: 'From $35/sq ft', description: 'New custom deck construction.', features: ['Wood or composite', 'Custom design', 'Railings & stairs', 'Permits included', '10-year structural warranty'], popular: true },
    { name: 'Outdoor Living Package', price: 'Custom Quote', description: 'Deck, patio, pergola, and outdoor kitchen.', features: ['Full design-build', 'Deck & patio', 'Pergola or gazebo', 'Outdoor kitchen', 'Landscape integration'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the Outdoor Living Co. assistant. How can I help you today?",
    placeholder: "Ask about our deck and patio services...",
    knowledgeBase: [
      "We offer deck construction, patio installation, pergolas and gazebos, deck repair, composite decking, and outdoor kitchens.",
      "Most decks take 1-2 weeks from breaking ground to final inspection. Patios take 3-7 days. Complex designs may extend timelines.",
      "Wood decks cost less upfront but need staining every 1-2 years. Composite costs more but needs no staining and lasts 25+ years.",
      "Yes, we pull all required permits, schedule inspections, and ensure your project meets local building codes.",
      "We can often repair existing decks — replacing rotted boards, reinforcing framing, and refinishing — if the structure is sound.",
      "Wood decks need cleaning and staining every 1-2 years. Composite needs occasional soap-and-water cleaning. Patios need occasional weed control and resealing.",
      "Every deck and patio comes with a 10-year structural warranty, plus manufacturer material warranties.",
      "We serve Greenwood, Brookmeadow, Willow Park, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are Monday through Saturday, 7am to 6pm.",
      "We have 20+ years of experience and have built over 1,800 decks and patios.",
    ],
  },
};
