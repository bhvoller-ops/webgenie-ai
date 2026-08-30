import {
  Car,
  Home,
  HeartPulse,
  Building2,
  Stethoscope,
  Umbrella,
  ShieldCheck,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  FileCheck,
  Award,
  LifeBuoy,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const insuranceAgencyConfig: IndustryConfig = {
  id: 'insurance-agency',
  industryName: 'Insurance Agency',
  businessName: 'ShieldLine Insurance',
  tagline: 'Protection for What Matters Most.',
  heroTitle: 'Comprehensive Insurance Coverage Tailored to You',
  heroSubtitle:
    'Auto, home, life, and business insurance from top-rated carriers. We shop the market to find you the right coverage at the right price, with a real person when you need us.',
  phone: '(555) 629-4410',
  email: 'quotes@shieldline.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Fri 8am-7pm, Sat 9am-1pm',
  yearsExperience: '25+',
  licenseNumber: 'INS-5820194',

  colors: {
    primary: '#1E40AF',
    primaryDark: '#1E3A8A',
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

  heroImage: 'https://images.pexels.com/photos/8297423/pexels-photo-8297423.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'Top-Rated Carriers • Local Agents',
  ctaPrimary: 'Get a Free Quote',
  ctaSecondary: 'View Coverage',

  stats: [
    { value: '25+', label: 'Years Experience' },
    { value: '15,000+', label: 'Policies Written' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '24/7', label: 'Claims Support' },
  ],

  services: [
    {
      icon: Car,
      title: 'Auto Insurance',
      description:
        'Comprehensive auto coverage that protects you on the road. Liability, collision, and full coverage options with multi-policy discounts available.',
      features: ['Liability coverage', 'Collision & comprehensive', 'Uninsured motorist', 'Multi-car discounts'],
    },
    {
      icon: Home,
      title: 'Home Insurance',
      description:
        'Homeowners coverage that protects your home, belongings, and liability. We tailor limits and deductibles to fit your home and budget.',
      features: ['Dwelling coverage', 'Personal property', 'Liability protection', 'Loss of use'],
    },
    {
      icon: HeartPulse,
      title: 'Life Insurance',
      description:
        'Term and whole life insurance that protects your family financially. We help you choose the right coverage amount and type for your goals.',
      features: ['Term life', 'Whole life', 'Universal life', 'Income replacement'],
    },
    {
      icon: Building2,
      title: 'Business Insurance',
      description:
        'Commercial coverage for businesses of every size. General liability, property, workers comp, and professional liability tailored to your industry.',
      features: ['General liability', 'Commercial property', 'Workers compensation', 'Professional liability'],
    },
    {
      icon: Stethoscope,
      title: 'Health Insurance',
      description:
        'Individual and family health plans from top carriers. We help you navigate options and find coverage that fits your needs and budget.',
      features: ['Individual & family plans', 'Group health', 'Dental & vision', 'Supplemental coverage'],
    },
    {
      icon: Umbrella,
      title: 'Umbrella Coverage',
      description:
        'Extra liability protection above your existing policy limits. Affordable peace of mind for high-net-worth individuals and business owners.',
      features: ['$1M+ liability limits', 'Covers auto & home', 'Worldwide protection', 'Affordable premiums'],
    },
  ],

  whyUs: [
    {
      icon: ShieldCheck,
      title: 'Multiple Top Carriers',
      description:
        'We shop 20+ top-rated insurance carriers to find you the best coverage at the best price. One call, multiple quotes, no obligation.',
    },
    {
      icon: Clock,
      title: '24/7 Claims Support',
      description:
        'When you need to file a claim, we are here around the clock. We guide you through the process and advocate on your behalf.',
    },
    {
      icon: Users,
      title: 'Local, Real People',
      description:
        'You work with a dedicated local agent who knows you by name. No call centers, no waiting on hold — just responsive, personal service.',
    },
    {
      icon: ThumbsUp,
      title: 'Annual Policy Reviews',
      description:
        'Life changes, and so should your coverage. We review your policies every year to make sure you are always properly protected and not overpaying.',
    },
  ],
  whyUsTitle: 'Why Clients Choose ShieldLine',
  whyUsSubtitle:
    'We are not just a policy number. We are your advocate, your advisor, and your neighbor.',

  process: [
    {
      step: '01',
      title: 'Get a Quote',
      description:
        'Tell us about your needs. We shop our 20+ carriers and provide multiple coverage options with clear pricing within one business day.',
    },
    {
      step: '02',
      title: 'Choose Your Coverage',
      description:
        'We explain your options in plain English and help you select the right coverage and deductibles for your situation and budget.',
    },
    {
      step: '03',
      title: 'Activate Your Policy',
      description:
        'We handle all paperwork and setup. Your coverage begins immediately, and you receive your policy documents right away.',
    },
    {
      step: '04',
      title: 'Ongoing Support',
      description:
        'We review your coverage annually, help with claims, and adjust your policies as your life and needs change over time.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'Getting the right coverage is simpler than you think.',

  testimonials: [
    {
      name: 'Jennifer R.',
      location: 'Brookside',
      rating: 5,
      text: 'ShieldLine saved us $1,200 a year by bundling our home and auto. When a tree hit our roof, they handled the claim start to finish. True advocates.',
    },
    {
      name: 'Michael T.',
      location: 'Fairfield',
      rating: 5,
      text: 'After a fender bender, my agent answered on a Sunday and walked me through everything. The claim was settled in days. That is service you cannot put a price on.',
    },
    {
      name: 'Riverside Bakery',
      location: 'Riverside',
      rating: 5,
      text: 'They built a custom business policy that covered everything we needed and nothing we did not. Our annual review caught a gap that would have cost us dearly.',
    },
  ],
  testimonialsTitle: 'What Our Clients Say',
  testimonialsSubtitle: 'Real people, real protection, real peace of mind.',

  faqs: [
    {
      question: 'How can I lower my insurance premiums?',
      answer:
        'Bundling policies, increasing deductibles, and maintaining a clean driving record all help. We also shop multiple carriers annually to ensure you always get the best rate for your coverage.',
    },
    {
      question: 'How do I file a claim?',
      answer:
        'Call us anytime, 24/7. We guide you through the claims process, help you document everything, and advocate with the carrier on your behalf from start to resolution.',
    },
    {
      question: 'How much life insurance do I need?',
      answer:
        'A common guideline is 10-12 times your annual income, but it depends on your debts, dependents, and goals. We help you calculate the right amount at no cost or obligation.',
    },
    {
      question: 'Do you offer business insurance?',
      answer:
        'Yes. We provide general liability, property, workers compensation, professional liability, and commercial auto coverage tailored to your industry and business size.',
    },
    {
      question: 'What happens if I miss a payment?',
      answer:
        'Contact us immediately. Most carriers offer a grace period and we can help arrange a payment plan or find alternative coverage to prevent a lapse in protection.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about our insurance services.',

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

  contactTitle: 'Get Your Free Insurance Quote',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day with your coverage options.',

  galleryTitle: 'Protection in Action',
  gallerySubtitle: 'See how ShieldLine supports our community when it matters most.',
  galleryImages: [
    'https://images.pexels.com/photos/8297423/pexels-photo-8297423.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/8297423/pexels-photo-8297423.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/8297423/pexels-photo-8297423.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Licensed local agents who treat your protection like their own.',
  team: [
    { name: 'Thomas Bradley', role: 'Principal Agent', bio: 'Licensed insurance agent with 25 years of experience. Thomas founded ShieldLine and personally oversees every commercial account.' },
    { name: 'Grace Nguyen', role: 'Personal Lines Agent', bio: 'Specializes in home, auto, and life insurance. Grace is known for finding discounts and coverage options others miss.' },
    { name: 'Robert Ellis', role: 'Claims Advocate', bio: 'Your dedicated point of contact when you file a claim. Robert works directly with carriers to ensure fair, fast resolutions.' },
  ],

  pricingTitle: 'Insurance Coverage Options',
  pricingSubtitle: 'Sample monthly rates. Your actual quote is customized to you.',
  pricing: [
    { name: 'Auto Insurance', price: 'From $89/mo', description: 'Full coverage for your vehicle.', features: ['Liability coverage', 'Collision & comprehensive', 'Uninsured motorist', 'Roadside assistance', 'Multi-car discounts'], popular: true },
    { name: 'Home Insurance', price: 'From $120/mo', description: 'Protection for your home and belongings.', features: ['Dwelling coverage', 'Personal property', 'Liability protection', 'Loss of use', 'Bundle discount available'], popular: false },
    { name: 'Bundle & Save', price: 'From $189/mo', description: 'Auto and home together.', features: ['Auto + home combined', 'Up to 25% savings', 'Single deductible', 'One renewal date', 'Enhanced coverage'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the ShieldLine Insurance assistant. How can I help you today?",
    placeholder: "Ask about our insurance services...",
    knowledgeBase: [
      "We offer auto, home, life, business, health, and umbrella insurance coverage from 20+ top-rated carriers.",
      "You can lower premiums by bundling policies, increasing deductibles, maintaining a clean driving record, and letting us shop carriers annually for the best rate.",
      "To file a claim, call us anytime 24/7. We guide you through the process, help with documentation, and advocate with the carrier on your behalf.",
      "A common guideline for life insurance is 10-12 times your annual income, but we help you calculate the right amount based on your debts, dependents, and goals.",
      "Yes, we provide business insurance including general liability, property, workers compensation, professional liability, and commercial auto coverage.",
      "We shop 20+ top-rated carriers to find you the best coverage at the best price from one phone call, with no obligation.",
      "We provide annual policy reviews to ensure your coverage keeps up with life changes and that you are not overpaying.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are Monday through Friday 8am to 7pm, and Saturday 9am to 1pm, with 24/7 claims support.",
      "We have 25+ years of experience and have written over 15,000 policies with a 4.9-star average rating.",
    ],
  },
};
