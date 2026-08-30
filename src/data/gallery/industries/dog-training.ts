import {
  PawPrint,
  Bone,
  Brain,
  Trophy,
  HeartHandshake,
  Users,
  Award,
  Clock,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
  Target,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const dogTrainingConfig: IndustryConfig = {
  id: 'dog-training',
  industryName: 'Dog Training',
  businessName: 'Pawsitive K9 Training',
  tagline: 'Building Better Behaviors, One Paw at a Time.',
  heroTitle: 'Train Your Dog, Transform Your Life',
  heroSubtitle:
    'Positive-reinforcement dog training for puppies, adult dogs, and behavior challenges. Certified trainers help you build a confident, well-behaved companion for life.',
  phone: '(555) 562-9940',
  email: 'training@pawsitivek9.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Sat 8am-6pm',
  yearsExperience: '15+',
  licenseNumber: 'DT-4471826',

  colors: {
    primary: '#15803D',
    primaryDark: '#166534',
    primaryLight: '#DCFCE7',
    accent: '#92400E',
    background: '#FFFFFF',
    surface: '#F0FDF4',
    text: '#0A1A0E',
    textMuted: '#5B6B5E',
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

  heroImage: 'https://images.pexels.com/photos/19017771/pexels-photo-19017771.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'Certified Trainers • Positive Reinforcement',
  ctaPrimary: 'Book a Session',
  ctaSecondary: 'View Services',

  stats: [
    { value: '15+', label: 'Years Experience' },
    { value: '4,500+', label: 'Dogs Trained' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '98%', label: 'Success Rate' },
  ],

  services: [
    {
      icon: PawPrint,
      title: 'Obedience Training',
      description:
        'Foundational obedience for sit, stay, come, loose-leash walking, and reliable recall. Build a dog who listens in any environment.',
      features: ['Basic commands', 'Loose-leash walking', 'Reliable recall', 'Manners'],
    },
    {
      icon: Bone,
      title: 'Puppy Training',
      description:
        'Start your puppy off right with socialization, house training, bite inhibition, and foundational commands during critical development weeks.',
      features: ['Socialization', 'House training', 'Bite inhibition', 'Foundational commands'],
    },
    {
      icon: Brain,
      title: 'Behavior Modification',
      description:
        'Address leash reactivity, separation anxiety, aggression, and fear with a customized, humane behavior modification plan.',
      features: ['Leash reactivity', 'Separation anxiety', 'Aggression', 'Fear & phobias'],
    },
    {
      icon: Trophy,
      title: 'Agility Training',
      description:
        'Fun, confidence-building agility courses that exercise your dog\u2019s body and mind while strengthening your bond.',
      features: ['Obstacle courses', 'Confidence building', 'Mental stimulation', 'Handler teamwork'],
    },
    {
      icon: HeartHandshake,
      title: 'Service Dog Training',
      description:
        'Specialized training for service and therapy dogs, including task training, public access, and certification preparation.',
      features: ['Task training', 'Public access', 'Therapy prep', 'Certification support'],
    },
    {
      icon: Users,
      title: 'Group Classes',
      description:
        'Small group classes for socialization and obedience in a controlled environment. A great way to learn alongside other dog owners.',
      features: ['Small class sizes', 'Socialization', 'Distraction training', 'Community'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Certified Professional Trainers',
      description:
        'Our trainers hold certifications from the CCPDT and use only humane, science-based methods. No shock collars, no fear, no force.',
    },
    {
      icon: Clock,
      title: 'Flexible Scheduling',
      description:
        'In-home, at our facility, or virtual sessions — we work around your schedule and your dog\u2019s needs with daytime and evening slots.',
    },
    {
      icon: Users,
      title: 'Whole-Family Approach',
      description:
        'We coach the whole family so everyone uses the same cues and techniques. Consistency is the key to lasting results.',
    },
    {
      icon: ThumbsUp,
      title: 'Guaranteed Results',
      description:
        'We stand behind our training. If you do not see progress, we add follow-up sessions at no charge until you do. Your success is our goal.',
    },
  ],
  whyUsTitle: 'Why Choose Pawsitive K9',
  whyUsSubtitle:
    'Positive methods, certified trainers, and lasting results for dogs of every age and breed.',

  process: [
    {
      step: '01',
      title: 'Free Consultation',
      description:
        'We discuss your dog, your goals, and any challenges. You receive a tailored training plan and clear pricing upfront.',
    },
    {
      step: '02',
      title: 'Custom Training Plan',
      description:
        'We design a program for your dog\u2019s age, temperament, and your lifestyle — with specific milestones and homework.',
    },
    {
      step: '03',
      title: 'Training Sessions',
      description:
        'We work with you and your dog in-home, at our facility, or virtually, coaching you every step of the way.',
    },
    {
      step: '04',
      title: 'Lasting Support',
      description:
        'You get written plans, follow-up support, and access to refresher sessions. We are here for your dog\u2019s whole life.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'A clear path from first consultation to a well-behaved dog.',

  testimonials: [
    {
      name: 'Greg H.',
      location: 'Brookside',
      rating: 5,
      text: 'Our rescue had terrible leash reactivity. After six weeks with Pawsitive K9, we can walk past other dogs calmly. The positive methods actually worked where punishment never did.',
    },
    {
      name: 'Sofia R.',
      location: 'Fairfield',
      rating: 5,
      text: 'We started puppy training at 10 weeks and it made all the difference. House training was fast, socialization was thorough, and our pup is so confident. Worth every penny.',
    },
    {
      name: 'Tom W.',
      location: 'Eastside',
      rating: 5,
      text: 'They trained our service dog from puppy to certification. Professional, patient, and they coached our whole family so we all used the same cues. Life-changing.',
    },
  ],
  testimonialsTitle: 'What Our Clients Say',
  testimonialsSubtitle: 'Happy dogs and relieved owners are our best result.',

  faqs: [
    {
      question: 'What training methods do you use?',
      answer:
        'We use only positive, science-based reinforcement methods. No shock collars, prong collars, or force. We build trust and motivation so your dog wants to work with you.',
    },
    {
      question: 'How old does my dog need to be to start training?',
      answer:
        'Puppies can start as early as 8 weeks. Early socialization and foundational training during critical development weeks prevent many future behavior issues.',
    },
    {
      question: 'Do you offer in-home training?',
      answer:
        'Yes. We offer in-home, facility, and virtual sessions. In-home training is ideal for behavior issues that occur at home or in your neighborhood.',
    },
    {
      question: 'How long does training take?',
      answer:
        'It depends on your goals and your dog. Basic obedience often shows results in 4 to 6 weeks. Behavior modification can take longer. We set clear milestones and adjust as we go.',
    },
    {
      question: 'Do you train service and therapy dogs?',
      answer:
        'Yes. We offer specialized service and therapy dog training, including task training, public access skills, and certification preparation.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about training your dog with us.',

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

  contactTitle: 'Book Your Dog\u2019s Training Session',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day with a custom plan.',

  galleryTitle: 'Dogs We\u2019ve Trained',
  gallerySubtitle: 'See the transformations we help create.',
  galleryImages: [
    'https://images.pexels.com/photos/19017771/pexels-photo-19017771.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/19017771/pexels-photo-19017771.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/19017771/pexels-photo-19017771.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Certified trainers who love dogs as much as you do.',
  team: [
    { name: 'Carlos Mendez, CPDT-KA', role: 'Lead Trainer & Owner', bio: 'Carlos founded Pawsitive K9 15 years ago and is CCPDT certified with specialties in behavior modification and service dog training.' },
    { name: 'Hannah Brooks, CPDT-KA', role: 'Senior Trainer', bio: 'Hannah specializes in puppy development and agility, helping young dogs build confidence and foundational skills.' },
    { name: 'Dev Patel, KPA-CTP', role: 'Behavior Specialist', bio: 'Dev focuses on complex behavior cases including reactivity, anxiety, and aggression using humane, science-based methods.' },
  ],

  pricingTitle: 'Dog Training Packages',
  pricingSubtitle: 'Flexible packages for every dog and budget.',
  pricing: [
    { name: 'Single Session', price: 'From $95', description: 'One 60-minute private session.', features: ['60-minute session', 'In-home or facility', 'Customized focus', 'Written homework', 'Follow-up email support'], popular: false },
    { name: 'Training Package', price: 'From $425', description: '5 private sessions with support.', features: ['5 private sessions', 'Custom training plan', 'Written homework', 'Text & email support', 'Free refresher session'], popular: true },
    { name: 'Behavior Program', price: 'From $795', description: '8 sessions for complex issues.', features: ['8 private sessions', 'Behavior assessment', 'Custom modification plan', 'Unlimited support', 'Family coaching', 'Progress tracking'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the Pawsitive K9 Training assistant. How can I help you and your dog today?",
    placeholder: "Ask about dog training...",
    knowledgeBase: [
      "We offer obedience training, puppy training, behavior modification, agility training, service dog training, and group classes.",
      "We use only positive, science-based reinforcement methods. No shock collars, prong collars, or force.",
      "Puppies can start training as early as 8 weeks. Early socialization prevents many future behavior issues.",
      "We offer in-home, facility, and virtual sessions. In-home is ideal for behavior issues at home or in your neighborhood.",
      "Basic obedience usually shows results in 4 to 6 weeks. Behavior modification can take longer. We set clear milestones.",
      "Yes, we train service and therapy dogs including task training, public access skills, and certification preparation.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are Monday through Saturday, 8am to 6pm.",
      "Our trainers are CCPDT certified with 15+ years of experience and over 4,500 dogs trained.",
      "Single sessions start at $95, 5-session packages at $425, and 8-session behavior programs at $795.",
    ],
  },
};
