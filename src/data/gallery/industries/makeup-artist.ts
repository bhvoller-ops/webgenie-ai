import {
  Crown,
  Sparkles,
  Palette,
  Users,
  Brush,
  Gem,
  Award,
  Clock,
  Heart,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const makeupArtistConfig: IndustryConfig = {
  id: 'makeup-artist',
  industryName: 'Makeup Artist',
  businessName: 'GlamArtistry by Serena',
  tagline: 'Your Most Beautiful You.',
  heroTitle: 'Flawless Makeup for Your Most Important Moments',
  heroSubtitle:
    'From bridal glam to editorial looks, I create long-lasting, photo-ready makeup tailored to your features and event. Premium products, expert technique, and a calm, confidence-boosting experience — on location or in studio.',
  phone: '(555) 338-6620',
  email: 'bookings@glamartistry.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'By Appointment 7 Days a Week',
  yearsExperience: '10+',
  licenseNumber: 'MA-4471203',

  colors: {
    primary: '#BE185D',
    primaryDark: '#9F1239',
    primaryLight: '#FCE7F3',
    accent: '#92400E',
    background: '#FFFFFF',
    surface: '#FDF2F8',
    text: '#1A0A12',
    textMuted: '#6B5B62',
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
    'https://images.pexels.com/photos/5149734/pexels-photo-5149734.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'On-Location Available • Premium Products',
  ctaPrimary: 'Book Consultation',
  ctaSecondary: 'View Services',

  stats: [
    { value: '10+', label: 'Years Experience' },
    { value: '1,500+', label: 'Events Beautified' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '500+', label: 'Brides Styled' },
  ],

  services: [
    {
      icon: Crown,
      title: 'Bridal Makeup',
      description:
        'Flawless, long-wearing bridal makeup designed to last through tears, photos, and dancing. Includes a trial session so your wedding day look is perfect. On-location service available.',
      features: ['Bridal trial included', 'Long-wear formula', 'Touch-up kit provided', 'On-location available'],
    },
    {
      icon: Sparkles,
      title: 'Special Event Makeup',
      description:
        'Glamorous makeup for galas, proms, parties, and milestone celebrations. Custom looks from soft glam to bold statement — photo-ready and built to last all night.',
      features: ['Custom glam looks', 'Lash application', 'Long-wear products', 'Photo-ready finish'],
    },
    {
      icon: Palette,
      title: 'Editorial & Fashion',
      description:
        'Creative, high-fashion makeup for photoshoots, runway, and editorial work. Experienced in avant-garde, beauty, and commercial looks that translate flawlessly on camera.',
      features: ['Photoshoot makeup', 'Runway looks', 'Creative & avant-garde', 'Commercial & beauty'],
    },
    {
      icon: Users,
      title: 'Makeup Lessons',
      description:
        'Personalized one-on-one makeup lessons. Learn techniques for your face shape, features, and lifestyle. Walk away with a custom routine and product recommendations.',
      features: ['Personalized techniques', 'Product recommendations', 'Custom routine', 'All skill levels'],
    },
    {
      icon: Brush,
      title: 'Group Bookings',
      description:
        'Makeup for bridal parties, photo shoots, and group events. I bring a team for large parties so everyone gets gorgeous, on-time results without the stress.',
      features: ['Bridal party makeup', 'Group event styling', 'Team of artists', 'Coordinated timing'],
    },
    {
      icon: Gem,
      title: 'Natural Glam Looks',
      description:
        'Enhance-your-beauty natural makeup that looks like you, perfected. Soft contour, glowing skin, and defined features for an effortless, radiant finish.',
      features: ['Glowing skin focus', 'Soft contour', 'Enhanced natural features', 'Radiant finish'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Professional Training',
      description:
        'I trained at a top makeup academy and have 10 years of experience across bridal, editorial, and event makeup. My techniques are current, precise, and built for longevity.',
    },
    {
      icon: Clock,
      title: 'On-Time, Every Time',
      description:
        'Your event timing matters. I arrive early, work efficiently, and have a team for large parties. You will never be rushed, and you will never be late because of your makeup.',
    },
    {
      icon: Heart,
      title: 'Calm, Fun Experience',
      description:
        'Getting your makeup done should feel like a treat. I create a relaxed, uplifting atmosphere with great music and good energy so you feel pampered and confident.',
    },
    {
      icon: ThumbsUp,
      title: 'Premium Products',
      description:
        'I use only high-quality, long-wearing products from trusted brands. Your makeup will look flawless in person and in photos, and last from first toast to last dance.',
    },
  ],
  whyUsTitle: 'Why Clients Choose GlamArtistry',
  whyUsSubtitle:
    'Professional training, premium products, and a calm experience that leaves you glowing inside and out.',

  process: [
    {
      step: '01',
      title: 'Consultation',
      description:
        'We discuss your event, your style, inspiration photos, and skin concerns. I recommend the perfect look and provide a clear quote with no surprises.',
    },
    {
      step: '02',
      title: 'Trial Session',
      description:
        'For brides and special events, we do a trial to perfect your look. We adjust until it is exactly right, so your event day is stress-free and you know what to expect.',
    },
    {
      step: '03',
      title: 'Event Day',
      description:
        'I arrive early with all products and tools. Sit back, relax, and enjoy the pampering. You will look and feel gorgeous, with time to spare.',
    },
    {
      step: '04',
      title: 'Touch-Up Tips',
      description:
        'I provide a touch-up kit and quick tips so your makeup stays flawless all day and night. You leave with confidence and everything you need.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'A relaxed, confidence-boosting experience from consultation to event day.',

  testimonials: [
    {
      name: 'Kayla M.',
      location: 'Brookside',
      rating: 5,
      text: 'Serena did my wedding makeup and it was flawless from 10am ceremony to midnight send-off. The trial made me so confident going into the wedding day. I felt like the most beautiful version of myself. Book her immediately.',
    },
    {
      name: 'Priya S.',
      location: 'Fairfield',
      rating: 5,
      text: 'She did makeup for me and my entire bridal party of 8 and everyone looked stunning. She brought a team so we were all done on time and never felt rushed. The energy was so fun and calm. Worth every penny.',
    },
    {
      name: 'Naomi B.',
      location: 'Eastside',
      rating: 5,
      text: 'I booked a makeup lesson and it changed my whole routine. Serena taught me techniques for my eye shape and skin tone that I actually use every day. I finally feel confident doing my own makeup. Such a great experience.',
    },
  ],
  testimonialsTitle: 'What My Clients Say',
  testimonialsSubtitle: 'Beautiful, confident clients for every kind of occasion.',

  faqs: [
    {
      question: 'Do you offer on-location makeup services?',
      answer:
        'Yes! I travel to your home, hotel, or venue for your convenience. Travel within the metro area is included in pricing; destinations outside the area may have a travel fee. I bring everything needed.',
    },
    {
      question: 'Do I need a trial before my wedding?',
      answer:
        'I strongly recommend a trial for brides. We meet 4 to 8 weeks before your wedding, test your look with your veil or accessories, and refine it until it is perfect. This makes your wedding day stress-free.',
    },
    {
      question: 'How long does makeup application take?',
      answer:
        'A single makeup application takes about 45 to 60 minutes. For bridal parties, I allow 45 minutes per person and bring additional artists for larger groups so everyone is ready on time.',
    },
    {
      question: 'What products do you use?',
      answer:
        'I use premium, long-wearing products from trusted professional brands including Charlotte Tilbury, NARS, MAC, and others. All products are sanitized between clients. I also carry options for sensitive skin.',
    },
    {
      question: 'Do you provide lash application?',
      answer:
        'Yes, strip lash application is included with all makeup services. I have a selection of lash styles from natural to dramatic, or you can bring your own. I also offer individual lash add-ons for extra longevity.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about booking your makeup.',

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

  contactTitle: 'Book Your Makeup Consultation',
  contactSubtitle:
    'Call me or fill out the form with your event details. I respond within one business day.',

  galleryTitle: 'My Recent Makeup Work',
  gallerySubtitle: 'See the GlamArtistry difference.',
  galleryImages: [
    'https://images.pexels.com/photos/5149734/pexels-photo-5149734.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/5149734/pexels-photo-5149734.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/5149734/pexels-photo-5149734.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Artist',
  teamSubtitle: 'Professional makeup artists dedicated to your most beautiful you.',
  team: [
    { name: 'Serena Adams', role: 'Lead Makeup Artist & Owner', bio: 'Professional makeup artist with 10 years of experience and training from a top makeup academy. Serena specializes in bridal, editorial, and event makeup and founded GlamArtistry to make every client feel radiant.' },
    { name: 'Tiana Brooks', role: 'Associate Makeup Artist', bio: 'Specializes in natural glam, special event makeup, and group bookings. Tiana has 6 years of experience and brings a calm, fun energy to every party she works with.' },
    { name: 'Elena Vasquez', role: 'Makeup Artist & Educator', bio: 'Leads our makeup lessons and group education sessions. Elena has 8 years of experience and a gift for teaching clients techniques they can use every day.' },
  ],

  pricingTitle: 'Makeup Service Packages',
  pricingSubtitle: 'Transparent pricing with on-location options available.',
  pricing: [
    { name: 'Individual Glam', price: 'From $125', description: 'Makeup for one person.', features: ['Full makeup application', 'Strip lash application', 'Long-wear products', 'Touch-up kit', 'On-location available'], popular: false },
    { name: 'Bridal Package', price: 'From $295', description: 'Bridal makeup with trial session.', features: ['Bridal trial session', 'Wedding day makeup', 'Premium long-wear products', 'Touch-up kit', 'On-location included'], popular: true },
    { name: 'Bridal Party', price: 'From $95/person', description: 'Group makeup for parties of 4 or more.', features: ['Per-person pricing', 'Team of artists', 'Coordinated timing', 'Lash application', 'On-location included'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the GlamArtistry by Serena assistant. How can I help you today?",
    placeholder: "Ask about makeup services, bridal packages, or booking...",
    knowledgeBase: [
      "I offer bridal makeup, special event makeup, editorial and fashion makeup, makeup lessons, group bookings, and natural glam looks.",
      "Yes, I offer on-location makeup services and travel to your home, hotel, or venue. Travel within the metro area is included.",
      "I strongly recommend a bridal trial 4 to 8 weeks before your wedding so we can perfect your look and make your wedding day stress-free.",
      "A single makeup application takes about 45 to 60 minutes, and I allow 45 minutes per person for bridal parties.",
      "I use premium, long-wearing products from brands like Charlotte Tilbury, NARS, and MAC, all sanitized between clients.",
      "Yes, strip lash application is included with all makeup services, and individual lash add-ons are available for extra longevity.",
      "I am professionally trained with 10 years of experience across bridal, editorial, and event makeup.",
      "I serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "I am available by appointment 7 days a week.",
      "I have over 10 years of experience, have beautified more than 1,500 events, and have styled over 500 brides.",
    ],
  },
};
