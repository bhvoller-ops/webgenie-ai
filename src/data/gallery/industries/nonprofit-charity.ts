import {
  HeartHandshake,
  UtensilsCrossed,
  GraduationCap,
  Users,
  CloudRain,
  Home,
  Award,
  Clock,
  Sparkles,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
  HandHeart,
  Globe,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

const BASE_URL = 'https://images.pexels.com/photos/';

export const nonprofitCharityConfig: IndustryConfig = {
  id: 'nonprofit-charity',
  industryName: 'Nonprofit / Charity',
  businessName: 'Hope Rising Foundation',
  tagline: 'Together, We Rise.',
  heroTitle: 'Building Stronger Communities, One Act of Kindness at a Time',
  heroSubtitle:
    'Hope Rising Foundation serves families and individuals in need through food programs, education, disaster relief, and community outreach. Your support creates real, lasting change.',
  phone: '(555) 882-1140',
  email: 'hello@hoperising.org',
  serviceArea: 'Greater Metro Area & Surrounding Communities',
  hours: 'Mon-Fri 8am-6pm, Sat 9am-2pm',
  yearsExperience: '20+',
  licenseNumber: '501(c)(3)-47-2839105',

  colors: {
    primary: '#0D9488',
    primaryDark: '#0F766E',
    primaryLight: '#CCFBF1',
    accent: '#B45309',
    background: '#FFFFFF',
    surface: '#F0FDFA',
    text: '#0A1A1C',
    textMuted: '#5B6B6E',
  },

  navLinks: [
    { label: 'Programs', href: '#services' },
    { label: 'Why Us', href: '#why-us' },
    { label: 'Process', href: '#process' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Stories', href: '#testimonials' },
    { label: 'Giving', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#contact' },
  ],

  heroImage: `${BASE_URL}6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=1200`,
  heroBadge: '501(c)(3) Registered • 4-Star Charity Navigator',
  ctaPrimary: 'Donate Now',
  ctaSecondary: 'View Programs',

  stats: [
    { value: '20+', label: 'Years Serving' },
    { value: '120,000+', label: 'Lives Impacted' },
    { value: '4,500+', label: 'Volunteers' },
    { value: '92¢', label: 'Per Dollar to Programs' },
  ],

  services: [
    {
      icon: HandHeart,
      title: 'Community Outreach',
      description:
        'Grassroots programs that meet people where they are — neighborhood resource fairs, mobile clinics, and partnerships with local organizations.',
      features: ['Resource fairs', 'Mobile clinics', 'Local partnerships', 'Neighborhood events'],
    },
    {
      icon: UtensilsCrossed,
      title: 'Food Programs',
      description:
        'Food pantries, hot meal services, and weekend backpack programs that ensure no one in our community goes hungry.',
      features: ['Food pantry', 'Hot meal service', 'Backpack program', 'Senior delivery'],
    },
    {
      icon: GraduationCap,
      title: 'Education Initiatives',
      description:
        'After-school tutoring, scholarship programs, and adult education that open doors and break cycles of poverty.',
      features: ['After-school tutoring', 'Scholarship fund', 'Adult literacy', 'Mentorship'],
    },
    {
      icon: Users,
      title: 'Volunteer Programs',
      description:
        'Meaningful volunteer opportunities for individuals, families, and corporate groups. Make a difference while building community.',
      features: ['Individual volunteering', 'Corporate service days', 'Family volunteering', 'Skills-based service'],
    },
    {
      icon: CloudRain,
      title: 'Disaster Relief',
      description:
        'Rapid-response support for families affected by floods, fires, and storms — emergency supplies, shelter assistance, and recovery resources.',
      features: ['Emergency supplies', 'Shelter assistance', 'Recovery resources', 'Case management'],
    },
    {
      icon: Home,
      title: 'Family Support Services',
      description:
        'Wraparound support for families in crisis — utility assistance, housing navigation, counseling referrals, and case management.',
      features: ['Utility assistance', 'Housing navigation', 'Counseling referrals', 'Case management'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: '4-Star Rated Charity',
      description:
        'Consistently rated 4 stars by Charity Navigator for transparency, accountability, and the percentage of donations that reach our programs.',
    },
    {
      icon: Clock,
      title: '20+ Years of Service',
      description:
        'Two decades of trusted, on-the-ground service to our community. We know the needs because we live and work here alongside the people we serve.',
    },
    {
      icon: Sparkles,
      title: '92 Cents of Every Dollar',
      description:
        'An industry-leading 92 cents of every dollar goes directly to programs. We keep overhead low so your generosity has maximum impact.',
    },
    {
      icon: ThumbsUp,
      title: 'Real, Measurable Impact',
      description:
        'We track outcomes, not just outputs. Every program is measured against clear goals so you can see exactly how your support changes lives.',
    },
  ],
  whyUsTitle: 'Why Supporters Trust Hope Rising',
  whyUsSubtitle:
    'Two decades of transparent, accountable service that turns compassion into measurable, lasting change.',

  process: [
    {
      step: '01',
      title: 'Choose How to Help',
      description:
        'Donate, volunteer, or partner with us. Choose a program that resonates with you or let us help you find the best fit for your goals.',
    },
    {
      step: '02',
      title: 'Get Connected',
      description:
        'We match you with the right opportunity — a volunteer shift, a recurring gift, a corporate partnership, or an in-kind donation.',
    },
    {
      step: '03',
      title: 'Make an Impact',
      description:
        'Your support goes to work immediately, serving families and individuals through our community programs and services.',
    },
    {
      step: '04',
      title: 'See the Results',
      description:
        'We share stories, photos, and impact reports so you can see exactly how your generosity is changing lives in our community.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'Turning your compassion into measurable community impact.',

  testimonials: [
    {
      name: 'Maria G.',
      location: 'Brookside',
      rating: 5,
      text: 'When we lost everything in a house fire, Hope Rising was there within hours. Emergency supplies, a place to stay, and someone who helped us navigate the recovery. I do not know what we would have done without them.',
    },
    {
      name: 'David K.',
      location: 'Fairfield',
      rating: 5,
      text: 'I have volunteered with a lot of organizations. Hope Rising is the most organized, the most transparent, and the most genuinely impactful. I see where my time and money go and it matters.',
    },
    {
      name: 'The Alvarez Family',
      location: 'Eastside',
      rating: 5,
      text: 'The food pantry and backpack program got us through a really hard year. Now both parents are working again and my kids are thriving in the after-school program. We give back now because we remember.',
    },
  ],
  testimonialsTitle: 'Stories of Hope',
  testimonialsSubtitle: 'Real lives changed by your generosity and our programs.',

  faqs: [
    {
      question: 'Is my donation tax-deductible?',
      answer:
        'Yes. Hope Rising Foundation is a registered 501(c)(3) nonprofit, and your donation is tax-deductible to the fullest extent allowed by law. You will receive an emailed receipt for every gift.',
    },
    {
      question: 'How much of my donation goes to programs?',
      answer:
        'An industry-leading 92 cents of every dollar goes directly to programs and services. We keep administrative and fundraising costs low so your generosity has maximum impact.',
    },
    {
      question: 'Can I volunteer as an individual or with a group?',
      answer:
        'Both. We welcome individual volunteers, families, and corporate groups. Opportunities include food pantry shifts, tutoring, event support, and skills-based service. Sign up through our volunteer page.',
    },
    {
      question: 'What areas do you serve?',
      answer:
        'We serve the Greater Metro Area and surrounding communities, including Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate. Disaster relief extends further as needed.',
    },
    {
      question: 'How can my company partner with Hope Rising?',
      answer:
        'We offer corporate partnerships including sponsored volunteer days, matching gift programs, in-kind donations, and program sponsorships. Contact us to discuss a partnership that aligns with your company\u2019s values.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about supporting Hope Rising.',

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

  contactTitle: 'Get Involved Today',
  contactSubtitle:
    'Call us or fill out the form below to donate, volunteer, or partner with us. Together, we rise.',

  galleryTitle: 'Our Programs in Action',
  gallerySubtitle: 'See the impact of your support.',
  galleryImages: [
    `${BASE_URL}6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=1200`,
    `${BASE_URL}6646919/pexels-photo-6646919.jpeg?auto=compress&cs=tinysrgb&w=1200`,
    `${BASE_URL}6641231/pexels-photo-6641231.jpeg?auto=compress&cs=tinysrgb&w=1200`,
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Dedicated professionals and volunteers committed to serving our community.',
  team: [
    { name: 'Reverend Grace Okonkwo', role: 'Executive Director / Founder', bio: 'Founded Hope Rising 20 years ago after a career in social work. Grace leads with compassion and a relentless focus on measurable community impact.' },
    { name: 'Michael Torres', role: 'Programs Director', bio: 'Oversees all six program areas and ensures every initiative meets its goals. Michael has 15 years of nonprofit program management experience.' },
    { name: 'Aisha Rahman', role: 'Volunteer Coordinator', bio: 'Matches volunteers with meaningful opportunities and manages our 4,500+ volunteer network, from individuals to corporate service days.' },
  ],

  pricingTitle: 'Ways to Give',
  pricingSubtitle: 'Every gift, no matter the size, creates hope.',
  pricing: [
    { name: 'One-Time Gift', price: 'From $25', description: 'A single gift to support our programs.', features: ['Choose any amount', 'Tax-deductible', 'Immediate impact', 'Email receipt'], popular: false },
    { name: 'Monthly Giving', price: 'From $10/mo', description: 'Recurring support that sustains our work.', features: ['Flexible monthly amount', 'Sustains programs year-round', 'Annual impact report', 'Cancel anytime'], popular: true },
    { name: 'Corporate Partner', price: 'Custom', description: 'Partnership tailored to your company.', features: ['Sponsored volunteer days', 'Matching gift program', 'Brand visibility', 'Impact reporting'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the Hope Rising Foundation assistant. How can I help you today?",
    placeholder: "Ask about donating, volunteering, or our programs...",
    knowledgeBase: [
      "We offer community outreach, food programs, education initiatives, volunteer programs, disaster relief, and family support services.",
      "Yes, Hope Rising is a registered 501(c)(3) nonprofit and your donation is tax-deductible to the fullest extent allowed by law.",
      "An industry-leading 92 cents of every dollar goes directly to programs and services.",
      "We welcome individual volunteers, families, and corporate groups for food pantry shifts, tutoring, event support, and skills-based service.",
      "We serve the Greater Metro Area including Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate, with disaster relief extending further as needed.",
      "We offer corporate partnerships including sponsored volunteer days, matching gift programs, in-kind donations, and program sponsorships.",
      "We have 20+ years of service, have impacted over 120,000 lives, and work with 4,500+ volunteers.",
      "Our hours are Monday through Friday 8am to 6pm, and Saturday 9am to 2pm.",
      "You can give one-time, set up monthly recurring giving, or become a corporate partner. Every gift is tax-deductible.",
      "To get involved, use the contact form or call us and we will help you find the best way to donate, volunteer, or partner.",
    ],
  },
};
