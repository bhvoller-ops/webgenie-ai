import {
  Stethoscope,
  Syringe,
  Scissors,
  HeartPulse,
  Siren,
  PawPrint,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
  Activity,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const veterinaryClinicConfig: IndustryConfig = {
  id: 'veterinary-clinic',
  industryName: 'Veterinary Clinic',
  businessName: 'PawsHealth Veterinary',
  tagline: 'Compassionate Care for Every Pet.',
  heroTitle: 'Your Pet\u2019s Health Is Our Priority',
  heroSubtitle:
    'Full-service veterinary care from wellness exams to emergency treatment. Our experienced team treats your pets like family with modern equipment and a gentle touch.',
  phone: '(555) 342-7780',
  email: 'care@pawshealthvet.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Sat 8am-7pm',
  yearsExperience: '20+',
  licenseNumber: 'VET-6612094',

  colors: {
    primary: '#0D9488',
    primaryDark: '#0F766E',
    primaryLight: '#CCFBF1',
    accent: '#1E40AF',
    background: '#FFFFFF',
    surface: '#F0FDFA',
    text: '#0A1A1A',
    textMuted: '#5B6B6B',
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

  heroImage: 'https://images.pexels.com/photos/7468978/pexels-photo-7468978.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'AAHA Accredited • Emergency Care',
  ctaPrimary: 'Book Appointment',
  ctaSecondary: 'View Services',

  stats: [
    { value: '20+', label: 'Years Experience' },
    { value: '35,000+', label: 'Pets Treated' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '24/7', label: 'Emergency Support' },
  ],

  services: [
    {
      icon: Stethoscope,
      title: 'Wellness Exams',
      description:
        'Comprehensive annual and bi-annual exams that catch issues early and keep your pet healthy at every life stage.',
      features: ['Annual exams', 'Senior wellness', 'Puppy & kitten exams', 'Health screenings'],
    },
    {
      icon: Syringe,
      title: 'Vaccinations',
      description:
        'Core and lifestyle vaccines tailored to your pet\u2019s needs, with reminders so you never miss a booster.',
      features: ['Core vaccines', 'Lifestyle vaccines', 'Booster reminders', 'Vaccine records'],
    },
    {
      icon: Scissors,
      title: 'Dental Care',
      description:
        'Cleanings, extractions, and oral health assessments to keep your pet\u2019s teeth and gums healthy for life.',
      features: ['Dental cleanings', 'Extractions', 'Oral assessments', 'Home care guidance'],
    },
    {
      icon: HeartPulse,
      title: 'Surgery',
      description:
        'Soft tissue and orthopedic surgery in modern, fully monitored surgical suites with compassionate recovery care.',
      features: ['Spay & neuter', 'Soft tissue surgery', 'Orthopedic surgery', 'Post-op care'],
    },
    {
      icon: Siren,
      title: 'Emergency Care',
      description:
        'Urgent and emergency care during business hours with referrals to our 24/7 partner hospital after hours.',
      features: ['Urgent care', 'Trauma treatment', 'Critical care', 'After-hours referral'],
    },
    {
      icon: PawPrint,
      title: 'Microchipping',
      description:
        'Permanent identification microchips with lifetime registration, giving you peace of mind if your pet ever goes missing.',
      features: ['Microchip insertion', 'Lifetime registration', 'Quick & painless', 'Recovery support'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'AAHA Accredited',
      description:
        'We meet the highest standards in veterinary medicine. Fewer than 15% of clinics earn AAHA accreditation — we are proud to be one.',
    },
    {
      icon: Clock,
      title: 'Convenient Scheduling',
      description:
        'Same-day appointments for sick pets and flexible scheduling for wellness visits. We respect your time and your pet\u2019s comfort.',
    },
    {
      icon: Users,
      title: 'Fear-Free Approach',
      description:
        'Our team is certified in fear-free handling, creating a calm, low-stress environment for anxious pets and their families.',
    },
    {
      icon: ThumbsUp,
      title: 'Transparent Pricing',
      description:
        'Clear estimates before every procedure. No surprise bills — we explain options and costs so you can make informed decisions.',
    },
  ],
  whyUsTitle: 'Why Pet Parents Trust PawsHealth',
  whyUsSubtitle:
    'Modern medicine, compassionate care, and a team that treats your pet like family.',

  process: [
    {
      step: '01',
      title: 'Book an Appointment',
      description:
        'Call us or book online. Same-day appointments are available for sick pets and urgent concerns.',
    },
    {
      step: '02',
      title: 'Check-In & Exam',
      description:
        'Arrive a few minutes early. Our team reviews history and performs a thorough exam with your pet\u2019s comfort in mind.',
    },
    {
      step: '03',
      title: 'Diagnosis & Plan',
      description:
        'We explain findings, present treatment options, and provide a clear estimate before any procedure begins.',
    },
    {
      step: '04',
      title: 'Follow-Up Care',
      description:
        'We follow up after treatment, send reminders for boosters, and are always available for questions or concerns.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'Compassionate, clear care from booking to follow-up.',

  testimonials: [
    {
      name: 'Rachel S.',
      location: 'Brookside',
      rating: 5,
      text: 'My anxious rescue dog actually walks into PawsHealth willingly. The fear-free approach makes all the difference, and the vets explain everything clearly. I trust them completely.',
    },
    {
      name: 'David K.',
      location: 'Fairfield',
      rating: 5,
      text: 'They saved my cat\u2019s life during an emergency. The team was calm, fast, and kept me informed the whole time. The follow-up calls after showed how much they genuinely care.',
    },
    {
      name: 'Emily T.',
      location: 'Eastside',
      rating: 5,
      text: 'Transparent pricing is why I switched. Every estimate is clear, they explain all options, and they never push unnecessary procedures. My pets get great care and I get peace of mind.',
    },
  ],
  testimonialsTitle: 'What Pet Parents Say',
  testimonialsSubtitle: 'Healthy pets and relieved owners are our greatest reward.',

  faqs: [
    {
      question: 'Do you take walk-ins or do I need an appointment?',
      answer:
        'We recommend appointments to minimize wait times, but we do accept walk-ins for urgent concerns during business hours. Calling ahead helps us prepare for your pet\u2019s needs.',
    },
    {
      question: 'What should I do in an after-hours emergency?',
      answer:
        'Call our main number for after-hours instructions. We partner with a 24/7 emergency hospital and will direct you immediately. During business hours, we handle emergencies in-house.',
    },
    {
      question: 'Do you see both cats and dogs?',
      answer:
        'Yes. We provide comprehensive care for cats and dogs of all ages, from puppies and kittens to seniors. We also treat many small mammals and exotic pets — call to confirm.',
    },
    {
      question: 'Do you offer payment plans?',
      answer:
        'We provide clear estimates before every procedure and accept major pet insurance. We also partner with financing providers for larger treatments — ask our team for details.',
    },
    {
      question: 'How often should my pet have a wellness exam?',
      answer:
        'Adult pets should have an annual wellness exam. Puppies, kittens, and senior pets benefit from bi-annual exams to catch age-related issues early and keep vaccinations current.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about caring for your pet with us.',

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

  contactTitle: 'Book Your Pet\u2019s Appointment',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day.',

  galleryTitle: 'Our Clinic & Patients',
  gallerySubtitle: 'A look at the care we provide every day.',
  galleryImages: [
    'https://images.pexels.com/photos/7468978/pexels-photo-7468978.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/7468978/pexels-photo-7468978.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/7468978/pexels-photo-7468978.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Experienced veterinarians and compassionate support staff.',
  team: [
    { name: 'Dr. Susan Patel, DVM', role: 'Lead Veterinarian & Owner', bio: 'Dr. Patel founded PawsHealth 20 years ago and is AAHA-accreditation focused with special interests in internal medicine and senior care.' },
    { name: 'Dr. Marcus Webb, DVM', role: 'Associate Veterinarian', bio: 'Dr. Webb specializes in surgery and dentistry, with advanced training in soft tissue and orthopedic procedures.' },
    { name: 'Linda Cho', role: 'Head Veterinary Technician', bio: 'Linda leads our technician team and is fear-free certified, ensuring every pet has a calm, comfortable visit.' },
  ],

  pricingTitle: 'Veterinary Care Pricing',
  pricingSubtitle: 'Transparent pricing for common services.',
  pricing: [
    { name: 'Wellness Exam', price: 'From $65', description: 'Comprehensive annual exam.', features: ['Full physical exam', 'Health screening', 'Vaccine review', 'Nutrition guidance', 'Clear estimate'], popular: false },
    { name: 'Vaccine Package', price: 'From $120', description: 'Core vaccines for the year.', features: ['Core vaccines', 'Lifestyle vaccines', 'Booster reminders', 'Vaccine records', 'Exam included'], popular: true },
    { name: 'Dental Cleaning', price: 'From $385', description: 'Full dental cleaning package.', features: ['Pre-anesthetic bloodwork', 'Anesthesia monitoring', 'Full cleaning', 'Oral assessment', 'Home care plan'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the PawsHealth Veterinary assistant. How can I help you and your pet today?",
    placeholder: "Ask about our veterinary services...",
    knowledgeBase: [
      "We offer wellness exams, vaccinations, dental care, surgery, emergency care, and microchipping for cats and dogs.",
      "We recommend appointments to minimize wait times, but we accept walk-ins for urgent concerns during business hours. Call ahead if you can.",
      "For after-hours emergencies, call our main number for instructions. We partner with a 24/7 emergency hospital and will direct you immediately.",
      "We see cats and dogs of all ages, plus many small mammals and exotic pets. Call to confirm we treat your specific pet.",
      "We provide clear estimates before every procedure, accept major pet insurance, and partner with financing providers for larger treatments.",
      "Adult pets need an annual wellness exam. Puppies, kittens, and seniors benefit from bi-annual exams.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are Monday through Saturday, 8am to 7pm.",
      "We are AAHA accredited with 20+ years of experience and have treated over 35,000 pets.",
      "Wellness exams start at $65, vaccine packages at $120, and dental cleanings at $385.",
    ],
  },
};
