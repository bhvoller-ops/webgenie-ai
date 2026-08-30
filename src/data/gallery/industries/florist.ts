import {
  Heart,
  Flower2,
  Leaf,
  Building2,
  PartyPopper,
  Truck,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
  Sparkles,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const floristConfig: IndustryConfig = {
  id: 'florist',
  industryName: 'Florist',
  businessName: 'Bloom & Petal Florist',
  tagline: 'Fresh Flowers, Thoughtfully Arranged.',
  heroTitle: 'Beautiful Blooms for Every Occasion',
  heroSubtitle:
    'From wedding florals to everyday bouquets, our florists craft fresh, seasonal arrangements with a personal touch. Same-day delivery available on orders before noon.',
  phone: '(555) 621-4470',
  email: 'orders@bloomandpetal.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Sat 8am-6pm',
  yearsExperience: '18+',
  licenseNumber: 'FL-7720413',

  colors: {
    primary: '#15803D',
    primaryDark: '#166534',
    primaryLight: '#DCFCE7',
    accent: '#BE185D',
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

  heroImage: 'https://images.pexels.com/photos/5409690/pexels-photo-5409690.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'Same-Day Delivery • Locally Grown',
  ctaPrimary: 'Order Flowers',
  ctaSecondary: 'View Services',

  stats: [
    { value: '18+', label: 'Years Experience' },
    { value: '45,000+', label: 'Arrangements Made' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '100%', label: 'Fresh Guarantee' },
  ],

  services: [
    {
      icon: Heart,
      title: 'Wedding Florals',
      description:
        'Bouquets, centerpieces, ceremony arches, and full wedding floral design. We work with you to match your colors, theme, and budget.',
      features: ['Bridal bouquets', 'Centerpieces', 'Ceremony arches', 'Boutonnieres & corsages'],
    },
    {
      icon: Flower2,
      title: 'Sympathy Arrangements',
      description:
        'Thoughtful sympathy and funeral flowers delivered with care. Wreaths, sprays, and standing arrangements for services and home.',
      features: ['Funeral sprays', 'Standing wreaths', 'Casket sprays', 'Sympathy baskets'],
    },
    {
      icon: Leaf,
      title: 'Everyday Bouquets',
      description:
        'Fresh, seasonal bouquets for birthdays, anniversaries, or just because. Choose from our daily selection or custom order.',
      features: ['Seasonal bouquets', 'Custom arrangements', 'Mixed stems', 'Single-variety bunches'],
    },
    {
      icon: Building2,
      title: 'Corporate Flowers',
      description:
        'Weekly fresh flowers for offices, lobbies, and reception areas. We deliver and refresh arrangements on a schedule that suits you.',
      features: ['Weekly office flowers', 'Lobby arrangements', 'Reception desk', 'Event florals'],
    },
    {
      icon: PartyPopper,
      title: 'Event Decor',
      description:
        'Floral decor for parties, galas, and celebrations. From statement installations to table runners, we design to your theme.',
      features: ['Statement installations', 'Table runners', 'Stage florals', 'Photo backdrops'],
    },
    {
      icon: Truck,
      title: 'Subscription Deliveries',
      description:
        'Fresh flowers delivered to your home or office weekly or bi-weekly. A simple way to always have fresh blooms on hand.',
      features: ['Weekly or bi-weekly', 'Customizable styles', 'Flexible pause', 'Free delivery'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Master Florists',
      description:
        'Our team includes certified florists with decades of combined experience in wedding and event floral design.',
    },
    {
      icon: Clock,
      title: 'Same-Day Delivery',
      description:
        'Order before noon for same-day delivery across the metro area. Perfect for last-minute gifts and celebrations.',
    },
    {
      icon: Users,
      title: 'Locally Sourced',
      description:
        'We partner with local growers for the freshest seasonal stems, supporting our community and reducing our footprint.',
    },
    {
      icon: ThumbsUp,
      title: 'Fresh Guarantee',
      description:
        'Every arrangement is backed by our freshness guarantee. If your flowers do not last at least five days, we replace them free.',
    },
  ],
  whyUsTitle: 'Why Bloom & Petal',
  whyUsSubtitle:
    'Fresh flowers, expert design, and a personal touch on every arrangement.',

  process: [
    {
      step: '01',
      title: 'Browse or Custom Order',
      description:
        'Choose from our daily selection online or call us to design a custom arrangement for your occasion.',
    },
    {
      step: '02',
      title: 'We Craft Your Arrangement',
      description:
        'Our florists hand-select fresh stems and craft your arrangement with care and attention to detail.',
    },
    {
      step: '03',
      title: 'Quality Check',
      description:
        'Every arrangement is inspected for freshness and design quality before it leaves our shop.',
    },
    {
      step: '04',
      title: 'Delivered With Care',
      description:
        'We deliver your flowers in temperature-controlled vehicles to keep them fresh from our shop to your door.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'From order to delivery, fresh flowers made simple.',

  testimonials: [
    {
      name: 'Danielle F.',
      location: 'Brookside',
      rating: 5,
      text: 'Bloom & Petal did all the flowers for our wedding and they were breathtaking. The bouquets, the centerpieces, the ceremony arch — everything was perfect and stayed fresh all day.',
    },
    {
      name: 'Kevin O.',
      location: 'Fairfield',
      rating: 5,
      text: 'I order from Bloom & Petal for every anniversary and birthday. Same-day delivery has saved me more than once, and the arrangements always look better than the photos online.',
    },
    {
      name: 'Maria L.',
      location: 'Eastside',
      rating: 5,
      text: 'Their weekly office subscription has completely transformed our reception area. Clients always comment on the flowers, and the team is so friendly and reliable.',
    },
  ],
  testimonialsTitle: 'What Our Customers Say',
  testimonialsSubtitle: 'Fresh flowers and happy customers are our signature.',

  faqs: [
    {
      question: 'Do you offer same-day delivery?',
      answer:
        'Yes! Orders placed before noon are eligible for same-day delivery across the metro area. Custom and large orders may require additional time.',
    },
    {
      question: 'Can I customize my arrangement?',
      answer:
        'Absolutely. Call or visit us to design a custom arrangement. Tell us your colors, occasion, and budget, and our florists will create something unique.',
    },
    {
      question: 'How far in advance should I order wedding flowers?',
      answer:
        'We recommend booking wedding florals 3 to 6 months in advance to secure your date. A consultation lets us understand your vision and provide an accurate quote.',
    },
    {
      question: 'What is your freshness guarantee?',
      answer:
        'Every arrangement is guaranteed fresh for at least five days. If your flowers do not meet this standard, contact us and we will replace them free of charge.',
    },
    {
      question: 'Do you offer corporate flower subscriptions?',
      answer:
        'Yes. We deliver and refresh fresh arrangements for offices on a weekly or bi-weekly schedule. Contact us for a custom subscription quote.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about ordering flowers.',

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

  contactTitle: 'Order Fresh Flowers Today',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day.',

  galleryTitle: 'Our Recent Floral Designs',
  gallerySubtitle: 'A look at the blooms we love to create.',
  galleryImages: [
    'https://images.pexels.com/photos/5409690/pexels-photo-5409690.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/5409690/pexels-photo-5409690.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/5409690/pexels-photo-5409690.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Master florists who love what they do.',
  team: [
    { name: 'Eleanor Whitfield', role: 'Owner & Master Florist', bio: 'Eleanor founded Bloom & Petal 18 years ago and is a certified florist specializing in wedding and event design.' },
    { name: 'Grace Thompson', role: 'Lead Wedding Florist', bio: 'Grace designs our wedding collections and has created florals for over 400 weddings across the region.' },
    { name: 'Tom Alvarez', role: 'Delivery & Logistics Lead', bio: 'Tom ensures every arrangement arrives fresh and on time, managing our delivery fleet and corporate subscriptions.' },
  ],

  pricingTitle: 'Floral Arrangement Pricing',
  pricingSubtitle: 'Transparent pricing for every occasion.',
  pricing: [
    { name: 'Everyday Bouquet', price: 'From $35', description: 'Fresh seasonal arrangement.', features: ['Seasonal stems', 'Designer wrap', 'Same-day delivery', 'Fresh guarantee'], popular: false },
    { name: 'Signature Arrangement', price: 'From $75', description: 'Premium mixed arrangement.', features: ['Premium stems', 'Custom design', 'Vase included', 'Same-day delivery', 'Fresh guarantee'], popular: true },
    { name: 'Wedding Consultation', price: 'Custom Quote', description: 'Full wedding floral design.', features: ['Design consultation', 'Bouquets & centerpieces', 'Ceremony florals', 'Delivery & setup', 'Day-of support'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the Bloom & Petal Florist assistant. How can I help you today?",
    placeholder: "Ask about flowers and arrangements...",
    knowledgeBase: [
      "We offer wedding florals, sympathy arrangements, everyday bouquets, corporate flowers, event decor, and subscription deliveries.",
      "Yes, we offer same-day delivery on orders placed before noon across the metro area.",
      "You can customize any arrangement. Call or visit us with your colors, occasion, and budget and our florists will design something unique.",
      "For wedding florals, book 3 to 6 months in advance to secure your date and get an accurate quote.",
      "Every arrangement is guaranteed fresh for at least five days. If not, we replace it free of charge.",
      "We offer corporate flower subscriptions with weekly or bi-weekly delivery and refresh.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are Monday through Saturday, 8am to 6pm.",
      "We have 18+ years of experience and have created over 45,000 arrangements.",
      "Everyday bouquets start at $35, signature arrangements at $75, and wedding floral design is custom quoted.",
    ],
  },
};
