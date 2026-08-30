import {
  Activity,
  Zap,
  ShieldCheck,
  Hand,
  Droplets,
  Eye,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const physicalTherapyConfig: IndustryConfig = {
  id: 'physical-therapy',
  industryName: 'Physical Therapy',
  businessName: 'RestoreMotion PT',
  tagline: 'Move Better. Live Better.',
  heroTitle: 'Expert Physical Therapy That Gets You Moving Again',
  heroSubtitle:
    'Whether you are recovering from surgery, managing chronic pain, or working to prevent injury, our licensed physical therapists create personalized treatment plans to restore your strength, mobility, and quality of life.',
  phone: '(555) 621-4477',
  email: 'intake@restoremotionpt.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Thu 7am-7pm, Fri 7am-4pm',
  yearsExperience: '15+',
  licenseNumber: 'PT-5523104',

  colors: {
    primary: '#0D9488',
    primaryDark: '#0F766E',
    primaryLight: '#CCFBF1',
    accent: '#1E40AF',
    background: '#FFFFFF',
    surface: '#F0FDFA',
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
    'https://images.pexels.com/photos/20860596/pexels-photo-20860596.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'Direct Access • Most Insurance Accepted',
  ctaPrimary: 'Book Evaluation',
  ctaSecondary: 'View Services',

  stats: [
    { value: '15+', label: 'Years Experience' },
    { value: '12,000+', label: 'Patients Treated' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '92%', label: 'Pain Reduction in 6 Weeks' },
  ],

  services: [
    {
      icon: Activity,
      title: 'Orthopedic Rehab',
      description:
        'Treatment for joint, muscle, and bone conditions including arthritis, tendonitis, and post-fracture recovery. We restore mobility and reduce pain with targeted exercise and manual therapy.',
      features: ['Joint mobilization', 'Strength training', 'Pain management', 'Functional training'],
    },
    {
      icon: Zap,
      title: 'Sports Injury Recovery',
      description:
        'Specialized rehabilitation for athletes of all levels. We treat sprains, strains, and overuse injuries and design return-to-sport programs to get you back safely and stronger.',
      features: ['Injury assessment', 'Sport-specific training', 'Return-to-play testing', 'Injury prevention'],
    },
    {
      icon: ShieldCheck,
      title: 'Post-Surgical Rehab',
      description:
        'Comprehensive rehabilitation following orthopedic surgery including joint replacement, ACL reconstruction, and rotator cuff repair. We coordinate with your surgeon for optimal recovery.',
      features: ['Post-op protocols', 'Range of motion', 'Strength restoration', 'Scar tissue management'],
    },
    {
      icon: Hand,
      title: 'Manual Therapy',
      description:
        'Hands-on treatment techniques including joint mobilization, soft tissue massage, and myofascial release to reduce pain, improve mobility, and accelerate healing.',
      features: ['Joint mobilization', 'Soft tissue work', 'Myofascial release', 'Trigger point therapy'],
    },
    {
      icon: Eye,
      title: 'Balance & Fall Prevention',
      description:
        'Specialized programs for older adults and those with vestibular disorders. We improve stability, coordination, and confidence to reduce fall risk and restore independence.',
      features: ['Vestibular rehab', 'Balance training', 'Gait correction', 'Fall risk assessment'],
    },
    {
      icon: Droplets,
      title: 'Dry Needling',
      description:
        'A modern technique using fine needles to release muscle tension and trigger points, reduce pain, and improve function. Performed by certified physical therapists.',
      features: ['Trigger point release', 'Pain reduction', 'Muscle relaxation', 'Improved mobility'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Licensed Specialists',
      description:
        'All our therapists hold Doctor of Physical Therapy degrees and pursue advanced certifications in orthopedics, sports, and manual therapy. You receive expert care at every visit.',
    },
    {
      icon: Clock,
      title: 'One-on-One Sessions',
      description:
        'You work directly with your physical therapist for the full session — no aides, no double-booking. We focus entirely on your recovery during every minute of your appointment.',
    },
    {
      icon: Users,
      title: 'Personalized Plans',
      description:
        'No cookie-cutter programs. We design a treatment plan based on your specific condition, goals, and lifestyle, and adjust it as you progress toward full recovery.',
    },
    {
      icon: ThumbsUp,
      title: 'Direct Access',
      description:
        'In most states you can see a physical therapist without a physician referral. We verify your insurance benefits and handle any required paperwork for you.',
    },
  ],
  whyUsTitle: 'Why Patients Choose RestoreMotion',
  whyUsSubtitle:
    'Licensed therapists, one-on-one care, and personalized plans that deliver real results.',

  process: [
    {
      step: '01',
      title: 'Initial Evaluation',
      description:
        'Your therapist performs a thorough 60-minute assessment of your condition, mobility, strength, and goals to build your personalized treatment plan.',
    },
    {
      step: '02',
      title: 'Custom Treatment Plan',
      description:
        'We explain your diagnosis, outline your recovery timeline, and design a hands-on treatment and home exercise program tailored to your needs.',
    },
    {
      step: '03',
      title: 'Active Rehabilitation',
      description:
        'Regular one-on-one sessions combining manual therapy, guided exercise, and education. We track your progress and advance your program as you improve.',
    },
    {
      step: '04',
      title: 'Return to Activity',
      description:
        'We transition you to independent management with a home program and injury prevention strategies so you stay strong and pain-free long after therapy ends.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'A clear path from your first evaluation to lasting recovery.',

  testimonials: [
    {
      name: 'Greg P.',
      location: 'Brookside',
      rating: 5,
      text: 'After knee replacement surgery I was worried about getting back to hiking. The team at RestoreMotion got me walking, then hiking, then back on the trails in 10 weeks. The one-on-one sessions made all the difference.',
    },
    {
      name: 'Alicia T.',
      location: 'Fairfield',
      rating: 5,
      text: 'I came in with chronic back pain from years at a desk job. My therapist identified the root cause and gave me exercises that actually worked. Six weeks later I am pain-free for the first time in years.',
    },
    {
      name: 'Devon R.',
      location: 'Eastside',
      rating: 5,
      text: 'Tore my ACL playing soccer and they guided me through the entire recovery. The sport-specific return-to-play testing gave me confidence to get back on the field. Professional, knowledgeable, and genuinely caring.',
    },
  ],
  testimonialsTitle: 'What Our Patients Say',
  testimonialsSubtitle: 'Real recovery stories from patients back to doing what they love.',

  faqs: [
    {
      question: 'Do I need a referral from my doctor?',
      answer:
        'In most states, you can see a physical therapist directly without a physician referral, known as direct access. We verify your insurance requirements and handle any necessary paperwork. Some insurance plans may still require a referral.',
    },
    {
      question: 'How long will my therapy take?',
      answer:
        'Recovery time depends on your condition, its severity, and your goals. Most patients attend 2 to 3 sessions per week for 4 to 8 weeks. Your therapist gives you a clear timeline after your initial evaluation.',
    },
    {
      question: 'What should I wear to my appointments?',
      answer:
        'Wear comfortable, loose-fitting clothing that allows easy access to the area being treated and lets you move freely. Athletic wear is ideal. We have gowns available if needed for certain treatments.',
    },
    {
      question: 'Will physical therapy be painful?',
      answer:
        'Some discomfort can occur as we work to restore mobility and strength, but therapy should not be painful. We communicate with you throughout each session and adjust treatment to keep you comfortable while making progress.',
    },
    {
      question: 'Do you accept my insurance?',
      answer:
        'We accept most major insurance plans including Medicare and many workers compensation plans. We also offer affordable self-pay rates. Call us with your insurance details and we will verify your benefits before your first visit.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about physical therapy.',

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

  contactTitle: 'Book Your Physical Therapy Evaluation',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day to schedule your visit.',

  galleryTitle: 'Our Clinic & Treatment Spaces',
  gallerySubtitle: 'See the RestoreMotion difference.',
  galleryImages: [
    'https://images.pexels.com/photos/20860596/pexels-photo-20860596.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/20860596/pexels-photo-20860596.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/20860596/pexels-photo-20860596.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Licensed physical therapists dedicated to your recovery.',
  team: [
    { name: 'Dr. Rachel Kim, DPT', role: 'Clinic Director & PT', bio: 'Doctor of Physical Therapy with 15 years of experience specializing in orthopedics and sports rehabilitation. Dr. Kim is board-certified in orthopedic physical therapy.' },
    { name: 'Dr. James Okafor, DPT', role: 'Physical Therapist', bio: 'Specializes in post-surgical rehabilitation and manual therapy. Dr. Okafor is certified in dry needling and has advanced training in vestibular and balance disorders.' },
    { name: 'Maria Gonzalez, PTA', role: 'Physical Therapist Assistant', bio: 'Works alongside our PTs to guide patients through exercise programs and provide hands-on treatment. Maria has 10 years of experience in outpatient orthopedics.' },
  ],

  pricingTitle: 'Therapy Service Options',
  pricingSubtitle: 'Transparent pricing with most insurance accepted.',
  pricing: [
    { name: 'Initial Evaluation', price: 'From $150', description: 'Comprehensive 60-minute assessment.', features: ['Full movement assessment', 'Strength testing', 'Diagnosis & plan', 'Home exercise program'], popular: false },
    { name: 'Standard Treatment', price: 'Insurance Covered', description: 'Most insurance-covered therapy sessions.', features: ['One-on-one sessions', 'Manual therapy', 'Guided exercise', 'Progress tracking', 'Home program updates'], popular: true },
    { name: 'Self-Pay Package', price: 'From $99/session', description: 'For those without insurance coverage.', features: ['No referral needed', 'Flexible scheduling', 'One-on-one care', 'Custom home program', 'Progress reports'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the RestoreMotion PT assistant. How can I help you today?",
    placeholder: "Ask about physical therapy, insurance, or scheduling...",
    knowledgeBase: [
      "We offer orthopedic rehab, sports injury recovery, post-surgical rehab, manual therapy, balance and fall prevention, and dry needling.",
      "In most states you can see a physical therapist directly without a physician referral, known as direct access.",
      "Most patients attend 2 to 3 sessions per week for 4 to 8 weeks, depending on the condition.",
      "We accept most major insurance plans including Medicare and many workers compensation plans, plus affordable self-pay rates.",
      "Wear comfortable, loose-fitting clothing that allows easy movement and access to the treated area.",
      "All our therapists hold Doctor of Physical Therapy degrees and pursue advanced certifications.",
      "Every session is one-on-one with your physical therapist for the full appointment time.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are Monday through Thursday 7am to 7pm and Friday 7am to 4pm.",
      "We have over 15 years of experience and have treated more than 12,000 patients with 92% reporting significant pain reduction within 6 weeks.",
    ],
  },
};
