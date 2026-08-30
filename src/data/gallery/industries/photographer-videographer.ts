import {
  Heart,
  User,
  Camera,
  Video,
  Home,
  Calendar,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
  Aperture,
  Film,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

const BASE_URL = 'https://images.pexels.com/photos/';

export const photographerVideographerConfig: IndustryConfig = {
  id: 'photographer-videographer',
  industryName: 'Photographer / Videographer',
  businessName: 'Lumen Studio',
  tagline: 'Light. Story. Forever.',
  heroTitle: 'Capturing Moments That Last a Lifetime',
  heroSubtitle:
    'Lumen Studio creates timeless photography and cinematic video for weddings, portraits, brands, and events. Artful storytelling, professional equipment, and a relaxed experience from first call to final delivery.',
  phone: '(555) 377-2841',
  email: 'hello@lumenstudio.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'By appointment, 7 days a week',
  yearsExperience: '10+',
  licenseNumber: 'PPA-2398174',

  colors: {
    primary: '#57534E',
    primaryDark: '#44403C',
    primaryLight: '#F5F5F4',
    accent: '#B45309',
    background: '#FFFFFF',
    surface: '#FAFAF9',
    text: '#1A1714',
    textMuted: '#6B6259',
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

  heroImage: `${BASE_URL}1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=1200`,
  heroBadge: 'Award-Winning • 300+ Weddings Captured',
  ctaPrimary: 'Check Availability',
  ctaSecondary: 'View Services',

  stats: [
    { value: '10+', label: 'Years Behind the Lens' },
    { value: '450+', label: 'Projects Delivered' },
    { value: '300+', label: 'Weddings Captured' },
    { value: '4.9★', label: 'Client Rating' },
  ],

  services: [
    {
      icon: Heart,
      title: 'Wedding Photography',
      description:
        'Documentary-style wedding photography that captures the real, unscripted moments of your day. Full-day coverage with a second shooter available.',
      features: ['Full-day coverage', 'Engagement session', 'Online gallery', 'Print release'],
    },
    {
      icon: User,
      title: 'Portrait Sessions',
      description:
        'Family, maternity, newborn, and personal branding portraits in studio or on location. Relaxed sessions that bring out your best.',
      features: ['Family portraits', 'Maternity & newborn', 'Personal branding', 'Studio or location'],
    },
    {
      icon: Camera,
      title: 'Commercial Photography',
      description:
        'Product, food, and brand photography that makes your business look its best. On-site or studio shoots with professional lighting and retouching.',
      features: ['Product photography', 'Food & beverage', 'Brand imagery', 'Professional retouching'],
    },
    {
      icon: Video,
      title: 'Video Production',
      description:
        'Cinematic video for weddings, brands, and events. From concept to final edit, we produce video that moves people and tells your story.',
      features: ['Wedding films', 'Brand videos', 'Event coverage', 'Full post-production'],
    },
    {
      icon: Home,
      title: 'Real Estate Photography',
      description:
        'High-quality interior, exterior, and drone photography that helps properties sell faster. Quick turnaround for agents and developers.',
      features: ['Interior & exterior', 'Drone aerials', 'Twilight shots', '24-hour turnaround'],
    },
    {
      icon: Calendar,
      title: 'Event Coverage',
      description:
        'Professional coverage for corporate events, galas, conferences, and private parties. We capture the key moments and the candid energy.',
      features: ['Corporate events', 'Galas & fundraisers', 'Conferences', 'Private parties'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Award-Winning Work',
      description:
        'Recognized by the Professional Photographers of America and featured in national publications. Our work speaks for itself.',
    },
    {
      icon: Clock,
      title: 'Fast, Reliable Delivery',
      description:
        'Sneak peeks within 48 hours and full galleries delivered within 2-3 weeks. We respect your excitement and your timeline.',
    },
    {
      icon: Users,
      title: 'Relaxed, Fun Experience',
      description:
        'We make shoots comfortable and enjoyable, not stiff or awkward. The best images come from people who feel at ease, and we know how to get you there.',
    },
    {
      icon: ThumbsUp,
      title: 'Professional Equipment',
      description:
        'Full-frame cameras, professional lenses, off-camera lighting, and backup gear on every shoot. We are prepared for anything.',
    },
  ],
  whyUsTitle: 'Why Clients Choose Lumen Studio',
  whyUsSubtitle:
    'Artful storytelling, a relaxed experience, and professional reliability from first call to final delivery.',

  process: [
    {
      step: '01',
      title: 'Inquiry & Consultation',
      description:
        'Tell us about your event or project. We will schedule a call or meeting to understand your vision, answer questions, and confirm availability.',
    },
    {
      step: '02',
      title: 'Booking & Planning',
      description:
        'We send a custom proposal and contract. Once you sign and pay the deposit, we lock in your date and build a shot list and timeline together.',
    },
    {
      step: '03',
      title: 'The Shoot',
      description:
        'We arrive early, prepared, and ready to capture. You relax and enjoy the moment while we handle the storytelling and the details.',
    },
    {
      step: '04',
      title: 'Edit & Delivery',
      description:
        'You receive sneak peeks within 48 hours and your full edited gallery or video within 2-3 weeks, with print release and online sharing.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'A smooth, enjoyable experience from first inquiry to final delivery.',

  testimonials: [
    {
      name: 'Emma & Ryan C.',
      location: 'Brookside',
      rating: 5,
      text: 'Lumen captured our wedding and we cannot stop looking at the photos. They caught moments we did not even know happened. The whole day felt effortless with them there. Truly artists.',
    },
    {
      name: 'Olivia T.',
      location: 'Fairfield',
      rating: 5,
      text: 'I needed brand photography for my business and the results exceeded every expectation. Professional, creative, and so easy to work with. My website and socials look like a million bucks now.',
    },
    {
      name: 'Daniel & Priya M.',
      location: 'Eastside',
      rating: 5,
      text: 'Our wedding film is stunning. We have watched it a dozen times and still get emotional. Lumen understood exactly the story we wanted to tell and delivered something we will treasure forever.',
    },
  ],
  testimonialsTitle: 'What Our Clients Say',
  testimonialsSubtitle: 'Moments captured and stories told, again and again.',

  faqs: [
    {
      question: 'How far in advance should we book?',
      answer:
        'For weddings, we recommend booking 8-12 months in advance, especially for peak season dates. For portraits, events, and commercial work, 4-6 weeks is usually sufficient. We do our best to accommodate last-minute requests when our schedule allows.',
    },
    {
      question: 'Do you travel for shoots?',
      answer:
        'Yes. We travel throughout the Greater Metro Area at no additional cost. For destinations beyond that, we provide a custom travel quote. We have shot weddings and projects across the country and internationally.',
    },
    {
      question: 'How many photos do we receive?',
      answer:
        'For a full wedding, you typically receive 600-800 fully edited images. Portrait sessions include 40-80 edited images depending on the package. Every image is individually edited for color, tone, and quality.',
    },
    {
      question: 'What is the turnaround time?',
      answer:
        'You receive sneak peeks within 48 hours of your shoot. Full wedding galleries are delivered within 2-3 weeks, and portrait sessions within 1-2 weeks. Video projects typically take 3-4 weeks for final edit.',
    },
    {
      question: 'Do we get the rights to our photos?',
      answer:
        'Yes. Every package includes a personal print release, so you can print and share your images freely. We retain the copyright for portfolio and marketing use, but your personal use is unrestricted.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about working with Lumen Studio.',

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

  contactTitle: 'Check Availability for Your Date',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day to discuss your vision and confirm availability.',

  galleryTitle: 'Recent Work',
  gallerySubtitle: 'A selection of moments captured by Lumen Studio.',
  galleryImages: [
    `${BASE_URL}1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=1200`,
    `${BASE_URL}1444416/pexels-photo-1444416.jpeg?auto=compress&cs=tinysrgb&w=1200`,
    `${BASE_URL}1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=1200`,
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Award-winning photographers and filmmakers who love what they do.',
  team: [
    { name: 'Jordan Avery', role: 'Lead Photographer / Founder', bio: 'Award-winning photographer with 10+ years specializing in weddings and portraiture. Jordan founded Lumen Studio to tell authentic, timeless stories.' },
    { name: 'Casey Morgan', role: 'Cinematographer / Video Lead', bio: 'Filmmaker with a documentary background and 8 years crafting wedding films and brand videos with a cinematic, emotional touch.' },
    { name: 'Riley Chen', role: 'Second Shooter & Editor', bio: 'Photographer and retoucher who works alongside Jordan on weddings and commercial shoots, and handles post-production for the studio.' },
  ],

  pricingTitle: 'Photography and Video Packages',
  pricingSubtitle: 'Transparent packages with flexible add-ons.',
  pricing: [
    { name: 'Portrait Session', price: 'From $350', description: '1-hour portrait session.', features: ['1-hour session', '40+ edited images', 'Online gallery', 'Print release'], popular: false },
    { name: 'Wedding Package', price: 'From $2,800', description: 'Full-day wedding coverage.', features: ['8-hour coverage', '600+ edited images', 'Engagement session', 'Second shooter', 'Online gallery'], popular: true },
    { name: 'Commercial', price: 'Custom quote', description: 'Tailored commercial and video work.', features: ['Custom scope', 'Studio or on-site', 'Professional lighting', 'Full retouching', 'Usage rights'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the Lumen Studio assistant. How can I help you today?",
    placeholder: "Ask about photography, video, or booking...",
    knowledgeBase: [
      "We offer wedding photography, portrait sessions, commercial photography, video production, real estate photography, and event coverage.",
      "For weddings, we recommend booking 8-12 months in advance. For portraits, events, and commercial work, 4-6 weeks is usually enough.",
      "We travel throughout the Greater Metro Area at no additional cost and provide custom travel quotes for destinations beyond that.",
      "A full wedding typically includes 600-800 fully edited images, and portrait sessions include 40-80 edited images depending on the package.",
      "You receive sneak peeks within 48 hours. Full wedding galleries are delivered within 2-3 weeks, portraits within 1-2 weeks, and video within 3-4 weeks.",
      "Every package includes a personal print release so you can print and share freely. We retain copyright for portfolio use.",
      "We have 10+ years of experience, have delivered 450+ projects, and captured 300+ weddings with a 4.9-star client rating.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate, and travel further for weddings and commercial work.",
      "We are available by appointment, seven days a week, including evenings for consultations.",
      "To check availability, use the contact form or call us and we will respond within one business day.",
    ],
  },
};
