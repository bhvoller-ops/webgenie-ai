import {
  Heart,
  Sparkles,
  Flower,
  Stethoscope,
  Syringe,
  Shield,
  Award,
  Clock,
  Users,
  ThumbsUp,
} from 'lucide-react';
import type { IndustryConfig } from '../types';
import { SITE_ORIGIN } from '@/lib/site-url';

export const medSpaConfig: IndustryConfig = {
  id: 'med-spa',
  industryName: 'Med Spa',
  businessName: 'Serenity Med Spa',
  tagline: 'Reveal Your Natural Radiance.',
  heroTitle: 'Confidence Begins With Self-Care',
  heroSubtitle:
    'Advanced aesthetic treatments and wellness therapies delivered by licensed medical professionals in a serene, luxurious environment.',
  phone: '(555) 567-8901',
  email: 'hello@serenitymedspa.com',
  serviceArea: 'Greater Metro Area & Surrounding Counties',
  hours: 'Tue-Sat 9am-7pm | Sun 10am-4pm',
  yearsExperience: '12+',
  licenseNumber: 'MS-7283940',

  colors: {
    primary: '#9D174D',
    primaryDark: '#831843',
    primaryLight: '#FCE7F3',
    accent: '#92400E',
    background: '#FFFFFF',
    surface: '#FDF2F8',
    text: '#1F2937',
    textMuted: '#6B7280',
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

  heroImage: `${SITE_ORIGIN}/gallery-photos/med-spa.jpg`,
  heroBadge: 'Medical Director Supervised • Licensed Professionals',
  ctaPrimary: 'Book Free Consultation',
  ctaSecondary: 'View Services',

  stats: [
    { value: '12+', label: 'Years of Excellence' },
    { value: '15,000+', label: 'Treatments Performed' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '100%', label: 'Personalized Care' },
  ],

  services: [
    {
      icon: Syringe,
      title: 'Botox & Fillers',
      description:
        'FDA-approved injectables to smooth fine lines, restore volume, and enhance your natural facial contours with subtle, lasting results.',
      features: ['Botox injections', 'Dermal fillers', 'Lip enhancement', 'Cheek contouring'],
    },
    {
      icon: Sparkles,
      title: 'Facials',
      description:
        'Customized medical-grade facials tailored to your skin type, targeting acne, aging, and dullness for a radiant complexion.',
      features: ['Hydrafacial', 'Dermaplaning', 'Custom masks', 'LED light therapy'],
    },
    {
      icon: Flower,
      title: 'Laser Treatments',
      description:
        'Advanced laser technology for hair removal, skin resurfacing, and pigmentation correction with minimal downtime.',
      features: ['Laser hair removal', 'Skin resurfacing', 'Pigment correction', 'Spider vein treatment'],
    },
    {
      icon: Stethoscope,
      title: 'Body Contouring',
      description:
        'Non-invasive body sculpting treatments that target stubborn fat and tighten skin for a smoother, more defined silhouette.',
      features: ['CoolSculpting', 'Radiofrequency skin tightening', 'Cellulite reduction', 'Custom treatment plans'],
    },
    {
      icon: Heart,
      title: 'Microneedling',
      description:
        'Collagen-induction therapy that improves skin texture, reduces scarring, and restores a youthful glow with minimal downtime.',
      features: ['Collagen induction', 'Acne scar reduction', 'Fine line smoothing', 'Enhanced product absorption'],
    },
    {
      icon: Shield,
      title: 'Chemical Peels',
      description:
        'Medical-grade chemical peels that exfoliate and renew the skin, addressing tone, texture, and signs of aging.',
      features: ['Light peels', 'Medium-depth peels', 'Acne treatment', 'Sun damage repair'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Medical Director Supervised',
      description:
        'Every treatment is overseen by a board-certified medical director. Our licensed professionals bring clinical expertise to every session.',
    },
    {
      icon: Clock,
      title: 'Flexible Scheduling',
      description:
        'Evening and weekend appointments available. We respect your time and never rush your consultation or treatment.',
    },
    {
      icon: Users,
      title: 'Personalized Treatment Plans',
      description:
        'No two faces are alike. We build a custom plan around your goals, skin type, and budget — never a one-size-fits-all approach.',
    },
    {
      icon: ThumbsUp,
      title: 'Premium Products & Equipment',
      description:
        'We use only FDA-approved injectables and state-of-the-art laser technology, backed by clinical research and proven results.',
    },
  ],
  whyUsTitle: 'Why Clients Trust Serenity Med Spa',
  whyUsSubtitle:
    'Medical expertise meets luxury wellness. Here is what sets our practice apart.',

  process: [
    {
      step: '01',
      title: 'Free Consultation',
      description:
        'We discuss your goals, review your medical history, and assess your skin — no pressure, no obligation, just honest guidance.',
    },
    {
      step: '02',
      title: 'Custom Treatment Plan',
      description:
        'Your provider designs a personalized plan with clear pricing, expected results, and a realistic timeline for your goals.',
    },
    {
      step: '03',
      title: 'Professional Treatment',
      description:
        'Relax in our serene treatment suites while our licensed professionals perform your procedure with precision and care.',
    },
    {
      step: '04',
      title: 'Follow-Up & Aftercare',
      description:
        'We schedule a follow-up to assess your results, answer questions, and adjust your plan to keep you glowing.',
    },
  ],
  processTitle: 'Your Serenity Journey',
  processSubtitle: 'A thoughtful, personalized experience from consultation to aftercare.',

  testimonials: [
    {
      name: 'Ashley R.',
      location: 'Oakwood Heights',
      rating: 5,
      text: 'I was nervous about getting fillers for the first time, but the team made me feel completely at ease. The results look so natural that my husband could not figure out what changed — he just knew I looked refreshed.',
    },
    {
      name: 'Megan L.',
      location: 'Cedar Valley',
      rating: 5,
      text: 'After three laser treatments my skin has never looked better. The staff is knowledgeable, the facility is spotless, and they never push products or services I do not need.',
    },
    {
      name: 'Danielle P.',
      location: 'Maple Ridge',
      rating: 5,
      text: 'The hydrafacial here is worth every penny. My skin was glowing for weeks. I have finally found my med spa — I will not go anywhere else.',
    },
  ],
  testimonialsTitle: 'What Our Clients Say',
  testimonialsSubtitle: 'Real stories from clients who found their confidence at Serenity.',

  faqs: [
    {
      question: 'Are injectables safe, and will my results look natural?',
      answer:
        'Yes. All of our injectables are FDA-approved and administered by licensed professionals under medical director supervision. We specialize in natural-looking results that enhance your features, not change them. We start conservatively and can always add more at a follow-up.',
    },
    {
      question: 'How long do results typically last?',
      answer:
        'It depends on the treatment. Botox generally lasts 3-4 months, dermal fillers 6-18 months, and laser treatments can provide long-lasting results with proper skincare. We will give you a clear expectation during your consultation.',
    },
    {
      question: 'Is there any downtime after treatments?',
      answer:
        'Most of our treatments have little to no downtime. You may experience mild redness or swelling for a few hours to a day after injectables or microneedling. We provide detailed aftercare instructions and are always available for questions.',
    },
    {
      question: 'Do you offer financing or membership plans?',
      answer:
        'Yes. We offer flexible membership plans that include discounted treatments and priority scheduling. We also partner with financing providers for larger treatment packages. Ask us about current options during your consultation.',
    },
    {
      question: 'What should I expect during my first consultation?',
      answer:
        'Your first visit includes a thorough discussion of your goals, a review of your medical history, a skin assessment, and a personalized treatment plan with transparent pricing. Plan for about 45 minutes. There is no pressure to book a treatment that day.',
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

  contactTitle: 'Book Your Free Consultation',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day — no pressure, just personalized guidance.',

  galleryTitle: 'Our Spa & Treatment Results',
  gallerySubtitle: 'Step into serenity. See our space and the results we deliver.',
  galleryImages: ['/hero-salon.webp', '/hero-cleaning.webp', '/hero-restoration.webp'],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Licensed medical professionals dedicated to your confidence and care.',
  team: [
    { name: 'Dr. Evelyn Carter', role: 'Medical Director', bio: 'Board-certified physician with 15 years of experience in aesthetic medicine. Dr. Carter oversees every treatment protocol at Serenity Med Spa.' },
    { name: 'Jessica Nguyen', role: 'Lead Aesthetic Nurse', bio: 'Licensed RN and injection specialist with advanced training in facial anatomy and injectable techniques. Jessica has performed over 8,000 treatments.' },
    { name: 'Maria Rodriguez', role: 'Master Aesthetician', bio: 'Certified in advanced laser therapies and medical-grade skincare. Maria personalizes every facial and laser plan to your unique skin.' },
  ],

  pricingTitle: 'Treatment Packages & Memberships',
  pricingSubtitle: 'Transparent pricing with flexible membership options. Free consultations for every new client.',
  pricing: [
    { name: 'Single Treatment', price: 'From $199', description: 'Pay as you go for any individual service.', features: ['One treatment of choice', 'Consultation included', 'Aftercare guidance', 'Follow-up check'], popular: false },
    { name: 'Radiance Membership', price: '$199/mo', description: 'Monthly membership with exclusive perks and savings.', features: ['Monthly signature facial', '15% off all treatments', 'Priority scheduling', 'Free birthday treatment', 'Exclusive product discounts'], popular: true },
    { name: 'Total Transformation', price: 'From $3,500', description: 'Comprehensive multi-treatment package for full results.', features: ['Custom 6-month plan', 'Multiple treatment areas', 'Quarterly progress reviews', 'Complimentary skincare kit', '20% off all additional services'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the Serenity Med Spa assistant. How can I help you today?",
    placeholder: "Ask about our treatments or booking...",
    knowledgeBase: [
      "We offer Botox and fillers, facials, laser treatments, body contouring, microneedling, and chemical peels.",
      "All treatments are supervised by our medical director, Dr. Evelyn Carter, and performed by licensed professionals.",
      "Our license number is MS-7283940 and we are fully licensed and insured.",
      "Botox typically lasts 3-4 months and dermal fillers last 6-18 months depending on the product and area treated.",
      "Most treatments have little to no downtime, with mild redness or swelling resolving within a day.",
      "We offer free consultations with no obligation. Call us at (555) 567-8901 to schedule.",
      "We offer a Radiance Membership for $199/month that includes a monthly facial, 15% off all treatments, and priority scheduling.",
      "We serve Oakwood Heights, Cedar Valley, Maple Ridge, Pinebrook, Riverside, Highland Park, Greenwood, and Brookfield.",
      "Our hours are Tue-Sat 9am-7pm and Sun 10am-4pm.",
      "We have 12+ years of experience and have performed over 15,000 treatments.",
    ],
  },
};
