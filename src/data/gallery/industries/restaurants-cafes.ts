import {
  UtensilsCrossed,
  Coffee,
  Wine,
  PartyPopper,
  Truck,
  ShoppingBag,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
  ChefHat,
  Star,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

const BASE_URL = 'https://images.pexels.com/photos/';

export const restaurantsCafesConfig: IndustryConfig = {
  id: 'restaurants-cafes',
  industryName: 'Restaurants & Cafes',
  businessName: 'The Copper Spoon',
  tagline: 'Comfort Food, Elevated.',
  heroTitle: 'A Neighborhood Table Worth Gathering Around',
  heroSubtitle:
    'Seasonal, locally sourced comfort food served in a warm, inviting space. From slow mornings over coffee to lively dinners with friends, every plate is made with intention and care.',
  phone: '(555) 318-6620',
  email: 'reservations@copperspoon.com',
  serviceArea: 'Downtown Core & Surrounding Neighborhoods',
  hours: 'Tue-Sun 8am-10pm',
  yearsExperience: '9+',
  licenseNumber: 'REST-4471-22',

  colors: {
    primary: '#C2410C',
    primaryDark: '#9A3412',
    primaryLight: '#FFEDD5',
    accent: '#166534',
    background: '#FFFFFF',
    surface: '#FFF7ED',
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

  heroImage: `${BASE_URL}67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=1200`,
  heroBadge: 'Farm-to-Table • Open Kitchen',
  ctaPrimary: 'Reserve a Table',
  ctaSecondary: 'View Menu',

  stats: [
    { value: '9+', label: 'Years Serving' },
    { value: '120K+', label: 'Guests Served' },
    { value: '4.8★', label: 'Google Rating' },
    { value: '30+', label: 'Local Farm Partners' },
  ],

  services: [
    {
      icon: UtensilsCrossed,
      title: 'Dinner Service',
      description:
        'Our seasonal dinner menu features locally sourced ingredients turned into comforting, memorable plates. Open kitchen, warm lighting, and a wine list built to match.',
      features: ['Seasonal menu', 'Local sourcing', 'Open kitchen', 'Curated wine list'],
    },
    {
      icon: Coffee,
      title: 'Weekend Brunch',
      description:
        'Saturday and Sunday brunch from 8am to 2pm. House-baked pastries, signature eggs, and a brunch cocktail menu that makes weekends worth waking up for.',
      features: ['House pastries', 'Signature brunch cocktails', 'Fresh coffee bar', 'Vegetarian options'],
    },
    {
      icon: PartyPopper,
      title: 'Private Events',
      description:
        'Host your rehearsal dinner, birthday, or corporate gathering in our private dining room. Custom menus, dedicated service, and a space that feels like yours for the night.',
      features: ['Private dining room', 'Custom menus', 'Dedicated server', 'Up to 40 guests'],
    },
    {
      icon: Truck,
      title: 'Catering',
      description:
        'Off-site catering for events of all sizes. From corporate lunches to wedding receptions, we bring the same quality and care to your venue that you expect in our dining room.',
      features: ['Corporate catering', 'Wedding receptions', 'Drop-off or full service', 'Customizable menus'],
    },
    {
      icon: ShoppingBag,
      title: 'Takeout & Delivery',
      description:
        'Enjoy The Copper Spoon at home. Order online for pickup or delivery within our service area. Same menu, same care, packed to travel well.',
      features: ['Online ordering', 'Curbside pickup', 'Local delivery', 'Family-style options'],
    },
    {
      icon: Wine,
      title: 'Bar & Cocktails',
      description:
        'A cozy bar with craft cocktails, local beers on tap, and a thoughtfully chosen wine list. Pull up a seat for a pre-dinner drink or a nightcap.',
      features: ['Craft cocktails', 'Local beer on tap', 'Curated wine list', 'Bar bites'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Farm-to-Table Since Day One',
      description:
        'We have sourced from local farms and producers since we opened. It shows in every plate — fresher ingredients, better flavor, and a stronger local food economy.',
    },
    {
      icon: Clock,
      title: 'Made to Order, Every Time',
      description:
        'Nothing sits under a heat lamp. Every dish is made to order, which means it takes a few minutes longer and tastes noticeably better. We think it is worth the wait.',
    },
    {
      icon: Users,
      title: 'A True Neighborhood Spot',
      description:
        'We know our regulars by name and treat first-timers like family. Our dining room is the kind of place where you linger a little longer than you planned.',
    },
    {
      icon: ThumbsUp,
      title: 'Hospitality First',
      description:
        'Great food matters, but great hospitality is what brings people back. Our team is trained to make every guest feel cared for from the door to the last bite.',
    },
  ],
  whyUsTitle: 'Why Guests Come Back',
  whyUsSubtitle:
    'A neighborhood restaurant built on good food, good people, and genuine hospitality.',

  process: [
    {
      step: '01',
      title: 'Reserve',
      description:
        'Book your table online or by phone. We hold reservations for 15 minutes, so let us know if you are running late.',
    },
    {
      step: '02',
      title: 'Arrive & Settle In',
      description:
        'Greeted at the door, seated at your table, and handed menus and a drink list. Take your time — we are in no rush.',
    },
    {
      step: '03',
      title: 'Savor',
      description:
        'Your meal is made to order and brought to your table as it is ready. Ask your server for pairings or recommendations anytime.',
    },
    {
      step: '04',
      title: 'Linger',
      description:
        'Dessert, coffee, another round — stay as long as you like. We would rather you enjoy the evening than turn your table.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'A relaxed dining experience from reservation to last bite.',

  testimonials: [
    {
      name: 'Olivia R.',
      location: 'Downtown Core',
      rating: 5,
      text: 'The Copper Spoon is our go-to for date night. The seasonal menu always surprises us, the wine list is excellent, and the service makes you feel like a regular even on your first visit. A true gem.',
    },
    {
      name: 'Marcus T.',
      location: 'Midtown',
      rating: 5,
      text: 'We hosted our rehearsal dinner in the private room and it could not have gone better. Custom menu, dedicated server, and every guest raved about the food. The team made it effortless.',
    },
    {
      name: 'Hannah L.',
      location: 'Riverside',
      rating: 5,
      text: 'Best brunch in the city, hands down. The pastries are baked in-house, the coffee is great, and the cocktails are dangerous in the best way. Worth the weekend wait.',
    },
  ],
  testimonialsTitle: 'What Our Guests Say',
  testimonialsSubtitle: 'Kind words from the people who keep us cooking.',

  faqs: [
    {
      question: 'Do you take reservations?',
      answer:
        'Yes, we take reservations for dinner and weekend brunch. Book online through our website or call us. We keep a portion of tables for walk-ins at the bar and counter.',
    },
    {
      question: 'Do you accommodate dietary restrictions?',
      answer:
        'Absolutely. Our menu clearly marks vegetarian and gluten-free options, and our kitchen can adapt most dishes for vegan, dairy-free, or allergy needs. Tell your server and we will take care of you.',
    },
    {
      question: 'Can I book the private dining room?',
      answer:
        'Yes. Our private dining room seats up to 40 guests and includes a custom menu built with our chef. A minimum spend applies. Contact us at least two weeks in advance for availability.',
    },
    {
      question: 'Do you offer takeout and delivery?',
      answer:
        'Yes. Order directly through our website for pickup or local delivery. We pack everything to travel well, though some delicate dishes are best enjoyed in our dining room.',
    },
    {
      question: 'Is parking available?',
      answer:
        'Street parking is available nearby, and there is a public parking garage two blocks away. We also have a bike rack out front for cycling guests.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know before you visit.',

  serviceAreas: [
    { name: 'Downtown Core' },
    { name: 'Midtown' },
    { name: 'Riverside' },
    { name: 'Eastside' },
    { name: 'Uptown' },
    { name: 'Brookside' },
    { name: 'Fairfield' },
    { name: 'Westgate' },
  ],
  serviceAreasTitle: 'Neighborhoods We Serve',

  contactTitle: 'Reserve Your Table',
  contactSubtitle:
    'Call us or fill out the form below. We confirm reservations within one business day.',

  galleryTitle: 'A Taste of The Copper Spoon',
  gallerySubtitle: 'Plates, pours, and our dining room.',
  galleryImages: [
    `${BASE_URL}67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=1200`,
    `${BASE_URL}262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1200`,
    `${BASE_URL}313707/pexels-photo-313707.jpeg?auto=compress&cs=tinysrgb&w=1200`,
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'The people behind the plates and the hospitality.',
  team: [
    { name: 'Chef Elena Ruiz', role: 'Executive Chef & Owner', bio: 'Trained in classic French technique and rooted in local sourcing. Elena opened The Copper Spoon nine years ago to bring farm-to-table comfort food to the neighborhood.' },
    { name: 'Marcus Bell', role: 'General Manager', bio: 'Twenty years in hospitality and the reason the dining room runs like clockwork. Marcus knows every regular by name and their usual order.' },
    { name: 'Sofia Park', role: 'Head Bartender', bio: 'Our cocktail program lives in Sofia’s hands. Seasonal menus, zero-waste syrups, and a warm welcome at the bar every night.' },
  ],

  pricingTitle: 'Dining Options',
  pricingSubtitle: 'A range of ways to enjoy The Copper Spoon.',
  pricing: [
    { name: 'Dinner', price: '$$ • 3 courses ~$45', description: 'Full seasonal dinner menu.', features: ['Seasonal plates', 'Curated wine list', 'Craft cocktails', 'Dessert menu', 'Walk-in bar seating'], popular: false },
    { name: 'Weekend Brunch', price: '$$ • 2 courses ~$28', description: 'Sat-Sun 8am-2pm.', features: ['House pastries', 'Brunch cocktails', 'Fresh coffee bar', 'Vegetarian options', 'Reservations recommended'], popular: true },
    { name: 'Private Events', price: 'From $65/guest', description: 'Custom menus for up to 40 guests.', features: ['Private dining room', 'Custom menu with chef', 'Dedicated server', 'Wine pairings available', 'Minimum spend applies'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am The Copper Spoon assistant. How can I help you today?",
    placeholder: "Ask about our menu, reservations, or events...",
    knowledgeBase: [
      "We serve dinner Tuesday through Sunday, and weekend brunch Saturday and Sunday from 8am to 2pm.",
      "Yes, we take reservations for dinner and weekend brunch. Book online through our website or call us. We keep some tables for walk-ins at the bar.",
      "Our menu clearly marks vegetarian and gluten-free options, and our kitchen can adapt most dishes for vegan, dairy-free, or allergy needs. Just tell your server.",
      "Our private dining room seats up to 40 guests with a custom menu built with our chef. A minimum spend applies. Book at least two weeks in advance.",
      "We offer takeout and local delivery through our website. Some delicate dishes are best enjoyed in our dining room.",
      "We are farm-to-table and source from over 30 local farm and producer partners.",
      "We serve Downtown Core, Midtown, Riverside, Eastside, Uptown, Brookside, Fairfield, and Westgate.",
      "Our hours are Tuesday through Sunday, 8am to 10pm. We are closed Mondays.",
      "We have been serving the neighborhood for 9+ years and have served over 120,000 guests.",
      "To reserve a table, call us at (555) 318-6620 or book online through our website.",
    ],
  },
};
