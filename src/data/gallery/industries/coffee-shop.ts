import {
  Coffee,
  Croissant,
  Salad,
  Package,
  Utensils,
  Award,
  Clock,
  Leaf,
  Heart,
  Star,
  MapPin,
  Users,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const coffeeShopConfig: IndustryConfig = {
  id: 'coffee-shop',
  industryName: 'Coffee Shop',
  businessName: 'Brave Roaster Coffee',
  tagline: 'Bold Coffee. Brave Choices.',
  heroTitle: 'Coffee Worth Crossing Town For',
  heroSubtitle:
    'Small-batch roasted coffee, house-baked pastries, and a warm place to gather. Every cup supports fair-trade farmers and our local community.',
  phone: '(555) 781-2245',
  email: 'hello@braveroaster.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Sun 6am-6pm',
  yearsExperience: '9+',
  licenseNumber: 'CF-6293847',

  colors: {
    primary: '#92400E',
    primaryDark: '#78350F',
    primaryLight: '#FEF3C7',
    accent: '#15803D',
    background: '#FFFFFF',
    surface: '#FFFBEB',
    text: '#2E1F0F',
    textMuted: '#7A6B5B',
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

  heroImage: 'https://images.pexels.com/photos/6612572/pexels-photo-6612572.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'Small-Batch Roasted • Fair Trade • House Baked',
  ctaPrimary: 'Order Ahead',
  ctaSecondary: 'View Menu',

  stats: [
    { value: '9+', label: 'Years Roasting' },
    { value: '120K+', label: 'Cups Served' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '100%', label: 'Fair-Trade Beans' },
  ],

  services: [
    {
      icon: Coffee,
      title: 'Espresso & Coffee',
      description:
        'Handcrafted espresso drinks, pour-overs, cold brew, and seasonal specialties — all made with our small-batch roasted, fair-trade beans.',
      features: ['Espresso drinks', 'Pour-over', 'Cold brew', 'Seasonal specials'],
    },
    {
      icon: Croissant,
      title: 'Pastries & Baked Goods',
      description:
        'Fresh-baked croissants, muffins, scones, and cookies every morning. Baked in-house daily with real butter and simple ingredients.',
      features: ['Fresh daily', 'Croissants & scones', 'Muffins & cookies', 'Vegan options'],
    },
    {
      icon: Salad,
      title: 'Light Lunch & Salads',
      description:
        'Wholesome salads, sandwiches, and grain bowls made with local produce. Perfect for a quick, delicious midday break.',
      features: ['Seasonal salads', 'Sandwiches', 'Grain bowls', 'Vegetarian options'],
    },
    {
      icon: Package,
      title: 'Whole Bean Retail',
      description:
        'Take our coffee home. Fresh-roasted whole beans, brewing equipment, and brewing guides so you can make great coffee at home.',
      features: ['Fresh-roasted beans', 'Brewing gear', 'Subscription available', 'Brewing guides'],
    },
    {
      icon: Utensils,
      title: 'Catering & Bulk Orders',
      description:
        'Coffee catering for meetings and events, plus bulk brewed coffee and pastry boxes for offices and gatherings of any size.',
      features: ['Office coffee', 'Event catering', 'Pastry boxes', 'Custom orders'],
    },
    {
      icon: Award,
      title: 'Loyalty Program',
      description:
        'Earn a point for every dollar, get a free drink every 10 visits, and unlock member-only perks. Join free in seconds.',
      features: ['Free drinks', 'Member perks', 'Birthday treats', 'Early access'],
    },
  ],

  whyUs: [
    {
      icon: Leaf,
      title: 'Fair-Trade & Sustainable',
      description:
        'Every bean is fair-trade certified and roasted in small batches. We pay farmers fairly and source sustainably because it tastes better and does good.',
    },
    {
      icon: Award,
      title: 'Roasted In-House',
      description:
        'We roast our own beans on-site every week. You taste the difference fresh makes — brighter, sweeter, and more complex coffee.',
    },
    {
      icon: Heart,
      title: 'Community Space',
      description:
        'More than a cafe, we are a gathering place. Free WiFi, comfy seating, local art, and a team that learns your name and your order.',
    },
    {
      icon: Star,
      title: 'Locally Loved',
      description:
        'Voted best coffee shop three years running. Our regulars are our family, and their reviews keep us roasting and baking every day.',
    },
  ],
  whyUsTitle: 'Why Coffee Lovers Choose Brave',
  whyUsSubtitle:
    'We do not just serve coffee — we roast it, bake for it, and build a community around every cup.',

  process: [
    {
      step: '01',
      title: 'Order Ahead or Walk In',
      description:
        'Use our app to order ahead and skip the line, or walk in and let our baristas help you choose. Either way, you are minutes from great coffee.',
    },
    {
      step: '02',
      title: 'We Craft Your Drink',
      description:
        'Our baristas pull fresh shots, steam milk to order, and build your drink with care. Every cup is made to your specifications.',
    },
    {
      step: '03',
      title: 'Grab a Pastry',
      description:
        'Pair your coffee with a fresh-baked pastry or a light lunch. Our bakers start before dawn so everything is ready when you arrive.',
    },
    {
      step: '04',
      title: 'Earn Rewards',
      description:
        'Join our loyalty program and earn points on every purchase. Free drinks, member perks, and birthday treats are just the beginning.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'From bean to cup to your happy place.',

  testimonials: [
    {
      name: 'Kevin O.',
      location: 'Brookside',
      rating: 5,
      text: 'Best coffee in town, hands down. The pour-over is always perfect and the baristas remember my name. The croissants are worth getting up early for. My daily ritual.',
    },
    {
      name: 'Naomi L.',
      location: 'Fairfield',
      rating: 5,
      text: 'I work remotely and this is my second office. Great WiFi, comfy seats, and coffee that actually tastes like coffee. The seasonal drinks are always a fun surprise.',
    },
    {
      name: 'Tomas G.',
      location: 'Eastside',
      rating: 5,
      text: 'Their catering saved our team retreat. The coffee boxes and pastry spread were a huge hit, and the service was seamless from order to delivery. Will use again.',
    },
  ],
  testimonialsTitle: 'What Our Customers Say',
  testimonialsSubtitle: 'Great coffee, warm welcomes, and regulars who feel like family.',

  faqs: [
    {
      question: 'Do you have dairy-free milk options?',
      answer:
        'Yes! We offer oat, almond, and soy milk at no extra charge. We also have coconut milk seasonally. Just ask your barista.',
    },
    {
      question: 'Can I order ahead and skip the line?',
      answer:
        'Yes. Download our app or order online, and your drink will be ready when you walk in. Perfect for busy mornings on the go.',
    },
    {
      question: 'Do you roast your own beans?',
      answer:
        'Yes! We roast in small batches on-site every week. You can buy fresh whole beans in the shop or sign up for a subscription to have them delivered.',
    },
    {
      question: 'Do you offer coffee catering for events?',
      answer:
        'Absolutely. We offer brewed coffee boxes, espresso bar catering, and pastry boxes for events of any size. Contact us at least 48 hours in advance to book.',
    },
    {
      question: 'Is your coffee fair trade?',
      answer:
        'Every bean we serve is fair-trade certified. We believe in paying farmers fairly and sourcing sustainably — it is better for the planet and better in the cup.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about Brave Roaster.',

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

  contactTitle: 'Visit Us or Order Ahead',
  contactSubtitle:
    'Call us or fill out the form below for catering and bulk orders. We respond within one business day.',

  galleryTitle: 'Life at Brave Roaster',
  gallerySubtitle: 'Fresh roasts, baked daily, and a community that gathers.',
  galleryImages: [
    'https://images.pexels.com/photos/6612572/pexels-photo-6612572.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/6612572/pexels-photo-6612572.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/6612572/pexels-photo-6612572.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Roasters, bakers, and baristas who love what they do.',
  team: [
    { name: 'Diego Alvarez', role: 'Owner & Head Roaster', bio: 'Former barista champion turned roaster, Diego founded Brave to share his obsession with great coffee and fair-trade sourcing.' },
    { name: 'Hannah Brooks', role: 'Head Baker', bio: 'Hannah starts her shift at 4am so every croissant is fresh and warm when the doors open at 6.' },
    { name: 'Sam Tanaka', role: 'Lead Barista', bio: 'Sam knows every regular by name and drink, and can pour latte art that belongs in a gallery.' },
  ],

  pricingTitle: 'Coffee & Catering',
  pricingSubtitle: 'Everyday prices and catering options for any occasion.',
  pricing: [
    { name: 'Daily Brew', price: 'From $3.50', description: 'Single cup, any drink.', features: ['Espresso & drip', 'Dairy-free included', 'Loyalty points', 'Order ahead'], popular: false },
    { name: 'Bean Subscription', price: 'From $18/mo', description: 'Fresh beans delivered monthly.', features: ['12oz fresh beans', 'Choose your roast', 'Skip anytime', 'Brewing guide', 'Member pricing'], popular: true },
    { name: 'Office Catering', price: 'From $4/person', description: 'Coffee and pastries for your team.', features: ['Brewed coffee boxes', 'Pastry assortment', 'Cups & supplies', '48-hour booking', 'Delivery available'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the Brave Roaster assistant. What can I get started for you today?",
    placeholder: "Ask about the menu, catering, or hours...",
    knowledgeBase: [
      "We serve espresso and coffee, pastries and baked goods, light lunch and salads, whole bean retail, catering and bulk orders, and a loyalty program.",
      "Yes, we offer oat, almond, and soy milk at no extra charge, plus seasonal coconut milk. Just ask your barista.",
      "Yes, you can order ahead through our app or online and skip the line. Your drink will be ready when you arrive.",
      "We roast our own beans in small batches on-site every week. You can buy fresh whole beans in the shop or subscribe for delivery.",
      "We offer coffee catering for events including brewed coffee boxes, espresso bar catering, and pastry boxes. Book at least 48 hours in advance.",
      "Every bean we serve is 100% fair-trade certified. We pay farmers fairly and source sustainably.",
      "Our loyalty program gives you a point per dollar, a free drink every 10 visits, and member-only perks. Join free in seconds.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "We are open Monday through Sunday, 6am to 6pm.",
      "We have 9+ years roasting, served over 120,000 cups, and use 100% fair-trade beans.",
    ],
  },
};
