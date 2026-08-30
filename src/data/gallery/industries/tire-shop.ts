import {
  CircleDot,
  Disc,
  Gauge,
  Wrench,
  Snowflake,
  Zap,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
  Search,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const tireShopConfig: IndustryConfig = {
  id: 'tire-shop',
  industryName: 'Tire Shop',
  businessName: 'GripTire Pros',
  tagline: 'Grip the Road With Confidence.',
  heroTitle: 'Professional Tire Sales & Service',
  heroSubtitle:
    'From new tire installation to rotation, alignment, and repair, our tire experts keep you safe on the road. Top brands, expert mounting, and honest advice for every vehicle and budget.',
  phone: '(555) 621-8830',
  email: 'info@griptirepros.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Sat 8am-7pm',
  yearsExperience: '17+',
  licenseNumber: 'TS-5820419',

  colors: {
    primary: '#1F2937',
    primaryDark: '#111827',
    primaryLight: '#F3F4F6',
    accent: '#DC2626',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#0F172A',
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
    'https://images.pexels.com/photos/16023877/pexels-photo-16023877.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'All Major Brands • Road Hazard Warranty',
  ctaPrimary: 'Get Free Quote',
  ctaSecondary: 'View Services',

  stats: [
    { value: '17+', label: 'Years Experience' },
    { value: '50,000+', label: 'Tires Installed' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '100%', label: 'Satisfaction Guarantee' },
  ],

  services: [
    {
      icon: CircleDot,
      title: 'Tire Installation',
      description:
        'Professional tire mounting and balancing for every vehicle type. We install all major brands with precision equipment and a road hazard warranty on every set.',
      features: ['All major brands', 'Computer balancing', 'Valve stem replacement', 'Road hazard warranty'],
    },
    {
      icon: Disc,
      title: 'Tire Rotation',
      description:
        'Extend tire life and improve handling with regular rotation. Our free rotation service with purchased tires keeps your warranty valid and your wear even.',
      features: ['Free with purchase', 'Even tread wear', 'Extended tire life', 'Pattern-specific rotation'],
    },
    {
      icon: Gauge,
      title: 'Wheel Alignment',
      description:
        'Precision four-wheel alignment using laser-guided equipment. Correct camber, caster, and toe to prevent uneven wear and improve fuel efficiency and handling.',
      features: ['Four-wheel alignment', 'Laser-guided precision', 'Printed before & after', 'Steering correction'],
    },
    {
      icon: Wrench,
      title: 'Tire Repair',
      description:
        'Safe, permanent puncture repair using industry-standard plug-and-patch methods. We inspect the tire inside and out to ensure it is safe to repair before we do.',
      features: ['Plug & patch method', 'Internal inspection', 'Safety-first approach', 'Quick turnaround'],
    },
    {
      icon: Snowflake,
      title: 'Winter Tires',
      description:
        'Stay safe in snow and ice with dedicated winter tires. We help you choose the right set, store your off-season tires, and swap them when the weather changes.',
      features: ['Top winter brands', 'Seasonal swap service', 'Tire storage available', 'Studded options'],
    },
    {
      icon: Zap,
      title: 'TPMS Service',
      description:
        'Tire Pressure Monitoring System diagnosis, sensor replacement, and reprogramming. We keep your TPMS working so you are alerted before a tire becomes dangerous.',
      features: ['Sensor diagnosis', 'Sensor replacement', 'System reprogramming', 'Battery service'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'All Major Brands',
      description:
        'We carry and install every major tire brand — Michelin, Goodyear, Bridgestone, Continental, and more. We help you choose the right tire for your vehicle, climate, and budget.',
    },
    {
      icon: Clock,
      title: 'Fast, No-Appointment Service',
      description:
        'Most tire services are walk-in and completed in under an hour. We respect your time and get you back on the road without the wait.',
    },
    {
      icon: Users,
      title: 'Certified Technicians',
      description:
        'Our tire technicians are ASE-certified and trained on the latest mounting and alignment equipment. Your vehicle is in expert hands from start to finish.',
    },
    {
      icon: ThumbsUp,
      title: 'Road Hazard Warranty',
      description:
        'Every tire purchase includes road hazard coverage. If your tire is damaged by a nail, glass, or pothole, we repair or replace it — no questions asked.',
    },
  ],
  whyUsTitle: 'Why Drivers Choose GripTire Pros',
  whyUsSubtitle:
    'Top brands, expert installation, and honest advice that keeps you safe on every mile.',

  process: [
    {
      step: '01',
      title: 'Tire Selection',
      description:
        'Tell us your vehicle and driving needs. We recommend the best tires for your climate, budget, and driving style from all major brands.',
    },
    {
      step: '02',
      title: 'Installation & Balancing',
      description:
        'Our certified technicians mount, balance, and install your new tires with precision equipment. Valve stems are replaced and torque is checked.',
    },
    {
      step: '03',
      title: 'Alignment Check',
      description:
        'We check your alignment and recommend correction if needed. Proper alignment extends tire life and improves safety and fuel efficiency.',
    },
    {
      step: '04',
      title: 'Hit the Road',
      description:
        'You drive away with balanced, aligned tires and road hazard coverage. We schedule your first rotation so you never forget this critical maintenance.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'From tire selection to back on the road in four simple steps.',

  testimonials: [
    {
      name: 'Frank L.',
      location: 'Eastgate',
      rating: 5,
      text: 'I needed four new tires fast and GripTire Pros had them in stock, installed, and balanced in under an hour. The price beat the big-box stores and the road hazard warranty gave me real peace of mind.',
    },
    {
      name: 'Yuki T.',
      location: 'North Hills',
      rating: 5,
      text: 'They fixed a nail in my tire properly — plug and patch, not just a plug like the quick-lube places. They showed me the inside of the tire to prove it was safe to repair. Honest, knowledgeable people.',
    },
    {
      name: 'Carlos R.',
      location: 'Southpoint',
      rating: 5,
      text: 'The four-wheel alignment made my car drive like new. They printed the before and after measurements so I could see the difference. No upsell pressure, just great service. Highly recommend.',
    },
  ],
  testimonialsTitle: 'What Our Clients Say',
  testimonialsSubtitle: 'Safe tires and confident drivers are what we do best.',

  faqs: [
    {
      question: 'How often should I rotate my tires?',
      answer:
        'Every 5,000 to 8,000 miles, or at every other oil change. Regular rotation ensures even tread wear and extends tire life. We include free rotation with tire purchases.',
    },
    {
      question: 'How do I know if I need an alignment?',
      answer:
        'Signs include uneven tire wear, pulling to one side, a crooked steering wheel when driving straight, or vibration. We recommend checking alignment at least once a year or after hitting a pothole.',
    },
    {
      question: 'Can you repair a tire with a nail in it?',
      answer:
        'Often, yes — if the puncture is in the repairable tread area and less than 1/4 inch. We inspect the tire inside and out and use the industry-standard plug-and-patch method. If it is not safe to repair, we will tell you.',
    },
    {
      question: 'Do I really need winter tires?',
      answer:
        'If you drive in snow or ice, winter tires significantly improve traction, braking, and safety. All-season tires harden in cold temperatures. Winter tires stay flexible and grip in conditions below 45°F.',
    },
    {
      question: 'What does road hazard warranty cover?',
      answer:
        'Road hazard coverage protects against damage from nails, glass, potholes, and other road debris. If your tire is damaged, we repair it free or replace it at prorated cost. It is included with every tire purchase.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about our tire services.',

  serviceAreas: [
    { name: 'Eastgate' },
    { name: 'North Hills' },
    { name: 'Southpoint' },
    { name: 'Downtown Core' },
    { name: 'Midtown' },
    { name: 'Riverside' },
    { name: 'Uptown' },
    { name: 'Westgate' },
  ],
  serviceAreasTitle: 'Communities We Proudly Serve',

  contactTitle: 'Get Your Free Tire Quote',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day with tire options and pricing.',

  galleryTitle: 'Our Recent Tire Service Projects',
  gallerySubtitle: 'See the GripTire Pros difference.',
  galleryImages: [
    'https://images.pexels.com/photos/16023877/pexels-photo-16023877.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/4489702/pexels-photo-4489702.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/3806288/pexels-photo-3806288.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'ASE-certified tire technicians who keep you safe on every mile.',
  team: [
    { name: 'Dale Foster', role: 'Shop Manager', bio: 'Dale manages daily operations and inventory, ensuring we have the right tires in stock and every job done right the first time.' },
    { name: 'Priya Nair', role: 'Lead Technician', bio: 'Priya is our ASE-certified lead tech, specializing in wheel alignment and TPMS diagnostics with 17 years of experience.' },
    { name: 'Sam Whitfield', role: 'Tire Specialist', bio: 'Sam handles tire selection, mounting, and balancing, helping every customer find the perfect tire for their vehicle and budget.' },
  ],

  pricingTitle: 'Tire Service Packages',
  pricingSubtitle: 'Transparent pricing with no hidden fees.',
  pricing: [
    { name: 'Tire Repair', price: 'From $25', description: 'Permanent plug-and-patch puncture repair.', features: ['Internal inspection', 'Plug & patch method', 'Safety verification', 'Quick turnaround'], popular: false },
    { name: 'Tire Installation', price: 'From $25/tire', description: 'Mount, balance, and install a set of four.', features: ['Mounting & balancing', 'Valve stem replacement', 'TPMS reset', 'Road hazard warranty', 'Free rotations'], popular: true },
    { name: 'Alignment Package', price: 'From $99', description: 'Four-wheel alignment with printed report.', features: ['Four-wheel alignment', 'Laser-guided precision', 'Before & after printout', 'Steering wheel centering', '90-day warranty'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the GripTire Pros assistant. How can I help you today?",
    placeholder: "Ask about our tire services...",
    knowledgeBase: [
      "We offer tire installation, tire rotation, wheel alignment, tire repair, winter tires, and TPMS service.",
      "Tires should be rotated every 5,000 to 8,000 miles, or at every other oil change. Rotation is free with tire purchases.",
      "Signs you need an alignment include uneven tire wear, pulling to one side, a crooked steering wheel, or vibration. We recommend checking at least once a year.",
      "We can repair a tire with a nail if the puncture is in the repairable tread area and less than 1/4 inch. We use the industry-standard plug-and-patch method after an internal inspection.",
      "Winter tires significantly improve traction, braking, and safety in snow, ice, and temperatures below 45°F. All-season tires harden in the cold.",
      "Road hazard warranty covers damage from nails, glass, potholes, and road debris. We repair free or replace at prorated cost. It is included with every tire purchase.",
      "We carry and install all major brands including Michelin, Goodyear, Bridgestone, Continental, and more.",
      "We serve Eastgate, North Hills, Southpoint, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are Monday through Saturday, 8am to 7pm. Most services are walk-in and completed in under an hour.",
      "We have 17+ years of experience and have installed over 50,000 tires.",
    ],
  },
};
