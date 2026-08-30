import {
  Brain,
  BookOpen,
  FlaskConical,
  Target,
  Lightbulb,
  Laptop,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
  GraduationCap,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const tutoringConfig: IndustryConfig = {
  id: 'tutoring',
  industryName: 'Tutoring',
  businessName: 'BrightPath Tutoring',
  tagline: 'Confidence Through Understanding.',
  heroTitle: 'Help Your Child Succeed in School',
  heroSubtitle:
    'Personalized tutoring for K-12 and college students in math, reading, science, and test prep. Certified tutors build confidence and skills with a plan tailored to your child.',
  phone: '(555) 217-6650',
  email: 'learn@brightpathtutoring.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Sat 9am-8pm',
  yearsExperience: '16+',
  licenseNumber: 'TR-8840517',

  colors: {
    primary: '#1E40AF',
    primaryDark: '#1E3A8A',
    primaryLight: '#DBEAFE',
    accent: '#B45309',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#0A0F1A',
    textMuted: '#5B606B',
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

  heroImage: 'https://images.pexels.com/photos/4173338/pexels-photo-4173338.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'Certified Tutors • Personalized Plans',
  ctaPrimary: 'Book a Tutor',
  ctaSecondary: 'View Services',

  stats: [
    { value: '16+', label: 'Years Experience' },
    { value: '8,000+', label: 'Students Helped' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '95%', label: 'Grade Improvement' },
  ],

  services: [
    {
      icon: Brain,
      title: 'Math Tutoring',
      description:
        'From elementary math to calculus, our tutors build conceptual understanding and problem-solving confidence at every level.',
      features: ['Elementary math', 'Algebra & geometry', 'Calculus', 'Statistics'],
    },
    {
      icon: BookOpen,
      title: 'Reading & Writing',
      description:
        'Phonics, comprehension, essay writing, and grammar support that helps students become confident, capable readers and writers.',
      features: ['Phonics & fluency', 'Reading comprehension', 'Essay writing', 'Grammar'],
    },
    {
      icon: FlaskConical,
      title: 'Science Tutoring',
      description:
        'Biology, chemistry, physics, and earth science with hands-on, concept-first teaching that makes science click.',
      features: ['Biology', 'Chemistry', 'Physics', 'Earth science'],
    },
    {
      icon: Target,
      title: 'Test Prep',
      description:
        'SAT, ACT, and state test prep with proven strategies, practice tests, and personalized study plans for target scores.',
      features: ['SAT prep', 'ACT prep', 'State tests', 'Practice tests'],
    },
    {
      icon: Lightbulb,
      title: 'Study Skills',
      description:
        'Time management, organization, note-taking, and exam strategies that help students learn how to learn for life.',
      features: ['Time management', 'Organization', 'Note-taking', 'Exam strategies'],
    },
    {
      icon: Laptop,
      title: 'Online Tutoring',
      description:
        'Live, interactive online sessions with the same certified tutors and personalized plans — learn from anywhere.',
      features: ['Live sessions', 'Interactive tools', 'Flexible scheduling', 'Session recordings'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Certified Educators',
      description:
        'Our tutors are certified teachers and subject specialists with proven track records. We match each student with the right tutor.',
    },
    {
      icon: Clock,
      title: 'Flexible Scheduling',
      description:
        'In-center, in-home, and online sessions with daytime, evening, and weekend availability. We fit tutoring into your family\u2019s life.',
    },
    {
      icon: Users,
      title: 'Personalized Plans',
      description:
        'Every student gets a custom learning plan based on assessment, goals, and learning style — with regular progress reports for parents.',
    },
    {
      icon: ThumbsUp,
      title: 'Grade Improvement Guarantee',
      description:
        'We guarantee grade improvement. If your child\u2019s grades do not improve after 12 sessions, we continue tutoring free until they do.',
    },
  ],
  whyUsTitle: 'Why Families Choose BrightPath',
  whyUsSubtitle:
    'Certified tutors, personalized plans, and measurable results for every student.',

  process: [
    {
      step: '01',
      title: 'Free Assessment',
      description:
        'We assess your child\u2019s skills, identify gaps, and understand goals. You receive a detailed report and learning plan.',
    },
    {
      step: '02',
      title: 'Tutor Matching',
      description:
        'We match your child with a certified tutor who fits their subject needs, learning style, and personality.',
    },
    {
      step: '03',
      title: 'Personalized Sessions',
      description:
        'Your child works one-on-one with their tutor, in-center, in-home, or online, following their custom learning plan.',
    },
    {
      step: '04',
      title: 'Track Progress',
      description:
        'You receive regular progress reports and we adjust the plan as your child grows. Goals are reviewed and updated together.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'A clear path from assessment to measurable improvement.',

  testimonials: [
    {
      name: 'Lauren B.',
      location: 'Brookside',
      rating: 5,
      text: 'My daughter went from a C to an A in algebra in one semester. Her tutor was patient and made math make sense. The progress reports kept me informed the whole way.',
    },
    {
      name: 'Robert H.',
      location: 'Fairfield',
      rating: 5,
      text: 'BrightPath prepped my son for the SAT and he raised his score 240 points. The practice tests and strategies were exactly what he needed. Worth every penny.',
    },
    {
      name: 'Aisha M.',
      location: 'Eastside',
      rating: 5,
      text: 'Online tutoring fit our busy schedule perfectly. My son connects with his tutor twice a week and actually looks forward to it. His reading confidence has soared.',
    },
  ],
  testimonialsTitle: 'What Families Say',
  testimonialsSubtitle: 'Confident students and relieved parents are our best results.',

  faqs: [
    {
      question: 'What subjects and grade levels do you tutor?',
      answer:
        'We tutor K-12 and college students in math, reading, writing, science, and test prep. Our certified tutors cover elementary through advanced levels.',
    },
    {
      question: 'Do you offer in-home or online tutoring?',
      answer:
        'Both. We offer in-center, in-home, and online sessions with daytime, evening, and weekend availability. Online sessions are live and interactive with the same certified tutors.',
    },
    {
      question: 'How are tutors matched to my child?',
      answer:
        'After a free assessment, we match your child with a certified tutor based on subject needs, learning style, and personality. You can request a change at any time.',
    },
    {
      question: 'How often should my child meet with a tutor?',
      answer:
        'Most students benefit from two sessions per week, but we tailor frequency to your child\u2019s goals and schedule. We adjust as progress is made.',
    },
    {
      question: 'Do you guarantee grade improvement?',
      answer:
        'Yes. If your child\u2019s grades do not improve after 12 sessions, we continue tutoring at no charge until they do. Your child\u2019s success is our commitment.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about tutoring with us.',

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

  contactTitle: 'Book Your Child\u2019s Free Assessment',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day.',

  galleryTitle: 'Students & Sessions',
  gallerySubtitle: 'A look at the learning we support.',
  galleryImages: [
    'https://images.pexels.com/photos/4173338/pexels-photo-4173338.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/4173338/pexels-photo-4173338.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/4173338/pexels-photo-4173338.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Certified educators who love helping students succeed.',
  team: [
    { name: 'Dr. Angela Foster', role: 'Founder & Director of Education', bio: 'Dr. Foster founded BrightPath 16 years ago and oversees curriculum, tutor training, and student learning plans.' },
    { name: 'James Carter, M.Ed', role: 'Lead Math & Science Tutor', bio: 'James is a certified teacher specializing in math and science from elementary through AP and college levels.' },
    { name: 'Maya Singh, M.Ed', role: 'Lead Reading & Test Prep Tutor', bio: 'Maya specializes in reading intervention and SAT/ACT prep, helping students build skills and confidence for exams.' },
  ],

  pricingTitle: 'Tutoring Packages',
  pricingSubtitle: 'Flexible packages for every student and budget.',
  pricing: [
    { name: 'Single Session', price: 'From $55', description: 'One 60-minute session.', features: ['60-minute session', 'In-center, in-home, or online', 'Certified tutor', 'Personalized focus', 'Progress note'], popular: false },
    { name: 'Monthly Package', price: 'From $199', description: '8 sessions with full support.', features: ['8 sessions per month', 'Custom learning plan', 'Regular progress reports', 'Flexible scheduling', 'Parent consultations'], popular: true },
    { name: 'Test Prep Program', price: 'From $599', description: 'Comprehensive SAT/ACT prep.', features: ['12 sessions', 'Full practice tests', 'Custom study plan', 'Score tracking', 'Strategy sessions', 'Materials included'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the BrightPath Tutoring assistant. How can I help you today?",
    placeholder: "Ask about tutoring services...",
    knowledgeBase: [
      "We tutor K-12 and college students in math, reading, writing, science, and test prep, from elementary through advanced levels.",
      "We offer in-center, in-home, and online sessions with daytime, evening, and weekend availability.",
      "After a free assessment, we match your child with a certified tutor based on subject needs, learning style, and personality.",
      "Most students benefit from two sessions per week, but we tailor frequency to your child\u2019s goals and schedule.",
      "Yes, we guarantee grade improvement. If grades do not improve after 12 sessions, we continue tutoring free until they do.",
      "Our SAT and ACT prep includes practice tests, custom study plans, score tracking, and proven strategies.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are Monday through Saturday, 9am to 8pm.",
      "Our tutors are certified educators with 16+ years of experience and over 8,000 students helped.",
      "Single sessions start at $55, monthly packages at $199, and comprehensive test prep programs at $599.",
    ],
  },
};
