import {
  HeartPulse,
  Activity,
  Heart,
  Bone,
  Stethoscope,
  Shield,
  Award,
  Clock,
  Users,
  ThumbsUp,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const chiropracticConfig: IndustryConfig = {
  id: 'chiropractic',
  industryName: 'Chiropractic',
  businessName: 'AlignWell Chiropractic',
  tagline: 'Move Better. Live Better.',
  heroTitle: 'Natural Healing for a Healthier You',
  heroSubtitle:
    'Drug-free, surgery-free chiropractic care that addresses the root cause of your pain and helps you live life at your fullest.',
  phone: '(555) 890-1234',
  email: 'care@alignwellchiropractic.com',
  serviceArea: 'Greater Metro Area & Surrounding Counties',
  hours: 'Mon-Wed-Fri 7am-6pm | Tue-Thu 9am-5pm | Sat 8am-12pm',
  yearsExperience: '16+',
  licenseNumber: 'CH-1526273',

  colors: {
    primary: '#15803D',
    primaryDark: '#166534',
    primaryLight: '#DCFCE7',
    accent: '#78350F',
    background: '#FFFFFF',
    surface: '#F7FDF9',
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

  heroImage: 'https://webgenie-ai-sooty.vercel.app/gallery-photos/chiropractic.jpg',
  heroBadge: 'Licensed Chiropractor • Most Insurance Accepted',
  ctaPrimary: 'Book Free Consultation',
  ctaSecondary: 'View Services',

  stats: [
    { value: '16+', label: 'Years of Care' },
    { value: '9,500+', label: 'Patients Helped' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '90%', label: 'Pain Reduction' },
  ],

  services: [
    {
      icon: HeartPulse,
      title: 'Spinal Adjustment',
      description:
        'Precise, gentle spinal manipulations that restore proper alignment, relieve nerve pressure, and help your body heal naturally.',
      features: ['Manual adjustments', 'Drop table technique', 'Instrument adjusting', 'Motion palpation'],
    },
    {
      icon: Heart,
      title: 'Massage Therapy',
      description:
        'Therapeutic massage that complements your adjustments by releasing muscle tension, improving circulation, and accelerating recovery.',
      features: ['Deep tissue massage', 'Trigger point therapy', 'Myofascial release', 'Sports recovery massage'],
    },
    {
      icon: Activity,
      title: 'Injury Recovery',
      description:
        'Targeted rehabilitation programs for auto accidents, work injuries, and sports injuries — getting you back to full function safely.',
      features: ['Auto accident recovery', 'Work injury rehab', 'Sports injury care', 'Progressive rehab exercises'],
    },
    {
      icon: Bone,
      title: 'Posture Correction',
      description:
        'Comprehensive posture assessment and corrective protocols that address the root cause of pain and prevent future problems.',
      features: ['Postural assessment', 'Ergonomic coaching', 'Corrective exercises', 'Progress monitoring'],
    },
    {
      icon: Stethoscope,
      title: 'Wellness Plans',
      description:
        'Ongoing wellness care that keeps your spine healthy, your immune system strong, and your body performing at its best year-round.',
      features: ['Monthly maintenance', 'Preventive adjustments', 'Lifestyle coaching', 'Nutritional guidance'],
    },
    {
      icon: Shield,
      title: 'Pediatric Care',
      description:
        'Gentle, safe chiropractic care for children that supports healthy development, better sleep, and a stronger immune system.',
      features: ['Gentle techniques', 'Developmental support', 'Colic relief', 'Sports injury prevention'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Licensed & Experienced',
      description:
        'Dr. Mitchell is a licensed Doctor of Chiropractic (CH-1526273) with 16+ years of experience and advanced training in multiple adjustment techniques.',
    },
    {
      icon: Clock,
      title: 'Same-Day Appointments',
      description:
        'Pain does not wait, and neither should you. We offer same-day appointments for new and existing patients whenever possible.',
    },
    {
      icon: Users,
      title: 'Whole-Family Care',
      description:
        'From infants to seniors, we treat every member of your family with care tailored to their age, condition, and goals.',
    },
    {
      icon: ThumbsUp,
      title: 'Root-Cause Approach',
      description:
        'We do not just mask symptoms. We identify and treat the underlying cause of your pain for lasting relief, not temporary fixes.',
    },
  ],
  whyUsTitle: 'Why Patients Trust AlignWell',
  whyUsSubtitle:
    'Natural, effective care that treats the cause — not just the symptoms. Here is what sets us apart.',

  process: [
    {
      step: '01',
      title: 'Comprehensive Consultation',
      description:
        'We listen to your history, understand your pain, and perform a thorough examination including posture, range of motion, and neurological tests.',
    },
    {
      step: '02',
      title: 'Custom Treatment Plan',
      description:
        'Based on your exam, we design a personalized care plan with clear goals, a realistic timeline, and transparent pricing.',
    },
    {
      step: '03',
      title: 'Hands-On Treatment',
      description:
        'Gentle, precise adjustments and complementary therapies delivered in a calm, comfortable environment. Most patients feel relief immediately.',
    },
    {
      step: '04',
      title: 'Ongoing Wellness',
      description:
        'We track your progress, adjust your care as you heal, and transition you to a wellness plan that keeps you feeling your best.',
    },
  ],
  processTitle: 'Your Path to Wellness',
  processSubtitle: 'A clear, personalized journey from pain to lasting health.',

  testimonials: [
    {
      name: 'Thomas H.',
      location: 'Oakwood Heights',
      rating: 5,
      text: 'After years of lower back pain and being told surgery was my only option, Dr. Mitchell had me pain-free in eight weeks. I cannot recommend AlignWell enough. It changed my life.',
    },
    {
      name: 'Karen W.',
      location: 'Cedar Valley',
      rating: 5,
      text: 'I was in a car accident and could barely turn my neck. Within three visits I had full range of motion back. The care and attention here is exceptional.',
    },
    {
      name: 'Diego R.',
      location: 'Maple Ridge',
      rating: 5,
      text: 'My whole family goes to AlignWell. My kids love their adjustments and I have not had a migraine in months. Dr. Mitchell genuinely cares about every patient.',
    },
  ],
  testimonialsTitle: 'What Our Patients Say',
  testimonialsSubtitle: 'Real stories from patients who found relief and lasting wellness.',

  faqs: [
    {
      question: 'Is chiropractic treatment safe?',
      answer:
        'Yes. Chiropractic care is widely recognized as one of the safest drug-free, non-invasive therapies for neuromusculoskeletal conditions. Dr. Mitchell uses gentle, precise techniques and always conducts a thorough exam before any treatment. Millions of people safely receive chiropractic care every year.',
    },
    {
      question: 'Does chiropractic treatment hurt?',
      answer:
        'Most patients experience relief during or immediately after treatment, not pain. You may feel mild soreness for 24-48 hours after your first few adjustments, similar to starting a new exercise routine. We use gentle techniques and always adjust our approach based on your comfort level.',
    },
    {
      question: 'How many visits will I need?',
      answer:
        'It depends on your condition, how long you have had it, and your overall health. Acute issues may resolve in 4-8 visits, while chronic conditions may require a longer plan. We will give you a clear estimate after your exam and adjust based on your progress.',
    },
    {
      question: 'Do you accept insurance?',
      answer:
        'Yes. We accept most major insurance plans, including auto insurance for accident claims and workers compensation for workplace injuries. We will verify your benefits before your first treatment and explain any out-of-pocket costs upfront.',
    },
    {
      question: 'Can chiropractic care help with conditions beyond back pain?',
      answer:
        'Yes. While back and neck pain are the most common reasons people seek care, chiropractic can also help with headaches, sciatica, joint pain, posture issues, sports injuries, and even improved immune function. We will discuss your specific concerns during your consultation.',
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

  contactTitle: 'Start Your Healing Journey',
  contactSubtitle:
    'Call us or fill out the form below. New patients receive a free consultation — we respond within one business day.',

  galleryTitle: 'Our Clinic & Care in Action',
  gallerySubtitle: 'See our welcoming clinic and the care we provide every day.',
  galleryImages: ['/hero-landscaping.webp', '/hero-tree-care.webp', '/hero-cleaning.webp'],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Dedicated professionals committed to your natural health and wellness.',
  team: [
    { name: 'Dr. Sarah Mitchell', role: 'Founder & Lead Chiropractor', bio: 'Doctor of Chiropractic with 16+ years of experience and advanced training in diversified, activator, and drop-table techniques. Dr. Mitchell founded AlignWell to provide holistic, patient-first care.' },
    { name: 'James Park', role: 'Licensed Massage Therapist', bio: 'LMT with 10 years of experience in deep tissue, trigger point, and sports massage. James works alongside Dr. Mitchell to accelerate your recovery.' },
    { name: 'Emily Foster', role: 'Rehab & Wellness Coordinator', bio: 'Certified in corrective exercise and rehabilitation. Emily designs personalized exercise and posture programs to keep you well between visits.' },
  ],

  pricingTitle: 'Care Plans & Wellness Options',
  pricingSubtitle: 'Transparent pricing. Most insurance accepted. Free consultations for new patients.',
  pricing: [
    { name: 'New Patient Visit', price: '$95', description: 'Complete consultation, exam, and first adjustment.', features: ['Health history review', 'Full spinal exam', 'Posture assessment', 'First adjustment', 'Custom care plan'], popular: false },
    { name: 'Wellness Membership', price: '$129/mo', description: 'Monthly membership for ongoing preventive care.', features: ['4 adjustments per month', '1 massage per month', 'Posture screening', 'Exercise plan', 'Priority scheduling'], popular: true },
    { name: 'Injury Recovery Program', price: 'From $1,200', description: 'Comprehensive rehab program for accident or injury.', features: ['12-week program', 'Weekly adjustments', 'Massage therapy', 'Rehab exercises', 'Progress reports', 'Insurance filing assistance'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the AlignWell Chiropractic assistant. How can I help you today?",
    placeholder: "Ask about our treatments or scheduling...",
    knowledgeBase: [
      "We offer spinal adjustments, massage therapy, injury recovery, posture correction, wellness plans, and pediatric chiropractic care.",
      "Our lead chiropractor, Dr. Sarah Mitchell, is licensed (CH-1526273) with 16+ years of experience.",
      "Chiropractic care is widely recognized as one of the safest drug-free, non-invasive therapies for back, neck, and joint conditions.",
      "Most patients feel relief during or immediately after treatment. Mild soreness for 24-48 hours after the first few adjustments is normal.",
      "The number of visits depends on your condition. Acute issues may resolve in 4-8 visits, while chronic conditions may need a longer plan.",
      "We accept most major insurance plans, auto insurance for accidents, and workers compensation for workplace injuries.",
      "We offer free consultations for new patients. Call us at (555) 890-1234 to schedule.",
      "We serve Oakwood Heights, Cedar Valley, Maple Ridge, Pinebrook, Riverside, Highland Park, Greenwood, and Brookfield.",
      "Our hours are Mon-Wed-Fri 7am-6pm, Tue-Thu 9am-5pm, and Sat 8am-12pm.",
      "We have 16+ years of experience and have helped over 9,500 patients.",
    ],
  },
};
