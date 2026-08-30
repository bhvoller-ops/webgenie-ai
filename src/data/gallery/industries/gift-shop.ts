import {
  Gift,
  Heart,
  Home,
  Mail,
  ShoppingBasket,
  Building2,
  Award,
  Truck,
  HeartHandshake,
  Star,
  Recycle,
  Users,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const giftShopConfig: IndustryConfig = {
  id: 'gift-shop',
  industryName: 'Gift Shop',
  businessName: 'The Curated Gift Co.',
  tagline: 'Gifts That Mean More.',
  heroTitle: 'Thoughtful Gifts for Every Occasion',
  heroSubtitle:
    'Handmade, local, and one-of-a-kind gifts curated with care. From birthdays to corporate gifting, we help you give something memorable, every single time.',
  phone: '(555) 834-1129',
  email: 'hello@curatedgiftco.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Sat 10am-7pm, Sun 12pm-5pm',
  yearsExperience: '7+',
  licenseNumber: 'GS-3847102',

  colors: {
    primary: '#0D9488',
    primaryDark: '#0F766E',
    primaryLight: '#CCFBF1',
    accent: '#BE185D',
    background: '#FFFFFF',
    surface: '#F0FDFA',
    text: '#0F2A26',
    textMuted: '#5B7A74',
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

  heroImage: 'https://images.pexels.com/photos/8889507/pexels-photo-8889507.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'Handmade • Local Artisans • Custom Baskets',
  ctaPrimary: 'Shop Gifts',
  ctaSecondary: 'Build a Custom Basket',

  stats: [
    { value: '7+', label: 'Years Curating' },
    { value: '3,000+', label: 'Gifts Curated' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '50+', label: 'Local Artisans' },
  ],

  services: [
    {
      icon: Gift,
      title: 'Handmade Gifts',
      description:
        'Unique, handcrafted gifts from independent makers. Pottery, candles, soaps, and one-of-a-kind pieces you will not find in big-box stores.',
      features: ['Handcrafted', 'One-of-a-kind', 'Small-batch', 'Locally made'],
    },
    {
      icon: Heart,
      title: 'Local Artisan Goods',
      description:
        'A curated selection of goods from 50+ local artisans. Food, art, home goods, and more — every purchase supports a local maker.',
      features: ['50+ artisans', 'Food & treats', 'Art & prints', 'Supports local'],
    },
    {
      icon: Home,
      title: 'Home Decor',
      description:
        'Beautiful, distinctive home decor that makes a house feel like home. Wall art, textiles, ceramics, and seasonal accents for every style.',
      features: ['Wall art', 'Textiles & throws', 'Ceramics', 'Seasonal accents'],
    },
    {
      icon: Mail,
      title: 'Greeting Cards & Stationery',
      description:
        'Handpicked cards and stationery for every occasion. Letterpress, handmade, and locally designed — plus custom printing available.',
      features: ['Letterpress cards', 'Locally designed', 'Custom printing', 'Every occasion'],
    },
    {
      icon: ShoppingBasket,
      title: 'Custom Gift Baskets',
      description:
        'We build custom gift baskets tailored to the recipient and occasion. Tell us about them and we will curate something they will love.',
      features: ['Fully customizable', 'Any occasion', 'Any budget', 'Beautifully wrapped'],
    },
    {
      icon: Building2,
      title: 'Corporate Gifting',
      description:
        'Client gifts, employee appreciation, and event favors at scale. Branded packaging and bulk ordering with a dedicated account manager.',
      features: ['Client gifts', 'Employee rewards', 'Branded packaging', 'Bulk ordering'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Curated With Care',
      description:
        'Every item in our shop is hand-selected by our team. We test, touch, and fall in love with each piece before it makes the shelf.',
    },
    {
      icon: HeartHandshake,
      title: 'Supports Local Makers',
      description:
        'We partner with 50+ local artisans. Every purchase directly supports a maker in our community and keeps creativity thriving.',
    },
    {
      icon: Truck,
      title: 'Custom & Delivered',
      description:
        'Custom baskets built to order and delivered locally. We handle the curation, wrapping, and delivery so gifting is effortless for you.',
    },
    {
      icon: Recycle,
      title: 'Sustainable Packaging',
      description:
        'We use recyclable, reusable, and beautiful packaging. Gifts that look gorgeous and are kind to the planet — wrapping you will not want to toss.',
    },
  ],
  whyUsTitle: 'Why Givers Choose The Curated Gift Co.',
  whyUsSubtitle:
    'We do not just sell gifts — we help you give something meaningful, made by real people, wrapped with real care.',

  process: [
    {
      step: '01',
      title: 'Tell Us About Them',
      description:
        'Share the occasion, the recipient, and your budget. The more you tell us, the better we can curate the perfect gift.',
    },
    {
      step: '02',
      title: 'We Curate Your Gift',
      description:
        'Our team handpicks items from our shop and local artisans. You approve the selection before we build and wrap your gift.',
    },
    {
      step: '03',
      title: 'We Wrap & Deliver',
      description:
        'Beautiful, sustainable wrapping and local delivery. We can also ship nationwide or have it ready for in-store pickup.',
    },
    {
      step: '04',
      title: 'They Love It',
      description:
        'Your recipient opens a thoughtful, one-of-a-kind gift. You look like a gifting genius. Win-win. Come back for the next occasion.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'From idea to unforgettable gift.',

  testimonials: [
    {
      name: 'Grace H.',
      location: 'Brookside',
      rating: 5,
      text: 'I needed a retirement gift for my boss and had no idea what to get. They curated the most beautiful basket of local goods and she was blown away. Now I go here for every occasion.',
    },
    {
      name: 'Evan C.',
      location: 'Fairfield',
      rating: 5,
      text: 'We use them for all our corporate client gifts. The branded packaging is gorgeous, the gifts are always unique, and our account manager makes bulk ordering effortless. A real partner.',
    },
    {
      name: 'Yuki M.',
      location: 'Eastside',
      rating: 5,
      text: 'The handmade candles and pottery are stunning. I love that I am supporting local artisans with every purchase. The wrapping alone is worth the visit — so beautiful.',
    },
  ],
  testimonialsTitle: 'What Our Customers Say',
  testimonialsSubtitle: 'Thoughtful gifts, happy recipients, effortless gifting.',

  faqs: [
    {
      question: 'Can you build a custom gift basket for any occasion?',
      answer:
        'Yes! Tell us the occasion, recipient, and budget, and we will curate a basket just for them. We can accommodate any theme, dietary need, or personal preference.',
    },
    {
      question: 'Do you offer corporate gifting at scale?',
      answer:
        'Absolutely. We handle client gifts, employee appreciation, and event favors with branded packaging and a dedicated account manager. Contact us for bulk pricing.',
    },
    {
      question: 'Do you offer delivery and shipping?',
      answer:
        'Yes. We offer local delivery within our service area and nationwide shipping. Custom baskets and corporate orders can also be picked up in-store.',
    },
    {
      question: 'Are your products locally made?',
      answer:
        'Many of them are. We partner with 50+ local artisans and also carry select fair-trade goods from independent makers. Every item is chosen with care.',
    },
    {
      question: 'Do you offer gift wrapping?',
      answer:
        'Yes, complimentary gift wrapping is included with every purchase. We use beautiful, sustainable packaging that makes every gift feel special.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about gifting with us.',

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

  contactTitle: 'Let Us Help You Give the Perfect Gift',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day to start curating your gift.',

  galleryTitle: 'Gifts We Love Right Now',
  gallerySubtitle: 'New arrivals, custom baskets, and artisan favorites.',
  galleryImages: [
    'https://images.pexels.com/photos/8889507/pexels-photo-8889507.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/8889507/pexels-photo-8889507.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/8889507/pexels-photo-8889507.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Curators and makers who love helping you give well.',
  team: [
    { name: 'Olivia Park', role: 'Owner & Head Curator', bio: 'Olivia opened The Curated Gift Co. to connect local artisans with people who want to give something meaningful. She personally selects every item in the shop.' },
    { name: 'Marcus Reid', role: 'Corporate Gifting Manager', bio: 'Marcus handles all corporate accounts, from single client gifts to bulk event favors, with branded packaging and a personal touch.' },
    { name: 'Tessa Wong', role: 'Basket Designer', bio: 'Tessa has an eye for pairing items into gorgeous, cohesive gift baskets that make every recipient feel truly seen.' },
  ],

  pricingTitle: 'Gifting Options',
  pricingSubtitle: 'From a single card to a corporate order of 500.',
  pricing: [
    { name: 'Shop In-Store', price: 'Any budget', description: 'Browse and buy at your own pace.', features: ['Full collection', 'Complimentary wrapping', 'Cards & stationery', 'Local artisan goods'], popular: false },
    { name: 'Custom Gift Basket', price: 'From $50', description: 'We curate a basket just for them.', features: ['Fully customizable', 'Any occasion', 'You approve first', 'Beautiful wrapping', 'Local delivery'], popular: true },
    { name: 'Corporate Gifting', price: 'Volume pricing', description: 'Client and employee gifts at scale.', features: ['Dedicated manager', 'Branded packaging', 'Bulk ordering', 'Volume discounts', 'Nationwide shipping'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am The Curated Gift Co. assistant. Who are you shopping for today?",
    placeholder: "Ask about gifts, baskets, or corporate orders...",
    knowledgeBase: [
      "We offer handmade gifts, local artisan goods, home decor, greeting cards and stationery, custom gift baskets, and corporate gifting.",
      "Yes! Tell us the occasion, recipient, and budget, and we will curate a custom gift basket just for them. You approve the selection before we build it.",
      "We handle corporate gifting at scale including client gifts, employee appreciation, and event favors with branded packaging and a dedicated account manager.",
      "We offer local delivery within our service area and nationwide shipping. Custom baskets and corporate orders can also be picked up in-store.",
      "Many of our products are locally made. We partner with 50+ local artisans and also carry select fair-trade goods from independent makers.",
      "Complimentary gift wrapping is included with every purchase. We use beautiful, sustainable packaging that makes every gift feel special.",
      "Our custom gift baskets start at $50 and are fully customizable for any occasion and budget. You approve the selection before we build and wrap.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are Monday through Saturday 10am to 7pm, and Sunday 12pm to 5pm.",
      "We have 7+ years curating, over 3,000 gifts curated, and partner with 50+ local artisans.",
    ],
  },
};
