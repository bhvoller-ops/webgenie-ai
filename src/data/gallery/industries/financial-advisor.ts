import {
  PiggyBank,
  TrendingUp,
  FileText,
  Receipt,
  ShieldCheck,
  GraduationCap,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  Target,
  LineChart,
  Handshake,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const financialAdvisorConfig: IndustryConfig = {
  id: 'financial-advisor',
  industryName: 'Financial Advisor',
  businessName: 'WealthPath Financial',
  tagline: 'Your Path to Financial Confidence.',
  heroTitle: 'Financial Planning for Every Stage of Life',
  heroSubtitle:
    'Retirement, investment, estate, and tax planning tailored to your goals. Fiduciary advice, transparent fees, and a long-term partnership for your financial future.',
  phone: '(555) 718-3325',
  email: 'advisor@wealthpath.com',
  serviceArea: 'Greater Metro Area & Remote Nationwide',
  hours: 'Mon-Fri 8am-6pm',
  yearsExperience: '22+',
  licenseNumber: 'SEC-8029174',

  colors: {
    primary: '#15803D',
    primaryDark: '#166534',
    primaryLight: '#DCFCE7',
    accent: '#1E3A5F',
    background: '#FFFFFF',
    surface: '#F0FDF4',
    text: '#0A1A0F',
    textMuted: '#5B6B5E',
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

  heroImage: 'https://images.pexels.com/photos/8353820/pexels-photo-8353820.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'Fiduciary • Fee-Only • SEC-Registered',
  ctaPrimary: 'Book a Free Consultation',
  ctaSecondary: 'View Services',

  stats: [
    { value: '22+', label: 'Years Experience' },
    { value: '$850M+', label: 'Assets Under Management' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '98%', label: 'Client Retention' },
  ],

  services: [
    {
      icon: PiggyBank,
      title: 'Retirement Planning',
      description:
        'Comprehensive retirement planning that answers your biggest question: when can I retire, and will my money last? We build a plan you can count on.',
      features: ['Retirement income planning', 'Social Security strategy', 'Pension optimization', 'Withdrawal strategy'],
    },
    {
      icon: TrendingUp,
      title: 'Investment Management',
      description:
        'Diversified, low-cost investment portfolios built for your goals and risk tolerance. Ongoing rebalancing and tax-efficient strategies included.',
      features: ['Portfolio design', 'Diversification', 'Tax-loss harvesting', 'Ongoing rebalancing'],
    },
    {
      icon: FileText,
      title: 'Estate Planning',
      description:
        'Coordinate with your attorney to ensure your estate plan reflects your wishes. We help minimize taxes and simplify things for your heirs.',
      features: ['Estate strategy', 'Beneficiary review', 'Trust coordination', 'Tax minimization'],
    },
    {
      icon: Receipt,
      title: 'Tax Strategy',
      description:
        'Proactive tax planning throughout the year, not just at filing time. We identify strategies to reduce your tax burden and keep more of your money.',
      features: ['Year-round planning', 'Roth conversions', 'Tax-efficient investing', 'Charitable strategies'],
    },
    {
      icon: ShieldCheck,
      title: 'Insurance Planning',
      description:
        'Review your life, disability, and long-term care coverage to protect your family and income. We recommend only what you actually need.',
      features: ['Life insurance review', 'Disability coverage', 'Long-term care', 'Coverage gap analysis'],
    },
    {
      icon: GraduationCap,
      title: 'College Savings Plans',
      description:
        '529 plans and education savings strategies that help you fund your childrens education tax-efficiently while staying on track for retirement.',
      features: ['529 plan setup', 'Education funding strategy', 'Tax benefits', 'Financial aid planning'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Fiduciary Standard',
      description:
        'We are legally obligated to act in your best interest, always. No commissions, no hidden incentives — just advice that serves you and only you.',
    },
    {
      icon: Clock,
      title: 'Long-Term Partnership',
      description:
        'We are here for decades, not a single transaction. Our 98% client retention rate reflects relationships built on trust and consistent results.',
    },
    {
      icon: Users,
      title: 'Holistic Planning',
      description:
        'We look at your entire financial picture — investments, taxes, estate, insurance — not just one piece. Everything works together.',
    },
    {
      icon: ThumbsUp,
      title: 'Transparent Fees',
      description:
        'You know exactly what you pay and why. Our fee-only structure means no commissions, no kickbacks, and no conflicts of interest. Ever.',
    },
  ],
  whyUsTitle: 'Why Clients Trust WealthPath',
  whyUsSubtitle:
    'We are fiduciaries, fee-only, and focused on your long-term success — not on selling products.',

  process: [
    {
      step: '01',
      title: 'Free Consultation',
      description:
        'We discuss your goals, concerns, and current financial situation. There is no obligation and no pressure — just a conversation.',
    },
    {
      step: '02',
      title: 'Comprehensive Plan',
      description:
        'We analyze your full financial picture and build a written plan covering investments, retirement, taxes, estate, and insurance.',
    },
    {
      step: '03',
      title: 'Implementation',
      description:
        'We help you put the plan into action — opening accounts, adjusting investments, and coordinating with your attorney and CPA.',
    },
    {
      step: '04',
      title: 'Ongoing Reviews',
      description:
        'We meet regularly to review progress, adjust for life changes, and keep your plan on track as your goals evolve over time.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'A thorough, personalized process from first call to long-term partnership.',

  testimonials: [
    {
      name: 'Robert & Linda S.',
      location: 'Brookside',
      rating: 5,
      text: 'WealthPath built a retirement plan that gave us confidence to retire two years earlier than we thought. Their tax strategy alone saved us thousands. Truly fiduciary.',
    },
    {
      name: 'Dr. Angela W.',
      location: 'Fairfield',
      rating: 5,
      text: 'As a physician I was wary of advisors pushing products. WealthPath is fee-only and fiduciary. They simplified my investments and cut my fees in half. No pressure, ever.',
    },
    {
      name: 'James P.',
      location: 'Eastside',
      rating: 5,
      text: 'After my wifes passing, they helped me reorganize everything — estate, taxes, investments. Patient, compassionate, and brilliant. I finally feel in control again.',
    },
  ],
  testimonialsTitle: 'What Our Clients Say',
  testimonialsSubtitle: 'Clients who found clarity, confidence, and a partner for the long term.',

  faqs: [
    {
      question: 'What does fiduciary mean?',
      answer:
        'A fiduciary is legally obligated to act in your best interest at all times. We are fee-only and fiduciary, meaning no commissions and no conflicts of interest. We work only for you.',
    },
    {
      question: 'How are you compensated?',
      answer:
        'We charge a transparent, fee-only structure based on assets under management or a flat planning fee. You know exactly what you pay and why. We receive no commissions or kickbacks.',
    },
    {
      question: 'What is the minimum to work with you?',
      answer:
        'We work with clients at many asset levels. For investment management, our typical minimum is $250,000. For planning-only engagements, we offer flat-fee arrangements with no minimum.',
    },
    {
      question: 'Do you work with clients remotely?',
      answer:
        'Yes. We work with clients nationwide via secure video meetings and digital document sharing. Many of our clients we have never met in person, and the relationship works seamlessly.',
    },
    {
      question: 'How often will we meet?',
      answer:
        'We meet at least quarterly for ongoing clients, plus anytime life changes occur — a new job, a move, a birth, a loss. You can always reach us between meetings by phone or email.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about our financial advisory services.',

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

  contactTitle: 'Book Your Free Consultation',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day to schedule your consultation.',

  galleryTitle: 'Your Financial Journey',
  gallerySubtitle: 'See how thoughtful planning creates lasting confidence.',
  galleryImages: [
    'https://images.pexels.com/photos/8353820/pexels-photo-8353820.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/8353820/pexels-photo-8353820.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/8353820/pexels-photo-8353820.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Fiduciary advisors with the credentials and heart to guide your financial journey.',
  team: [
    { name: 'William Hartman', role: 'Founder & Senior Advisor, CFP', bio: 'Certified Financial Planner with 22 years of experience. William founded WealthPath and leads retirement and estate planning for every client.' },
    { name: 'Sofia Reyes', role: 'Investment Advisor, CFA', bio: 'Chartered Financial Analyst specializing in portfolio management and tax-efficient investing. Sofia designs and manages every client investment portfolio.' },
    { name: 'Daniel Brooks', role: 'Financial Planner, CFP', bio: 'Certified Financial Planner focused on younger clients and families. Daniel specializes in college savings, insurance planning, and early-career strategy.' },
  ],

  pricingTitle: 'Advisory Service Options',
  pricingSubtitle: 'Transparent, fee-only pricing. No commissions, ever.',
  pricing: [
    { name: 'Financial Plan', price: 'From $2,500', description: 'One-time comprehensive financial plan.', features: ['Retirement analysis', 'Investment review', 'Tax strategy', 'Estate review', 'Written plan'], popular: false },
    { name: 'Wealth Management', price: 'From 1.0% AUM', description: 'Ongoing investment management and planning.', features: ['Portfolio management', 'Quarterly reviews', 'Tax-loss harvesting', 'Unlimited access', 'Annual plan update'], popular: true },
    { name: 'Family Office', price: 'Custom', description: 'Comprehensive services for complex situations.', features: ['Multi-generational planning', 'Estate coordination', 'Tax strategy', 'Insurance review', 'Dedicated team'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the WealthPath Financial assistant. How can I help you today?",
    placeholder: "Ask about our financial advisory services...",
    knowledgeBase: [
      "We offer retirement planning, investment management, estate planning, tax strategy, insurance planning, and college savings plans.",
      "A fiduciary is legally obligated to act in your best interest at all times. We are fee-only and fiduciary, with no commissions or conflicts of interest.",
      "We charge a transparent fee-only structure based on assets under management or a flat planning fee. You know exactly what you pay and why.",
      "For investment management, our typical minimum is $250,000. For planning-only engagements, we offer flat-fee arrangements with no minimum.",
      "Yes, we work with clients nationwide via secure video meetings and digital document sharing. Many clients we have never met in person.",
      "We meet at least quarterly for ongoing clients, plus anytime life changes occur. You can always reach us between meetings by phone or email.",
      "Our process includes free consultation, comprehensive plan, implementation, and ongoing reviews.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate, plus remote clients nationwide.",
      "Our hours are Monday through Friday, 8am to 6pm.",
      "We have 22+ years of experience, over $850 million in assets under management, and a 98% client retention rate with a 4.9-star average rating.",
    ],
  },
};
