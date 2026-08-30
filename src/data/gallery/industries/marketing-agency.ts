import {
  Megaphone,
  Search,
  Share2,
  Globe,
  PenTool,
  Target,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  BarChart3,
  Rocket,
  Lightbulb,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const marketingAgencyConfig: IndustryConfig = {
  id: 'marketing-agency',
  industryName: 'Marketing Agency',
  businessName: 'BrandBoost Marketing',
  tagline: 'Growth, Engineered.',
  heroTitle: 'Marketing That Drives Real Business Growth',
  heroSubtitle:
    'Digital marketing, SEO, social media, and web design that attract customers and grow revenue. Data-driven strategies, creative execution, and transparent reporting.',
  phone: '(555) 834-2270',
  email: 'grow@brandboost.com',
  serviceArea: 'Greater Metro Area & Remote Nationwide',
  hours: 'Mon-Fri 9am-6pm',
  yearsExperience: '10+',
  licenseNumber: 'MB-7291045',

  colors: {
    primary: '#0891B2',
    primaryDark: '#155E75',
    primaryLight: '#CFFAFE',
    accent: '#BE185D',
    background: '#FFFFFF',
    surface: '#ECFEFF',
    text: '#0A1A1C',
    textMuted: '#5B6B6E',
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

  heroImage: 'https://images.pexels.com/photos/8117415/pexels-photo-8117415.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'Data-Driven • Results-Focused',
  ctaPrimary: 'Get a Free Strategy Session',
  ctaSecondary: 'View Services',

  stats: [
    { value: '10+', label: 'Years Experience' },
    { value: '450+', label: 'Campaigns Launched' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '3.2x', label: 'Average ROAS' },
  ],

  services: [
    {
      icon: Megaphone,
      title: 'Digital Marketing',
      description:
        'Comprehensive digital marketing strategies that connect your brand with the right audience across every channel for measurable growth.',
      features: ['Strategy development', 'Channel planning', 'Campaign management', 'Performance reporting'],
    },
    {
      icon: Search,
      title: 'SEO & Local Search',
      description:
        'Search engine optimization that improves your rankings and visibility. Technical SEO, content, and local search to drive organic traffic.',
      features: ['Technical SEO audit', 'Keyword strategy', 'Local SEO', 'Link building'],
    },
    {
      icon: Share2,
      title: 'Social Media Management',
      description:
        'Strategic social media management that builds your audience and engagement. Content creation, scheduling, and community management.',
      features: ['Content creation', 'Posting schedule', 'Community management', 'Social analytics'],
    },
    {
      icon: Globe,
      title: 'Web Design',
      description:
        'Conversion-focused websites that look great and perform even better. Fast, responsive, and built to turn visitors into customers.',
      features: ['Responsive design', 'Conversion optimization', 'CMS integration', 'Analytics setup'],
    },
    {
      icon: PenTool,
      title: 'Content Marketing',
      description:
        'Content that educates, engages, and converts. Blog posts, videos, and resources that build authority and drive organic traffic.',
      features: ['Blog writing', 'Video content', 'Lead magnets', 'Email newsletters'],
    },
    {
      icon: Target,
      title: 'Paid Advertising',
      description:
        'Targeted paid ad campaigns on Google, Meta, and more. Precise audience targeting and continuous optimization for maximum ROI.',
      features: ['Google Ads', 'Meta Ads', 'Audience targeting', 'ROAS optimization'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Proven Results',
      description:
        'We have launched 450+ campaigns with an average 3.2x return on ad spend. We focus on metrics that matter to your business, not vanity numbers.',
    },
    {
      icon: Clock,
      title: 'Fast Turnaround',
      description:
        'We move quickly without sacrificing quality. Most campaigns launch within two weeks of onboarding, with weekly reporting and optimization.',
    },
    {
      icon: Users,
      title: 'Senior Team',
      description:
        'You work directly with experienced strategists and specialists, not junior account managers. Every campaign is led by a senior team member.',
    },
    {
      icon: ThumbsUp,
      title: 'Full Transparency',
      description:
        'You see every metric, every dollar spent, and every result. We provide dashboard access and monthly reports with clear, honest insights.',
    },
  ],
  whyUsTitle: 'Why Brands Choose BrandBoost',
  whyUsSubtitle:
    'We treat your marketing budget like our own money. Every dollar is accountable to results.',

  process: [
    {
      step: '01',
      title: 'Strategy Session',
      description:
        'We learn your business, goals, and audience. Then we build a custom marketing strategy with clear objectives and projected outcomes.',
    },
    {
      step: '02',
      title: 'Campaign Build',
      description:
        'We design, write, and build your campaigns across all channels. You review and approve everything before anything goes live.',
    },
    {
      step: '03',
      title: 'Launch & Optimize',
      description:
        'Campaigns go live and we monitor performance daily. We test, tweak, and optimize continuously to improve results over time.',
    },
    {
      step: '04',
      title: 'Report & Scale',
      description:
        'You receive weekly reports and monthly strategy calls. We double down on what works and scale your campaigns for growth.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'A clear, accountable process from strategy to scale.',

  testimonials: [
    {
      name: 'GreenLeaf Organics',
      location: 'Brookside',
      rating: 5,
      text: 'BrandBoost grew our online revenue 240% in six months. Their SEO and paid ads work together perfectly. The weekly reports keep us informed and confident.',
    },
    {
      name: 'Marcus D.',
      location: 'Fairfield',
      rating: 5,
      text: 'Our new website converted 3x better than the old one within a month. They actually understand business, not just marketing. A true growth partner.',
    },
    {
      name: 'Uptown Fitness',
      location: 'Uptown',
      rating: 5,
      text: 'Social media went from an afterthought to our top lead source. They create content our members actually share. Membership is up 60% this year.',
    },
  ],
  testimonialsTitle: 'What Our Clients Say',
  testimonialsSubtitle: 'Brands that grew with marketing that actually works.',

  faqs: [
    {
      question: 'How long until I see results?',
      answer:
        'Paid advertising can drive results within weeks, while SEO and content marketing typically take 3-6 months to compound. We set clear expectations and milestones for every channel.',
    },
    {
      question: 'What is your minimum contract length?',
      answer:
        'We work on month-to-month agreements after an initial 90-day onboarding period. We earn your business every month with results, not lock-in contracts.',
    },
    {
      question: 'Do you work with my industry?',
      answer:
        'We have experience across e-commerce, professional services, healthcare, home services, and more. If we are not the right fit, we will tell you honestly in the strategy session.',
    },
    {
      question: 'How do you report on results?',
      answer:
        'You get a live dashboard with real-time metrics, weekly summary emails, and monthly strategy calls. We report on the metrics that matter to your business, not vanity numbers.',
    },
    {
      question: 'What is included in your management fee?',
      answer:
        'Strategy, creative, copywriting, campaign management, optimization, and reporting are all included. Ad spend is separate and you control the budget at all times.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about our marketing services.',

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

  contactTitle: 'Get Your Free Strategy Session',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day to schedule your session.',

  galleryTitle: 'Our Recent Campaigns',
  gallerySubtitle: 'See the creative and results behind our recent work.',
  galleryImages: [
    'https://images.pexels.com/photos/8117415/pexels-photo-8117415.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/8117415/pexels-photo-8117415.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/8117415/pexels-photo-8117415.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Senior strategists and specialists who treat your budget like their own.',
  team: [
    { name: 'Alex Rivera', role: 'Founder & Strategy Director', bio: '10 years in digital marketing. Alex leads strategy for every client and has managed over $20M in ad spend across industries.' },
    { name: 'Jordan Kim', role: 'Creative Director', bio: 'Award-winning designer and copywriter. Jordan leads creative across web design, ads, and content for every BrandBoost client.' },
    { name: 'Sam Patel', role: 'Paid Media Lead', bio: 'Google and Meta certified specialist. Sam manages paid advertising campaigns and has achieved an average 3.2x ROAS across accounts.' },
  ],

  pricingTitle: 'Marketing Service Packages',
  pricingSubtitle: 'Month-to-month after 90-day onboarding. No long-term contracts.',
  pricing: [
    { name: 'Starter', price: 'From $1,500/mo', description: 'For small businesses getting started.', features: ['1 marketing channel', 'Monthly strategy call', 'Weekly reporting', 'Dashboard access', 'Email support'], popular: false },
    { name: 'Growth', price: 'From $3,500/mo', description: 'Multi-channel growth marketing.', features: ['Up to 3 channels', 'Bi-weekly strategy calls', 'Weekly reporting', 'Dashboard access', 'Priority support'], popular: true },
    { name: 'Scale', price: 'From $7,500/mo', description: 'Full-funnel marketing at scale.', features: ['All channels included', 'Weekly strategy calls', 'Custom reporting', 'Dedicated account team', '24/7 support'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the BrandBoost Marketing assistant. How can I help you today?",
    placeholder: "Ask about our marketing services...",
    knowledgeBase: [
      "We offer digital marketing, SEO and local search, social media management, web design, content marketing, and paid advertising.",
      "Paid advertising can drive results within weeks, while SEO and content marketing typically take 3-6 months to compound. We set clear expectations for every channel.",
      "We work month-to-month after an initial 90-day onboarding period. We earn your business every month with results, not lock-in contracts.",
      "We have experience across e-commerce, professional services, healthcare, home services, and many other industries.",
      "You get a live dashboard with real-time metrics, weekly summary emails, and monthly strategy calls on the metrics that matter to your business.",
      "Strategy, creative, copywriting, campaign management, optimization, and reporting are all included. Ad spend is separate and you control the budget.",
      "Our process includes strategy session, campaign build, launch and optimize, and report and scale.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate, plus remote clients nationwide.",
      "Our hours are Monday through Friday, 9am to 6pm.",
      "We have 10+ years of experience, launched 450+ campaigns, and achieved an average 3.2x return on ad spend with a 4.9-star rating.",
    ],
  },
};
