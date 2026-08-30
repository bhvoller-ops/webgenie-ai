import {
  Truck,
  LifeBuoy,
  Car,
  Anchor,
  MapPin,
  Bike,
  Siren,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
  Search,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const towingConfig: IndustryConfig = {
  id: 'towing',
  industryName: 'Towing',
  businessName: 'Reliable Towing & Recovery',
  tagline: 'Stuck? We Are On Our Way.',
  heroTitle: '24/7 Towing & Roadside Assistance',
  heroSubtitle:
    'Fast, reliable towing and roadside help whenever you need it. From jump-starts to full recovery, our trained operators get you and your vehicle safely to where you need to be — day or night.',
  phone: '(555) 911-2477',
  email: 'dispatch@reliabletowing.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: '24/7/365',
  yearsExperience: '15+',
  licenseNumber: 'TW-7382915',

  colors: {
    primary: '#1E40AF',
    primaryDark: '#1E3A8A',
    primaryLight: '#DBEAFE',
    accent: '#DC2626',
    background: '#FFFFFF',
    surface: '#EFF6FF',
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

  heroImage:
    'https://images.pexels.com/photos/17429097/pexels-photo-17429097.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: '24/7 Dispatch • Licensed & Insured',
  ctaPrimary: 'Call for Help',
  ctaSecondary: 'View Services',

  stats: [
    { value: '15+', label: 'Years Experience' },
    { value: '24/7', label: 'Always Available' },
    { value: '4.8★', label: 'Average Rating' },
    { value: '30min', label: 'Average Response Time' },
  ],

  services: [
    {
      icon: Siren,
      title: 'Emergency Towing',
      description:
        'Stuck on the highway or in a ditch? Our 24/7 dispatch sends the nearest truck to get you and your vehicle to safety fast. We handle accidents and breakdowns with care.',
      features: ['24/7 dispatch', 'Accident recovery', 'Breakdown towing', 'Insurance billing'],
    },
    {
      icon: LifeBuoy,
      title: 'Roadside Assistance',
      description:
        'Jump-starts, lockouts, flat tires, and fuel delivery. We get you back on the road without a tow whenever possible — fast, professional, and affordable.',
      features: ['Jump-starts', 'Lockout service', 'Flat tire change', 'Fuel delivery'],
    },
    {
      icon: Anchor,
      title: 'Vehicle Recovery',
      description:
        'Off-road recovery, winch-outs, and vehicle extraction from ditches, mud, snow, and water. Our heavy-duty winches and skilled operators recover vehicles safely.',
      features: ['Winch-outs', 'Off-road recovery', 'Mud & snow extraction', 'Water recovery'],
    },
    {
      icon: Truck,
      title: 'Flatbed Towing',
      description:
        'Damage-free flatbed towing for luxury, classic, and low-clearance vehicles. Your car rides on the bed, not behind it — the safest way to transport any vehicle.',
      features: ['Luxury vehicles', 'Classic cars', 'Low-clearance cars', 'All-wheel drive'],
    },
    {
      icon: MapPin,
      title: 'Long-Distance Towing',
      description:
        'Need your vehicle moved across the state or region? We offer long-distance towing and vehicle transport with GPS tracking and guaranteed arrival times.',
      features: ['Interstate towing', 'GPS tracking', 'Guaranteed ETA', 'Multiple vehicles'],
    },
    {
      icon: Bike,
      title: 'Motorcycle Towing',
      description:
        'Specialized motorcycle towing with soft straps and dedicated trailers. We transport cruisers, sport bikes, and touring motorcycles without a scratch.',
      features: ['Soft-strap tie-downs', 'Dedicated trailers', 'All motorcycle types', 'Damage-free transport'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Licensed & Insured',
      description:
        'Fully licensed, bonded, and insured with commercial auto coverage. Your vehicle is protected from the moment we hook up to the moment we drop off.',
    },
    {
      icon: Clock,
      title: 'Fast Response Times',
      description:
        'Our average response time is 30 minutes. We dispatch the nearest available truck and provide live ETA updates so you are never left wondering.',
    },
    {
      icon: Users,
      title: 'Trained Operators',
      description:
        'Our drivers are certified, background-checked, and trained in safe recovery techniques. They treat your vehicle like it is their own — every time.',
    },
    {
      icon: ThumbsUp,
      title: 'Transparent Pricing',
      description:
        'Upfront pricing with no surprise fees. We tell you the cost before we hook up, and we bill insurance directly for accident tows when possible.',
    },
  ],
  whyUsTitle: 'Why Drivers Choose Reliable Towing & Recovery',
  whyUsSubtitle:
    'Fast response, trained operators, and transparent pricing when you need help most.',

  process: [
    {
      step: '01',
      title: 'Call Dispatch',
      description:
        'Call our 24/7 line with your location, vehicle, and situation. We confirm the service needed and give you an upfront price and ETA.',
    },
    {
      step: '02',
      title: 'Truck Dispatched',
      description:
        'We send the nearest appropriate truck and provide live ETA updates. You get a text when the driver is en route and again on arrival.',
    },
    {
      step: '03',
      title: 'Service Performed',
      description:
        'Our trained operator performs the tow or roadside service safely and efficiently. Your vehicle is secured and protected throughout.',
    },
    {
      step: '04',
      title: 'Safe Arrival',
      description:
        'We deliver your vehicle to your chosen destination, unhook carefully, and complete payment on-site. You are back on your way.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'From call to safe arrival in four simple steps.',

  testimonials: [
    {
      name: 'Rachel D.',
      location: 'Highway 9',
      rating: 5,
      text: 'My car broke down on the highway at 2am and Reliable Towing was there in 25 minutes. The driver was professional, calm, and got me and my car safely to the shop. Lifesavers.',
    },
    {
      name: 'Tony M.',
      location: 'Interstate 40',
      rating: 5,
      text: 'They towed my classic Mustang on a flatbed and treated it like it was made of glass. Soft straps, careful driving, and the price was exactly what they quoted. The only tow company I will use.',
    },
    {
      name: 'Brenda F.',
      location: 'Route 17',
      rating: 5,
      text: 'Locked my keys in my car at the grocery store. They had someone out in 20 minutes and I was back in my car in five. Friendly, fast, and reasonably priced. Saved my whole day.',
    },
  ],
  testimonialsTitle: 'What Our Clients Say',
  testimonialsSubtitle: 'Safe tows and relieved drivers are what we do best.',

  faqs: [
    {
      question: 'How quickly can you get to me?',
      answer:
        'Our average response time is 30 minutes in the metro area. Highway and rural calls may take longer depending on location. We provide live ETA updates so you always know when help is arriving.',
    },
    {
      question: 'How much does towing cost?',
      answer:
        'Base tow rates start at $75 plus mileage. Roadside assistance starts at $49. We give you an upfront price before dispatching, so there are no surprises. We also bill insurance directly for accident tows.',
    },
    {
      question: 'Do you handle accident towing and insurance billing?',
      answer:
        'Yes. We work with all major insurance companies and motor clubs. We can bill your insurance or motor club directly for accident tows, and we provide detailed receipts for your claim.',
    },
    {
      question: 'What types of vehicles can you tow?',
      answer:
        'We tow cars, SUVs, trucks, motorcycles, and light commercial vehicles. Our flatbeds handle luxury, classic, and low-clearance vehicles. For heavy-duty needs, call us and we will arrange the right equipment.',
    },
    {
      question: 'Are you available 24/7?',
      answer:
        'Yes. Our dispatch line is answered 24 hours a day, 7 days a week, 365 days a year. Holidays, late nights, early mornings — we are always here when you need us.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about our towing services.',

  serviceAreas: [
    { name: 'Highway 9 Corridor' },
    { name: 'Interstate 40' },
    { name: 'Route 17' },
    { name: 'Downtown Core' },
    { name: 'Midtown' },
    { name: 'Riverside' },
    { name: 'Uptown' },
    { name: 'Westgate' },
  ],
  serviceAreasTitle: 'Communities We Proudly Serve',

  contactTitle: 'Need a Tow? Call Now.',
  contactSubtitle:
    'Our 24/7 dispatch is standing by. Call us or fill out the form for non-emergency scheduling.',

  galleryTitle: 'Our Towing & Recovery Fleet',
  gallerySubtitle: 'See the Reliable Towing & Recovery difference.',
  galleryImages: [
    'https://images.pexels.com/photos/17429097/pexels-photo-17429097.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/3806288/pexels-photo-3806288.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/1596497/pexels-photo-1596497.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Certified operators who get you and your vehicle safely where you need to be.',
  team: [
    { name: 'Ray Sullivan', role: 'Dispatch Manager', bio: 'Ray runs our 24/7 dispatch center, coordinating drivers and ensuring the fastest possible response to every call.' },
    { name: 'Diana Park', role: 'Lead Operator', bio: 'Diana is our most experienced tow operator, certified in flatbed, recovery, and heavy-duty towing techniques.' },
    { name: 'Marcus Hill', role: 'Roadside Specialist', bio: 'Marcus specializes in roadside assistance — jump-starts, lockouts, and tire changes that get drivers back on the road fast.' },
  ],

  pricingTitle: 'Towing & Roadside Service Rates',
  pricingSubtitle: 'Transparent pricing with no hidden fees.',
  pricing: [
    { name: 'Roadside Assistance', price: 'From $49', description: 'Jump-start, lockout, or tire change.', features: ['Jump-start', 'Lockout service', 'Flat tire change', 'Fuel delivery', '30-min response'], popular: false },
    { name: 'Local Tow', price: 'From $75', description: 'Standard local tow up to 10 miles.', features: ['Up to 10 miles', 'Hook-up included', 'Flatbed available', 'Insurance billing', 'Live ETA updates'], popular: true },
    { name: 'Long-Distance & Recovery', price: 'Custom Quote', description: 'Long-distance towing and vehicle recovery.', features: ['Interstate transport', 'Off-road recovery', 'Winch-outs', 'GPS tracking', 'Guaranteed ETA'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the Reliable Towing & Recovery assistant. How can I help you today?",
    placeholder: "Ask about our towing services...",
    knowledgeBase: [
      "We offer emergency towing, roadside assistance, vehicle recovery, flatbed towing, long-distance towing, and motorcycle towing.",
      "Our average response time is 30 minutes in the metro area. Highway and rural calls may take longer. We provide live ETA updates.",
      "Base tow rates start at $75 plus mileage. Roadside assistance starts at $49. We give you an upfront price before dispatching.",
      "Yes, we work with all major insurance companies and motor clubs, and can bill them directly for accident tows.",
      "We tow cars, SUVs, trucks, motorcycles, and light commercial vehicles. Our flatbeds handle luxury, classic, and low-clearance vehicles.",
      "Yes, our dispatch line is answered 24 hours a day, 7 days a week, 365 days a year, including holidays.",
      "Our drivers are certified, background-checked, and trained in safe recovery and towing techniques.",
      "We serve the Highway 9 Corridor, Interstate 40, Route 17, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "We are available 24/7/365 — call any time, day or night.",
      "We have 15+ years of experience and a 30-minute average response time.",
    ],
  },
};
