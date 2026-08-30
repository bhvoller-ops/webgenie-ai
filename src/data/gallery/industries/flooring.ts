import {
  Grid3x3,
  SquareStack,
  Layers,
  Footprints,
  Brush,
  Sparkles,
  Hammer,
  Ruler,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
  Search,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const flooringConfig: IndustryConfig = {
  id: 'flooring',
  industryName: 'Flooring',
  businessName: 'Premier Floor Co.',
  tagline: 'Beautiful Floors That Last a Lifetime.',
  heroTitle: 'Premium Flooring Installation & Refinishing',
  heroSubtitle:
    'From hardwood to tile, laminate to epoxy, our master installers deliver flawless floors that transform your home. Quality materials, expert craftsmanship, and a satisfaction guarantee on every project.',
  phone: '(555) 245-8801',
  email: 'info@premierfloorco.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Sat 7am-6pm',
  yearsExperience: '18+',
  licenseNumber: 'FL-5829104',

  colors: {
    primary: '#92400E',
    primaryDark: '#78350F',
    primaryLight: '#FEF3C7',
    accent: '#1E3A5F',
    background: '#FFFFFF',
    surface: '#FFFBEB',
    text: '#1C1917',
    textMuted: '#78716C',
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
    'https://images.pexels.com/photos/1388944/pexels-photo-1388944.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'Licensed & Insured • Free Estimates',
  ctaPrimary: 'Get Free Quote',
  ctaSecondary: 'View Services',

  stats: [
    { value: '18+', label: 'Years Experience' },
    { value: '4,500+', label: 'Floors Installed' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '100%', label: 'Satisfaction Guarantee' },
  ],

  services: [
    {
      icon: Grid3x3,
      title: 'Hardwood Installation',
      description:
        'Premium solid and engineered hardwood installation. We handle every species, width, and finish to bring warmth and value to your home.',
      features: ['Solid & engineered', 'Nail-down & glue-down', 'Custom patterns', 'Factory & site finish'],
    },
    {
      icon: SquareStack,
      title: 'Tile & Stone',
      description:
        'Precision tile and natural stone installation for floors, showers, and backsplashes. From ceramic to marble, we make it last.',
      features: ['Ceramic & porcelain', 'Marble & granite', 'Heated floors', 'Custom mosaics'],
    },
    {
      icon: Layers,
      title: 'Laminate & Vinyl',
      description:
        'Durable, affordable laminate and luxury vinyl plank flooring. Water-resistant options perfect for any room in your home.',
      features: ['Luxury vinyl plank', 'Waterproof laminate', 'Click-lock install', 'Quick turnaround'],
    },
    {
      icon: Footprints,
      title: 'Carpet Installation',
      description:
        'Soft, warm carpet installation with premium padding and expert stretching. Choose from thousands of styles and colors.',
      features: ['Wide style selection', 'Premium padding', 'Stretch & seam', 'Stair carpeting'],
    },
    {
      icon: Brush,
      title: 'Floor Refinishing',
      description:
        'Restore your existing hardwood floors to like-new condition. Dustless sanding and premium finishes that bring back the shine.',
      features: ['Dustless sanding', 'Stain matching', 'Water-based finish', 'Scratch repair'],
    },
    {
      icon: Sparkles,
      title: 'Epoxy Garage Floors',
      description:
        'Transform your garage with durable, beautiful epoxy coatings. Resistant to stains, chemicals, and heavy traffic for years.',
      features: ['Solid & metallic epoxy', 'Chip & flake finishes', 'Crack repair', 'UV-resistant topcoat'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Master Craftsmen',
      description:
        'Our installers are factory-trained and certified. With 18 years of experience, we deliver floors that look stunning and stand the test of time.',
    },
    {
      icon: Clock,
      title: 'On-Time, On-Budget',
      description:
        'We respect your schedule and your budget. Clear timelines, upfront pricing, and no surprise charges — ever.',
    },
    {
      icon: Users,
      title: 'Premium Materials',
      description:
        'We partner with top manufacturers to source the finest flooring materials. Quality you can see and feel underfoot.',
    },
    {
      icon: ThumbsUp,
      title: 'Lifetime Workmanship Warranty',
      description:
        'We stand behind every installation with a lifetime workmanship warranty. If it ever lifts, buckles, or fails, we fix it free.',
    },
  ],
  whyUsTitle: 'Why Homeowners Choose Premier Floor Co.',
  whyUsSubtitle:
    'Expert installation, premium materials, and a commitment to quality that shows in every plank and tile.',

  process: [
    {
      step: '01',
      title: 'Free Consultation',
      description:
        'We visit your home, measure the space, and help you choose the perfect flooring. You get a detailed quote with no obligation.',
    },
    {
      step: '02',
      title: 'Material Selection',
      description:
        'Browse our extensive samples and select the material, color, and finish that fits your style and budget.',
    },
    {
      step: '03',
      title: 'Expert Installation',
      description:
        'Our certified crew arrives on schedule, protects your home, and installs your new floors with precision craftsmanship.',
    },
    {
      step: '04',
      title: 'Final Walkthrough',
      description:
        'We clean up thoroughly and walk you through the finished floor. Your approval is the final step before we leave.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'From consultation to flawless finish in four simple steps.',

  testimonials: [
    {
      name: 'Daniel R.',
      location: 'Oakwood',
      rating: 5,
      text: 'The hardwood installation is absolutely flawless. The crew was professional, punctual, and left my house cleaner than they found it. The floors look better than I imagined.',
    },
    {
      name: 'Sophia L.',
      location: 'Maple Heights',
      rating: 5,
      text: 'They refinished my 40-year-old oak floors and they look brand new. The dustless sanding process was amazing — no mess anywhere. Highly recommend Premier Floor Co.',
    },
    {
      name: 'Marcus T.',
      location: 'Cedar Grove',
      rating: 5,
      text: 'The epoxy garage floor is incredible. It transformed a dingy garage into a showroom-quality space. The team was knowledgeable and the price was fair. Five stars all the way.',
    },
  ],
  testimonialsTitle: 'What Our Clients Say',
  testimonialsSubtitle: 'Beautiful floors and happy homeowners are what we do best.',

  faqs: [
    {
      question: 'How long does flooring installation take?',
      answer:
        'Most residential installations take 1-3 days depending on the material and square footage. Hardwood may require acclimation time before installation. We provide a clear timeline during your consultation.',
    },
    {
      question: 'Do you remove and dispose of old flooring?',
      answer:
        'Yes! We offer complete tear-out and disposal of existing flooring as part of our service. This includes carpet, tile, laminate, and underlayment removal, plus responsible disposal.',
    },
    {
      question: 'What flooring is best for homes with pets?',
      answer:
        'Luxury vinyl plank and tile are excellent pet-friendly options — scratch-resistant, waterproof, and easy to clean. For hardwood, we recommend harder species like oak or hickory with a durable finish.',
    },
    {
      question: 'Can you match my existing hardwood floors?',
      answer:
        'Absolutely. We can match wood species, board width, and stain color to blend seamlessly with your existing floors. We also offer refinishing to unify the tone across old and new areas.',
    },
    {
      question: 'Do you offer a warranty?',
      answer:
        'Yes. All installations come with a lifetime workmanship warranty. Material warranties vary by manufacturer and are passed through to you. We stand behind every floor we install.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about our flooring services.',

  serviceAreas: [
    { name: 'Oakwood' },
    { name: 'Maple Heights' },
    { name: 'Cedar Grove' },
    { name: 'Downtown Core' },
    { name: 'Midtown' },
    { name: 'Riverside' },
    { name: 'Uptown' },
    { name: 'Westgate' },
  ],
  serviceAreasTitle: 'Communities We Proudly Serve',

  contactTitle: 'Get Your Free Flooring Estimate',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day with a custom quote.',

  galleryTitle: 'Our Recent Flooring Projects',
  gallerySubtitle: 'See the Premier Floor Co. difference.',
  galleryImages: [
    'https://images.pexels.com/photos/1388944/pexels-photo-1388944.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/675877/pexels-photo-675877.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Certified flooring professionals who treat your home like their own.',
  team: [
    { name: 'Frank Delgado', role: 'Master Installer', bio: 'Frank leads our hardwood and tile installation crews with 18 years of hands-on flooring experience and factory certifications.' },
    { name: 'Irene Kowalski', role: 'Design Consultant', bio: 'Irene helps clients choose the perfect flooring material, color, and pattern to match their home and lifestyle.' },
    { name: 'Tom Reyes', role: 'Refinishing Specialist', bio: 'Tom is our dustless sanding and refinishing expert, restoring worn hardwood floors to better-than-new condition.' },
  ],

  pricingTitle: 'Flooring Service Packages',
  pricingSubtitle: 'Transparent pricing with no hidden fees.',
  pricing: [
    { name: 'Basic Installation', price: 'From $4.50/sq ft', description: 'Professional installation of your chosen flooring.', features: ['Material installation', 'Standard underlayment', 'Basic trim work', 'Cleanup & haul-away'], popular: false },
    { name: 'Premium Installation', price: 'From $7.50/sq ft', description: 'Complete installation with premium materials.', features: ['Premium underlayment', 'Custom trim & transitions', 'Subfloor prep included', 'Old floor removal', '1-year service guarantee'], popular: true },
    { name: 'Refinishing Package', price: 'From $3.50/sq ft', description: 'Restore existing hardwood floors.', features: ['Dustless sanding', 'Stain of your choice', 'Two coats of finish', 'Scratch & dent repair', 'Furniture moving'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the Premier Floor Co. assistant. How can I help you today?",
    placeholder: "Ask about our flooring services...",
    knowledgeBase: [
      "We offer hardwood installation, tile and stone, laminate and vinyl, carpet installation, floor refinishing, and epoxy garage floors.",
      "Most residential flooring installations take 1-3 days depending on the material and square footage.",
      "Yes, we remove and dispose of old flooring as part of our service, including carpet, tile, laminate, and underlayment.",
      "For homes with pets, we recommend luxury vinyl plank or tile — scratch-resistant, waterproof, and easy to clean.",
      "We can match existing hardwood floors by species, board width, and stain color, and refinish to unify the tone.",
      "All installations come with a lifetime workmanship warranty, plus manufacturer material warranties.",
      "We offer free in-home consultations with measurement and a detailed, no-obligation quote.",
      "We serve Oakwood, Maple Heights, Cedar Grove, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are Monday through Saturday, 7am to 6pm.",
      "We have 18+ years of experience and have installed over 4,500 floors.",
    ],
  },
};
