import {
  Briefcase,
  Compass,
  Lightbulb,
  Users,
  Presentation,
  Target,
  Award,
  Clock,
  HeartHandshake,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
  TrendingUp,
  Rocket,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

const BASE_URL = 'https://images.pexels.com/photos/';

export const coachConsultantConfig: IndustryConfig = {
  id: 'coach-consultant',
  industryName: 'Coach / Consultant',
  businessName: 'Momentum Coaching Group',
  tagline: 'Clarity. Strategy. Momentum.',
  heroTitle: 'Unlock Your Potential and Build Real Momentum',
  heroSubtitle:
    'Executive coaching, career transition, and business strategy consulting for leaders who want to move with purpose. Practical frameworks, honest feedback, and measurable results.',
  phone: '(555) 619-4427',
  email: 'hello@momentumcoaching.com',
  serviceArea: 'Nationwide (Virtual) & Greater Metro Area (In-Person)',
  hours: 'Mon-Fri 8am-6pm',
  yearsExperience: '12+',
  licenseNumber: 'ICF-CC-3382910',

  colors: {
    primary: '#059669',
    primaryDark: '#047857',
    primaryLight: '#D1FAE5',
    accent: '#4338CA',
    background: '#FFFFFF',
    surface: '#ECFDF5',
    text: '#0A1F18',
    textMuted: '#5B6B66',
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

  heroImage: `${BASE_URL}3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1200`,
  heroBadge: 'ICF Certified • 500+ Clients Coached',
  ctaPrimary: 'Book a Discovery Call',
  ctaSecondary: 'View Services',

  stats: [
    { value: '12+', label: 'Years Coaching' },
    { value: '500+', label: 'Clients Served' },
    { value: '94%', label: 'Goal Achievement Rate' },
    { value: '4.9★', label: 'Average Rating' },
  ],

  services: [
    {
      icon: Briefcase,
      title: 'Executive Coaching',
      description:
        'One-on-one coaching for senior leaders and executives. Navigate complexity, sharpen decision-making, and lead with greater confidence and impact.',
      features: ['Leadership assessment', 'Strategic decision-making', 'Stakeholder management', 'Presence and influence'],
    },
    {
      icon: Compass,
      title: 'Career Transition Coaching',
      description:
        'Structured support for career changes, promotions, and pivots. Clarify your direction, position your strengths, and land the role you want.',
      features: ['Career clarity mapping', 'Personal branding', 'Interview preparation', 'Negotiation coaching'],
    },
    {
      icon: Lightbulb,
      title: 'Business Strategy Consulting',
      description:
        'Practical strategy consulting for founders and leadership teams. Turn vision into a clear plan with priorities, metrics, and accountability.',
      features: ['Strategic planning', 'Market positioning', 'Operational frameworks', 'Growth roadmaps'],
    },
    {
      icon: Users,
      title: 'Leadership Development',
      description:
        'Develop the next generation of leaders in your organization. Custom programs that build self-awareness, communication, and coaching skills.',
      features: ['Emerging leader programs', '360-degree feedback', 'Communication skills', 'Coaching for managers'],
    },
    {
      icon: Presentation,
      title: 'Team Workshops',
      description:
        'Interactive workshops on alignment, collaboration, and performance. Get your team moving in the same direction with shared language and tools.',
      features: ['Team alignment', 'Communication frameworks', 'Conflict resolution', 'Action planning'],
    },
    {
      icon: Target,
      title: 'Accountability Programs',
      description:
        'Structured accountability partnerships that turn intentions into consistent action. Weekly check-ins, progress tracking, and honest feedback.',
      features: ['Weekly check-ins', 'Goal tracking', 'Progress reviews', 'Honest feedback'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'ICF-Certified Coaches',
      description:
        'Our coaches hold credentials from the International Coaching Federation and bring real executive experience to every engagement.',
    },
    {
      icon: Clock,
      title: '12+ Years of Results',
      description:
        'We have coached 500+ clients across industries with a 94% goal achievement rate. Our frameworks are proven, not theoretical.',
    },
    {
      icon: HeartHandshake,
      title: 'Honest and Practical',
      description:
        'We do not do vague motivation. Every session delivers clear insights, actionable next steps, and the honest feedback that drives real change.',
    },
    {
      icon: ThumbsUp,
      title: 'Measurable Outcomes',
      description:
        'We define success up front and track it. You will always know whether you are making progress toward the goals that matter to you.',
    },
  ],
  whyUsTitle: 'Why Clients Choose Momentum',
  whyUsSubtitle:
    'Certified expertise, honest partnership, and a relentless focus on the results that matter to you.',

  process: [
    {
      step: '01',
      title: 'Discovery Call',
      description:
        'A complimentary 30-minute call to understand your goals, challenges, and whether we are the right fit. No pressure, no obligation.',
    },
    {
      step: '02',
      title: 'Goal Setting & Plan',
      description:
        'Together we define clear, measurable goals and build a coaching or consulting plan with milestones, timeline, and success metrics.',
    },
    {
      step: '03',
      title: 'Coaching Sessions',
      description:
        'Regular sessions — weekly or bi-weekly — focused on insight, action, and accountability. Each one ends with concrete next steps.',
    },
    {
      step: '04',
      title: 'Review and Sustain',
      description:
        'We measure progress against your goals, celebrate wins, and build the habits and systems that sustain momentum long after our work ends.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'A structured, results-driven process from first call to lasting momentum.',

  testimonials: [
    {
      name: 'Vanessa C.',
      location: 'Brookside',
      rating: 5,
      text: 'After 12 years in the same role I was stuck. Momentum helped me get crystal clear on what I wanted, reposition my experience, and I landed a VP role within four months. Worth every penny.',
    },
    {
      name: 'Marcus B.',
      location: 'Fairfield',
      rating: 5,
      text: 'As a founder I had vision but no structure. Their strategy consulting gave me a clear plan, priorities, and the accountability to actually execute. Revenue is up 60% this year.',
    },
    {
      name: 'Priya N.',
      location: 'Eastside',
      rating: 5,
      text: 'The executive coaching was exactly what I needed going into a new C-suite role. Honest feedback, practical frameworks, and real growth in how I lead. My team has noticed the difference.',
    },
  ],
  testimonialsTitle: 'What Our Clients Say',
  testimonialsSubtitle: 'Real people, real goals, measurable momentum.',

  faqs: [
    {
      question: 'What is the difference between coaching and consulting?',
      answer:
        'Coaching helps you unlock your own answers and build lasting capability through questioning and reflection. Consulting provides expert advice and frameworks to solve specific problems. We offer both and often blend them depending on your needs.',
    },
    {
      question: 'How long is a typical coaching engagement?',
      answer:
        'Most coaching engagements run 3 to 6 months with weekly or bi-weekly sessions. Some clients work with us for a year or more. We recommend a minimum of 3 months to build real, sustainable momentum.',
    },
    {
      question: 'Are sessions in person or virtual?',
      answer:
        'Both. We offer in-person sessions in the Greater Metro Area and virtual sessions nationwide via video. Many clients use a hybrid approach. We will recommend the best format based on your goals and location.',
    },
    {
      question: 'Do you work with teams or only individuals?',
      answer:
        'Both. We coach individual executives and leaders, and we also run team workshops and leadership development programs for organizations. Team engagements are custom-designed based on your team\u2019s goals.',
    },
    {
      question: 'How do I know if coaching is right for me?',
      answer:
        'Coaching works best when you have a goal, are open to honest feedback, and are willing to take action between sessions. The free discovery call is the best way to find out if we are a good fit before you commit.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about coaching and consulting with us.',

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

  contactTitle: 'Book Your Free Discovery Call',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day to schedule your complimentary 30-minute call.',

  galleryTitle: 'Clients in Action',
  gallerySubtitle: 'See Momentum Coaching Group at work.',
  galleryImages: [
    `${BASE_URL}3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1200`,
    `${BASE_URL}3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1200`,
    `${BASE_URL}3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200`,
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'ICF-certified coaches and experienced consultants who get results.',
  team: [
    { name: 'Derek Alvarado', role: 'Founder & Lead Coach', bio: 'ICF PCC-certified coach with 12+ years of experience and a background as a Fortune 500 executive. Derek founded Momentum to help leaders move with clarity and purpose.' },
    { name: 'Sophie Tran', role: 'Career Transition Coach', bio: 'ICF ACC-certified coach specializing in career pivots, personal branding, and interview preparation. Sophie has guided 200+ professionals through successful transitions.' },
    { name: 'Marcus Bell', role: 'Strategy Consultant', bio: 'Former strategy consultant with 15 years helping founders and leadership teams turn vision into clear, executable plans with measurable results.' },
  ],

  pricingTitle: 'Coaching and Consulting Packages',
  pricingSubtitle: 'Clear packages with flexible options.',
  pricing: [
    { name: 'Single Session', price: 'From $250', description: 'One focused coaching session.', features: ['60-minute session', 'Goal clarification', 'Action plan', 'Follow-up summary'], popular: false },
    { name: '3-Month Program', price: 'From $2,400', description: 'Weekly coaching over 3 months.', features: ['12 weekly sessions', 'Goal setting framework', 'Progress tracking', 'Email support between sessions'], popular: true },
    { name: 'Team Engagement', price: 'Custom quote', description: 'Workshops and team coaching.', features: ['Custom program design', 'Team workshops', 'Leadership development', 'Progress reporting'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the Momentum Coaching Group assistant. How can I help you today?",
    placeholder: "Ask about coaching or consulting...",
    knowledgeBase: [
      "We offer executive coaching, career transition coaching, business strategy consulting, leadership development, team workshops, and accountability programs.",
      "Our coaches are ICF-certified and bring real executive experience to every engagement.",
      "Most coaching engagements run 3 to 6 months with weekly or bi-weekly sessions. We recommend a minimum of 3 months to build sustainable momentum.",
      "We offer both in-person sessions in the Greater Metro Area and virtual sessions nationwide via video, with a hybrid option available.",
      "We coach individuals and also run team workshops and leadership development programs for organizations.",
      "Coaching helps you unlock your own answers; consulting provides expert advice. We offer both and often blend them based on your needs.",
      "We have 12+ years of experience, have coached 500+ clients, and have a 94% goal achievement rate.",
      "We serve clients in Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate, plus virtual engagements nationwide.",
      "Our hours are Monday through Friday, 8am to 6pm.",
      "The first step is a free 30-minute discovery call to see if we are a good fit before you commit.",
    ],
  },
};
