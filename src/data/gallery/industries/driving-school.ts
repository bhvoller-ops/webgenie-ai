import {
  Car,
  User,
  Shield,
  FileCheck,
  Navigation,
  Monitor,
  Award,
  Clock,
  Users,
  ThumbsUp,
  MapPin,
  PhoneCall,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const drivingSchoolConfig: IndustryConfig = {
  id: 'driving-school',
  industryName: 'Driving School',
  businessName: 'SafeWay Driving Academy',
  tagline: 'Drive Safe. Drive Confident.',
  heroTitle: 'Learn to Drive the Safe Way',
  heroSubtitle:
    'Professional driver education for teens and adults. Certified instructors, modern vehicles, and a proven curriculum that builds safe, confident drivers for life.',
  phone: '(555) 463-9921',
  email: 'info@safewaydrivingacademy.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Sat 8am-7pm',
  yearsExperience: '20+',
  licenseNumber: 'DS-2019384',

  colors: {
    primary: '#1E40AF',
    primaryDark: '#1E3A8A',
    primaryLight: '#DBEAFE',
    accent: '#B45309',
    background: '#FFFFFF',
    surface: '#F0F5FF',
    text: '#0F1B2E',
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

  heroImage: 'https://images.pexels.com/photos/9518244/pexels-photo-9518244.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'State Certified • Licensed Instructors • Online & In-Car',
  ctaPrimary: 'Enroll Now',
  ctaSecondary: 'View Programs',

  stats: [
    { value: '20+', label: 'Years Teaching' },
    { value: '15,000+', label: 'Students Licensed' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '95%', label: 'First-Time Pass Rate' },
  ],

  services: [
    {
      icon: Car,
      title: 'Teen Driver Education',
      description:
        'Complete state-certified program for new teen drivers. Classroom instruction, behind-the-wheel training, and everything needed to earn a license.',
      features: ['State certified', 'Classroom + in-car', 'Permit prep', 'Graduate certificate'],
    },
    {
      icon: User,
      title: 'Adult Driving Lessons',
      description:
        'Tailored instruction for adult learners, whether you are getting your first license or refreshing your skills after years off the road.',
      features: ['Beginner friendly', 'Refresher courses', 'Flexible scheduling', 'Patient instructors'],
    },
    {
      icon: Shield,
      title: 'Defensive Driving',
      description:
        'Learn advanced techniques to anticipate hazards and respond safely. May qualify you for an insurance discount — check with your provider.',
      features: ['Hazard awareness', 'Emergency maneuvers', 'Insurance discount', 'Court approved'],
    },
    {
      icon: FileCheck,
      title: 'DMV Test Prep',
      description:
        'Focused preparation for the written and road tests. We cover the handbook, practice tests, and a mock road test so you walk in confident.',
      features: ['Written test prep', 'Road test simulation', 'Handbook review', 'Confidence building'],
    },
    {
      icon: Navigation,
      title: 'Behind-the-Wheel Training',
      description:
        'One-on-one in-car instruction with certified instructors. Build real-world skills in traffic, parking, highway, and adverse conditions.',
      features: ['One-on-one', 'Highway driving', 'Parking mastery', 'Real traffic practice'],
    },
    {
      icon: Monitor,
      title: 'Online Courses',
      description:
        'Complete your classroom requirement online at your own pace. Engaging video lessons, quizzes, and progress tracking from any device.',
      features: ['Self-paced', 'Video lessons', 'Mobile friendly', '24/7 access'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'State Certified',
      description:
        'We are a fully licensed and state-certified driving school. Our curriculum meets all requirements and our instructors are professionally trained.',
    },
    {
      icon: Shield,
      title: 'Safety First',
      description:
        'Our modern training vehicles are equipped with dual controls and safety features. Your safety is our top priority in every lesson.',
    },
    {
      icon: Clock,
      title: 'Flexible Scheduling',
      description:
        'We offer lessons seven days a week with pickup and drop-off available. We work around your school, work, and family schedule.',
    },
    {
      icon: ThumbsUp,
      title: 'Proven Results',
      description:
        'With a 95% first-time pass rate and 15,000+ licensed graduates, our track record speaks for itself. You are in good hands.',
    },
  ],
  whyUsTitle: 'Why Families Trust SafeWay',
  whyUsSubtitle:
    'We do not just teach driving — we build safe, confident drivers with a curriculum backed by 20 years of results.',

  process: [
    {
      step: '01',
      title: 'Enroll & Get Your Permit',
      description:
        'Register online or by phone. Complete the classroom portion and we guide you through getting your learner permit.',
    },
    {
      step: '02',
      title: 'Schedule Driving Lessons',
      description:
        'Book behind-the-wheel sessions at times that work for you. We pick you up from home, school, or work.',
    },
    {
      step: '03',
      title: 'Practice & Build Skills',
      description:
        'One-on-one instruction builds real-world confidence. Practice between lessons with a licensed adult to accelerate progress.',
    },
    {
      step: '04',
      title: 'Pass Your Test',
      description:
        'We run a mock road test, then take you to the DMV. Walk in confident and drive out with your new license.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'From permit to licensed driver.',

  testimonials: [
    {
      name: 'Patricia M.',
      location: 'Brookside',
      rating: 5,
      text: 'My son passed his road test on the first try thanks to SafeWay. The instructor was patient and thorough, and the behind-the-wheel lessons built real confidence. Worth every penny.',
    },
    {
      name: 'Ahmed R.',
      location: 'Fairfield',
      rating: 5,
      text: 'I was nervous about driving as an adult learner, but my instructor never made me feel rushed. After 10 lessons I passed my test and now drive to work every day. Highly recommend.',
    },
    {
      name: 'Sandra W.',
      location: 'Eastside',
      rating: 5,
      text: 'The online course was so convenient for my daughter. She completed it on her phone between activities, and the in-car instructors were professional and kind. Great experience overall.',
    },
  ],
  testimonialsTitle: 'What Our Students Say',
  testimonialsSubtitle: 'Confident drivers, happy families.',

  faqs: [
    {
      question: 'How do I get my learner permit?',
      answer:
        'You must be at least 15 years old, pass a written test, and provide required documents. Our classroom course prepares you for the written test, and we guide you through the entire process.',
    },
    {
      question: 'How many lessons do I need before my test?',
      answer:
        'It varies by student. Most new drivers benefit from 6 to 10 behind-the-wheel lessons. Your instructor will assess your progress and recommend the right number for you.',
    },
    {
      question: 'Do you pick up and drop off?',
      answer:
        'Yes! We offer free pickup and drop-off at home, school, or work within our service area for all behind-the-wheel lessons.',
    },
    {
      question: 'Can I use your car for the DMV road test?',
      answer:
        'Yes. We offer a road test package that includes use of our vehicle, pickup, and a warm-up lesson before your test. Ask us for details when you enroll.',
    },
    {
      question: 'Do you offer defensive driving for insurance discounts?',
      answer:
        'Yes. Our defensive driving course is court-approved and may qualify you for an insurance discount. Check with your insurance provider to confirm their requirements.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about learning to drive with us.',

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

  contactTitle: 'Enroll in Driving School',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day to get you started.',

  galleryTitle: 'Our Training in Action',
  gallerySubtitle: 'Lessons, road tests, and safe drivers in the making.',
  galleryImages: [
    'https://images.pexels.com/photos/9518244/pexels-photo-9518244.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/9518244/pexels-photo-9518244.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/9518244/pexels-photo-9518244.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Certified instructors dedicated to your safety.',
  team: [
    { name: 'Robert Hayes', role: 'Academy Director & Lead Instructor', bio: 'Former police driving instructor with 20 years of experience. Robert founded SafeWay to bring professional-grade driver education to everyone.' },
    { name: 'Jennifer Cruz', role: 'Behind-the-Wheel Instructor', bio: 'Patient and thorough, Jennifer specializes in helping nervous new drivers build confidence behind the wheel.' },
    { name: 'Michael Owens', role: 'Classroom & Online Instructor', bio: 'Engaging educator who makes the rules of the road easy to understand and remember for students of all ages.' },
  ],

  pricingTitle: 'Driving Programs',
  pricingSubtitle: 'Clear pricing with no hidden fees.',
  pricing: [
    { name: 'Online Course Only', price: 'From $49', description: 'Complete classroom requirement online.', features: ['Self-paced', 'Video lessons', 'Permit prep', 'Certificate of completion', 'Mobile friendly'], popular: false },
    { name: 'Full Teen Program', price: 'From $499', description: 'Classroom plus behind-the-wheel.', features: ['Online classroom', '6 in-car lessons', 'DMV test prep', 'Pickup & drop-off', 'Graduate certificate'], popular: true },
    { name: 'Road Test Package', price: 'From $149', description: 'Mock test, car, and DMV trip.', features: ['Mock road test', 'Use of our vehicle', 'Warm-up lesson', 'DMV pickup', 'Confidence guaranteed'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the SafeWay Driving Academy assistant. Are you looking for teen or adult driving lessons?",
    placeholder: "Ask about programs, pricing, or scheduling...",
    knowledgeBase: [
      "We offer teen driver education, adult driving lessons, defensive driving, DMV test prep, behind-the-wheel training, and online courses.",
      "To get your learner permit you must be at least 15, pass a written test, and provide required documents. Our classroom course prepares you for the written test.",
      "Most new drivers benefit from 6 to 10 behind-the-wheel lessons. Your instructor will assess your progress and recommend the right number for you.",
      "Yes, we offer free pickup and drop-off at home, school, or work within our service area for all behind-the-wheel lessons.",
      "Yes, our road test package includes use of our vehicle, pickup, and a warm-up lesson before your DMV test.",
      "Our defensive driving course is court-approved and may qualify you for an insurance discount. Check with your provider to confirm.",
      "Our full teen program is $499 and includes the online classroom course plus 6 behind-the-wheel lessons and DMV test prep.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are Monday through Saturday, 8am to 7pm.",
      "We have 20+ years of experience, 15,000+ licensed students, and a 95% first-time pass rate.",
    ],
  },
};
