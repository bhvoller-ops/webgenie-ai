import {
  Eye,
  Glasses,
  Sparkles,
  Smile,
  Zap,
  Activity,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const optometryConfig: IndustryConfig = {
  id: 'optometry',
  industryName: 'Optometry',
  businessName: 'ClearVision Eye Care',
  tagline: 'See Life Clearly. Live Life Fully.',
  heroTitle: 'Comprehensive Eye Care for the Whole Family',
  heroSubtitle:
    'From routine eye exams to designer eyewear and specialized disease management, our experienced optometrists provide personalized care using the latest diagnostic technology. Book your appointment today.',
  phone: '(555) 712-3398',
  email: 'appointments@clearvision.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Fri 8am-6pm, Sat 9am-3pm',
  yearsExperience: '18+',
  licenseNumber: 'OD-7741209',

  colors: {
    primary: '#0E7490',
    primaryDark: '#155E75',
    primaryLight: '#CFFAFE',
    accent: '#7C3AED',
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

  heroImage:
    'https://images.pexels.com/photos/26167588/pexels-photo-26167588.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'Accepting Most Insurance • Same-Day Appointments',
  ctaPrimary: 'Book Appointment',
  ctaSecondary: 'View Services',

  stats: [
    { value: '18+', label: 'Years Experience' },
    { value: '25,000+', label: 'Patients Served' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '1,200+', label: 'Designer Frames' },
  ],

  services: [
    {
      icon: Eye,
      title: 'Comprehensive Eye Exams',
      description:
        'Thorough eye health evaluations using advanced diagnostic technology. We check vision, eye pressure, retinal health, and screen for eye diseases at every visit.',
      features: ['Visual acuity testing', 'Retinal imaging', 'Glaucoma screening', 'Digital eye pressure check'],
    },
    {
      icon: Glasses,
      title: 'Contact Lens Fitting',
      description:
        'Expert contact lens fittings for all types of lenses including daily, monthly, toric, and specialty lenses for astigmatism and dry eyes.',
      features: ['Daily & monthly lenses', 'Toric lenses', 'Multifocal lenses', 'Specialty fittings'],
    },
    {
      icon: Sparkles,
      title: 'Designer Eyewear',
      description:
        'Browse over 1,200 designer frames from top brands. Our opticians help you find frames that fit your face, lifestyle, and budget — with precision lens fitting.',
      features: ['1,200+ designer frames', 'Premium lenses', 'Blue light protection', 'Adjustments included'],
    },
    {
      icon: Smile,
      title: 'Pediatric Eye Care',
      description:
        'Gentle, kid-friendly eye exams for children of all ages. We detect vision issues early to support healthy development and school performance.',
      features: ['Vision screening', 'Lazy eye detection', 'Color vision testing', 'Kid-friendly staff'],
    },
    {
      icon: Zap,
      title: 'LASIK Consultation',
      description:
        'Comprehensive LASIK and refractive surgery consultations. We evaluate your candidacy, explain your options, and co-manage your care with trusted surgeons.',
      features: ['Candidacy evaluation', 'Surgeon referrals', 'Pre-op & post-op care', 'Financing options'],
    },
    {
      icon: Activity,
      title: 'Eye Disease Treatment',
      description:
        'Diagnosis and management of glaucoma, macular degeneration, diabetic eye disease, and dry eye syndrome. We use the latest technology to protect your vision.',
      features: ['Glaucoma management', 'Macular degeneration', 'Diabetic eye care', 'Dry eye treatment'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Advanced Technology',
      description:
        'We invest in the latest diagnostic technology including OCT imaging and digital retinal photography to detect eye disease years earlier than traditional methods.',
    },
    {
      icon: Clock,
      title: 'On-Time Appointments',
      description:
        'We respect your time. Appointments start on time, and we offer same-day and emergency appointments for urgent eye concerns like red eyes and vision changes.',
    },
    {
      icon: Users,
      title: 'Family-Friendly Care',
      description:
        'From toddlers to seniors, we provide eye care for every age. Our welcoming office and friendly staff make every visit comfortable for the whole family.',
    },
    {
      icon: ThumbsUp,
      title: 'Insurance Accepted',
      description:
        'We accept most major vision and medical insurance plans and offer affordable self-pay options. We will verify your benefits before your visit.',
    },
  ],
  whyUsTitle: 'Why Families Choose ClearVision',
  whyUsSubtitle:
    'Advanced technology, experienced doctors, and personalized care for every member of your family.',

  process: [
    {
      step: '01',
      title: 'Book Your Visit',
      description:
        'Call us or book online. We will verify your insurance and find a convenient time that works with your schedule.',
    },
    {
      step: '02',
      title: 'Comprehensive Exam',
      description:
        'Our optometrist performs a thorough eye health exam using advanced diagnostic technology and discusses your vision needs.',
    },
    {
      step: '03',
      title: 'Personalized Plan',
      description:
        'We explain your results, recommend a vision correction plan, and help you choose eyewear or contacts that fit your lifestyle.',
    },
    {
      step: '04',
      title: 'Ongoing Care',
      description:
        'We schedule your next exam, send reminders, and monitor any eye health conditions over time to protect your vision long-term.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'Simple, comfortable eye care from booking to follow-up.',

  testimonials: [
    {
      name: 'Patricia H.',
      location: 'Brookside',
      rating: 5,
      text: 'Best eye exam I have ever had. The doctor used imaging technology that showed me my own retina and explained everything. I found beautiful frames and the staff helped with my insurance. Highly recommend.',
    },
    {
      name: 'James K.',
      location: 'Fairfield',
      rating: 5,
      text: 'I was nervous about contacts after years in glasses. The fitting was patient and thorough, and now I wear daily contacts comfortably. The follow-up care has been excellent.',
    },
    {
      name: 'Sofia M.',
      location: 'Eastside',
      rating: 5,
      text: 'They caught early signs of glaucoma at a routine exam that another doctor missed. The monitoring and treatment plan have been clear and reassuring. I trust them completely with my eye health.',
    },
  ],
  testimonialsTitle: 'What Our Patients Say',
  testimonialsSubtitle: 'Clear vision and healthy eyes for thousands of happy patients.',

  faqs: [
    {
      question: 'How often should I get an eye exam?',
      answer:
        'Adults should have a comprehensive eye exam every 1 to 2 years, or more frequently if you wear contacts, have diabetes, or have a family history of eye disease. Children should be examined annually starting at age 6 months.',
    },
    {
      question: 'Do you accept my insurance?',
      answer:
        'We accept most major vision insurance plans including VSP, EyeMed, Davis Vision, and many medical plans. We also offer affordable self-pay pricing. Call us with your insurance details and we will verify your benefits.',
    },
    {
      question: 'How long does an eye exam take?',
      answer:
        'A comprehensive eye exam typically takes 45 to 60 minutes, including pre-testing with our technicians and your time with the optometrist. If you are selecting new frames, allow an additional 30 to 45 minutes.',
    },
    {
      question: 'Can I get contacts even if I have astigmatism?',
      answer:
        'Yes! We fit toric contact lenses specifically designed for astigmatism, as well as multifocal and specialty lenses. Our optometrist will determine the best lens type for your prescription and lifestyle.',
    },
    {
      question: 'Do you see children?',
      answer:
        'Absolutely. We provide eye care for children of all ages, from infants to teenagers. Early eye exams are important for detecting vision issues that can affect learning and development.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about your eye care.',

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

  contactTitle: 'Book Your Eye Appointment',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day to schedule your visit.',

  galleryTitle: 'Our Office & Eyewear Collection',
  gallerySubtitle: 'See the ClearVision experience.',
  galleryImages: [
    'https://images.pexels.com/photos/26167588/pexels-photo-26167588.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/26167588/pexels-photo-26167588.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/26167588/pexels-photo-26167588.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Experienced optometrists and opticians dedicated to your vision health.',
  team: [
    { name: 'Dr. Emily Chen, OD', role: 'Optometrist & Owner', bio: 'Doctor of Optometry with 18 years of experience. Dr. Chen specializes in comprehensive eye care, contact lenses, and early disease detection using advanced imaging technology.' },
    { name: 'Dr. Marcus Bell, OD', role: 'Optometrist', bio: 'Specializes in pediatric eye care and the management of ocular disease. Dr. Bell has a particular interest in dry eye treatment and myopia control for children.' },
    { name: 'Lisa Park', role: 'Lead Optician', bio: 'Licensed optician with expertise in frame styling and precision lens fitting. Lisa helps patients find eyewear that looks great and performs perfectly.' },
  ],

  pricingTitle: 'Eye Care Packages',
  pricingSubtitle: 'Transparent pricing with insurance options available.',
  pricing: [
    { name: 'Comprehensive Exam', price: 'From $99', description: 'Complete eye health evaluation.', features: ['Visual acuity testing', 'Retinal imaging', 'Glaucoma screening', 'Prescription update'], popular: false },
    { name: 'Exam + Eyewear', price: 'From $199', description: 'Exam plus a complete pair of glasses.', features: ['Comprehensive exam', 'Designer frame', 'Single vision lenses', 'Anti-glare coating', 'Frame adjustments'], popular: true },
    { name: 'Contact Lens Package', price: 'From $249', description: 'Exam, fitting, and lens supply.', features: ['Comprehensive exam', 'Contact lens fitting', 'Trial pair of lenses', 'Follow-up fitting visit', 'Yearly supply option'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the ClearVision Eye Care assistant. How can I help you today?",
    placeholder: "Ask about eye exams, contacts, or eyewear...",
    knowledgeBase: [
      "We offer comprehensive eye exams, contact lens fittings, designer eyewear, pediatric eye care, LASIK consultations, and eye disease treatment.",
      "Adults should have a comprehensive eye exam every 1 to 2 years, and children should be examined annually.",
      "We accept most major vision insurance plans including VSP, EyeMed, and Davis Vision, plus many medical plans.",
      "A comprehensive eye exam typically takes 45 to 60 minutes.",
      "Yes, we fit toric contact lenses for astigmatism as well as multifocal and specialty lenses.",
      "We provide eye care for children of all ages, from infants to teenagers.",
      "We use advanced diagnostic technology including OCT imaging and digital retinal photography.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are Monday through Friday 8am to 6pm and Saturday 9am to 3pm.",
      "We have over 18 years of experience and have served more than 25,000 patients with over 1,200 designer frames in stock.",
    ],
  },
};
