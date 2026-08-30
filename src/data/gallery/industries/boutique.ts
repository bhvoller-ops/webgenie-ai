import {
  Shirt,
  ShoppingBag,
  Gem,
  Sparkles,
  HeartHandshake,
  Gift,
  Award,
  Truck,
  Heart,
  Star,
  Tag,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const boutiqueConfig: IndustryConfig = {
  id: 'boutique',
  industryName: 'Boutique & Clothing',
  businessName: 'Velvet & Vine Boutique',
  tagline: 'Style That Tells Your Story.',
  heroTitle: 'Curated Fashion for the Modern You',
  heroSubtitle:
    'Thoughtfully selected clothing, accessories, and gifts for women and men who love to stand out. Personal styling, seasonal collections, and pieces you will not find anywhere else.',
  phone: '(555) 628-3344',
  email: 'hello@velvetandvine.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Sat 10am-7pm, Sun 12pm-5pm',
  yearsExperience: '8+',
  licenseNumber: 'BT-7291045',

  colors: {
    primary: '#9F1239',
    primaryDark: '#881337',
    primaryLight: '#FCE7F3',
    accent: '#0D9488',
    background: '#FFFFFF',
    surface: '#FDF2F8',
    text: '#2E1020',
    textMuted: '#7A5A68',
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

  heroImage: 'https://images.pexels.com/photos/1488470/pexels-photo-1488470.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'Curated Collections • Personal Styling • Locally Loved',
  ctaPrimary: 'Shop New Arrivals',
  ctaSecondary: 'Book a Styling Session',

  stats: [
    { value: '8+', label: 'Years Styling' },
    { value: '5,000+', label: 'Happy Customers' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '50+', label: 'New Arrivals Weekly' },
  ],

  services: [
    {
      icon: Shirt,
      title: "Women's Fashion",
      description:
        'Curated womenswear from emerging designers and trusted brands. Dresses, tops, denim, outerwear, and statement pieces for every occasion.',
      features: ['Dresses & tops', 'Denim & pants', 'Outerwear', 'Sizes XS-3X'],
    },
    {
      icon: ShoppingBag,
      title: "Men's Fashion",
      description:
        'Modern menswear with a focus on fit and fabric. Shirts, polos, denim, jackets, and accessories that elevate any wardrobe.',
      features: ['Shirts & polos', 'Denim & chinos', 'Jackets & knits', 'Sizes S-2XL'],
    },
    {
      icon: Gem,
      title: 'Accessories & Jewelry',
      description:
        'The finishing touches. Handpicked jewelry, bags, belts, scarves, and hats that transform an outfit from simple to stunning.',
      features: ['Handmade jewelry', 'Bags & wallets', 'Scarves & belts', 'Seasonal hats'],
    },
    {
      icon: Sparkles,
      title: 'Seasonal Collections',
      description:
        'Fresh drops every season, from resort florals to cozy winter knits. Stay ahead of trends with our curated seasonal edits.',
      features: ['Spring florals', 'Summer resort', 'Fall layers', 'Winter knits'],
    },
    {
      icon: HeartHandshake,
      title: 'Personal Styling',
      description:
        'One-on-one sessions with our stylists to refresh your wardrobe, dress for an event, or build a capsule collection that works for your life.',
      features: ['Wardrobe audit', 'Event styling', 'Capsule building', 'Color analysis'],
    },
    {
      icon: Gift,
      title: 'Gift Cards',
      description:
        'The perfect gift for the fashion lover in your life. Available in any amount, redeemable in-store and online, with beautiful packaging.',
      features: ['Any amount', 'In-store & online', 'Digital or physical', 'Gift wrapping'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Curated, Not Mass-Market',
      description:
        'We handpick every piece in the store. No racks of sameness — just thoughtfully selected fashion you will love and actually wear.',
    },
    {
      icon: Heart,
      title: 'Personal Service',
      description:
        'Our stylists know your name, your style, and your size. We offer honest advice and help you find pieces that truly work for you.',
    },
    {
      icon: Truck,
      title: 'Easy Returns & Exchanges',
      description:
        'Not in love? Return within 30 days for a full refund or exchange. We want you to be thrilled with every purchase.',
    },
    {
      icon: Star,
      title: 'Locally Loved',
      description:
        'We have been a neighborhood favorite for 8 years. Our customers come back because they trust our taste and our team.',
    },
  ],
  whyUsTitle: 'Why Shoppers Love Velvet & Vine',
  whyUsSubtitle:
    'We do not just sell clothes — we help you build a wardrobe that feels like you, with service that goes beyond the sale.',

  process: [
    {
      step: '01',
      title: 'Visit or Book Online',
      description:
        'Stop by the boutique or book a styling session online. Tell us about your style, your life, and what you are looking for.',
    },
    {
      step: '02',
      title: 'Get Styled',
      description:
        'Our stylists pull pieces tailored to you. Try on in our fitting room with honest feedback and expert advice.',
    },
    {
      step: '03',
      title: 'Build Your Wardrobe',
      description:
        'Take home pieces you love. We note your sizes and preferences so we can alert you when new arrivals match your style.',
    },
    {
      step: '04',
      title: 'Come Back & Refresh',
      description:
        'Seasonal drops, VIP previews, and personal calls when we find something perfect for you. Your wardrobe, always fresh.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'From browsing to a wardrobe you love.',

  testimonials: [
    {
      name: 'Olivia B.',
      location: 'Brookside',
      rating: 5,
      text: 'I walked in for a dress for a wedding and walked out with a whole new confidence. The stylist knew exactly what would flatter me. I get compliments every time I wear their pieces.',
    },
    {
      name: 'Marcus D.',
      location: 'Fairfield',
      rating: 5,
      text: 'Finally a boutique with great menswear that is not boring. The staff helped me build a capsule wardrobe and I actually enjoy getting dressed now. The quality is outstanding.',
    },
    {
      name: 'Priya S.',
      location: 'Eastside',
      rating: 5,
      text: 'The personal styling session was a game changer. They helped me define my style and I have never had so many pieces I actually wear. The seasonal drops keep me coming back.',
    },
  ],
  testimonialsTitle: 'What Our Customers Say',
  testimonialsSubtitle: 'Style, service, and a wardrobe you will love.',

  faqs: [
    {
      question: 'Do you offer plus sizes?',
      answer:
        'Yes! We carry sizes XS to 3X in womenswear and S to 2XL in menswear. We believe great style is for every body, and we are always expanding our size range.',
    },
    {
      question: 'What is your return policy?',
      answer:
        'Returns and exchanges are accepted within 30 days of purchase with tags attached and original receipt. Sale items are final sale unless otherwise noted.',
    },
    {
      question: 'How does personal styling work?',
      answer:
        'Book a free 45-minute session online or in-store. Tell us your goals, and our stylists pull a personalized selection. There is no obligation to buy — we just love helping you look great.',
    },
    {
      question: 'Do you offer gift wrapping?',
      answer:
        'Yes, complimentary gift wrapping is available on any purchase. We also offer digital and physical gift cards in any amount.',
    },
    {
      question: 'How often do you get new arrivals?',
      answer:
        'New pieces arrive weekly, with major seasonal drops four times a year. Follow us on social media or join our VIP list for first access to new collections.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about shopping with us.',

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

  contactTitle: 'Visit Us or Book a Styling Session',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day to schedule your styling session.',

  galleryTitle: 'Our Latest Collections',
  gallerySubtitle: 'Seasonal drops, styling sessions, and customer favorites.',
  galleryImages: [
    'https://images.pexels.com/photos/1488470/pexels-photo-1488470.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/1488470/pexels-photo-1488470.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/1488470/pexels-photo-1488470.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Stylists who love helping you look and feel your best.',
  team: [
    { name: 'Charlotte Avery', role: 'Owner & Head Stylist', bio: 'With 15 years in fashion retail, Charlotte opened Velvet & Vine to bring curated, personal styling to the neighborhood.' },
    { name: 'Devon Mitchell', role: 'Menswear Stylist', bio: 'Devon has an eye for modern menswear and loves helping guys discover that getting dressed can be fun.' },
    { name: 'Aria Kim', role: 'Womenswear & Accessories Stylist', bio: 'Aria tracks every trend and translates it into wearable, flattering pieces for real women.' },
  ],

  pricingTitle: 'Styling Services',
  pricingSubtitle: 'Personal styling is always free. Here is what we offer.',
  pricing: [
    { name: 'Walk-In Shopping', price: 'Free', description: 'Browse and shop at your own pace.', features: ['No appointment needed', 'Full collection access', 'Fitting room support', 'Honest style advice'], popular: false },
    { name: 'Personal Styling Session', price: 'Free', description: '45 minutes with a dedicated stylist.', features: ['One-on-one', 'Personalized selection', 'Wardrobe planning', 'VIP new-arrival alerts', 'No purchase required'], popular: true },
    { name: 'Wardrobe Audit & Capsule', price: 'From $75', description: 'In-home or in-store wardrobe refresh.', features: ['2-hour session', 'Wardrobe audit', 'Capsule collection plan', 'Personalized lookbook', 'Follow-up styling calls'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the Velvet & Vine Boutique assistant. Looking for something specific or need styling help?",
    placeholder: "Ask about collections, sizing, or styling...",
    knowledgeBase: [
      "We offer womens fashion, mens fashion, accessories and jewelry, seasonal collections, personal styling, and gift cards.",
      "We carry sizes XS to 3X in womenswear and S to 2XL in menswear. We are always expanding our size range.",
      "Returns and exchanges are accepted within 30 days with tags attached and original receipt. Sale items are final sale.",
      "Personal styling is free! Book a 45-minute session online or in-store with no obligation to buy.",
      "Yes, we offer complimentary gift wrapping on any purchase, plus digital and physical gift cards in any amount.",
      "New pieces arrive weekly, with major seasonal drops four times a year. Join our VIP list for first access.",
      "Our personal styling session is free and includes a one-on-one with a dedicated stylist and personalized selection.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are Monday through Saturday 10am to 7pm, and Sunday 12pm to 5pm.",
      "We have 8+ years of styling experience, 5,000+ happy customers, and 50+ new arrivals every week.",
    ],
  },
};
