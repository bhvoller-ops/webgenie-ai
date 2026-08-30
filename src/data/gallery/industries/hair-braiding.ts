import {
  Crown,
  Grid2x2,
  Waves,
  Sparkles,
  Flower2,
  Heart,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
  Search,
  Scissors,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

const BASE_URL = 'https://images.pexels.com/photos/';

export const hairBraidingConfig: IndustryConfig = {
  id: 'hair-braiding',
  industryName: 'Hair Braiding Shop',
  businessName: 'Crown of Braids',
  tagline: 'Crowned in Culture, Styled with Care.',
  heroTitle: 'Beautiful Braids, Expertly Crafted',
  heroSubtitle:
    'Professional hair braiding specializing in box braids, cornrows, twists, locs, and protective styles. Skilled hands, quality hair, and a comfortable chair — so you leave feeling crowned.',
  phone: '(555) 633-8814',
  email: 'bookings@crownofbraids.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Tue-Sun 9am-8pm',
  yearsExperience: '14+',
  licenseNumber: 'BRAID-5530-14',

  colors: {
    primary: '#7C2D12',
    primaryDark: '#571C0F',
    primaryLight: '#FEF3C7',
    accent: '#B45309',
    background: '#FFFFFF',
    surface: '#FFFBEB',
    text: '#1A0E07',
    textMuted: '#6B5A4E',
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

  heroImage: `${BASE_URL}3993465/pexels-photo-3993465.jpeg?auto=compress&cs=tinysrgb&w=1200`,
  heroBadge: 'Natural Hair Specialists • 14+ Years',
  ctaPrimary: 'Book Your Appointment',
  ctaSecondary: 'View Styles',

  stats: [
    { value: '14+', label: 'Years Braiding' },
    { value: '9,000+', label: 'Clients Styled' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '50+', label: 'Braid Styles' },
  ],

  services: [
    {
      icon: Grid2x2,
      title: 'Box Braids',
      description:
        'Classic individual box braids in your choice of length, size, and color. Lightweight, versatile, and a timeless protective style that lasts for weeks with proper care.',
      features: ['Small, medium, or jumbo', 'Any length', 'Color options', 'Lightweight install'],
    },
    {
      icon: Waves,
      title: 'Cornrows',
      description:
        'Neat, precise cornrows in straight-back or creative geometric designs. A foundational protective style that can be worn alone or as the base for other styles.',
      features: ['Straight-back', 'Geometric designs', 'Feed-in options', 'Lasts 2-4 weeks'],
    },
    {
      icon: Sparkles,
      title: 'Senegalese Twists',
      description:
        'Smooth, rope-like twists that are soft to the touch and incredibly versatile. Senegalese twists are lightweight, low-tension, and beautiful worn up or down.',
      features: ['Rope twist technique', 'Low tension', 'Various lengths', 'Long-lasting'],
    },
    {
      icon: Crown,
      title: 'Goddess Locs',
      description:
        'Soft, bohemian locs with curled ends for a romantic, natural look. Goddess locs give you the beauty of locs without the long-term commitment.',
      features: ['Bohemian curls', 'Faux locs look', 'Various lengths', 'Lightweight'],
    },
    {
      icon: Flower2,
      title: 'Knotless Braids',
      description:
        'Feed-in box braids that start with your natural hair for a tension-free, scalp-friendly install. The most comfortable braids you will ever wear.',
      features: ['Tension-free', 'Scalp-friendly', 'Natural blend', 'Lightweight'],
    },
    {
      icon: Heart,
      title: 'Hair Maintenance & Consultation',
      description:
        'Keep your braids fresh and your natural hair healthy. We offer wash, retouch, takedown, and consultations to help you choose the best style for your hair and lifestyle.',
      features: ['Braid refresh', 'Takedown service', 'Scalp care', 'Style consultation'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: '14+ Years of Experience',
      description:
        'Over a decade of braiding every hair type and texture. Our experience means faster, neater, longer-lasting styles and a stylist who knows exactly what will work for you.',
    },
    {
      icon: Clock,
      title: 'Respect for Your Time',
      description:
        'We book appointments that start on time and give you an honest estimate of how long your style will take. No all-day waits, no surprises.',
    },
    {
      icon: Users,
      title: 'Gentle on Your Scalp',
      description:
        'Protective styles should not hurt. We use low-tension techniques and listen to your comfort throughout the install. Your edges and scalp are always protected.',
    },
    {
      icon: ThumbsUp,
      title: 'Quality Hair Included',
      description:
        'We use premium braiding hair that is pre-stretched, lightweight, and gentle on your hands and scalp. You can also bring your own hair if you prefer.',
    },
  ],
  whyUsTitle: 'Why Clients Choose Crown of Braids',
  whyUsSubtitle:
    'Skilled hands, quality products, and genuine care for your natural hair and your comfort.',

  process: [
    {
      step: '01',
      title: 'Book & Consult',
      description:
        'Book your appointment and tell us the style, length, and size you want. We confirm the time needed and whether to bring or buy hair.',
    },
    {
      step: '02',
      title: 'Prep & Cleanse',
      description:
        'We wash, deep condition, and blow-dry your hair to create the perfect base for your braids. Clean hair means longer-lasting styles.',
    },
    {
      step: '03',
      title: 'The Braid',
      description:
        'Sit back and relax while we work. We use low-tension techniques and check in on your comfort throughout the install.',
    },
    {
      step: '04',
      title: 'Dip & Style',
      description:
        'We seal your ends, style your braids, and send you home with a care guide to keep them fresh for weeks.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'A comfortable experience from booking to final style.',

  testimonials: [
    {
      name: 'Aaliyah B.',
      location: 'Brookside',
      rating: 5,
      text: 'My knotless braids are the most comfortable I have ever had. No tension, no headaches, and they still look fresh three weeks later. The shop is clean and welcoming and she really listens to what you want.',
    },
    {
      name: 'Grace M.',
      location: 'Fairfield',
      rating: 5,
      text: 'I have been coming here for two years and will not go anywhere else. My box braids always last at least eight weeks and my edges are always protected. The quality and consistency are unmatched.',
    },
    {
      name: 'Tanya R.',
      location: 'Eastside',
      rating: 5,
      text: 'My goddess locs were stunning and so lightweight I forgot I had them in. The consultation helped me pick the perfect length and color. I felt pampered the whole time. Highly recommend.',
    },
  ],
  testimonialsTitle: 'What Our Clients Say',
  testimonialsSubtitle: 'Beautiful braids and happy clients are our specialty.',

  faqs: [
    {
      question: 'How long do braids last?',
      answer:
        'With proper care, box braids and twists last 6 to 8 weeks, cornrows last 2 to 4 weeks, and goddess locs last 6 to 10 weeks. We send you home with a care guide to maximize the life of your style.',
    },
    {
      question: 'Do I need to bring my own braiding hair?',
      answer:
        'No, we provide premium pre-stretched braiding hair in a range of colors and lengths for an additional fee. You are also welcome to bring your own hair if you have a preference.',
    },
    {
      question: 'Will the braids damage my hair?',
      answer:
        'When installed correctly with low tension and cared for properly, braids are a protective style that actually helps your hair grow. We never braid too tight and we protect your edges.',
    },
    {
      question: 'How should I prepare for my appointment?',
      answer:
        'Come with clean, detangled hair if possible, or arrive 30 minutes early for a wash and blow-dry. Eat before long appointments and bring headphones or a book — braiding takes time.',
    },
    {
      question: 'Do you offer takedown services?',
      answer:
        'Yes. Professional takedown is available and recommended to prevent breakage. We also offer refresh services to extend the life of your current braids without a full reinstall.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about braiding with us.',

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

  contactTitle: 'Book Your Braid Appointment',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day to confirm your appointment.',

  galleryTitle: 'Recent Braid Styles',
  gallerySubtitle: 'A look at the crowns we have created.',
  galleryImages: [
    `${BASE_URL}3993465/pexels-photo-3993465.jpeg?auto=compress&cs=tinysrgb&w=1200`,
    `${BASE_URL}3993452/pexels-photo-3993452.jpeg?auto=compress&cs=tinysrgb&w=1200`,
    `${BASE_URL}3992874/pexels-photo-3992874.jpeg?auto=compress&cs=tinysrgb&w=1200`,
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Skilled braiders who treat your hair and your time with respect.',
  team: [
    { name: 'Adaeze Okafor', role: 'Master Braider & Owner', bio: 'Fourteen years of braiding experience and a natural hair specialist. Adaeze founded Crown of Braids to offer expert, gentle, beautiful protective styling to the community.' },
    { name: 'Imani Brooks', role: 'Senior Braider', bio: 'Our knotless braid and twist specialist. Imani is known for clean parts, even tension, and styles that last.' },
    { name: 'Zara Diallo', role: 'Braider', bio: 'Specializes in cornrows, goddess locs, and creative updos. Zara brings an artist’s eye to every style she creates.' },
  ],

  pricingTitle: 'Braid Style Pricing',
  pricingSubtitle: 'Clear pricing based on style, size, and length.',
  pricing: [
    { name: 'Cornrows', price: 'From $65', description: 'Straight-back or simple designs.', features: ['Consultation', 'Wash & blow-dry', 'Neat parts', 'Style finish', 'Care guide'], popular: false },
    { name: 'Box Braids / Twists', price: 'From $180', description: 'Most popular protective styles.', features: ['Small, medium, or jumbo', 'Any length', 'Color options', 'Premium hair available', 'Dip & style', 'Care guide'], popular: true },
    { name: 'Knotless / Goddess Locs', price: 'From $220', description: 'Tension-free and bohemian styles.', features: ['Low-tension install', 'Scalp-friendly', 'Various lengths', 'Premium hair included', 'Dip & style', 'Care guide'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the Crown of Braids assistant. How can I help you today?",
    placeholder: "Ask about our braiding services...",
    knowledgeBase: [
      "We specialize in box braids, cornrows, Senegalese twists, goddess locs, knotless braids, and hair maintenance and consultation.",
      "With proper care, box braids and twists last 6 to 8 weeks, cornrows last 2 to 4 weeks, and goddess locs last 6 to 10 weeks.",
      "You do not need to bring your own hair. We provide premium pre-stretched braiding hair for an additional fee, or you can bring your own.",
      "When installed correctly with low tension, braids are a protective style that helps your hair grow. We never braid too tight and we protect your edges.",
      "Come with clean, detangled hair if possible, or arrive 30 minutes early for a wash and blow-dry. Eat before long appointments and bring headphones or a book.",
      "Yes, we offer professional takedown services to prevent breakage, as well as refresh services to extend the life of your current braids.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are Tuesday through Sunday, 9am to 8pm. We are closed Mondays.",
      "We have 14+ years of braiding experience and have styled over 9,000 clients.",
      "To book an appointment, call us at (555) 633-8814 or fill out our contact form online.",
    ],
  },
};
