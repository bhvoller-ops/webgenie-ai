import {
  FileText,
  Calculator,
  Wallet,
  Briefcase,
  ShieldAlert,
  BarChart3,
  Award,
  Clock,
  Lock,
  ThumbsUp,
  PhoneCall,
  CheckCircle2,
  TrendingUp,
  Receipt,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const accountingTaxConfig: IndustryConfig = {
  id: 'accounting-tax',
  industryName: 'Accounting & Tax',
  businessName: 'LedgerWise Accounting',
  tagline: 'Numbers Done Right.',
  heroTitle: 'Accounting & Tax Services for Growth-Minded Businesses',
  heroSubtitle:
    'From bookkeeping to tax strategy, we handle your finances with precision. Stay compliant, minimize taxes, and make confident decisions with clear financials.',
  phone: '(555) 472-8890',
  email: 'hello@ledgerwise.com',
  serviceArea: 'Greater Metro Area & Remote Nationwide',
  hours: 'Mon-Fri 8am-6pm',
  yearsExperience: '18+',
  licenseNumber: 'CPA-3849201',

  colors: {
    primary: '#1E3A5F',
    primaryDark: '#172554',
    primaryLight: '#DBEAFE',
    accent: '#B45309',
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

  heroImage: 'https://images.pexels.com/photos/7821914/pexels-photo-7821914.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'CPA-Licensed • Secure & Confidential',
  ctaPrimary: 'Get a Free Consultation',
  ctaSecondary: 'View Services',

  stats: [
    { value: '18+', label: 'Years Experience' },
    { value: '1,200+', label: 'Clients Served' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '$8M+', label: 'Tax Savings Secured' },
  ],

  services: [
    {
      icon: FileText,
      title: 'Tax Preparation',
      description:
        'Accurate, timely tax preparation for individuals and businesses. We maximize deductions and ensure full compliance with current tax laws.',
      features: ['Personal & business returns', 'Deduction maximization', 'E-filing', 'Audit support'],
    },
    {
      icon: Calculator,
      title: 'Bookkeeping',
      description:
        'Monthly bookkeeping that keeps your records clean and current. Reconciliations, categorization, and financial statements you can trust.',
      features: ['Bank reconciliations', 'Expense categorization', 'Monthly statements', 'Cloud-based access'],
    },
    {
      icon: Wallet,
      title: 'Payroll Services',
      description:
        'Full-service payroll processing that handles paychecks, taxes, and filings. Accurate, on-time, and fully compliant every pay period.',
      features: ['Payroll processing', 'Tax filings', 'Direct deposit', 'W-2s and 1099s'],
    },
    {
      icon: Briefcase,
      title: 'Business Consulting',
      description:
        'Strategic financial guidance to help your business grow. Cash flow analysis, budgeting, and profit improvement strategies tailored to you.',
      features: ['Cash flow analysis', 'Budgeting & forecasting', 'Profit improvement', 'Growth planning'],
    },
    {
      icon: ShieldAlert,
      title: 'IRS Representation',
      description:
        'If you receive an IRS notice or face an audit, we represent you. We handle correspondence, negotiations, and resolution on your behalf.',
      features: ['Audit representation', 'Notice response', 'Offer in compromise', 'Installment agreements'],
    },
    {
      icon: BarChart3,
      title: 'Financial Statements',
      description:
        'Professional financial statements that give you a clear picture of your business health. Balance sheets, income statements, and cash flow reports.',
      features: ['Balance sheets', 'Income statements', 'Cash flow reports', 'Custom reporting'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'CPA-Licensed Experts',
      description:
        'Our team includes licensed CPAs with 18+ years of experience. You get professional expertise and the peace of mind that comes with it.',
    },
    {
      icon: Clock,
      title: 'Always On Time',
      description:
        'Deadlines matter. We meet every filing deadline, deliver reports on schedule, and respond to your questions within one business day.',
    },
    {
      icon: Lock,
      title: 'Bank-Level Security',
      description:
        'Your financial data is protected with encrypted, SOC-compliant systems. We take confidentiality and data security seriously at every level.',
    },
    {
      icon: ThumbsUp,
      title: 'Proactive Guidance',
      description:
        'We do not just record history — we help shape your future. We flag opportunities and risks before they become problems, not after.',
    },
  ],
  whyUsTitle: 'Why Businesses Trust LedgerWise',
  whyUsSubtitle:
    'We combine CPA-level expertise with technology and genuine care for your financial success.',

  process: [
    {
      step: '01',
      title: 'Free Consultation',
      description:
        'We discuss your needs, review your current situation, and recommend the right services for your business or personal finances.',
    },
    {
      step: '02',
      title: 'Onboarding',
      description:
        'We set up secure access to your accounts, transfer existing records, and establish a clear workflow and communication plan.',
    },
    {
      step: '03',
      title: 'Ongoing Service',
      description:
        'We handle your bookkeeping, payroll, and tax needs month to month. You receive clear reports and proactive guidance throughout.',
    },
    {
      step: '04',
      title: 'Year-End & Strategy',
      description:
        'We prepare year-end filings and meet to discuss tax strategy, growth opportunities, and financial goals for the year ahead.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'A straightforward process that keeps your finances organized all year.',

  testimonials: [
    {
      name: 'Rachel M.',
      location: 'Brookside',
      rating: 5,
      text: 'LedgerWise found deductions my previous accountant missed and saved me $4,200 last year. Their monthly bookkeeping finally gives me clear numbers to run my business by.',
    },
    {
      name: 'David K.',
      location: 'Fairfield',
      rating: 5,
      text: 'They handled an IRS notice I was terrified about. They managed every detail, resolved it for far less than I expected, and kept me informed throughout. A lifesaver.',
    },
    {
      name: 'Thompson Construction',
      location: 'Eastside',
      rating: 5,
      text: 'Payroll, bookkeeping, and taxes all in one place. Our crew gets paid on time and I never worry about filings. The quarterly strategy sessions are genuinely valuable.',
    },
  ],
  testimonialsTitle: 'What Our Clients Say',
  testimonialsSubtitle: 'Businesses and individuals who trust us with their numbers.',

  faqs: [
    {
      question: 'Do you work with individuals or only businesses?',
      answer:
        'Both. We provide tax preparation and financial planning for individuals, plus full bookkeeping, payroll, and tax services for businesses of all sizes.',
    },
    {
      question: 'How do you charge for your services?',
      answer:
        'We offer flat monthly fees for ongoing services like bookkeeping and payroll, and project-based pricing for tax preparation. You always know the cost upfront with no surprises.',
    },
    {
      question: 'Can you help if I am behind on my taxes?',
      answer:
        'Yes. We specialize in getting caught up. We can prepare prior-year returns, negotiate with the IRS on your behalf, and set up a plan to resolve any balances owed.',
    },
    {
      question: 'Do you offer remote or virtual services?',
      answer:
        'Absolutely. We work with clients nationwide through secure cloud-based accounting software. You can access your books and reports anytime, from anywhere.',
    },
    {
      question: 'How do you keep my financial data secure?',
      answer:
        'We use encrypted, SOC-compliant systems for all data storage and transfer. Access is restricted to your assigned team, and we follow strict confidentiality protocols.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about our accounting and tax services.',

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

  contactTitle: 'Get Your Free Consultation',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day to discuss your needs.',

  galleryTitle: 'Our Work in Action',
  gallerySubtitle: 'See how we help businesses stay organized and tax-efficient.',
  galleryImages: [
    'https://images.pexels.com/photos/7821914/pexels-photo-7821914.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/7821914/pexels-photo-7821914.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/7821914/pexels-photo-7821914.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Licensed CPAs and accountants dedicated to your financial success.',
  team: [
    { name: 'Patricia Hughes', role: 'Managing Partner, CPA', bio: 'Licensed CPA with 18 years of experience in tax and accounting. Patricia leads the firm and specializes in complex business tax strategy.' },
    { name: 'Kevin O’Brien', role: 'Tax Manager, CPA', bio: 'Specializes in individual and business tax preparation, IRS representation, and tax controversy resolution for clients at every level.' },
    { name: 'Lisa Chen', role: 'Bookkeeping Manager', bio: 'Manages monthly bookkeeping and payroll for over 200 clients. Lisa ensures every account is reconciled and every report is accurate.' },
  ],

  pricingTitle: 'Accounting Service Packages',
  pricingSubtitle: 'Transparent monthly pricing with no hidden fees.',
  pricing: [
    { name: 'Bookkeeping', price: 'From $250/mo', description: 'Monthly bookkeeping for small businesses.', features: ['Bank reconciliations', 'Expense categorization', 'Monthly statements', 'Cloud-based access', 'Email support'], popular: true },
    { name: 'Tax Preparation', price: 'From $350', description: 'Individual and business tax returns.', features: ['Personal or business return', 'Deduction maximization', 'E-filing included', 'Year-round support', 'Audit support'], popular: false },
    { name: 'Full-Service', price: 'From $600/mo', description: 'Bookkeeping, payroll, and tax strategy.', features: ['Monthly bookkeeping', 'Payroll processing', 'Quarterly tax filings', 'Annual tax return', 'Strategy sessions'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the LedgerWise Accounting assistant. How can I help you today?",
    placeholder: "Ask about our accounting services...",
    knowledgeBase: [
      "We offer tax preparation, bookkeeping, payroll services, business consulting, IRS representation, and financial statement preparation.",
      "We work with both individuals and businesses, providing tax preparation and financial planning for individuals and full accounting services for businesses.",
      "We offer flat monthly fees for ongoing services like bookkeeping and payroll, and project-based pricing for tax preparation. You always know the cost upfront.",
      "Yes, we specialize in getting caught up. We can prepare prior-year returns, negotiate with the IRS, and set up a plan to resolve balances owed.",
      "We work with clients nationwide through secure cloud-based accounting software. You can access your books and reports anytime from anywhere.",
      "We use encrypted, SOC-compliant systems for all data storage and transfer, with access restricted to your assigned team.",
      "Our team includes licensed CPAs with 18+ years of experience, ensuring professional expertise and peace of mind.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate, plus remote clients nationwide.",
      "Our hours are Monday through Friday, 8am to 6pm.",
      "We have 18+ years of experience, serve over 1,200 clients, and have secured over $8 million in tax savings with a 4.9-star average rating.",
    ],
  },
};
