import {
  Droplets,
  Sparkles,
  Hand,
  Wind,
  SprayCan,
  Lightbulb,
  CarFront,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
  Search,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const carWashConfig: IndustryConfig = {
  id: 'car-wash',
  industryName: 'Car Wash',
  businessName: 'SparkleWash Auto Spa',
  tagline: 'Drive Clean. Drive Proud.',
  heroTitle: 'Premium Car Wash & Auto Detailing',
  heroSubtitle:
    'From express washes to full-service detailing and ceramic coating, we make your vehicle look showroom-new. Gentle products, expert technique, and a shine that lasts.',
  phone: '(555) 447-2290',
  email: 'info@sparklewashautospa.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Sun 7am-8pm',
  yearsExperience: '10+',
  licenseNumber: 'CW-3847201',

  colors: {
    primary: '#0EA5E9',
    primaryDark: '#0284C7',
    primaryLight: '#E0F2FE',
    accent: '#1E40AF',
    background: '#FFFFFF',
    surface: '#F0F9FF',
    text: '#0C1B2A',
    textMuted: '#5B7388',
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
    'https://images.pexels.com/photos/4870702/pexels-photo-4870702.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'Open 7 Days • Unlimited Wash Club',
  ctaPrimary: 'Get Free Quote',
  ctaSecondary: 'View Services',

  stats: [
    { value: '10+', label: 'Years Experience' },
    { value: '75,000+', label: 'Cars Washed' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '100%', label: 'Satisfaction Guarantee' },
  ],

  services: [
    {
      icon: Droplets,
      title: 'Express Wash',
      description:
        'Fast, thorough exterior wash in under 10 minutes. Soft-cloth technology, spot-free rinse, and hand finish. Perfect for keeping your car clean between details.',
      features: ['Soft-cloth wash', 'Spot-free rinse', 'Tire shine', 'Hand finish'],
    },
    {
      icon: CarFront,
      title: 'Full-Service Wash',
      description:
        'Complete interior and exterior cleaning. Vacuum, dash wipe-down, window cleaning, plus a full exterior wash and hand wax. Drive away sparkling inside and out.',
      features: ['Full exterior wash', 'Interior vacuum', 'Dash & console wipe', 'Window cleaning'],
    },
    {
      icon: Hand,
      title: 'Hand Wash & Wax',
      description:
        'Premium hand wash with gentle, pH-balanced soap and a protective carnauba wax. The safest, most thorough wash for luxury, classic, and show vehicles.',
      features: ['Two-bucket method', 'pH-balanced soap', 'Carnauba wax', 'Wheel detail'],
    },
    {
      icon: Wind,
      title: 'Interior Detailing',
      description:
        'Deep interior cleaning that restores that new-car feel. Shampoo carpets and seats, condition leather, clean and protect all surfaces, and eliminate odors.',
      features: ['Carpet & seat shampoo', 'Leather conditioning', 'Surface protectant', 'Odor elimination'],
    },
    {
      icon: Sparkles,
      title: 'Ceramic Coating',
      description:
        'Long-lasting ceramic coating that protects your paint for years. Hydrophobic, scratch-resistant, and UV-blocking. The ultimate paint protection investment.',
      features: ['Multi-year protection', 'Hydrophobic finish', 'UV & scratch resistance', 'Easy maintenance'],
    },
    {
      icon: Lightbulb,
      title: 'Headlight Restoration',
      description:
        'Restore cloudy, yellowed headlights to crystal clarity. We sand, polish, and seal for improved visibility and a refreshed front-end appearance.',
      features: ['Cloudiness removal', 'UV sealant', 'Improved visibility', 'Like-new clarity'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Gentle, Paint-Safe Process',
      description:
        'We use soft-cloth technology, pH-balanced products, and the two-bucket method to prevent scratches. Your paint is safe in our hands, every single wash.',
    },
    {
      icon: Clock,
      title: 'Fast & Convenient',
      description:
        'Express washes in under 10 minutes. Full-service and detailing by appointment. Open 7 days a week with an unlimited wash club for frequent washers.',
    },
    {
      icon: Users,
      title: 'Trained Detail Technicians',
      description:
        'Our team is trained in professional detailing techniques and product chemistry. From ceramic coating application to leather care, we know what your vehicle needs.',
    },
    {
      icon: ThumbsUp,
      title: 'Satisfaction Guarantee',
      description:
        'If you are not happy with your wash, tell us within 24 hours and we will re-wash it free. We stand behind every service, from express to ceramic coating.',
    },
  ],
  whyUsTitle: 'Why Drivers Choose SparkleWash Auto Spa',
  whyUsSubtitle:
    'Gentle products, expert technique, and a shine that turns heads on every drive.',

  process: [
    {
      step: '01',
      title: 'Choose Your Service',
      description:
        'Pull up and select express, full-service, or detailing. Our team assesses your vehicle and confirms the service and price before we start.',
    },
    {
      step: '02',
      title: 'Pre-Treatment',
      description:
        'We pre-soak wheels, bugs, and heavy grime with targeted, paint-safe cleaners. This loosens dirt before the main wash for a thorough clean.',
    },
    {
      step: '03',
      title: 'Wash & Protect',
      description:
        'Soft-cloth or hand wash with pH-balanced soap, spot-free rinse, and protective wax or coating. Every surface is cleaned and protected.',
    },
    {
      step: '04',
      title: 'Final Inspection',
      description:
        'We hand-finish, inspect every panel, and hand you the keys. Your car looks showroom-new and is ready to turn heads on the drive home.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'From pull-up to showroom shine in four simple steps.',

  testimonials: [
    {
      name: 'Vanessa H.',
      location: 'Lakeview',
      rating: 5,
      text: 'The ceramic coating they applied to my SUV is incredible. Water beads right off and it still looks like the day I picked it up from the dealer. The detail team was meticulous. Worth every penny.',
    },
    {
      name: 'Andre J.',
      location: 'Forest Park',
      rating: 5,
      text: 'I use the unlimited wash club and it pays for itself in two weeks. The express wash is fast, thorough, and never scratches. The crew is friendly and my truck always looks great.',
    },
    {
      name: 'Monica S.',
      location: 'Garden District',
      rating: 5,
      text: 'They restored my headlights and the difference is night and day. I can actually see at night again. The price was fair and the work was done in under an hour. Excellent service.',
    },
  ],
  testimonialsTitle: 'What Our Clients Say',
  testimonialsSubtitle: 'Sparkling vehicles and proud drivers are what we do best.',

  faqs: [
    {
      question: 'How long does a car wash take?',
      answer:
        'Express washes take under 10 minutes. Full-service washes take 20-30 minutes. Interior detailing takes 1-3 hours depending on vehicle size and condition. Ceramic coating takes a full day.',
    },
    {
      question: 'Is the express wash safe for my paint?',
      answer:
        'Yes. We use soft-cloth technology, not brushes, and pH-balanced soap. The two-bucket method prevents dirt from being rubbed back into the paint. It is the gentlest express wash available.',
    },
    {
      question: 'How often should I wash my car?',
      answer:
        'Every 1-2 weeks for daily drivers, or more often in winter when road salt is present. The unlimited wash club makes frequent washing affordable. Regular washing protects your paint and resale value.',
    },
    {
      question: 'What is ceramic coating and is it worth it?',
      answer:
        'Ceramic coating is a liquid polymer that bonds to your paint, creating a hydrophobic, scratch-resistant, UV-blocking layer that lasts years. It makes washing easier and keeps your car looking new longer.',
    },
    {
      question: 'Do you offer an unlimited wash membership?',
      answer:
        'Yes! Our unlimited wash club lets you wash as often as you like for one monthly fee. It includes express washes, discounts on full-service and detailing, and priority access during busy times.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about our car wash and detailing services.',

  serviceAreas: [
    { name: 'Lakeview' },
    { name: 'Forest Park' },
    { name: 'Garden District' },
    { name: 'Downtown Core' },
    { name: 'Midtown' },
    { name: 'Riverside' },
    { name: 'Uptown' },
    { name: 'Westgate' },
  ],
  serviceAreasTitle: 'Communities We Proudly Serve',

  contactTitle: 'Get Your Free Detailing Quote',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day with service options and pricing.',

  galleryTitle: 'Our Recent Car Wash & Detailing Projects',
  gallerySubtitle: 'See the SparkleWash Auto Spa difference.',
  galleryImages: [
    'https://images.pexels.com/photos/4870702/pexels-photo-4870702.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/3806249/pexels-photo-3806249.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/3753434/pexels-photo-3753434.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Trained detail technicians who treat every vehicle like a show car.',
  team: [
    { name: 'Rex Donovan', role: 'Detail Manager', bio: 'Rex oversees all detailing services, from interior restoration to ceramic coating application, with 10 years of professional experience.' },
    { name: 'Lola Bennett', role: 'Customer Experience Lead', bio: 'Lola manages the front desk, wash club memberships, and ensures every customer leaves with a smile and a clean car.' },
    { name: 'Jamal Reed', role: 'Lead Detailer', bio: 'Jamal is our master detailer, specializing in paint correction, ceramic coating, and interior restoration for luxury and everyday vehicles.' },
  ],

  pricingTitle: 'Car Wash & Detailing Packages',
  pricingSubtitle: 'Transparent pricing with no hidden fees.',
  pricing: [
    { name: 'Express Wash', price: 'From $12', description: 'Fast exterior wash and hand finish.', features: ['Soft-cloth wash', 'Spot-free rinse', 'Tire shine', 'Hand finish', 'Under 10 minutes'], popular: false },
    { name: 'Full-Service Wash', price: 'From $29', description: 'Interior and exterior cleaning.', features: ['Full exterior wash', 'Interior vacuum', 'Dash & console wipe', 'Window cleaning', 'Hand wax'], popular: true },
    { name: 'Complete Detail', price: 'From $149', description: 'Full interior and exterior detail.', features: ['Interior shampoo', 'Leather conditioning', 'Clay bar & wax', 'Headlight restoration', 'Ceramic coating add-on'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the SparkleWash Auto Spa assistant. How can I help you today?",
    placeholder: "Ask about our car wash and detailing services...",
    knowledgeBase: [
      "We offer express wash, full-service wash, hand wash and wax, interior detailing, ceramic coating, and headlight restoration.",
      "Express washes take under 10 minutes. Full-service washes take 20-30 minutes. Interior detailing takes 1-3 hours. Ceramic coating takes a full day.",
      "Yes, our express wash is paint-safe. We use soft-cloth technology, not brushes, and pH-balanced soap with the two-bucket method to prevent scratches.",
      "You should wash your car every 1-2 weeks, or more often in winter when road salt is present. The unlimited wash club makes frequent washing affordable.",
      "Ceramic coating is a liquid polymer that bonds to your paint, creating a hydrophobic, scratch-resistant, UV-blocking layer that lasts years and makes washing easier.",
      "Yes, our unlimited wash club lets you wash as often as you like for one monthly fee, with discounts on full-service and detailing.",
      "We offer a satisfaction guarantee. If you are not happy with your wash, tell us within 24 hours and we will re-wash it free.",
      "We serve Lakeview, Forest Park, Garden District, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are Monday through Sunday, 7am to 8pm. We are open 7 days a week.",
      "We have 10+ years of experience and have washed over 75,000 cars.",
    ],
  },
};
