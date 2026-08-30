import {
  Sparkles,
  Music2,
  Wind,
  Heart,
  Footprints,
  Dumbbell,
  Award,
  Clock,
  Users,
  Star,
  Calendar,
  Sun,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const danceStudioConfig: IndustryConfig = {
  id: 'dance-studio',
  industryName: 'Dance Studio',
  businessName: 'Rhythm & Motion Dance Studio',
  tagline: 'Move With Confidence.',
  heroTitle: 'Find Your Rhythm, Find Yourself',
  heroSubtitle:
    'From first steps to center stage, our expert instructors guide dancers of all ages through every style. Build strength, grace, and confidence in a supportive community.',
  phone: '(555) 317-4456',
  email: 'info@rhythmandmotion.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Sat 9am-9pm',
  yearsExperience: '12+',
  licenseNumber: 'DS-5918204',

  colors: {
    primary: '#BE185D',
    primaryDark: '#9F1239',
    primaryLight: '#FCE7F3',
    accent: '#0D9488',
    background: '#FFFFFF',
    surface: '#FDF2F8',
    text: '#2E1020',
    textMuted: '#7A5A68',
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

  heroImage: 'https://images.pexels.com/photos/3901644/pexels-photo-3901644.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'All Ages • All Levels • Performance Opportunities',
  ctaPrimary: 'Book a Free Trial Class',
  ctaSecondary: 'View Class Schedule',

  stats: [
    { value: '12+', label: 'Years Teaching' },
    { value: '800+', label: 'Active Students' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '20+', label: 'Annual Performances' },
  ],

  services: [
    {
      icon: Sparkles,
      title: 'Ballet',
      description:
        'The foundation of all dance. Our ballet program builds technique, poise, and discipline from pre-ballet through advanced pointe work.',
      features: ['Pre-ballet to pointe', 'Technique & posture', 'Strength & flexibility', 'Performance prep'],
    },
    {
      icon: Music2,
      title: 'Hip-Hop',
      description:
        'High-energy classes that teach popping, locking, breaking, and freestyle. Build coordination, musicality, and your own signature style.',
      features: ['Popping & locking', 'Freestyle skills', 'Choreography', 'Crew battles'],
    },
    {
      icon: Wind,
      title: 'Jazz & Contemporary',
      description:
        'Expressive, fluid movement that blends technique with emotion. Explore jazz fundamentals and contemporary storytelling through dance.',
      features: ['Jazz technique', 'Contemporary flow', 'Emotional expression', 'Improvisation'],
    },
    {
      icon: Heart,
      title: 'Ballroom Dance',
      description:
        'Learn the waltz, tango, foxtrot, and more. Perfect for couples or solo dancers looking to shine on the social floor or compete.',
      features: ['Waltz & tango', 'Foxtrot & salsa', 'Lead & follow', 'Social dancing'],
    },
    {
      icon: Footprints,
      title: 'Tap Dance',
      description:
        'Make music with your feet. Our tap program develops rhythm, timing, and clarity from beginner shuffles to advanced routines.',
      features: ['Basic to advanced', 'Rhythm & timing', 'Improvisation', 'Choreography'],
    },
    {
      icon: Dumbbell,
      title: 'Dance Fitness',
      description:
        'Cardio dance classes that feel like a party. Burn calories, build endurance, and have a blast dancing to your favorite hits.',
      features: ['Cardio dance', 'Strength & tone', 'Fun playlists', 'All fitness levels'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Professional Instructors',
      description:
        'Our teachers are trained professionals with performance and competition experience. They bring passion and expertise to every class.',
    },
    {
      icon: Heart,
      title: 'Supportive Community',
      description:
        'We foster a welcoming, inclusive environment where every dancer feels encouraged to grow, take risks, and support one another.',
    },
    {
      icon: Star,
      title: 'Performance Opportunities',
      description:
        'From recitals to competitions, our students have regular chances to perform, build confidence, and showcase their hard work.',
    },
    {
      icon: Users,
      title: 'All Ages & Levels',
      description:
        'Toddler to adult, beginner to advanced — we have a class for you. Our curriculum scales with each dancer as they grow.',
    },
  ],
  whyUsTitle: 'Why Dancers Choose Rhythm & Motion',
  whyUsSubtitle:
    'We do not just teach steps — we build confident, expressive dancers in a community that feels like family.',

  process: [
    {
      step: '01',
      title: 'Book a Free Trial',
      description:
        'Choose a class and book a free trial. Come experience our teaching style and studio vibe before you commit.',
    },
    {
      step: '02',
      title: 'Find Your Level',
      description:
        'Our instructors assess your experience and goals to place you in the perfect class for your skill level.',
    },
    {
      step: '03',
      title: 'Train & Grow',
      description:
        'Weekly classes build technique, strength, and artistry. Track your progress and set new goals with your instructor.',
    },
    {
      step: '04',
      title: 'Perform & Shine',
      description:
        'Take the stage at recitals and showcases. Celebrate your progress and inspire others with your performance.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'From first step to first performance.',

  testimonials: [
    {
      name: 'Rachel K.',
      location: 'Brookside',
      rating: 5,
      text: 'My daughter started ballet here at age 5 and has blossomed. The instructors are so nurturing and the recitals are beautifully organized. She looks forward to class every week.',
    },
    {
      name: 'David L.',
      location: 'Fairfield',
      rating: 5,
      text: 'I took hip-hop as an adult beginner and was nervous, but the community here is so welcoming. A year later I performed in the showcase and it was one of the best decisions I ever made.',
    },
    {
      name: 'Carmen V.',
      location: 'Eastside',
      rating: 5,
      text: 'The ballroom classes are fantastic. My husband and I started for our wedding dance and got hooked. The teachers make it fun and we have met so many great couples.',
    },
  ],
  testimonialsTitle: 'What Our Dancers Say',
  testimonialsSubtitle: 'Confidence, community, and a whole lot of fun.',

  faqs: [
    {
      question: 'What should I wear to my first class?',
      answer:
        'Wear comfortable clothing you can move in — leggings and a fitted top work well. For ballet, we recommend a leotard and tights. For hip-hop, clean indoor sneakers. We will guide you on proper shoes after your trial.',
    },
    {
      question: 'What ages do you teach?',
      answer:
        'We start dancers as young as 3 in our pre-dance program and teach through adults. Every age has a curriculum designed specifically for their development and goals.',
    },
    {
      question: 'Do I need dance experience to start?',
      answer:
        'Not at all! The majority of our students start as complete beginners. Our intro and beginner classes are designed for people who have never danced before.',
    },
    {
      question: 'Do you offer performance opportunities?',
      answer:
        'Yes. We hold two studio recitals per year, plus optional competitions and community performances for our more advanced students. Participation is encouraged but never required.',
    },
    {
      question: 'Can I make up a missed class?',
      answer:
        'Yes. With 24 hours notice, you can make up a missed class in any equivalent class within the same session, subject to availability.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about dancing with us.',

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

  contactTitle: 'Book Your Free Trial Class',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day to find the right class for you.',

  galleryTitle: 'Our Dancers in Motion',
  gallerySubtitle: 'Recitals, rehearsals, and moments of pure joy.',
  galleryImages: [
    'https://images.pexels.com/photos/3901644/pexels-photo-3901644.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/3901644/pexels-photo-3901644.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/3901644/pexels-photo-3901644.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Professional dancers and passionate educators.',
  team: [
    { name: 'Isabella Romano', role: 'Studio Director & Ballet Instructor', bio: 'Former professional ballet dancer with 15 years of teaching experience. Isabella founded the studio to share her love of dance with the community.' },
    { name: 'Tyler Brooks', role: 'Hip-Hop & Jazz Instructor', bio: 'Choreographer and competition judge, Tyler brings energy and creativity to every class and has trained national champions.' },
    { name: 'Maya Patel', role: 'Contemporary & Ballroom Instructor', bio: 'Award-winning contemporary dancer, Maya specializes in helping students express emotion through movement.' },
  ],

  pricingTitle: 'Class Packages',
  pricingSubtitle: 'Flexible options for every dancer.',
  pricing: [
    { name: 'Drop-In Class', price: 'From $18', description: 'Single class, no commitment.', features: ['Any style', '1 hour class', 'Try before you commit', 'All levels welcome'], popular: false },
    { name: 'Monthly Unlimited', price: 'From $120/mo', description: 'Unlimited classes per month.', features: ['All styles', 'Unlimited classes', 'Recital eligibility', 'Priority booking', 'Make-up classes'], popular: true },
    { name: 'Performance Track', price: 'From $180/mo', description: 'Classes plus competition prep.', features: ['Unlimited classes', 'Competition coaching', 'Solo choreography', 'Costume included', 'Two recitals per year'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the Rhythm & Motion assistant. What style of dance are you interested in?",
    placeholder: "Ask about classes, levels, or scheduling...",
    knowledgeBase: [
      "We offer ballet, hip-hop, jazz and contemporary, ballroom, tap, and dance fitness classes for all ages and levels.",
      "We teach dancers as young as 3 in our pre-dance program through adults. Every age has a curriculum designed for them.",
      "No experience needed! Most of our students start as complete beginners. Our intro classes are designed for first-time dancers.",
      "Wear comfortable clothing you can move in. For ballet, a leotard and tights. For hip-hop, clean indoor sneakers. We guide you on shoes after your trial.",
      "We hold two studio recitals per year, plus optional competitions and community performances for advanced students.",
      "With 24 hours notice, you can make up a missed class in any equivalent class within the same session, subject to availability.",
      "Your first class is free! Book a trial in any style to experience our teaching before you commit.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are Monday through Saturday, 9am to 9pm.",
      "We have 12+ years of teaching experience, 800+ active students, and over 20 annual performances.",
    ],
  },
};
