import {
  Calendar,
  Heart,
  PartyPopper,
  Users,
  Video,
  Sparkles,
  Award,
  Clock,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
  MapPin,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const eventPlanningConfig: IndustryConfig = {
  id: 'event-planning',
  industryName: 'Event Planning',
  businessName: 'Vivid Event Planning',
  tagline: 'Unforgettable Moments, Flawlessly Executed.',
  heroTitle: 'We Bring Your Vision to Life',
  heroSubtitle:
    'Full-service event planning for corporate, social, and once-in-a-lifetime celebrations. From concept to cleanup, we handle every detail so you can enjoy the moment.',
  phone: '(555) 247-8830',
  email: 'events@vivideventplanning.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Sat 9am-7pm',
  yearsExperience: '14+',
  licenseNumber: 'EP-5029184',

  colors: {
    primary: '#BE185D',
    primaryDark: '#9F1239',
    primaryLight: '#FCE7F3',
    accent: '#0D9488',
    background: '#FFFFFF',
    surface: '#FDF2F8',
    text: '#1A0A12',
    textMuted: '#6B5A60',
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

  heroImage: 'https://images.pexels.com/photos/31107306/pexels-photo-31107306.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'Full-Service Planning • 14+ Years',
  ctaPrimary: 'Plan My Event',
  ctaSecondary: 'View Services',

  stats: [
    { value: '14+', label: 'Years Experience' },
    { value: '1,200+', label: 'Events Planned' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '100%', label: 'On-Time Delivery' },
  ],

  services: [
    {
      icon: Calendar,
      title: 'Corporate Events',
      description:
        'Conferences, product launches, team offsites, and holiday parties designed to impress your guests and reflect your brand.',
      features: ['Conferences & summits', 'Product launches', 'Team building', 'Holiday parties'],
    },
    {
      icon: Heart,
      title: 'Weddings',
      description:
        'From intimate ceremonies to grand celebrations, we handle venue, vendors, design, and day-of coordination.',
      features: ['Full wedding planning', 'Day-of coordination', 'Venue selection', 'Vendor management'],
    },
    {
      icon: PartyPopper,
      title: 'Private Parties',
      description:
        'Birthdays, anniversaries, showers, and milestone celebrations tailored to your style and guest list.',
      features: ['Birthday parties', 'Anniversaries', 'Baby & bridal showers', 'Milestone events'],
    },
    {
      icon: Users,
      title: 'Conferences & Seminars',
      description:
        'End-to-end conference planning including agenda, speakers, AV, catering, and attendee experience.',
      features: ['Agenda design', 'Speaker management', 'AV & staging', 'Catering coordination'],
    },
    {
      icon: Video,
      title: 'Virtual Events',
      description:
        'Engaging online and hybrid events with professional streaming, interactive platforms, and audience engagement.',
      features: ['Live streaming', 'Hybrid events', 'Virtual platforms', 'Audience engagement'],
    },
    {
      icon: Sparkles,
      title: 'Fundraising Galas',
      description:
        'Elegant galas and charity events that maximize donations and create memorable experiences for your supporters.',
      features: ['Gala coordination', 'Sponsor management', 'Auction planning', 'Donor engagement'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Award-Winning Team',
      description:
        'Our planners have been recognized by industry associations for creativity, execution, and client satisfaction.',
    },
    {
      icon: Clock,
      title: 'On-Time, Every Time',
      description:
        'We respect your timeline and budget. Detailed timelines and vendor coordination keep everything on track.',
    },
    {
      icon: Users,
      title: 'Trusted Vendor Network',
      description:
        'We have built relationships with the best venues, caterers, and vendors — passing our preferred pricing on to you.',
    },
    {
      icon: ThumbsUp,
      title: 'Stress-Free Experience',
      description:
        'You enjoy the event while we handle the logistics. From setup to teardown, every detail is managed for you.',
    },
  ],
  whyUsTitle: 'Why Clients Choose Vivid',
  whyUsSubtitle:
    'We turn your vision into a seamless, memorable experience — down to the last detail.',

  process: [
    {
      step: '01',
      title: 'Discovery Call',
      description:
        'We learn about your event, goals, budget, and vision. You receive a tailored proposal within 48 hours.',
    },
    {
      step: '02',
      title: 'Design & Planning',
      description:
        'We build a detailed plan — venue, vendors, timeline, and design — and keep you involved at every step.',
    },
    {
      step: '03',
      title: 'Coordination',
      description:
        'We manage all vendors, logistics, and timelines leading up to the event so nothing falls through the cracks.',
    },
    {
      step: '04',
      title: 'Day-Of Execution',
      description:
        'Our team is on-site from setup to teardown, ensuring everything runs perfectly while you enjoy the moment.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'A clear, collaborative process from first call to final toast.',

  testimonials: [
    {
      name: 'Vanessa R.',
      location: 'Downtown Core',
      rating: 5,
      text: 'Vivid planned our 200-person corporate gala and it was flawless. Every vendor showed up on time, the design was stunning, and our executives were blown away. We will never plan an event without them.',
    },
    {
      name: 'James T.',
      location: 'Riverside',
      rating: 5,
      text: 'Our wedding would have been a disaster without Vivid. They caught details we never would have thought of, kept us on budget, and made the whole day feel effortless. Worth every penny.',
    },
    {
      name: 'Priya K.',
      location: 'Uptown',
      rating: 5,
      text: 'I planned a milestone birthday for my mom and the Vivid team made it magical. The decor, the flow, the surprises — everything was perfect. My mom still talks about it months later.',
    },
  ],
  testimonialsTitle: 'What Our Clients Say',
  testimonialsSubtitle: 'Memorable events and happy clients are our specialty.',

  faqs: [
    {
      question: 'How far in advance should I book my event?',
      answer:
        'For weddings and large galas, we recommend booking 6 to 12 months out. Corporate events and private parties can often be planned in 8 to 12 weeks. We do accommodate rush events when our calendar allows.',
    },
    {
      question: 'Do you work within my budget?',
      answer:
        'Absolutely. We tailor every event to your budget and are transparent about costs throughout. We provide detailed proposals and never surprise you with hidden fees.',
    },
    {
      question: 'Can I hire you for day-of coordination only?',
      answer:
        'Yes. We offer day-of coordination as a standalone service for clients who want to plan their own event but want a professional to handle the big day. Contact us for details.',
    },
    {
      question: 'Do you handle venue and vendor selection?',
      answer:
        'Yes. We help you find and book the perfect venue and vendors, leveraging our network for preferred pricing. You always make the final decisions — we make the process easy.',
    },
    {
      question: 'What happens if something goes wrong on the day?',
      answer:
        'Our team is on-site and prepared for anything. We carry contingency plans, backup vendor contacts, and a full emergency kit so issues are resolved before you ever notice them.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about planning an event with us.',

  serviceAreas: [
    { name: 'Downtown Core' },
    { name: 'Midtown' },
    { name: 'Uptown' },
    { name: 'Riverside' },
    { name: 'Brookside' },
    { name: 'Fairfield' },
    { name: 'Eastside' },
    { name: 'Westgate' },
  ],
  serviceAreasTitle: 'Communities We Proudly Serve',

  contactTitle: 'Let\u2019s Plan Something Unforgettable',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day with a custom proposal.',

  galleryTitle: 'Recent Events We\u2019ve Planned',
  gallerySubtitle: 'A glimpse of the moments we\u2019ve created.',
  galleryImages: [
    'https://images.pexels.com/photos/31107306/pexels-photo-31107306.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/31107306/pexels-photo-31107306.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/31107306/pexels-photo-31107306.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Experienced planners who live for the details.',
  team: [
    { name: 'Olivia Grant', role: 'Lead Planner & Founder', bio: 'Olivia founded Vivid 14 years ago and has planned over 1,200 events. She oversees every project and leads our wedding and gala teams.' },
    { name: 'Marcus Bell', role: 'Corporate Events Director', bio: 'Marcus specializes in conferences and corporate galas, managing logistics, AV, and speaker coordination for events up to 1,000 guests.' },
    { name: 'Sofia Reyes', role: 'Design Lead', bio: 'Sofia brings events to life with custom design, florals, and decor. Her work has been featured in three industry publications.' },
  ],

  pricingTitle: 'Event Planning Packages',
  pricingSubtitle: 'Flexible packages for events of every size.',
  pricing: [
    { name: 'Day-Of Coordination', price: 'From $1,500', description: 'Coordination for the day of your event.', features: ['Up to 8 hours on-site', 'Vendor confirmation', 'Timeline management', 'Emergency kit', 'Setup & teardown oversight'], popular: false },
    { name: 'Partial Planning', price: 'From $3,500', description: 'Planning support for the final 60 days.', features: ['Vendor selection', 'Timeline & logistics', 'Design consultation', 'Day-of coordination', 'Unlimited consultations'], popular: true },
    { name: 'Full-Service Planning', price: 'From $6,500', description: 'Start-to-finish event planning.', features: ['Concept & design', 'Venue & vendor management', 'Budget tracking', 'Guest management', 'Full day-of execution', 'Post-event wrap-up'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the Vivid Event Planning assistant. How can I help you today?",
    placeholder: "Ask about planning your event...",
    knowledgeBase: [
      "We plan corporate events, weddings, private parties, conferences and seminars, virtual events, and fundraising galas.",
      "For weddings and large galas, book 6 to 12 months out. Corporate and private events can often be planned in 8 to 12 weeks.",
      "We tailor every event to your budget and provide transparent, detailed proposals with no hidden fees.",
      "We offer day-of coordination as a standalone service for clients who plan their own event but want a pro on the big day.",
      "We handle venue and vendor selection, leveraging our network for preferred pricing. You always make the final decisions.",
      "Our team is on-site for every event with contingency plans, backup vendors, and an emergency kit.",
      "We serve Downtown Core, Midtown, Uptown, Riverside, Brookside, Fairfield, Eastside, and Westgate.",
      "Our hours are Monday through Saturday, 9am to 7pm.",
      "We have 14+ years of experience and have planned over 1,200 events.",
      "Our packages range from day-of coordination starting at $1,500 to full-service planning starting at $6,500.",
    ],
  },
};
