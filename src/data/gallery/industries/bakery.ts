import {
  Wheat,
  Cake,
  Croissant,
  Leaf,
  Utensils,
  Sparkles,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
  Coffee,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const bakeryConfig: IndustryConfig = {
  id: 'bakery',
  industryName: 'Bakery',
  businessName: 'Golden Crust Bakery',
  tagline: 'Freshly Baked, Every Morning.',
  heroTitle: 'Baked Fresh, Made With Love',
  heroSubtitle:
    'Artisan breads, custom cakes, and pastries baked from scratch every morning. We use locally milled flour and real butter — no preservatives, no shortcuts.',
  phone: '(555) 418-2260',
  email: 'orders@goldencrustbakery.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Tue-Sun 6am-6pm',
  yearsExperience: '22+',
  licenseNumber: 'BK-9930482',

  colors: {
    primary: '#B45309',
    primaryDark: '#92400E',
    primaryLight: '#FEF3C7',
    accent: '#15803D',
    background: '#FFFFFF',
    surface: '#FFFBEB',
    text: '#1A1208',
    textMuted: '#6B5A48',
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

  heroImage: 'https://images.pexels.com/photos/7405059/pexels-photo-7405059.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'From Scratch • Locally Milled',
  ctaPrimary: 'Order Now',
  ctaSecondary: 'View Menu',

  stats: [
    { value: '22+', label: 'Years Baking' },
    { value: '1,500+', label: 'Custom Cakes' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '100%', label: 'From Scratch' },
  ],

  services: [
    {
      icon: Wheat,
      title: 'Fresh Bread',
      description:
        'Sourdough, baguettes, country loaves, and specialty breads baked fresh every morning using locally milled flour and natural starters.',
      features: ['Sourdough loaves', 'Baguettes', 'Country bread', 'Specialty breads'],
    },
    {
      icon: Cake,
      title: 'Custom Cakes',
      description:
        'Wedding cakes, birthday cakes, and celebration cakes designed to your theme. Custom flavors, fillings, and decorations.',
      features: ['Wedding cakes', 'Birthday cakes', 'Custom designs', 'Dietary options'],
    },
    {
      icon: Croissant,
      title: 'Pastries & Vienoiseries',
      description:
        'Buttery croissants, pain au chocolat, danish, and morning pastries made with European-style butter and layered by hand.',
      features: ['Croissants', 'Pain au chocolat', 'Danish', 'Morning buns'],
    },
    {
      icon: Leaf,
      title: 'Gluten-Free Options',
      description:
        'A dedicated gluten-free kitchen space produces breads, cakes, and pastries that are safe and delicious for everyone.',
      features: ['GF breads', 'GF cakes', 'GF pastries', 'Dedicated space'],
    },
    {
      icon: Utensils,
      title: 'Catering & Bulk Orders',
      description:
        'Breakfast spreads, dessert tables, and bulk pastries for corporate events, meetings, and special occasions.',
      features: ['Breakfast catering', 'Dessert tables', 'Bulk pastries', 'Corporate accounts'],
    },
    {
      icon: Sparkles,
      title: 'Seasonal Specialties',
      description:
        'Limited-time treats for holidays and seasons — from pumpkin spice in fall to king cake in carnival season.',
      features: ['Holiday treats', 'Seasonal flavors', 'Limited editions', 'Festival specialties'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Award-Winning Bakers',
      description:
        'Our bakers have won regional awards for bread and pastry. We train continuously and never compromise on technique.',
    },
    {
      icon: Clock,
      title: 'Baked Fresh Daily',
      description:
        'Our ovens start before dawn. Everything you see was baked today — we donate what remains to local shelters each evening.',
    },
    {
      icon: Users,
      title: 'Locally Sourced',
      description:
        'We mill flour from regional farms and use local butter, eggs, and produce. Freshness and community go hand in hand.',
    },
    {
      icon: ThumbsUp,
      title: 'From Scratch, Always',
      description:
        'No mixes, no preservatives, no shortcuts. Everything is made from scratch with real ingredients you can pronounce.',
    },
  ],
  whyUsTitle: 'Why Golden Crust',
  whyUsSubtitle:
    'Real ingredients, real technique, and a real love for baking in every loaf.',

  process: [
    {
      step: '01',
      title: 'Browse or Order',
      description:
        'Visit us in person or order online. Custom cake orders require at least 72 hours notice.',
    },
    {
      step: '02',
      title: 'We Bake Fresh',
      description:
        'Your order is baked fresh, never frozen. Custom cakes are designed and decorated to your specifications.',
    },
    {
      step: '03',
      title: 'Quality Check',
      description:
        'Every item is checked for freshness, quality, and appearance before it is packed or displayed.',
    },
    {
      step: '04',
      title: 'Pickup or Delivery',
      description:
        'Pick up at our bakery or choose local delivery. Custom cakes include careful transport packaging.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'Fresh baking, from order to your table.',

  testimonials: [
    {
      name: 'Carla D.',
      location: 'Brookside',
      rating: 5,
      text: 'Golden Crust made our wedding cake and it was the talk of the reception. Three tiers, beautiful design, and it tasted even better than it looked. Guests are still asking about it.',
    },
    {
      name: 'Michael B.',
      location: 'Fairfield',
      rating: 5,
      text: 'I stop in every Saturday for a sourdough loaf and a couple of croissants. The bread stays fresh for days and the croissants are the best I have had outside of Paris.',
    },
    {
      name: 'Aisha P.',
      location: 'Eastside',
      rating: 5,
      text: 'As someone with celiac, finding a bakery with a dedicated gluten-free space changed everything. The GF sourdough is incredible and I never worry about cross-contamination.',
    },
  ],
  testimonialsTitle: 'What Our Customers Say',
  testimonialsSubtitle: 'Fresh bread and happy customers are our daily goal.',

  faqs: [
    {
      question: 'How far in advance should I order a custom cake?',
      answer:
        'Custom cakes require at least 72 hours notice. Wedding cakes and large event cakes should be booked 4 to 8 weeks in advance to secure your date.',
    },
    {
      question: 'Do you offer gluten-free and vegan options?',
      answer:
        'Yes. We have a dedicated gluten-free kitchen space and offer a range of gluten-free breads, cakes, and pastries. Vegan options are available on request.',
    },
    {
      question: 'What are your hours and when is bread freshest?',
      answer:
        'We are open Tuesday through Sunday, 6am to 6pm. Bread is freshest in the morning — our ovens start before dawn and items are restocked throughout the day.',
    },
    {
      question: 'Do you deliver or offer catering?',
      answer:
        'Yes to both. We offer local delivery and catering for corporate events, meetings, and special occasions. Contact us for a catering quote.',
    },
    {
      question: 'What happens to unsold items at the end of the day?',
      answer:
        'We donate unsold items to local shelters and food banks each evening. Nothing goes to waste and we support our community.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about our bakery.',

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

  contactTitle: 'Order Fresh Baked Goods',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day.',

  galleryTitle: 'Fresh From Our Ovens',
  gallerySubtitle: 'A taste of what we bake every day.',
  galleryImages: [
    'https://images.pexels.com/photos/7405059/pexels-photo-7405059.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/7405059/pexels-photo-7405059.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/7405059/pexels-photo-7405059.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Bakers who start before the sun comes up.',
  team: [
    { name: 'Henri Dubois', role: 'Master Baker & Owner', bio: 'Henri trained in France and founded Golden Crust 22 years ago. He oversees all bread production and trains our baking team.' },
    { name: 'Lena Park', role: 'Head Pastry Chef', bio: 'Lena leads our pastry and viennoiserie program, crafting croissants and morning pastries with European-style butter.' },
    { name: 'Marcus Reid', role: 'Cake Designer', bio: 'Marcus designs and decorates our custom and wedding cakes, bringing clients\u2019 themes to life in sugar and fondant.' },
  ],

  pricingTitle: 'Bakery Pricing',
  pricingSubtitle: 'Fresh baked goods at honest prices.',
  pricing: [
    { name: 'Fresh Bread', price: 'From $6', description: 'Daily artisan loaves.', features: ['Sourdough', 'Baguettes', 'Country bread', 'Specialty breads', 'Baked fresh daily'], popular: false },
    { name: 'Pastries & Cakes', price: 'From $4', description: 'Daily pastries and cakes.', features: ['Croissants', 'Danish', 'Slice cakes', 'Seasonal treats', 'Baked fresh daily'], popular: true },
    { name: 'Custom Cakes', price: 'From $85', description: 'Made-to-order celebration cakes.', features: ['Custom design', 'Choice of flavors', 'Dietary options', 'Careful transport', '72hr notice required'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the Golden Crust Bakery assistant. How can I help you today?",
    placeholder: "Ask about our baked goods...",
    knowledgeBase: [
      "We offer fresh bread, custom cakes, pastries and vienoiseries, gluten-free options, catering and bulk orders, and seasonal specialties.",
      "Custom cakes require at least 72 hours notice. Wedding and large event cakes should be booked 4 to 8 weeks in advance.",
      "Yes, we have a dedicated gluten-free kitchen space and offer vegan options on request.",
      "We are open Tuesday through Sunday, 6am to 6pm. Bread is freshest in the morning.",
      "We offer local delivery and catering for corporate events, meetings, and special occasions.",
      "Unsold items are donated to local shelters and food banks each evening.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Everything is baked from scratch with no preservatives, using locally milled flour and real butter.",
      "We have 22+ years of experience and have made over 1,500 custom cakes.",
      "Fresh bread starts at $6, pastries at $4, and custom cakes start at $85.",
    ],
  },
};
