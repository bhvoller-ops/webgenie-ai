import {
  Stethoscope,
  ShieldPlus,
  Activity,
  Droplets,
  Sparkles,
  HeartPulse,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
  Leaf,
  Brain,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

const BASE_URL = 'https://images.pexels.com/photos/';

export const medicalWellnessConfig: IndustryConfig = {
  id: 'medical-wellness',
  industryName: 'Medical / Wellness',
  businessName: 'Vitality Wellness Center',
  tagline: 'Whole-Person Care for a Vibrant Life.',
  heroTitle: 'Modern Medicine Meets Holistic Wellness',
  heroSubtitle:
    'Vitality Wellness Center combines primary care, preventive medicine, and holistic therapies to help you feel your best at every stage of life. Personalized treatment plans, same-week appointments.',
  phone: '(555) 419-6620',
  email: 'care@vitalitywellness.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Fri 7am-7pm, Sat 8am-2pm',
  yearsExperience: '16+',
  licenseNumber: 'MED-WL-7720418',

  colors: {
    primary: '#0891B2',
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

  heroImage: `${BASE_URL}263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=1200`,
  heroBadge: 'Board-Certified Providers • Same-Week Appointments',
  ctaPrimary: 'Book Appointment',
  ctaSecondary: 'View Services',

  stats: [
    { value: '16+', label: 'Years of Care' },
    { value: '12,000+', label: 'Patients Served' },
    { value: '4.9★', label: 'Patient Rating' },
    { value: '90%', label: 'Same-Week Appointments' },
  ],

  services: [
    {
      icon: Stethoscope,
      title: 'Primary Care',
      description:
        'Comprehensive primary care for adults and families. Annual physicals, chronic condition management, and acute care with a provider who knows you.',
      features: ['Annual physicals', 'Chronic care management', 'Sick visits', 'Lab work on-site'],
    },
    {
      icon: ShieldPlus,
      title: 'Preventive Medicine',
      description:
        'Proactive screenings, lifestyle medicine, and personalized prevention plans that catch issues early and keep you healthy for the long run.',
      features: ['Health screenings', 'Lifestyle medicine', 'Prevention planning', 'Risk assessment'],
    },
    {
      icon: Activity,
      title: 'Hormone Therapy',
      description:
        'Bioidentical hormone replacement therapy for men and women. Restore balance, energy, and vitality with a personalized, medically supervised plan.',
      features: ['Hormone testing', 'Bioidentical HRT', 'Ongoing monitoring', 'Symptom relief'],
    },
    {
      icon: Droplets,
      title: 'IV Nutritional Therapy',
      description:
        'Custom IV nutrient infusions for energy, recovery, immunity, and hydration. Medical-grade formulas administered by licensed professionals.',
      features: ['Energy boost', 'Immune support', 'Hydration therapy', 'Recovery infusions'],
    },
    {
      icon: Sparkles,
      title: 'Acupuncture',
      description:
        'Traditional and modern acupuncture for pain, stress, fertility, and wellness. Performed by licensed acupuncturists in a calming environment.',
      features: ['Pain management', 'Stress relief', 'Fertility support', 'Wellness maintenance'],
    },
    {
      icon: HeartPulse,
      title: 'Mental Health Counseling',
      description:
        'Compassionate, confidential counseling for anxiety, depression, stress, and life transitions. Integrated with your medical care for whole-person support.',
      features: ['Individual therapy', 'Anxiety & depression', 'Stress management', 'Integrated care'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Board-Certified Providers',
      description:
        'Every provider is board-certified and brings years of clinical experience. You receive care from professionals who meet the highest medical standards.',
    },
    {
      icon: Clock,
      title: 'Same-Week Appointments',
      description:
        'We respect your time. Most new patients are seen within a week, and we offer early, evening, and Saturday hours for your convenience.',
    },
    {
      icon: Users,
      title: 'Whole-Person Approach',
      description:
        'We treat the person, not just the symptom. Your care plan addresses physical, mental, and lifestyle factors together for lasting wellness.',
    },
    {
      icon: ThumbsUp,
      title: 'Personalized Treatment Plans',
      description:
        'No cookie-cutter medicine. Your plan is built around your goals, history, and preferences, and adjusted as your needs change over time.',
    },
  ],
  whyUsTitle: 'Why Patients Choose Vitality',
  whyUsSubtitle:
    'Modern medicine and holistic care, delivered by board-certified providers who treat you as a whole person.',

  process: [
    {
      step: '01',
      title: 'Book Appointment',
      description:
        'Call or book online. New patients complete a brief intake form so we can match you with the right provider and prepare for your visit.',
    },
    {
      step: '02',
      title: 'Comprehensive Assessment',
      description:
        'Your provider reviews your history, listens to your concerns, and orders any needed labs or screenings to understand the full picture.',
    },
    {
      step: '03',
      title: 'Personalized Care Plan',
      description:
        'Together we build a treatment plan that fits your goals and lifestyle — combining medical, preventive, and holistic therapies as needed.',
    },
    {
      step: '04',
      title: 'Ongoing Support',
      description:
        'We follow up, adjust your plan, and coordinate your care. You always have a team that knows you and is invested in your long-term wellness.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'Compassionate, coordinated care from first visit to lasting wellness.',

  testimonials: [
    {
      name: 'Rachel M.',
      location: 'Brookside',
      rating: 5,
      text: 'After years of feeling off and being told everything was normal, Vitality actually listened. Hormone therapy changed my life — I have energy again and finally feel like myself.',
    },
    {
      name: 'Thomas W.',
      location: 'Fairfield',
      rating: 5,
      text: 'The whole-person approach is real here. My primary care, preventive screenings, and counseling are all coordinated in one place. It is the way healthcare should work.',
    },
    {
      name: 'Aisha B.',
      location: 'Eastside',
      rating: 5,
      text: 'I was seen within four days of calling, which never happens with other practices. The provider was thorough, kind, and never rushed me. I have finally found my medical home.',
    },
  ],
  testimonialsTitle: 'What Our Patients Say',
  testimonialsSubtitle: 'Real wellness outcomes from patients who finally feel heard.',

  faqs: [
    {
      question: 'Do you accept insurance?',
      answer:
        'We accept most major PPO insurance plans for primary care and preventive services. Some wellness services, such as IV therapy and certain hormone programs, are offered on a membership or cash-pay basis. Call us to verify your specific coverage.',
    },
    {
      question: 'How quickly can I get an appointment?',
      answer:
        'Most new patients are seen within one week. For acute concerns, we offer same-day or next-day appointments when available. Call early in the day for the best chance of a same-day slot.',
    },
    {
      question: 'Do I need a referral to see a specialist?',
      answer:
        'If you have a PPO plan, generally no referral is needed. For HMO plans, our primary care providers can provide referrals as appropriate. We will help coordinate your care regardless of your plan type.',
    },
    {
      question: 'Are the wellness therapies evidence-based?',
      answer:
        'Yes. All of our therapies — including hormone therapy, IV nutritional therapy, and acupuncture — are provided by licensed professionals and informed by current clinical evidence. We only recommend treatments we believe will genuinely help you.',
    },
    {
      question: 'Can you coordinate care with my other doctors?',
      answer:
        'Absolutely. With your permission, we share records and coordinate with your specialists to ensure your whole care team is aligned. This is a core part of our whole-person approach.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about care at Vitality Wellness Center.',

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

  contactTitle: 'Book Your Appointment',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day to schedule your visit.',

  galleryTitle: 'Inside Vitality Wellness Center',
  gallerySubtitle: 'A calming space designed for whole-person care.',
  galleryImages: [
    `${BASE_URL}263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=1200`,
    `${BASE_URL}356040/pexels-photo-356040.jpeg?auto=compress&cs=tinysrgb&w=1200`,
    `${BASE_URL}4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=1200`,
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Board-certified providers and licensed practitioners who care for the whole person.',
  team: [
    { name: 'Dr. Amara Patel, MD', role: 'Medical Director / Primary Care', bio: 'Board-certified in family medicine with 16 years of experience. Dr. Patel founded Vitality to bridge conventional medicine and holistic wellness.' },
    { name: 'Dr. James Liu, MD', role: 'Preventive & Hormone Specialist', bio: 'Board-certified in internal medicine with advanced training in hormone optimization and preventive lifestyle medicine.' },
    { name: 'Sofia Reyes, LAc', role: 'Lead Acupuncturist & Wellness Practitioner', bio: 'Licensed acupuncturist with 10 years specializing in pain management, fertility support, and stress-related conditions.' },
  ],

  pricingTitle: 'Care and Membership Options',
  pricingSubtitle: 'Transparent options for every stage of your wellness journey.',
  pricing: [
    { name: 'Primary Care Visit', price: 'Insurance / $180', description: 'Standard primary care appointment.', features: ['30-45 min visit', 'History & exam', 'Treatment plan', 'Lab coordination'], popular: false },
    { name: 'Wellness Membership', price: 'From $149/mo', description: 'Unlimited primary care plus wellness perks.', features: ['Unlimited primary care', 'Preventive screenings', '10% off wellness services', 'Priority scheduling'], popular: true },
    { name: 'Hormone Program', price: 'Custom quote', description: 'Comprehensive hormone optimization.', features: ['Full hormone panel', 'Bioidentical HRT', 'Ongoing monitoring', 'Lifestyle support'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the Vitality Wellness Center assistant. How can I help you today?",
    placeholder: "Ask about our services or booking...",
    knowledgeBase: [
      "We offer primary care, preventive medicine, hormone therapy, IV nutritional therapy, acupuncture, and mental health counseling.",
      "We accept most major PPO insurance plans for primary care and preventive services. Some wellness services are membership or cash-pay. Call to verify your coverage.",
      "Most new patients are seen within one week, with same-day or next-day appointments for acute concerns when available.",
      "All our providers are board-certified and our wellness therapies are provided by licensed professionals informed by current clinical evidence.",
      "We offer a whole-person approach that treats physical, mental, and lifestyle factors together, with personalized treatment plans.",
      "With your permission, we coordinate care and share records with your specialists to keep your whole care team aligned.",
      "We have 16+ years of experience and have served over 12,000 patients with a 4.9-star average rating.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are Monday through Friday 7am to 7pm, and Saturday 8am to 2pm.",
      "To book an appointment, use the contact form or call us and we will respond within one business day.",
    ],
  },
};
