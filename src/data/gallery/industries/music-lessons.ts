import {
  Piano,
  Guitar,
  Mic,
  Music,
  Drum,
  BookOpen,
  Award,
  Clock,
  Users,
  Heart,
  Star,
  Calendar,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const musicLessonsConfig: IndustryConfig = {
  id: 'music-lessons',
  industryName: 'Music Lessons',
  businessName: 'Harmony Music Academy',
  tagline: 'Play. Perform. Inspire.',
  heroTitle: 'Discover Your Musical Potential',
  heroSubtitle:
    'Expert instruction for all ages and skill levels. From your first note to center stage, our passionate teachers help you grow into the musician you want to be.',
  phone: '(555) 245-6789',
  email: 'lessons@harmonymusicacademy.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Sat 10am-8pm',
  yearsExperience: '15+',
  licenseNumber: 'ML-4827193',

  colors: {
    primary: '#7C3AED',
    primaryDark: '#5B21B6',
    primaryLight: '#EDE9FE',
    accent: '#B45309',
    background: '#FFFFFF',
    surface: '#F5F3FF',
    text: '#1E1B2E',
    textMuted: '#6B6786',
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

  heroImage: 'https://images.pexels.com/photos/7447185/pexels-photo-7447185.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'All Ages • All Levels • In-Studio & Online',
  ctaPrimary: 'Book a Trial Lesson',
  ctaSecondary: 'View Programs',

  stats: [
    { value: '15+', label: 'Years Teaching' },
    { value: '1,200+', label: 'Students Taught' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '98%', label: 'Student Retention' },
  ],

  services: [
    {
      icon: Piano,
      title: 'Piano Lessons',
      description:
        'From classical to contemporary, our piano program builds strong technique, sight-reading, and musical expression for beginners through advanced students.',
      features: ['Classical & pop', 'Technique & theory', 'Sight-reading', 'Performance prep'],
    },
    {
      icon: Guitar,
      title: 'Guitar Lessons',
      description:
        'Acoustic, electric, or bass — learn chords, riffs, and songs you love while building solid fundamentals and improvisation skills.',
      features: ['Acoustic & electric', 'Chords & scales', 'Songwriting', 'Lead & rhythm'],
    },
    {
      icon: Mic,
      title: 'Voice & Singing',
      description:
        'Develop vocal range, breath control, and confidence. Our vocal coaches guide you through technique and repertoire across genres.',
      features: ['Breath control', 'Range expansion', 'Stage presence', 'Audition prep'],
    },
    {
      icon: Music,
      title: 'Violin Lessons',
      description:
        'Beautiful tone and precise technique start here. Our violin program covers posture, bowing, intonation, and musicality.',
      features: ['Posture & bowing', 'Intonation', 'Classical & fiddle', 'Ensemble playing'],
    },
    {
      icon: Drum,
      title: 'Drum Lessons',
      description:
        'Build rhythm, coordination, and groove. Our drum students learn rock, jazz, funk, and more on a full acoustic kit.',
      features: ['Rock & jazz', 'Coordination drills', 'Timing & groove', 'Performance skills'],
    },
    {
      icon: BookOpen,
      title: 'Music Theory',
      description:
        'Understand the language of music. Our theory classes cover notation, harmony, composition, and ear training for well-rounded musicians.',
      features: ['Notation', 'Harmony & chords', 'Ear training', 'Composition'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Certified Instructors',
      description:
        'Our teachers hold degrees in music and have years of performance and teaching experience. You learn from professionals who love what they do.',
    },
    {
      icon: Heart,
      title: 'Personalized Learning',
      description:
        'Every student gets a custom lesson plan built around their goals, interests, and pace. No cookie-cutter curriculum here.',
    },
    {
      icon: Users,
      title: 'Recitals & Performance',
      description:
        'Regular recitals and showcases give students the chance to perform, build confidence, and celebrate their progress with family and friends.',
    },
    {
      icon: Star,
      title: 'All Ages Welcome',
      description:
        'From young beginners to adult learners, we tailor our approach to each age group so everyone can experience the joy of making music.',
    },
  ],
  whyUsTitle: 'Why Families Choose Harmony',
  whyUsSubtitle:
    'We do not just teach notes — we nurture musicians with patience, passion, and a plan for every student.',

  process: [
    {
      step: '01',
      title: 'Book a Trial Lesson',
      description:
        'Tell us your instrument, goals, and schedule. We match you with the perfect teacher and book a low-cost trial lesson.',
    },
    {
      step: '02',
      title: 'Meet Your Teacher',
      description:
        'Come in-studio or join online. Your teacher assesses your level, discusses your goals, and outlines a personalized plan.',
    },
    {
      step: '03',
      title: 'Learn & Practice',
      description:
        'Weekly lessons, clear practice goals, and ongoing feedback keep you progressing steadily toward your musical goals.',
    },
    {
      step: '04',
      title: 'Perform & Grow',
      description:
        'Show off your progress at recitals and showcases. Celebrate milestones and set new goals with your teacher.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'From first note to first performance.',

  testimonials: [
    {
      name: 'Maria S.',
      location: 'Brookside',
      rating: 5,
      text: 'My daughter has been taking piano lessons here for two years and loves it. Her teacher is patient and encouraging, and the recitals have done wonders for her confidence.',
    },
    {
      name: 'James T.',
      location: 'Fairfield',
      rating: 5,
      text: 'I started guitar lessons at 42, always wanted to learn. My instructor meets me where I am and makes every lesson fun. I can finally play my favorite songs.',
    },
    {
      name: 'Linda P.',
      location: 'Eastside',
      rating: 5,
      text: 'The voice lessons transformed my singing. I went from shy shower singer to performing at open mic night. The coaches truly care about each student.',
    },
  ],
  testimonialsTitle: 'What Our Students Say',
  testimonialsSubtitle: 'Real progress, real performances, real joy.',

  faqs: [
    {
      question: 'What ages do you teach?',
      answer:
        'We teach students as young as 4 through adult learners. Each program is tailored to the age and goals of the student, so everyone gets the right start.',
    },
    {
      question: 'Do I need to own an instrument to start?',
      answer:
        'Not for your first lesson. We can advise on what to buy or rent, and we have instruments available to use during in-studio lessons. For practice at home, you will eventually need your own.',
    },
    {
      question: 'Do you offer online lessons?',
      answer:
        'Yes! We offer high-quality online lessons via video for most instruments. Many students combine online and in-studio lessons for maximum flexibility.',
    },
    {
      question: 'How long are lessons and how often?',
      answer:
        'Most students take one 30, 45, or 60-minute lesson per week. Your teacher will recommend the right length based on your level, goals, and practice time.',
    },
    {
      question: 'Do you host recitals?',
      answer:
        'Yes. We hold recitals twice a year, plus informal showcases and performance workshops. Participation is encouraged but never required.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about lessons at Harmony.',

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

  contactTitle: 'Book Your Trial Lesson',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day to match you with a teacher.',

  galleryTitle: 'Our Students in Action',
  gallerySubtitle: 'Lessons, recitals, and moments of musical magic.',
  galleryImages: [
    'https://images.pexels.com/photos/7447185/pexels-photo-7447185.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/7447185/pexels-photo-7447185.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/7447185/pexels-photo-7447185.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Professional musicians and dedicated educators.',
  team: [
    { name: 'Elena Rossi', role: 'Academy Director & Piano Instructor', bio: 'Concert pianist with 20 years of teaching experience. Elena founded the academy to make quality music education accessible to everyone.' },
    { name: 'Marcus Bell', role: 'Guitar & Bass Instructor', bio: 'Touring guitarist turned educator, Marcus teaches rock, blues, and jazz to students of all ages and skill levels.' },
    { name: 'Sophie Chen', role: 'Voice & Violin Instructor', bio: 'Classically trained vocalist and violinist, Sophie specializes in helping shy students find their confidence on stage.' },
  ],

  pricingTitle: 'Lesson Packages',
  pricingSubtitle: 'Simple, transparent pricing for every budget.',
  pricing: [
    { name: 'Trial Lesson', price: 'From $25', description: 'Single introductory lesson.', features: ['30 minutes', 'Meet your teacher', 'Personalized plan', 'No commitment'], popular: false },
    { name: 'Weekly Lessons', price: 'From $120/mo', description: 'One lesson per week.', features: ['30 or 45 min lessons', 'Same teacher weekly', 'Recital eligibility', 'Online or in-studio', 'Practice resources'], popular: true },
    { name: 'Premium Program', price: 'From $200/mo', description: 'Weekly lessons plus theory.', features: ['60 min lessons', 'Music theory class', 'Priority scheduling', 'Two recitals per year', 'Performance workshops'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the Harmony Music Academy assistant. What instrument are you interested in learning?",
    placeholder: "Ask about lessons, instruments, or scheduling...",
    knowledgeBase: [
      "We offer piano, guitar, voice and singing, violin, drum, and music theory lessons for all ages and skill levels.",
      "We teach students as young as 4 through adult learners. Each program is tailored to the age and goals of the student.",
      "You do not need to own an instrument for your first lesson. We have instruments available in-studio and can advise on rentals.",
      "Yes, we offer online lessons via video for most instruments. Many students combine online and in-studio lessons.",
      "Most students take one 30, 45, or 60-minute lesson per week. Your teacher will recommend the right length for you.",
      "We hold recitals twice a year, plus informal showcases and performance workshops. Participation is encouraged but optional.",
      "Our trial lesson is just $25 and gives you a chance to meet your teacher and get a personalized plan before committing.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are Monday through Saturday, 10am to 8pm.",
      "We have 15+ years of teaching experience and over 1,200 students taught with a 98% retention rate.",
    ],
  },
};
