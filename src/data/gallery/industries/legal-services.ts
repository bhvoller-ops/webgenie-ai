import {
  Scale,
  ShieldCheck,
  FileText,
  Gavel,
  Briefcase,
  Building,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
  Search,
  Landmark,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

const BASE_URL = 'https://images.pexels.com/photos/';

export const legalServicesConfig: IndustryConfig = {
  id: 'legal-services',
  industryName: 'Legal Services / Law Firm',
  businessName: 'Sterling & Reed Law Group',
  tagline: 'Experienced Counsel. Proven Results.',
  heroTitle: 'Trusted Legal Advocacy When It Matters Most',
  heroSubtitle:
    'A full-service law firm representing individuals and businesses across the region. Decades of combined experience, a track record of results, and a commitment to treating every client with respect and clarity.',
  phone: '(555) 442-7781',
  email: 'intake@sterlingreedlaw.com',
  serviceArea: 'Greater Metro Area & Statewide',
  hours: 'Mon-Fri 8am-6pm',
  yearsExperience: '25+',
  licenseNumber: 'BAR-LLC-902345',

  colors: {
    primary: '#1E3A5F',
    primaryDark: '#172554',
    primaryLight: '#DBEAFE',
    accent: '#B45309',
    background: '#FFFFFF',
    surface: '#F1F5F9',
    text: '#0A0F1E',
    textMuted: '#5A6478',
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

  heroImage: `${BASE_URL}5668772/pexels-photo-5668772.jpeg?auto=compress&cs=tinysrgb&w=1200`,
  heroBadge: 'AV-Rated • 25+ Years of Trial Experience',
  ctaPrimary: 'Schedule a Consultation',
  ctaSecondary: 'View Practice Areas',

  stats: [
    { value: '25+', label: 'Years of Practice' },
    { value: '1,400+', label: 'Cases Won' },
    { value: '4.8★', label: 'Client Rating' },
    { value: '$42M+', label: 'Recovered for Clients' },
  ],

  services: [
    {
      icon: ShieldCheck,
      title: 'Personal Injury',
      description:
        'Aggressive representation for accident victims. We handle auto accidents, slip and falls, and wrongful death claims on a contingency fee basis — you pay nothing unless we win.',
      features: ['Auto accidents', 'Slip and fall', 'Wrongful death', 'Insurance disputes'],
    },
    {
      icon: Users,
      title: 'Family Law',
      description:
        'Compassionate counsel for divorce, custody, support, and adoption. We protect your rights and your family through some of life’s most difficult transitions.',
      features: ['Divorce', 'Child custody', 'Spousal support', 'Adoption'],
    },
    {
      icon: FileText,
      title: 'Estate Planning',
      description:
        'Comprehensive estate plans including wills, trusts, powers of attorney, and healthcare directives. Protect your assets and provide for your loved ones.',
      features: ['Wills & trusts', 'Powers of attorney', 'Healthcare directives', 'Probate'],
    },
    {
      icon: Gavel,
      title: 'Criminal Defense',
      description:
        'Experienced defense against misdemeanor and felony charges. We protect your freedom, your record, and your future with thorough preparation and trial-ready advocacy.',
      features: ['DUI defense', 'Drug charges', 'Assault & theft', 'Expungements'],
    },
    {
      icon: Briefcase,
      title: 'Business Law',
      description:
        'Legal counsel for business formation, contracts, disputes, and transactions. From startups to established companies, we help you grow and protect your enterprise.',
      features: ['Entity formation', 'Contract drafting', 'Business disputes', 'Mergers & acquisitions'],
    },
    {
      icon: Building,
      title: 'Real Estate Law',
      description:
        'Residential and commercial real estate transactions, title disputes, landlord-tenant matters, and zoning issues. We keep your deals closing and your investments protected.',
      features: ['Closings & title', 'Lease agreements', 'Property disputes', 'Zoning & land use'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'AV-Preeminent Rated',
      description:
        'Our attorneys hold the highest peer-review rating for legal ability and ethical standards, a distinction earned by fewer than 10% of practicing lawyers.',
    },
    {
      icon: Clock,
      title: 'Responsive & Accessible',
      description:
        'Your attorney calls you back within one business day. We believe clear communication is the foundation of effective representation and client trust.',
    },
    {
      icon: Users,
      title: 'Trial-Tested Team',
      description:
        'We prepare every case as if it will go to trial. Opposing counsel and insurers know we will not hesitate to fight for you in court, which often leads to better settlements.',
    },
    {
      icon: ThumbsUp,
      title: 'Straightforward Counsel',
      description:
        'We tell you the truth about your case, your options, and realistic outcomes — in plain language, not legalese. No surprises, no false promises.',
    },
  ],
  whyUsTitle: 'Why Clients Trust Sterling & Reed',
  whyUsSubtitle:
    'Decades of experience, a results-driven approach, and a genuine commitment to the people we represent.',

  process: [
    {
      step: '01',
      title: 'Free Consultation',
      description:
        'We review your situation, answer your questions, and give you an honest assessment of your case and options. No obligation, no pressure.',
    },
    {
      step: '02',
      title: 'Case Evaluation',
      description:
        'If we move forward, we investigate the facts, gather evidence, consult experts, and build a strategy tailored to your goals.',
    },
    {
      step: '03',
      title: 'Negotiation',
      description:
        'We pursue the best possible settlement through skilled negotiation, keeping you informed and involved at every decision point.',
    },
    {
      step: '04',
      title: 'Trial If Needed',
      description:
        'If a fair settlement is not possible, we take your case to court with a fully prepared, trial-ready legal team fighting for you.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'Clear, straightforward representation from first call to final resolution.',

  testimonials: [
    {
      name: 'Daniel K.',
      location: 'Brookside',
      rating: 5,
      text: 'After my car accident, Sterling & Reed handled everything with the insurance company while I focused on recovery. I received far more than the initial offer and never felt pressured. Truly professional.',
    },
    {
      name: 'Maria S.',
      location: 'Fairfield',
      rating: 5,
      text: 'Going through my divorce was the hardest thing I have ever done. My attorney was compassionate, responsive, and fierce when it mattered. I always knew where my case stood. I cannot recommend them enough.',
    },
    {
      name: 'Greg & Linda P.',
      location: 'Eastside',
      rating: 5,
      text: 'They set up our family trust and walked us through every document in plain English. We finally have peace of mind knowing our kids are protected. Worth every penny.',
    },
  ],
  testimonialsTitle: 'What Our Clients Say',
  testimonialsSubtitle: 'Real outcomes for real people — backed by decades of legal experience.',

  faqs: [
    {
      question: 'Do you offer free consultations?',
      answer:
        'Yes. We offer a free initial consultation for personal injury, family law, estate planning, and most other practice areas. During the consultation we assess your case and explain your options with no obligation.',
    },
    {
      question: 'How are your fees structured?',
      answer:
        'Personal injury cases are handled on a contingency fee basis — you pay nothing unless we win. Other matters are billed hourly or at a flat fee depending on the complexity. We discuss fees clearly before any work begins.',
    },
    {
      question: 'How long will my case take?',
      answer:
        'Timelines vary widely. A simple estate plan may take a few weeks, while a contested divorce or injury claim can take several months to over a year. We give you a realistic timeline estimate at the outset and update you as things progress.',
    },
    {
      question: 'Will my case go to trial?',
      answer:
        'Most cases settle before trial, but we prepare every case as if it will be tried in court. This preparation is exactly what often leads to favorable settlements. If trial is necessary, we are ready and willing to fight for you.',
    },
    {
      question: 'How do I know which attorney is right for my case?',
      answer:
        'During your consultation we match you with the attorney whose experience best fits your matter. Our team collaborates across practice areas, so you benefit from the combined knowledge of the entire firm.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Answers to common questions about working with our firm.',

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

  contactTitle: 'Schedule Your Confidential Consultation',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day to discuss your case.',

  galleryTitle: 'Our Practice in Action',
  gallerySubtitle: 'A look at the firm and the work we do for our clients.',
  galleryImages: [
    `${BASE_URL}5668772/pexels-photo-5668772.jpeg?auto=compress&cs=tinysrgb&w=1200`,
    `${BASE_URL}885080/pexels-photo-885080.jpeg?auto=compress&cs=tinysrgb&w=1200`,
    `${BASE_URL}3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=1200`,
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Experienced attorneys who prepare every case for trial.',
  team: [
    { name: 'James Sterling, Esq.', role: 'Founding Partner', bio: 'Twenty-five years of trial experience specializing in personal injury and business litigation. AV-Preeminent rated and a frequent lecturer on trial advocacy.' },
    { name: 'Patricia Reed, Esq.', role: 'Partner, Family Law', bio: 'Certified family law specialist with a reputation for compassionate, effective representation in complex divorce and custody matters.' },
    { name: 'Michael Tran, Esq.', role: 'Associate, Criminal Defense', bio: 'Former public defender now handling private criminal defense. Known for meticulous preparation and a calm, confident courtroom presence.' },
  ],

  pricingTitle: 'Fee Structures',
  pricingSubtitle: 'Clear, upfront pricing with no surprises.',
  pricing: [
    { name: 'Consultation', price: 'Free', description: 'Initial case assessment and strategy discussion.', features: ['Up to 1 hour', 'Case evaluation', 'Honest assessment', 'No obligation'], popular: false },
    { name: 'Flat-Fee Matters', price: 'From $750', description: 'Estate plans, contracts, and other defined-scope work.', features: ['Wills & trusts', 'Contract drafting', 'Entity formation', 'Transparent pricing', 'No hourly surprises'], popular: true },
    { name: 'Contingency / Hourly', price: 'Case-by-case', description: 'Injury cases on contingency; other matters hourly.', features: ['Free case evaluation', 'Contingency for injury', 'Hourly for litigation', 'Detailed billing statements', 'Regular cost updates'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hello. I am the Sterling & Reed Law Group assistant. How can I help you today?",
    placeholder: "Ask about our legal services...",
    knowledgeBase: [
      "We practice personal injury, family law, estate planning, criminal defense, business law, and real estate law.",
      "We offer a free initial consultation for most practice areas. During the consultation we assess your case and explain your options with no obligation.",
      "Personal injury cases are handled on a contingency fee basis, meaning you pay nothing unless we win your case.",
      "Other matters are billed hourly or at a flat fee depending on complexity. We discuss all fees clearly before any work begins.",
      "Timelines vary. A simple estate plan may take a few weeks, while a contested divorce or injury claim can take several months to over a year.",
      "Most cases settle before trial, but we prepare every case as if it will be tried in court, which often leads to better settlements.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate, as well as statewide.",
      "Our hours are Monday through Friday, 8am to 6pm.",
      "We have 25+ years of practice and have recovered over $42 million for our clients.",
      "To schedule a confidential consultation, call us at (555) 442-7781.",
    ],
  },
};
