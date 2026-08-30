import {
  Smile,
  Stethoscope,
  Heart,
  Sparkles,
  Star,
  Shield,
  Award,
  Clock,
  Users,
  ThumbsUp,
} from 'lucide-react';
import type { IndustryConfig } from '../types';
import { SITE_ORIGIN } from '@/lib/site-url';

export const dentalConfig: IndustryConfig = {
  id: 'dental',
  industryName: 'Dental',
  businessName: 'BrightSmile Dental',
  tagline: 'Healthy Smiles. Happy Lives.',
  heroTitle: 'Your Best Smile Starts Here',
  heroSubtitle:
    'Comprehensive dental care for the whole family — from routine cleanings to complete smile makeovers — delivered with comfort and compassion.',
  phone: '(555) 789-0123',
  email: 'care@brightsmiledental.com',
  serviceArea: 'Greater Metro Area & Surrounding Counties',
  hours: 'Mon-Thu 7am-6pm | Fri 7am-3pm | Sat 8am-2pm',
  yearsExperience: '18+',
  licenseNumber: 'DN-9405162',

  colors: {
    primary: '#0369A1',
    primaryDark: '#075985',
    primaryLight: '#E0F2FE',
    accent: '#92400E',
    background: '#FFFFFF',
    surface: '#F0F9FF',
    text: '#0F172A',
    textMuted: '#64748B',
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

  heroImage: `${SITE_ORIGIN}/gallery-photos/dental.jpg`,
  heroBadge: 'Accepting New Patients • Most Insurance Accepted',
  ctaPrimary: 'Book Appointment',
  ctaSecondary: 'View Services',

  stats: [
    { value: '18+', label: 'Years Serving' },
    { value: '12,000+', label: 'Patients Treated' },
    { value: '4.9★', label: 'Average Rating' },
    { value: 'Same-Day', label: 'Emergency Care' },
  ],

  services: [
    {
      icon: Stethoscope,
      title: 'General Dentistry',
      description:
        'Comprehensive preventive care including cleanings, exams, fillings, and gum disease treatment to keep your smile healthy for life.',
      features: ['Routine cleanings', 'Digital X-rays', 'Tooth-colored fillings', 'Gum disease treatment'],
    },
    {
      icon: Smile,
      title: 'Cosmetic Dentistry',
      description:
        'Transform your smile with veneers, bonding, and smile makeovers designed to enhance your natural beauty and confidence.',
      features: ['Porcelain veneers', 'Dental bonding', 'Smile makeovers', 'Gum contouring'],
    },
    {
      icon: Sparkles,
      title: 'Teeth Whitening',
      description:
        'Professional whitening treatments that deliver dramatic results safely — far more effective than anything you can buy over the counter.',
      features: ['In-office whitening', 'Custom take-home trays', 'Sensitivity-safe formulas', 'Long-lasting results'],
    },
    {
      icon: Star,
      title: 'Orthodontics',
      description:
        'Straighten your teeth discreetly with traditional braces or clear aligners tailored to your lifestyle and treatment goals.',
      features: ['Clear aligners', 'Traditional braces', 'Retainers', 'Bite correction'],
    },
    {
      icon: Heart,
      title: 'Dental Implants',
      description:
        'Permanent tooth replacement that looks, feels, and functions like natural teeth — restoring your smile and your confidence.',
      features: ['Single implants', 'Implant bridges', 'All-on-4 implants', 'Bone grafting'],
    },
    {
      icon: Shield,
      title: 'Emergency Dental',
      description:
        'Same-day emergency appointments for toothaches, broken teeth, and dental trauma. When you are in pain, we are here.',
      features: ['Same-day appointments', 'Pain relief', 'Broken tooth repair', 'Trauma care'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Experienced & Licensed',
      description:
        'Led by Dr. Patel with 18+ years of experience. We are fully licensed (DN-9405162) and members of the American Dental Association.',
    },
    {
      icon: Clock,
      title: 'On-Time Appointments',
      description:
        'We respect your schedule. Most patients are seated within 10 minutes of their appointment time, every time.',
    },
    {
      icon: Users,
      title: 'Family-Friendly Care',
      description:
        'From toddlers to grandparents, we treat every generation with patience and compassion. Your whole family is welcome here.',
    },
    {
      icon: ThumbsUp,
      title: 'Comfort-First Approach',
      description:
        'Sedation options, gentle techniques, and a calming environment. Dental anxiety is common — and we know exactly how to help.',
    },
  ],
  whyUsTitle: 'Why Patients Choose BrightSmile',
  whyUsSubtitle:
    'We make going to the dentist something to smile about. Here is what sets us apart.',

  process: [
    {
      step: '01',
      title: 'New Patient Exam',
      description:
        'Your first visit includes a comprehensive exam, digital X-rays, and a conversation about your goals and concerns — we listen first.',
    },
    {
      step: '02',
      title: 'Custom Treatment Plan',
      description:
        'We present clear treatment options with transparent pricing and insurance breakdowns. No surprises, no pressure.',
    },
    {
      step: '03',
      title: 'Comfortable Treatment',
      description:
        'Relax with sedation options, noise-canceling headphones, and a gentle touch. We check in with you at every step.',
    },
    {
      step: '04',
      title: 'Ongoing Preventive Care',
      description:
        'We schedule your next cleaning and provide a personalized home-care routine to keep your smile healthy between visits.',
    },
  ],
  processTitle: 'Your Visit, Step by Step',
  processSubtitle: 'A calm, clear experience designed around your comfort and care.',

  testimonials: [
    {
      name: 'Rachel K.',
      location: 'Oakwood Heights',
      rating: 5,
      text: 'I have been terrified of dentists my whole life. Dr. Patel and the team were so gentle and patient that I actually look forward to my cleanings now. I never thought I would say that.',
    },
    {
      name: 'James O.',
      location: 'Cedar Valley',
      rating: 5,
      text: 'Broke a tooth on a Saturday and they got me in within two hours. Pain-free repair and they filed my insurance for me. This is how dental care should work.',
    },
    {
      name: 'Lisa M.',
      location: 'Maple Ridge',
      rating: 5,
      text: 'My entire family goes to BrightSmile — from my 4-year-old to my mother. They are wonderful with kids and incredibly patient with my mom who has dementia. Truly a family practice.',
    },
  ],
  testimonialsTitle: 'What Our Patients Say',
  testimonialsSubtitle: 'Real reviews from real families we have cared for.',

  faqs: [
    {
      question: 'Do you accept my insurance?',
      answer:
        'We accept most major dental insurance plans, including Delta Dental, Cigna, MetLife, Aetna, and United Healthcare. We will verify your benefits before your appointment and file claims on your behalf. Call us with your insurance details and we will confirm coverage.',
    },
    {
      question: 'How often should I get a dental cleaning?',
      answer:
        'For most patients, we recommend a cleaning and exam every six months. If you have gum disease, a history of cavities, or certain medical conditions, we may recommend more frequent visits. We will personalize your schedule.',
    },
    {
      question: 'What should I do in a dental emergency?',
      answer:
        'Call us immediately at (555) 789-0123. We reserve same-day emergency appointments every day. For a knocked-out tooth, keep it moist in milk or saliva and bring it with you. Time is critical — the sooner you call, the better the outcome.',
    },
    {
      question: 'Do you offer payment plans for larger procedures?',
      answer:
        'Yes. We offer flexible financing through CareCredit and in-house payment plans for qualified patients. We will review all payment options during your treatment planning consultation so you can choose what works for your budget.',
    },
    {
      question: 'Are you good with children?',
      answer:
        'Absolutely. We love treating kids and we make their first dental experiences fun and positive. We use kid-friendly language, show them the tools, and celebrate every visit. A good first experience sets the tone for a lifetime of healthy habits.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know before your first visit.',

  serviceAreas: [
    { name: 'Oakwood Heights' },
    { name: 'Cedar Valley' },
    { name: 'Maple Ridge' },
    { name: 'Pinebrook' },
    { name: 'Riverside' },
    { name: 'Highland Park' },
    { name: 'Greenwood' },
    { name: 'Brookfield' },
  ],
  serviceAreasTitle: 'Communities We Proudly Serve',

  contactTitle: 'Book Your Appointment Today',
  contactSubtitle:
    'Call us or fill out the form below. New patients are always welcome — we respond within one business day.',

  galleryTitle: 'Our Office & Smile Transformations',
  gallerySubtitle: 'See our modern facility and the smiles we have helped create.',
  galleryImages: ['/hero-cleaning.webp', '/hero-salon.webp', '/hero-painting.webp'],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Experienced dental professionals who treat you like family.',
  team: [
    { name: 'Dr. Anita Patel', role: 'Founder & Lead Dentist', bio: 'DDS with 18+ years of experience and a member of the American Dental Association. Dr. Patel founded BrightSmile to provide compassionate, comprehensive care.' },
    { name: 'Dr. Kevin Liu', role: 'Cosmetic & Implant Dentist', bio: 'Specialist in cosmetic dentistry and implantology with advanced training in full-mouth restoration. Dr. Liu transforms complex cases into beautiful smiles.' },
    { name: 'Maria Santos', role: 'Lead Dental Hygienist', bio: 'Registered dental hygienist with 12 years of experience. Maria makes every cleaning comfortable and educates patients on lifelong oral health.' },
  ],

  pricingTitle: 'Dental Care & Membership Options',
  pricingSubtitle: 'Transparent pricing. Most insurance accepted. Flexible financing available.',
  pricing: [
    { name: 'New Patient Special', price: '$89', description: 'Complete exam, X-rays, and cleaning for new patients.', features: ['Comprehensive exam', 'Digital X-rays', 'Professional cleaning', 'Oral cancer screening', 'Treatment plan'], popular: false },
    { name: 'BrightSmile Membership', price: '$349/yr', description: 'Annual membership for patients without insurance.', features: ['2 cleanings per year', '2 exams per year', 'X-rays included', '15% off all procedures', 'No deductibles or limits'], popular: true },
    { name: 'Smile Makeover Consult', price: 'Free', description: 'Comprehensive cosmetic consultation with treatment options.', features: ['Smile assessment', 'Digital smile preview', 'Treatment options', 'Financing review', 'No obligation'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the BrightSmile Dental assistant. How can I help you today?",
    placeholder: "Ask about our services or scheduling...",
    knowledgeBase: [
      "We offer general dentistry, cosmetic dentistry, teeth whitening, orthodontics, dental implants, and emergency dental care.",
      "We accept most major insurance plans including Delta Dental, Cigna, MetLife, Aetna, and United Healthcare.",
      "Our license number is DN-9405162 and we are members of the American Dental Association.",
      "For most patients, we recommend a cleaning and exam every six months, though some patients may need more frequent visits.",
      "For dental emergencies, call us immediately at (555) 789-0123. We reserve same-day emergency appointments every day.",
      "We offer a new patient special for $89 that includes a complete exam, X-rays, and cleaning.",
      "We offer flexible financing through CareCredit and in-house payment plans for qualified patients.",
      "We serve Oakwood Heights, Cedar Valley, Maple Ridge, Pinebrook, Riverside, Highland Park, Greenwood, and Brookfield.",
      "Our hours are Mon-Thu 7am-6pm, Fri 7am-3pm, and Sat 8am-2pm.",
      "We have 18+ years of experience and have treated over 12,000 patients.",
    ],
  },
};
