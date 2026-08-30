import {
  HeartPulse,
  Users,
  Smile,
  Brain,
  Shield,
  Activity,
  Award,
  Clock,
  HandHeart,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const mentalHealthConfig: IndustryConfig = {
  id: 'mental-health',
  industryName: 'Mental Health Counseling',
  businessName: 'MindWell Counseling Center',
  tagline: 'Healing Minds. Transforming Lives.',
  heroTitle: 'Compassionate Mental Health Care for Every Journey',
  heroSubtitle:
    'Our licensed counselors provide a safe, confidential space to work through anxiety, depression, trauma, and life transitions. Evidence-based therapy tailored to your unique needs — in person or via secure telehealth.',
  phone: '(555) 833-2267',
  email: 'intake@mindwellcc.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Fri 8am-8pm, Sat 9am-5pm',
  yearsExperience: '12+',
  licenseNumber: 'LPC-4412098',

  colors: {
    primary: '#6366F1',
    primaryDark: '#4F46E5',
    primaryLight: '#E0E7FF',
    accent: '#0D9488',
    background: '#FFFFFF',
    surface: '#EEF2FF',
    text: '#0A0F1A',
    textMuted: '#5B6375',
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
    'https://images.pexels.com/photos/5699493/pexels-photo-5699493.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'Licensed & Confidential • In-Person & Telehealth',
  ctaPrimary: 'Schedule Consultation',
  ctaSecondary: 'View Services',

  stats: [
    { value: '12+', label: 'Years Experience' },
    { value: '8,000+', label: 'Clients Served' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '15+', label: 'Therapy Modalities' },
  ],

  services: [
    {
      icon: HeartPulse,
      title: 'Individual Therapy',
      description:
        'One-on-one counseling to address anxiety, depression, stress, grief, and life transitions. We use evidence-based approaches like CBT and ACT to help you build coping skills and resilience.',
      features: ['Cognitive Behavioral Therapy', 'Acceptance & Commitment Therapy', 'Stress management', 'Coping skills'],
    },
    {
      icon: Users,
      title: 'Couples Counseling',
      description:
        'Strengthen your relationship with evidence-based couples therapy. We help partners improve communication, rebuild trust, and navigate conflict using the Gottman Method and EFT.',
      features: ['Communication skills', 'Conflict resolution', 'Trust rebuilding', 'Gottman Method'],
    },
    {
      icon: Smile,
      title: 'Family Therapy',
      description:
        'Family counseling to improve dynamics, resolve conflicts, and support healthy development. We work with families of all structures to build understanding and connection.',
      features: ['Family dynamics', 'Parenting support', 'Blended family guidance', 'Conflict resolution'],
    },
    {
      icon: Brain,
      title: 'Anxiety & Depression Treatment',
      description:
        'Specialized treatment for anxiety disorders and depression using CBT, mindfulness, and other proven approaches. We help you understand symptoms and develop effective coping strategies.',
      features: ['CBT for anxiety', 'Depression treatment', 'Mindfulness training', 'Relapse prevention'],
    },
    {
      icon: Shield,
      title: 'Trauma Therapy',
      description:
        'Trauma-informed therapy including EMDR and trauma-focused CBT. We provide a safe, paced approach to processing traumatic experiences and reclaiming your sense of safety.',
      features: ['EMDR therapy', 'Trauma-focused CBT', 'Somatic approaches', 'Safety & stabilization'],
    },
    {
      icon: Activity,
      title: 'Group Therapy',
      description:
        'Supportive group therapy sessions for shared experiences including grief, anxiety, and life transitions. Build connection and learn from others in a facilitated, confidential setting.',
      features: ['Grief support groups', 'Anxiety skills groups', 'Process groups', 'Skills building'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Licensed Professionals',
      description:
        'All our counselors are licensed and hold advanced degrees in counseling, social work, or psychology. We pursue ongoing training in the latest evidence-based therapies.',
    },
    {
      icon: Clock,
      title: 'Flexible Scheduling',
      description:
        'Evening and weekend appointments available, plus secure telehealth sessions from anywhere. We work to make therapy fit your life, not the other way around.',
    },
    {
      icon: HandHeart,
      title: 'Compassionate Care',
      description:
        'We believe in meeting you where you are with empathy and without judgment. Our counselors create a warm, confidential space where you can be fully yourself.',
    },
    {
      icon: ThumbsUp,
      title: 'Personalized Approach',
      description:
        'No two people are alike. We match you with a therapist whose expertise fits your needs and tailor your treatment plan to your goals, values, and pace of change.',
    },
  ],
  whyUsTitle: 'Why Clients Choose MindWell',
  whyUsSubtitle:
    'Licensed, compassionate counselors providing evidence-based care in a safe, confidential space.',

  process: [
    {
      step: '01',
      title: 'Initial Consultation',
      description:
        'A free 15-minute phone or video consultation to understand your needs and match you with the right therapist. We answer your questions and explain what to expect.',
    },
    {
      step: '02',
      title: 'First Session',
      description:
        'Your therapist gets to know you, your history, and your goals. Together you build a personalized treatment plan and establish a comfortable, trusting relationship.',
    },
    {
      step: '03',
      title: 'Ongoing Therapy',
      description:
        'Regular sessions using evidence-based approaches tailored to your needs. We track your progress and adjust your plan as you grow and your goals evolve.',
    },
    {
      step: '04',
      title: 'Lasting Wellness',
      description:
        'As you reach your goals, we develop a maintenance plan with coping strategies and self-care tools so you can sustain your progress long after therapy ends.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'A supportive path from your first call to lasting wellness.',

  testimonials: [
    {
      name: 'Taylor M.',
      location: 'Brookside',
      rating: 5,
      text: 'I was nervous about starting therapy but my counselor made me feel safe from day one. After six months of CBT my anxiety is manageable and I have tools I use every day. It changed my life.',
    },
    {
      name: 'Jordan & Sam R.',
      location: 'Fairfield',
      rating: 5,
      text: 'Couples counseling saved our marriage. We learned to actually hear each other instead of just reacting. The Gottman techniques were practical and our therapist was warm but honest. Grateful every day.',
    },
    {
      name: 'Avery K.',
      location: 'Eastside',
      rating: 5,
      text: 'After years of trauma I did not think therapy would help. EMDR was hard work but my therapist paced it perfectly. I finally feel safe in my own body. MindWell gave me my life back.',
    },
  ],
  testimonialsTitle: 'What Our Clients Say',
  testimonialsSubtitle: 'Real stories of healing, growth, and lasting change.',

  faqs: [
    {
      question: 'How do I know if I need therapy?',
      answer:
        'If you are struggling with persistent sadness, anxiety, stress, relationship issues, grief, or major life changes, therapy can help. You do not need to be in crisis to benefit — therapy supports growth and wellness at any stage of life.',
    },
    {
      question: 'Is everything I say confidential?',
      answer:
        'Yes. Your sessions are completely confidential under HIPAA and professional ethics codes. The only exceptions are imminent risk of harm to yourself or others, abuse of a minor or vulnerable adult, or a court order.',
    },
    {
      question: 'Do you accept insurance?',
      answer:
        'We accept many major insurance plans and can provide a superbill for out-of-network reimbursement. We also offer sliding-scale fees based on income. Call us with your insurance details and we will verify your benefits.',
    },
    {
      question: 'Do you offer telehealth or virtual sessions?',
      answer:
        'Yes. We offer secure, HIPAA-compliant telehealth sessions via video so you can attend therapy from anywhere. Many clients combine in-person and telehealth sessions for maximum flexibility.',
    },
    {
      question: 'How long does therapy take?',
      answer:
        'The length of therapy depends on your goals and needs. Some clients benefit from 8 to 12 sessions of focused work, while others prefer longer-term therapy. Your therapist discusses a realistic timeline with you at the start.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about starting therapy.',

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

  contactTitle: 'Schedule Your Free Consultation',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day to schedule your consultation.',

  galleryTitle: 'Our Counseling Spaces',
  gallerySubtitle: 'See the MindWell environment.',
  galleryImages: [
    'https://images.pexels.com/photos/5699493/pexels-photo-5699493.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/5699493/pexels-photo-5699493.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/5699493/pexels-photo-5699493.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Licensed, compassionate counselors dedicated to your wellbeing.',
  team: [
    { name: 'Dr. Naomi Fields, PhD', role: 'Clinical Director & Therapist', bio: 'Licensed psychologist with 12 years of experience specializing in anxiety, depression, and trauma. Dr. Fields is trained in CBT, ACT, and EMDR and leads our clinical training program.' },
    { name: 'Marcus Lee, LCSW', role: 'Therapist', bio: 'Licensed clinical social worker specializing in couples and family therapy. Marcus is a certified Gottman Method therapist and trained in Emotionally Focused Therapy.' },
    { name: 'Priya Patel, LPC', role: 'Therapist', bio: 'Licensed professional counselor with expertise in trauma therapy, grief, and life transitions. Priya is EMDR-certified and leads our trauma and group therapy programs.' },
  ],

  pricingTitle: 'Counseling Service Options',
  pricingSubtitle: 'Transparent pricing with insurance and sliding-scale options.',
  pricing: [
    { name: 'Initial Consultation', price: 'Free', description: '15-minute phone or video consultation.', features: ['Needs assessment', 'Therapist matching', 'Questions answered', 'No commitment'], popular: false },
    { name: 'Individual Session', price: 'From $140', description: '50-minute one-on-one therapy session.', features: ['Licensed therapist', 'Evidence-based care', 'Personalized plan', 'In-person or telehealth', 'Insurance accepted'], popular: true },
    { name: 'Couples or Family', price: 'From $175', description: '50-minute couples or family session.', features: ['Gottman Method', 'Communication skills', 'Conflict resolution', 'In-person or telehealth', 'Sliding scale available'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the MindWell Counseling Center assistant. How can I help you today?",
    placeholder: "Ask about therapy, insurance, or scheduling...",
    knowledgeBase: [
      "We offer individual therapy, couples counseling, family therapy, anxiety and depression treatment, trauma therapy, and group therapy.",
      "If you are struggling with persistent sadness, anxiety, stress, relationship issues, grief, or life changes, therapy can help at any stage.",
      "All sessions are completely confidential under HIPAA, with exceptions only for imminent risk of harm or abuse.",
      "We accept many major insurance plans and offer sliding-scale fees based on income, plus superbills for out-of-network reimbursement.",
      "Yes, we offer secure HIPAA-compliant telehealth video sessions so you can attend from anywhere.",
      "Therapy length varies. Some clients benefit from 8 to 12 sessions while others prefer longer-term therapy.",
      "All our counselors are licensed and hold advanced degrees, with ongoing training in evidence-based therapies.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are Monday through Friday 8am to 8pm and Saturday 9am to 5pm.",
      "We have over 12 years of experience and have served more than 8,000 clients with over 15 therapy modalities.",
    ],
  },
};
