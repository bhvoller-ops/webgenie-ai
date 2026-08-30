import {
  Music2,
  Heart,
  Building2,
  Disc3,
  Mic,
  Volume2,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
  Headphones,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const djEntertainmentConfig: IndustryConfig = {
  id: 'dj-entertainment',
  industryName: 'DJ & Entertainment',
  businessName: 'BeatDrop Entertainment',
  tagline: 'Where the Party Never Stops.',
  heroTitle: 'We Make Your Event Unforgettable',
  heroSubtitle:
    'Professional DJs, MCs, lighting, and sound for weddings, corporate events, clubs, and private parties. We read the crowd and keep the dance floor packed all night.',
  phone: '(555) 773-1190',
  email: 'bookings@beatdropent.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Sat 10am-9pm',
  yearsExperience: '12+',
  licenseNumber: 'DJ-3382910',

  colors: {
    primary: '#7C3AED',
    primaryDark: '#5B21B6',
    primaryLight: '#EDE9FE',
    accent: '#DC2626',
    background: '#FFFFFF',
    surface: '#F5F3FF',
    text: '#120A1F',
    textMuted: '#5B556B',
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

  heroImage: 'https://images.pexels.com/photos/5949085/pexels-photo-5949085.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'Pro DJs • State-of-the-Art Sound',
  ctaPrimary: 'Book a DJ',
  ctaSecondary: 'View Services',

  stats: [
    { value: '12+', label: 'Years Experience' },
    { value: '2,400+', label: 'Events Performed' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '100%', label: 'Dance Floor Packed' },
  ],

  services: [
    {
      icon: Heart,
      title: 'Wedding DJ',
      description:
        'Ceremony, cocktail hour, and reception music tailored to your style. We coordinate with your vendors and keep the night flowing.',
      features: ['Ceremony music', 'Cocktail hour', 'Reception DJ', 'MC services'],
    },
    {
      icon: Building2,
      title: 'Corporate Events',
      description:
        'Professional sound and music for product launches, conferences, holiday parties, and company celebrations.',
      features: ['Product launches', 'Conferences', 'Holiday parties', 'Award ceremonies'],
    },
    {
      icon: Disc3,
      title: 'Club & Nightlife',
      description:
        'Resident and guest DJ sets for clubs, lounges, and nightlife venues. We bring the energy and keep the crowd moving.',
      features: ['Resident DJ', 'Guest sets', 'Genre versatility', 'Late-night sets'],
    },
    {
      icon: Music2,
      title: 'Private Parties',
      description:
        'Birthdays, anniversaries, and milestone celebrations with music, lighting, and MC services tailored to your guests.',
      features: ['Birthday parties', 'Anniversaries', 'Milestone events', 'Custom playlists'],
    },
    {
      icon: Mic,
      title: 'Karaoke & MC Services',
      description:
        'Professional MC hosting and karaoke nights with a massive song library, wireless mics, and crowd engagement.',
      features: ['Professional MC', 'Karaoke nights', 'Massive song library', 'Wireless mics'],
    },
    {
      icon: Volume2,
      title: 'Lighting & Sound Rental',
      description:
        'Professional-grade lighting, sound systems, and AV equipment rental with setup, testing, and on-site support.',
      features: ['PA systems', 'Dance lighting', 'Up-lighting', 'AV equipment'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Professional DJs',
      description:
        'Our DJs are experienced professionals who read the crowd and mix seamlessly. No awkward gaps, no cheesy announcements.',
    },
    {
      icon: Clock,
      title: 'Always On Time',
      description:
        'We arrive early, set up without disruption, and are ready to go before your first guest walks in. Punctuality is non-negotiable.',
    },
    {
      icon: Users,
      title: 'Crowd Readers',
      description:
        'We adapt to your crowd in real time, mixing genres and eras to keep the energy up and the dance floor full.',
    },
    {
      icon: ThumbsUp,
      title: 'Backup Equipment',
      description:
        'Every booking includes backup equipment on-site. If anything fails, we switch in seconds — your event never skips a beat.',
    },
  ],
  whyUsTitle: 'Why Choose BeatDrop',
  whyUsSubtitle:
    'Professional sound, seamless mixing, and a packed dance floor — guaranteed.',

  process: [
    {
      step: '01',
      title: 'Consultation',
      description:
        'Tell us about your event, venue, and musical preferences. We send a tailored quote and package options.',
    },
    {
      step: '02',
      title: 'Plan Your Playlist',
      description:
        'Share your must-play and do-not-play lists. We build a custom set and coordinate timing with your event flow.',
    },
    {
      step: '03',
      title: 'Setup & Soundcheck',
      description:
        'We arrive early, set up professional equipment, and soundcheck before guests arrive. No disruption to your event.',
    },
    {
      step: '04',
      title: 'We Perform',
      description:
        'Your DJ and MC run the night, reading the crowd and keeping energy high from first song to last dance.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'From booking to the last dance, a seamless experience.',

  testimonials: [
    {
      name: 'Taylor M.',
      location: 'Downtown Core',
      rating: 5,
      text: 'BeatDrop DJed our wedding and the dance floor was packed from the first song to the last. They read the crowd perfectly and mixed genres seamlessly. Best decision we made.',
    },
    {
      name: 'Derek S.',
      location: 'Riverside',
      rating: 5,
      text: 'We hired BeatDrop for our company holiday party and they killed it. Professional setup, great MC, and everyone was dancing. Already booked them for next year.',
    },
    {
      name: 'Nadia A.',
      location: 'Uptown',
      rating: 5,
      text: 'Karaoke night at our venue with BeatDrop was a blast. Huge song library, great mics, and the MC kept the energy up all night. Our best event yet.',
    },
  ],
  testimonialsTitle: 'What Our Clients Say',
  testimonialsSubtitle: 'Packed dance floors and happy clients are our reputation.',

  faqs: [
    {
      question: 'How far in advance should I book?',
      answer:
        'For weddings and peak-season events, book 6 to 12 months out. Corporate and private events can often be booked 4 to 8 weeks in advance. We do accommodate last-minute bookings when available.',
    },
    {
      question: 'Can I choose the music for my event?',
      answer:
        'Absolutely. We send you a planning form to list must-play and do-not-play songs. Your DJ builds a custom set around your preferences while reading the crowd on the night.',
    },
    {
      question: 'Do you provide MC services?',
      answer:
        'Yes. Our DJs are also experienced MCs who can host announcements, introductions, and key moments. We coordinate with your vendors to keep the night flowing.',
    },
    {
      question: 'What equipment do you bring?',
      answer:
        'We bring professional sound systems, DJ controllers, lighting, and wireless microphones. Backup equipment is always on-site. We just need power and a space to set up.',
    },
    {
      question: 'Do you travel outside the metro area?',
      answer:
        'Yes, we travel for events throughout the region. Travel fees may apply for events outside our standard service area — we will include any fees in your quote.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about booking a DJ.',

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

  contactTitle: 'Book Your DJ Today',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day with a custom quote.',

  galleryTitle: 'Events We\u2019ve Rocked',
  gallerySubtitle: 'A look at the parties we\u2019ve powered.',
  galleryImages: [
    'https://images.pexels.com/photos/5949085/pexels-photo-5949085.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/5949085/pexels-photo-5949085.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/5949085/pexels-photo-5949085.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Professional DJs who know how to move a crowd.',
  team: [
    { name: 'Andre Cole', role: 'Lead DJ & Founder', bio: 'Andre founded BeatDrop 12 years ago and has performed at over 2,400 events. He leads our wedding and corporate teams.' },
    { name: 'Jasmine Lee', role: 'Senior DJ & MC', bio: 'Jasmine specializes in weddings and private parties, known for her seamless mixing and engaging MC style.' },
    { name: 'Tyler Brooks', role: 'Sound & Lighting Tech', bio: 'Tyler manages equipment, setup, and lighting design for every event, ensuring flawless sound and visuals.' },
  ],

  pricingTitle: 'DJ & Entertainment Packages',
  pricingSubtitle: 'Packages for events of every size.',
  pricing: [
    { name: 'Basic Package', price: 'From $895', description: '4-hour DJ service for private events.', features: ['4 hours of DJ service', 'Professional sound system', 'Basic dance lighting', 'Custom playlist', 'Setup & teardown'], popular: false },
    { name: 'Premium Package', price: 'From $1,495', description: '6-hour DJ, MC, and lighting.', features: ['6 hours of DJ service', 'MC hosting', 'Up-lighting & dance lighting', 'Wireless mics', 'Custom playlist', 'Backup equipment'], popular: true },
    { name: 'Full Production', price: 'From $2,495', description: 'Complete entertainment production.', features: ['Up to 8 hours', 'DJ & MC', 'Full lighting design', 'Premium sound system', 'Fog & special effects', 'Dedicated technician'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the BeatDrop Entertainment assistant. How can I help you today?",
    placeholder: "Ask about booking a DJ...",
    knowledgeBase: [
      "We provide wedding DJs, corporate event DJs, club and nightlife sets, private party DJs, karaoke and MC services, and lighting and sound rental.",
      "For weddings and peak-season events, book 6 to 12 months out. Corporate and private events can often be booked 4 to 8 weeks in advance.",
      "Yes, you choose the music. We send a planning form for must-play and do-not-play songs, and your DJ builds a custom set around your preferences.",
      "Our DJs are also experienced MCs who host announcements, introductions, and key moments, coordinating with your vendors.",
      "We bring professional sound systems, DJ controllers, lighting, and wireless mics, with backup equipment always on-site.",
      "We travel for events throughout the region. Travel fees may apply outside our standard service area and are included in your quote.",
      "We serve Downtown Core, Midtown, Uptown, Riverside, Brookside, Fairfield, Eastside, and Westgate.",
      "Our hours are Monday through Saturday, 10am to 9pm.",
      "We have 12+ years of experience and have performed at over 2,400 events.",
      "Packages range from $895 for basic DJ service to $2,495 for full production with lighting and special effects.",
    ],
  },
};
