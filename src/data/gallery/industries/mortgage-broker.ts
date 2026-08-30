import {
  Home,
  Building2,
  ShieldCheck,
  RefreshCw,
  Landmark,
  GraduationCap,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  Calculator,
  FileText,
  TrendingUp,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const mortgageBrokerConfig: IndustryConfig = {
  id: 'mortgage-broker',
  industryName: 'Mortgage Broker',
  businessName: 'PrimeLend Mortgage Group',
  tagline: 'Your Loan, Your Terms.',
  heroTitle: 'Find the Right Mortgage for You',
  heroSubtitle:
    'Access loans from dozens of lenders with one application. Conventional, FHA, VA, and jumbo loans with competitive rates and a smooth, transparent process.',
  phone: '(555) 318-7742',
  email: 'loans@primelend.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Fri 8am-7pm, Sat 9am-2pm',
  yearsExperience: '20+',
  licenseNumber: 'NMLS-2948173',

  colors: {
    primary: '#1E3A5F',
    primaryDark: '#172554',
    primaryLight: '#DBEAFE',
    accent: '#0D9488',
    background: '#FFFFFF',
    surface: '#F1F5F9',
    text: '#0A1929',
    textMuted: '#5B6B7E',
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

  heroImage: 'https://images.pexels.com/photos/8292888/pexels-photo-8292888.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'Licensed • NMLS-Verified',
  ctaPrimary: 'Get Pre-Approved',
  ctaSecondary: 'View Loan Options',

  stats: [
    { value: '20+', label: 'Years Experience' },
    { value: '$2.1B+', label: 'Loans Funded' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '21 Days', label: 'Average Close Time' },
  ],

  services: [
    {
      icon: Home,
      title: 'Conventional Loans',
      description:
        'Flexible conventional mortgages with competitive rates. Down payments as low as 3% and a variety of term options to fit your budget.',
      features: ['3% down minimum', '15 & 30-year terms', 'Fixed & adjustable rates', 'No PMI with 20% down'],
    },
    {
      icon: Building2,
      title: 'FHA Loans',
      description:
        'Government-backed FHA loans designed for first-time and moderate-income buyers. Lower credit requirements and down payments from 3.5%.',
      features: ['3.5% down payment', 'Lower credit scores OK', 'Gift funds accepted', 'Assumable loans'],
    },
    {
      icon: ShieldCheck,
      title: 'VA Loans',
      description:
        'Zero-down VA loans for active military, veterans, and eligible spouses. No PMI, competitive rates, and flexible credit guidelines.',
      features: ['0% down payment', 'No PMI required', 'Competitive rates', 'Streamline refinance'],
    },
    {
      icon: RefreshCw,
      title: 'Refinancing',
      description:
        'Lower your rate, shorten your term, or pull cash out. We help you evaluate whether refinancing makes sense for your situation.',
      features: ['Rate-and-term refinance', 'Cash-out refinance', 'Streamline options', 'Break-even analysis'],
    },
    {
      icon: Landmark,
      title: 'Jumbo Loans',
      description:
        'Financing for higher-priced properties that exceed conforming loan limits. Competitive rates and flexible underwriting for qualified buyers.',
      features: ['Loans above $766,550', 'Competitive jumbo rates', 'Flexible underwriting', 'Primary & second homes'],
    },
    {
      icon: GraduationCap,
      title: 'First-Time Buyer Programs',
      description:
        'Specialized programs with down payment assistance, grants, and education resources to make homeownership accessible for first-time buyers.',
      features: ['Down payment assistance', 'Grants available', 'Homebuyer education', 'Closing cost help'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Access 40+ Lenders',
      description:
        'As brokers we shop dozens of lenders to find you the best rate and terms. One application, multiple offers, no extra work for you.',
    },
    {
      icon: Clock,
      title: 'Fast Closings',
      description:
        'Our average closing time is 21 days. We keep the process moving with proactive communication and digital document management.',
    },
    {
      icon: Users,
      title: 'Personal Guidance',
      description:
        'You work with a dedicated loan officer from application to closing. We explain every step and answer your questions in plain English.',
    },
    {
      icon: ThumbsUp,
      title: 'Transparent Pricing',
      description:
        'No hidden fees or surprises. You see all costs upfront and we explain every line of your loan estimate before you commit.',
    },
  ],
  whyUsTitle: 'Why Borrowers Choose PrimeLend',
  whyUsSubtitle:
    'We shop the lenders so you do not have to. Better rates, faster closings, and a team that actually picks up the phone.',

  process: [
    {
      step: '01',
      title: 'Get Pre-Approved',
      description:
        'Complete a quick online application. We review your finances and issue a pre-approval letter, usually within 24 hours.',
    },
    {
      step: '02',
      title: 'Shop With Confidence',
      description:
        'Your pre-approval letter shows sellers you are serious. Find your home and make an offer with financing already in place.',
    },
    {
      step: '03',
      title: 'Lock Your Rate',
      description:
        'Once under contract, we lock your rate and order the appraisal. We handle all paperwork and coordinate with all parties.',
    },
    {
      step: '04',
      title: 'Close Your Loan',
      description:
        'Sign your final documents and get your keys. We attend closing to ensure everything goes smoothly and on time.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'A streamlined mortgage process from pre-approval to closing.',

  testimonials: [
    {
      name: 'Sarah & Mike P.',
      location: 'Brookside',
      rating: 5,
      text: 'PrimeLend got us a rate 0.5% lower than our bank quoted. They explained every option and closed in 18 days. We could not be happier.',
    },
    {
      name: 'James L.',
      location: 'Fairfield',
      rating: 5,
      text: 'As a veteran I was nervous about the VA loan process. They made it effortless — zero down, no PMI, and they handled everything. Incredible team.',
    },
    {
      name: 'Priya N.',
      location: 'Eastside',
      rating: 5,
      text: 'First-time buyer with lots of questions. My loan officer answered every one patiently and found me a down payment assistance program I did not know existed.',
    },
  ],
  testimonialsTitle: 'What Our Clients Say',
  testimonialsSubtitle: 'Homeowners who got the right loan at the right rate.',

  faqs: [
    {
      question: 'How much do I need for a down payment?',
      answer:
        'It depends on the loan type. Conventional loans start at 3% down, FHA loans at 3.5%, and VA loans require 0%. We also offer down payment assistance programs for qualified buyers.',
    },
    {
      question: 'What credit score do I need to qualify?',
      answer:
        'Minimum credit scores vary by loan type. FHA loans accept scores as low as 580, while conventional loans typically require 620 or higher. We review your full financial picture, not just the score.',
    },
    {
      question: 'How long does the mortgage process take?',
      answer:
        'From application to closing, the average timeline is 21-30 days. Pre-approval usually takes 24 hours. We keep the process moving with proactive communication and digital document management.',
    },
    {
      question: 'What is the difference between a broker and a bank?',
      answer:
        'A bank offers only its own loan products. As a broker, we shop 40+ lenders to find you the best rate and terms from one application, often saving you money and giving you more options.',
    },
    {
      question: 'When should I get pre-approved?',
      answer:
        'Before you start house hunting. A pre-approval letter shows sellers you are serious and lets you shop within your budget. It is free, does not commit you, and is typically valid for 90 days.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about our mortgage services.',

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

  contactTitle: 'Start Your Mortgage Journey',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day with your loan options.',

  galleryTitle: 'Our Recent Loan Closings',
  gallerySubtitle: 'Celebrating another family getting the keys.',
  galleryImages: [
    'https://images.pexels.com/photos/8292888/pexels-photo-8292888.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/8292888/pexels-photo-8292888.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/8292888/pexels-photo-8292888.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Licensed loan officers dedicated to finding your perfect loan.',
  team: [
    { name: 'Jennifer Walsh', role: 'Senior Loan Officer', bio: 'NMLS-licensed with 18 years of mortgage experience. Jennifer specializes in conventional and jumbo loans and has funded over $500M in volume.' },
    { name: 'Carlos Mendez', role: 'VA & FHA Specialist', bio: 'A veteran himself, Carlos is passionate about helping military families and first-time buyers navigate government loan programs.' },
    { name: 'Aisha Johnson', role: 'Loan Processor', bio: 'Keeps every loan moving on schedule. Aisha manages documentation, coordination, and timelines to ensure smooth, on-time closings.' },
  ],

  pricingTitle: 'Mortgage Loan Options',
  pricingSubtitle: 'Transparent rates and fees with no surprises.',
  pricing: [
    { name: 'Conventional Loan', price: 'From 6.25% APR', description: 'Flexible terms for qualified buyers.', features: ['3% down minimum', '15 & 30-year terms', 'Fixed or adjustable', 'No PMI at 20% down', 'Competitive rates'], popular: true },
    { name: 'FHA Loan', price: 'From 6.50% APR', description: 'Government-backed for first-time buyers.', features: ['3.5% down payment', 'Credit scores from 580', 'Gift funds accepted', 'Assumable loans', 'Lower closing costs'], popular: false },
    { name: 'VA Loan', price: 'From 6.00% APR', description: 'Zero-down for veterans and military.', features: ['0% down payment', 'No PMI required', 'Competitive rates', 'Streamline refinance', 'No funding fee for some'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the PrimeLend Mortgage assistant. How can I help you today?",
    placeholder: "Ask about our mortgage services...",
    knowledgeBase: [
      "We offer conventional loans, FHA loans, VA loans, refinancing, jumbo loans, and first-time buyer programs with down payment assistance.",
      "Down payment requirements vary: conventional loans start at 3% down, FHA at 3.5%, and VA loans require 0% down.",
      "Minimum credit scores vary by loan type. FHA accepts scores as low as 580, while conventional typically requires 620 or higher.",
      "From application to closing, the average timeline is 21 to 30 days. Pre-approval usually takes 24 hours.",
      "As a broker we shop 40+ lenders to find you the best rate and terms from one application, often saving you money versus a single bank.",
      "You should get pre-approved before you start house hunting. It is free, does not commit you, and is typically valid for 90 days.",
      "We offer down payment assistance programs and grants for qualified first-time buyers to make homeownership more accessible.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are Monday through Friday 8am to 7pm, and Saturday 9am to 2pm.",
      "We have 20+ years of experience and have funded over $2.1 billion in loans with a 4.9-star average rating.",
    ],
  },
};
