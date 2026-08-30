import {
  Stethoscope,
  Shield,
  Activity,
  ScanLine,
  ClipboardCheck,
  Syringe,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  Zap,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const urgentCareConfig: IndustryConfig = {
  id: 'urgent-care',
  industryName: 'Urgent Care',
  businessName: 'RapidMed Urgent Care',
  tagline: 'Quality Care. No Appointment Needed.',
  heroTitle: 'Fast, Reliable Urgent Care When You Need It Most',
  heroSubtitle:
    'From minor injuries to sudden illness, our board-certified providers deliver prompt, compassionate care seven days a week. Walk in any time — no appointment necessary — and get treated, tested, and on your way.',
  phone: '(555) 402-7788',
  email: 'info@rapidmeduc.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Sun 8am-8pm',
  yearsExperience: '10+',
  licenseNumber: 'UC-3310456',

  colors: {
    primary: '#0891B2',
    primaryDark: '#155E75',
    primaryLight: '#CFFAFE',
    accent: '#DC2626',
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
    'https://images.pexels.com/photos/8948301/pexels-photo-8948301.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'Open 7 Days • Walk-Ins Welcome • Short Wait Times',
  ctaPrimary: 'Check Wait Time',
  ctaSecondary: 'View Services',

  stats: [
    { value: '10+', label: 'Years Experience' },
    { value: '120,000+', label: 'Patients Treated' },
    { value: '4.8★', label: 'Average Rating' },
    { value: '<30 min', label: 'Average Wait Time' },
  ],

  services: [
    {
      icon: Stethoscope,
      title: 'Walk-In Care',
      description:
        'Same-day care for non-emergency conditions including colds, flu, infections, rashes, and minor allergic reactions. Walk in any day, any time — no appointment needed.',
      features: ['No appointment needed', '7 days a week', 'Short wait times', 'All ages welcome'],
    },
    {
      icon: Shield,
      title: 'Injury Treatment',
      description:
        'Treatment for minor injuries including cuts, burns, sprains, strains, and minor fractures. We provide wound care, splinting, and referral when specialized care is needed.',
      features: ['Wound care & stitches', 'Sprain & strain care', 'Minor fracture care', 'Burn treatment'],
    },
    {
      icon: Activity,
      title: 'Illness Treatment',
      description:
        'Diagnosis and treatment for acute illnesses including flu, strep, bronchitis, sinus infections, UTIs, and stomach bugs. On-site testing for fast, accurate results.',
      features: ['Flu & strep testing', 'Respiratory care', 'UTI treatment', 'Stomach illness care'],
    },
    {
      icon: ScanLine,
      title: 'X-Ray & Lab',
      description:
        'On-site digital X-ray and laboratory services for fast diagnosis. Blood work, urinalysis, and rapid tests mean you get answers and treatment in one visit.',
      features: ['Digital X-ray', 'Blood tests', 'Rapid strep & flu tests', 'Urinalysis'],
    },
    {
      icon: ClipboardCheck,
      title: 'Occupational Health',
      description:
        'Employer services including work injury care, pre-employment physicals, drug screening, and DOT physicals. We partner with local businesses to keep employees healthy.',
      features: ['Work injury treatment', 'Pre-employment physicals', 'Drug screening', 'DOT physicals'],
    },
    {
      icon: Syringe,
      title: 'Vaccinations & Immunizations',
      description:
        'A full range of vaccines for children and adults including flu shots, travel vaccines, tetanus, and school-required immunizations. Walk in or schedule ahead.',
      features: ['Flu shots', 'Travel vaccines', 'School immunizations', 'Tetanus shots'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Board-Certified Providers',
      description:
        'Every patient is seen by board-certified physicians, physician assistants, or nurse practitioners with emergency and urgent care experience. You receive expert care every visit.',
    },
    {
      icon: Clock,
      title: 'Open 7 Days a Week',
      description:
        'We are open 8am to 8pm every day including weekends and most holidays. When your regular doctor is unavailable, we are here for you with short wait times.',
    },
    {
      icon: Users,
      title: 'Care for All Ages',
      description:
        'From infants to seniors, we treat patients of every age. Families can all be seen in one visit, saving you time and multiple trips to different providers.',
    },
    {
      icon: ThumbsUp,
      title: 'Affordable & Transparent',
      description:
        'We accept most insurance plans and post our self-pay prices online. No surprise bills — we explain costs before treatment and offer affordable options for the uninsured.',
    },
  ],
  whyUsTitle: 'Why Families Choose RapidMed',
  whyUsSubtitle:
    'Board-certified providers, short wait times, and transparent pricing — seven days a week.',

  process: [
    {
      step: '01',
      title: 'Walk In or Check In',
      description:
        'Walk in any time or check in online to save your spot. Our current wait time is posted on our website and updated throughout the day.',
    },
    {
      step: '02',
      title: 'Quick Registration',
      description:
        'Our front desk team verifies your insurance and completes registration in minutes. Bring a photo ID and your insurance card if you have one.',
    },
    {
      step: '03',
      title: 'Expert Treatment',
      description:
        'A board-certified provider examines you, orders any needed tests or X-rays, and explains your diagnosis and treatment plan clearly.',
    },
    {
      step: '04',
      title: 'Follow-Up & Records',
      description:
        'We send your records to your primary care provider, provide prescriptions, and schedule any needed follow-up so your care continues seamlessly.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'Fast, simple care from walk-in to follow-up.',

  testimonials: [
    {
      name: 'Rebecca S.',
      location: 'Brookside',
      rating: 5,
      text: 'My son had an ear infection on a Sunday. We walked in, waited 15 minutes, and were out with a prescription in under an hour. The provider was great with kids. This place is a lifesaver.',
    },
    {
      name: 'Anthony D.',
      location: 'Fairfield',
      rating: 5,
      text: 'Cut my hand pretty badly on a Saturday. They cleaned it, stitched it up, and gave me a tetanus shot. Professional, quick, and way better than sitting in an ER for hours. Highly recommend.',
    },
    {
      name: 'Megan B.',
      location: 'Eastside',
      rating: 5,
      text: 'I needed a pre-employment physical and drug screen for a new job. Walked in on my lunch break and was done in 30 minutes. They even sent the paperwork directly to my employer. So convenient.',
    },
  ],
  testimonialsTitle: 'What Our Patients Say',
  testimonialsSubtitle: 'Fast, friendly care when you need it most.',

  faqs: [
    {
      question: 'When should I go to urgent care vs the emergency room?',
      answer:
        'Go to urgent care for non-life-threatening conditions like colds, minor cuts, sprains, and infections. Go to the ER or call 911 for chest pain, difficulty breathing, severe bleeding, stroke symptoms, or major trauma. When in doubt, call 911.',
    },
    {
      question: 'Do I need an appointment?',
      answer:
        'No appointment is needed — we are a walk-in clinic. However, you can check in online to save your spot and reduce your wait time. Walk-ins are welcome during all open hours, 8am to 8pm, seven days a week.',
    },
    {
      question: 'What insurance do you accept?',
      answer:
        'We accept most major insurance plans including Medicare. We also offer affordable self-pay pricing for those without insurance. Call us with your insurance details and we will verify your coverage before your visit.',
    },
    {
      question: 'How long is the wait?',
      answer:
        'Our average wait time is under 30 minutes, and we post current wait times on our website throughout the day. Checking in online before you arrive can further reduce your wait. Wait times may be longer during peak flu season.',
    },
    {
      question: 'Do you treat children?',
      answer:
        'Yes, we treat patients of all ages, from infants to seniors. Our providers are experienced in pediatric urgent care, and families can be seen together in one visit to save you time.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about urgent care.',

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

  contactTitle: 'Visit Us or Check Wait Times',
  contactSubtitle:
    'Walk in any time or check in online. Call us with any questions — we are here seven days a week.',

  galleryTitle: 'Our Clinic & Facilities',
  gallerySubtitle: 'See the RapidMed experience.',
  galleryImages: [
    'https://images.pexels.com/photos/8948301/pexels-photo-8948301.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/8948301/pexels-photo-8948301.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/8948301/pexels-photo-8948301.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Board-certified providers delivering prompt, compassionate care.',
  team: [
    { name: 'Dr. Karen Whitman, MD', role: 'Medical Director & Physician', bio: 'Board-certified in family medicine with 10 years of urgent care experience. Dr. Whitman oversees clinical quality and treats patients of all ages across our seven-day operation.' },
    { name: 'James Foster, PA-C', role: 'Physician Assistant', bio: 'Certified physician assistant specializing in urgent care and occupational health. James has 8 years of experience treating acute injuries and illnesses.' },
    { name: 'Nina Alvarez, FNP', role: 'Family Nurse Practitioner', bio: 'Board-certified family nurse practitioner with expertise in pediatric and adult urgent care, women\u2019s health, and preventive services including vaccinations.' },
  ],

  pricingTitle: 'Care Service Options',
  pricingSubtitle: 'Transparent pricing with most insurance accepted.',
  pricing: [
    { name: 'Office Visit', price: 'From $99', description: 'Self-pay rate for a basic urgent care visit.', features: ['Provider evaluation', 'Diagnosis & treatment', 'Common prescriptions', 'Most insurance accepted'], popular: false },
    { name: 'Visit + X-Ray or Lab', price: 'From $149', description: 'Visit with on-site diagnostic testing.', features: ['Provider evaluation', 'Digital X-ray or lab', 'Rapid strep & flu tests', 'Diagnosis & treatment', 'Insurance accepted'], popular: true },
    { name: 'Occupational Health', price: 'From $79', description: 'Employer services and physicals.', features: ['Pre-employment physicals', 'Drug screening', 'DOT physicals', 'Work injury care', 'Employer billing'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the RapidMed Urgent Care assistant. How can I help you today?",
    placeholder: "Ask about wait times, services, or insurance...",
    knowledgeBase: [
      "We offer walk-in care, injury treatment, illness treatment, on-site X-ray and lab, occupational health, and vaccinations and immunizations.",
      "Go to urgent care for non-life-threatening conditions. Go to the ER or call 911 for chest pain, difficulty breathing, severe bleeding, or stroke symptoms.",
      "No appointment is needed. We are a walk-in clinic open 8am to 8pm, seven days a week. You can also check in online to save your spot.",
      "We accept most major insurance plans including Medicare, plus affordable self-pay pricing for the uninsured.",
      "Our average wait time is under 30 minutes, and we post current wait times on our website throughout the day.",
      "Yes, we treat patients of all ages, from infants to seniors, and families can be seen together in one visit.",
      "All patients are seen by board-certified physicians, physician assistants, or nurse practitioners.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are 8am to 8pm every day including weekends and most holidays.",
      "We have over 10 years of experience and have treated more than 120,000 patients.",
    ],
  },
};
