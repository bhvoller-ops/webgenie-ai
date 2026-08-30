import {
  Home,
  Building2,
  UserCheck,
  Wrench,
  BarChart3,
  FileText,
  ShieldCheck,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
  KeyRound,
  TrendingUp,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

const BASE_URL = 'https://images.pexels.com/photos/';

export const propertyManagementConfig: IndustryConfig = {
  id: 'property-management',
  industryName: 'Property Management Services',
  businessName: 'Summit Property Management',
  tagline: 'Your Property. Our Priority.',
  heroTitle: 'Professional Property Management That Maximizes Value',
  heroSubtitle:
    'Full-service residential and commercial property management. From tenant screening to maintenance and financial reporting, we handle it all so you can enjoy stress-free ownership.',
  phone: '(555) 462-7188',
  email: 'info@summitpm.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Fri 8am-6pm, Sat 9am-1pm',
  yearsExperience: '15+',
  licenseNumber: 'PM-CO-2198474',

  colors: {
    primary: '#1E40AF',
    primaryDark: '#1E3A8A',
    primaryLight: '#DBEAFE',
    accent: '#0F766E',
    background: '#FFFFFF',
    surface: '#EFF6FF',
    text: '#0A1228',
    textMuted: '#5B6680',
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

  heroImage: `${BASE_URL}1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200`,
  heroBadge: 'Licensed & Insured • 24/7 Emergency Response',
  ctaPrimary: 'Get Free Consultation',
  ctaSecondary: 'View Services',

  stats: [
    { value: '15+', label: 'Years Managing Properties' },
    { value: '1,200+', label: 'Units Under Management' },
    { value: '98%', label: 'On-Time Rent Collection' },
    { value: '4.9★', label: 'Owner Satisfaction' },
  ],

  services: [
    {
      icon: Home,
      title: 'Residential Management',
      description:
        'Comprehensive management for single-family homes, condos, and multifamily properties. We handle tenants, rent, and maintenance so you do not have to.',
      features: ['Rent collection', 'Tenant relations', 'Lease enforcement', '24/7 maintenance'],
    },
    {
      icon: Building2,
      title: 'Commercial Management',
      description:
        'Professional management for office, retail, and mixed-use properties. Maximize occupancy and NOI with our experienced commercial team.',
      features: ['Tenant retention', 'CAM reconciliation', 'Vendor management', 'Facility oversight'],
    },
    {
      icon: UserCheck,
      title: 'Tenant Screening',
      description:
        'Thorough background, credit, and reference checks to place qualified, reliable tenants who pay on time and care for your property.',
      features: ['Credit & background check', 'Income verification', 'Rental history', 'Eviction records'],
    },
    {
      icon: Wrench,
      title: 'Maintenance & Repairs',
      description:
        'Licensed, insured vendors and a 24/7 emergency line. We keep your property in top condition and protect your investment.',
      features: ['Preventive maintenance', 'Emergency response', 'Vendor coordination', 'Inspections'],
    },
    {
      icon: BarChart3,
      title: 'Financial Reporting',
      description:
        'Detailed monthly statements and year-end reports. Always know exactly how your property is performing with transparent accounting.',
      features: ['Monthly statements', 'Year-end reports', 'Expense tracking', 'Online owner portal'],
    },
    {
      icon: FileText,
      title: 'Lease Administration',
      description:
        'Lease drafting, renewals, and enforcement handled by experts. Stay compliant and protected with properly structured agreements.',
      features: ['Lease drafting', 'Renewals & rent reviews', 'Compliance monitoring', 'Security deposits'],
    },
  ],

  whyUs: [
    {
      icon: ShieldCheck,
      title: 'Licensed & Insured',
      description:
        'Fully licensed property managers with comprehensive E&O and general liability insurance. Your investment is protected at every level.',
    },
    {
      icon: Clock,
      title: '24/7 Emergency Response',
      description:
        'Tenants and owners can reach us anytime. Emergencies are handled immediately to protect your property and keep tenants happy.',
    },
    {
      icon: Users,
      title: 'Experienced Local Team',
      description:
        'Our team knows the local market inside and out. We price rentals correctly, place quality tenants, and minimize vacancy.',
    },
    {
      icon: ThumbsUp,
      title: 'Transparent Reporting',
      description:
        'Real-time access to statements, reports, and documents through our owner portal. You always know where your money is going.',
    },
  ],
  whyUsTitle: 'Why Property Owners Choose Summit',
  whyUsSubtitle:
    'We treat your property like our own — maximizing value while minimizing the headaches of ownership.',

  process: [
    {
      step: '01',
      title: 'Free Consultation',
      description:
        'We assess your property, discuss your goals, and provide a realistic rental analysis and management proposal at no cost.',
    },
    {
      step: '02',
      title: 'Onboarding & Setup',
      description:
        'We inspect the property, set up your owner account, and prepare marketing materials to get your unit rented quickly.',
    },
    {
      step: '03',
      title: 'Tenant Placement',
      description:
        'We market the property, screen applicants thoroughly, and place a qualified tenant with a solid lease agreement.',
    },
    {
      step: '04',
      title: 'Ongoing Management',
      description:
        'We collect rent, handle maintenance, provide monthly statements, and keep your investment performing at its best.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'A seamless onboarding process that gets your property managed right.',

  testimonials: [
    {
      name: 'Patricia L.',
      location: 'Brookside',
      rating: 5,
      text: 'I was managing my own rentals and it was a nightmare. Summit took over and within a month my stress was gone. Rent is on time, maintenance is handled, and the reports are crystal clear.',
    },
    {
      name: 'Gregory H.',
      location: 'Fairfield',
      rating: 5,
      text: 'They manage my 12-unit building and I could not be happier. The tenant screening is thorough, vacancies are filled fast, and the financial reporting makes tax season a breeze.',
    },
    {
      name: 'Linda F.',
      location: 'Eastside',
      rating: 5,
      text: 'As an out-of-state owner, I needed a team I could trust completely. Summit has exceeded my expectations. They communicate proactively and treat my property like it is their own.',
    },
  ],
  testimonialsTitle: 'What Our Property Owners Say',
  testimonialsSubtitle: 'Stress-free ownership is what we deliver.',

  faqs: [
    {
      question: 'What areas do you manage properties in?',
      answer:
        'We manage residential and commercial properties throughout the Greater Metro Area and surrounding suburbs, including Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate.',
    },
    {
      question: 'How much does property management cost?',
      answer:
        'Our standard management fee is a percentage of collected rent, typically 8-10% depending on property type and portfolio size. There is no fee when your property is vacant. We provide a custom quote during your free consultation.',
    },
    {
      question: 'How do you screen tenants?',
      answer:
        'We run comprehensive credit and background checks, verify income and employment, contact previous landlords, and check eviction records. We only place tenants who meet our strict qualification standards.',
    },
    {
      question: 'How and when do I receive my rent payments?',
      answer:
        'Rent is due on the 1st of each month. We process owner distributions by the 10th via direct deposit, along with your monthly statement detailing income and expenses.',
    },
    {
      question: 'What happens if a tenant does not pay rent?',
      answer:
        'We handle the entire collection and eviction process if necessary. Our lease agreements include clear late-fee structures, and we begin enforcement immediately if rent is not paid on time.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about our property management services.',

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

  contactTitle: 'Get Your Free Property Consultation',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day with a custom management proposal.',

  galleryTitle: 'Properties We Manage',
  gallerySubtitle: 'See the quality of properties we represent.',
  galleryImages: [
    `${BASE_URL}1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200`,
    `${BASE_URL}323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1200`,
    `${BASE_URL}53610/pexels-photo-53610.jpeg?auto=compress&cs=tinysrgb&w=1200`,
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Experienced professionals dedicated to protecting and growing your investment.',
  team: [
    { name: 'Karen Whitmore', role: 'Broker / Managing Director', bio: 'Licensed broker with 20 years in real estate and property management. Karen founded Summit to bring professional, transparent management to local owners.' },
    { name: 'Daniel Cho', role: 'Portfolio Manager', bio: 'Manages our residential portfolio with expertise in tenant relations, leasing strategy, and rent optimization across 600+ units.' },
    { name: 'Maria Santos', role: 'Maintenance Coordinator', bio: 'Coordinates all maintenance and repairs with our licensed vendor network, ensuring fast, quality work and 24/7 emergency response.' },
  ],

  pricingTitle: 'Management Service Packages',
  pricingSubtitle: 'Transparent fees with no hidden costs.',
  pricing: [
    { name: 'Tenant Placement', price: '75% of 1st month rent', description: 'Find and place a qualified tenant.', features: ['Marketing & listing', 'Tenant screening', 'Lease drafting', 'Move-in inspection'], popular: false },
    { name: 'Full Management', price: '8% of monthly rent', description: 'Complete ongoing property management.', features: ['Rent collection', '24/7 maintenance', 'Monthly statements', 'Owner portal', 'Lease enforcement'], popular: true },
    { name: 'Commercial', price: 'Custom quote', description: 'Tailored management for commercial properties.', features: ['CAM reconciliation', 'Tenant retention', 'Vendor management', 'Financial reporting', 'Facility oversight'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the Summit Property Management assistant. How can I help you today?",
    placeholder: "Ask about our management services...",
    knowledgeBase: [
      "We offer residential management, commercial management, tenant screening, maintenance and repairs, financial reporting, and lease administration.",
      "Our standard management fee is 8-10% of collected rent, with no fee when your property is vacant. We provide a custom quote during your free consultation.",
      "We screen tenants with comprehensive credit and background checks, income verification, rental history, and eviction records.",
      "Owner distributions are sent by direct deposit by the 10th of each month, along with a detailed monthly statement.",
      "We are fully licensed and insured with comprehensive E&O and general liability coverage.",
      "We offer 24/7 emergency maintenance response for tenants and owners.",
      "Owners get real-time access to statements, reports, and documents through our online owner portal.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are Monday through Friday 8am to 6pm, and Saturday 9am to 1pm.",
      "We have 15+ years of experience and manage over 1,200 units with 98% on-time rent collection.",
    ],
  },
};
