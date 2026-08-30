import {
  Briefcase,
  Heart,
  Users,
  UtensilsCrossed,
  ChefHat,
  ClipboardList,
  Award,
  Clock,
  Leaf,
  ThumbsUp,
  PhoneCall,
  Wine,
  PartyPopper,
  Soup,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const cateringConfig: IndustryConfig = {
  id: 'catering',
  industryName: 'Catering',
  businessName: 'Savor Catering Co.',
  tagline: 'Food That Makes the Event.',
  heroTitle: 'Catering That Elevates Every Occasion',
  heroSubtitle:
    'Corporate, wedding, and private event catering with chef-crafted menus and flawless service. Fresh ingredients, customizable options, and a team that handles every detail.',
  phone: '(555) 461-9920',
  email: 'events@savorcatering.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Sat 8am-8pm',
  yearsExperience: '16+',
  licenseNumber: 'CAT-6291840',

  colors: {
    primary: '#92400E',
    primaryDark: '#78350F',
    primaryLight: '#FEF3C7',
    accent: '#15803D',
    background: '#FFFFFF',
    surface: '#FEFCE8',
    text: '#1A0F08',
    textMuted: '#6B5B4F',
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

  heroImage: 'https://images.pexels.com/photos/2337843/pexels-photo-2337843.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'Chef-Crafted • Full-Service Catering',
  ctaPrimary: 'Get a Custom Quote',
  ctaSecondary: 'View Menus',

  stats: [
    { value: '16+', label: 'Years Experience' },
    { value: '4,500+', label: 'Events Catered' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '100%', label: 'Fresh Ingredients' },
  ],

  services: [
    {
      icon: Briefcase,
      title: 'Corporate Catering',
      description:
        'Professional catering for meetings, conferences, and corporate events. From boardroom lunches to gala dinners, we make your business events memorable.',
      features: ['Breakfast & lunch meetings', 'Conference catering', 'Networking events', 'Executive dinners'],
    },
    {
      icon: Heart,
      title: 'Wedding Catering',
      description:
        'Your wedding menu, your way. From elegant plated dinners to relaxed family-style service, we create a dining experience your guests will remember.',
      features: ['Plated dinners', 'Family-style service', 'Cocktail receptions', 'Custom wedding cake'],
    },
    {
      icon: Users,
      title: 'Private Events',
      description:
        'Birthday parties, anniversaries, and celebrations of all kinds. Custom menus and attentive service that let you enjoy your own party.',
      features: ['Birthday parties', 'Anniversaries', 'Holiday gatherings', 'Custom themes'],
    },
    {
      icon: UtensilsCrossed,
      title: 'Boxed Lunches',
      description:
        'Fresh, individually packaged lunches perfect for meetings, trainings, and on-the-go teams. Variety of options to suit any dietary need.',
      features: ['Individual packaging', 'Dietary accommodations', 'Sandwich & salad options', 'Bulk ordering'],
    },
    {
      icon: ChefHat,
      title: 'Buffet-Style Service',
      description:
        'Abundant buffet-style catering that lets guests choose their favorites. Beautifully presented stations with attendants to keep everything fresh.',
      features: ['Multiple stations', 'Attended service', 'Fresh replenishment', 'Dietary labels'],
    },
    {
      icon: ClipboardList,
      title: 'Custom Menu Design',
      description:
        'Work with our chef to design a menu tailored to your event, theme, and dietary needs. Every dish crafted from scratch with seasonal ingredients.',
      features: ['Chef consultation', 'Seasonal ingredients', 'Dietary accommodations', 'Tasting sessions'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Chef-Crafted Menus',
      description:
        'Every menu is designed by our executive chef using seasonal, fresh ingredients. No frozen, no pre-packaged — just real food made from scratch.',
    },
    {
      icon: Clock,
      title: 'On-Time, Every Time',
      description:
        'We arrive early, set up on schedule, and serve on time. We respect your timeline because we know your event depends on it.',
    },
    {
      icon: Leaf,
      title: 'Dietary Accommodations',
      description:
        'Vegetarian, vegan, gluten-free, kosher, halal — we accommodate every dietary need without compromising on flavor or presentation.',
    },
    {
      icon: ThumbsUp,
      title: 'Full-Service Experience',
      description:
        'We handle setup, service, and cleanup. Our professional staff ensures everything runs smoothly so you can relax and enjoy your event.',
    },
  ],
  whyUsTitle: ' Why Hosts Choose Savor Catering',
  whyUsSubtitle:
    'We treat your event like our own. Great food, attentive service, and zero stress for you.',

  process: [
    {
      step: '01',
      title: 'Request a Quote',
      description:
        'Tell us about your event — date, guest count, and style. We provide a custom quote with menu options within one business day.',
    },
    {
      step: '02',
      title: 'Menu Planning',
      description:
        'Work with our chef to select or customize your menu. Schedule a tasting for larger events to sample before you decide.',
    },
    {
      step: '03',
      title: 'We Cater Your Event',
      description:
        'Our team arrives early, sets up beautifully, and serves professionally. You and your guests enjoy the event while we handle everything.',
    },
    {
      step: '04',
      title: 'Cleanup & Follow-Up',
      description:
        'We clean up thoroughly and leave your venue spotless. We follow up to make sure everything exceeded your expectations.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'A simple, stress-free process from quote to cleanup.',

  testimonials: [
    {
      name: 'Anderson Wedding',
      location: 'Brookside',
      rating: 5,
      text: 'Savor catered our wedding for 180 guests and every single person raved about the food. The tasting was fun, the service was flawless, and the cleanup was invisible. Perfection.',
    },
    {
      name: 'TechCorp Annual Meeting',
      location: 'Fairfield',
      rating: 5,
      text: 'We use Savor for every corporate event. They handle 300-person conferences and 10-person lunches with the same care. Always on time, always delicious, always professional.',
    },
    {
      name: 'Maria G.',
      location: 'Eastside',
      rating: 5,
      text: 'They catered my moms 80th birthday. The chef accommodated six different dietary needs without anyone feeling left out. Beautiful presentation and the food was incredible.',
    },
  ],
  testimonialsTitle: 'What Our Clients Say',
  testimonialsSubtitle: 'Events made unforgettable by food worth remembering.',

  faqs: [
    {
      question: 'What is your minimum guest count?',
      answer:
        'We cater events of all sizes. Our minimum order is typically 10 guests, but we are happy to discuss smaller gatherings and boxed lunch orders.',
    },
    {
      question: 'Do you accommodate dietary restrictions?',
      answer:
        'Absolutely. We offer vegetarian, vegan, gluten-free, kosher, halal, and allergy-friendly options. Tell us your needs and we will design a menu that works for every guest.',
    },
    {
      question: 'Do you provide tastings before the event?',
      answer:
        'Yes. For weddings and large events we offer tasting sessions so you can sample menu items before deciding. Tastings are included for events over 75 guests.',
    },
    {
      question: 'Do you provide staff and equipment?',
      answer:
        'Yes. Our full-service packages include professional servers, chefs, tables, linens, chafing dishes, and all serving equipment. We handle setup and cleanup too.',
    },
    {
      question: 'How far in advance should I book?',
      answer:
        'For weddings and large events, we recommend booking 3-6 months in advance. For corporate and smaller events, 2-4 weeks is usually sufficient. We do accommodate last-minute requests when possible.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about our catering services.',

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

  contactTitle: 'Get Your Custom Catering Quote',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day with menu options and pricing.',

  galleryTitle: 'Our Recent Catered Events',
  gallerySubtitle: 'See the food, presentation, and care behind every Savor event.',
  galleryImages: [
    'https://images.pexels.com/photos/2337843/pexels-photo-2337843.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/2337843/pexels-photo-2337843.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/2337843/pexels-photo-2337843.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'A chef-led team passionate about making your event delicious.',
  team: [
    { name: 'Chef Antonio Russo', role: 'Executive Chef & Owner', bio: 'Classically trained chef with 16 years of catering experience. Antonio designs every menu and personally oversees food quality for every event.' },
    { name: 'Hannah Brooks', role: 'Event Coordinator', bio: 'Manages every event from first quote to final cleanup. Hannah ensures your timeline, dietary needs, and every detail are perfectly handled.' },
    { name: 'Marcus Lee', role: 'Lead Server & Captain', bio: 'Leads our service team on-site. Marcus ensures professional, attentive service from setup through cleanup at every event we cater.' },
  ],

  pricingTitle: 'Catering Service Packages',
  pricingSubtitle: 'Pricing varies by menu and guest count. Custom quotes available.',
  pricing: [
    { name: 'Boxed Lunches', price: 'From $18/person', description: 'Individually packaged lunches.', features: ['Sandwich or salad', 'Side & dessert', 'Individual packaging', 'Dietary options', 'Bulk delivery'], popular: false },
    { name: 'Buffet Package', price: 'From $32/person', description: 'Full buffet-style catering.', features: ['2 entrees & 3 sides', 'Attended service', 'All equipment included', 'Setup & cleanup', 'Dietary accommodations'], popular: true },
    { name: 'Plated Dinner', price: 'From $65/person', description: 'Full-service plated dinner.', features: ['3-course plated meal', 'Full service staff', 'All equipment & linens', 'Custom menu design', 'Tasting included'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the Savor Catering assistant. How can I help you today?",
    placeholder: "Ask about our catering services...",
    knowledgeBase: [
      "We offer corporate catering, wedding catering, private events, boxed lunches, buffet-style service, and custom menu design.",
      "Our minimum order is typically 10 guests, but we are happy to discuss smaller gatherings and boxed lunch orders.",
      "We accommodate vegetarian, vegan, gluten-free, kosher, halal, and allergy-friendly options. Tell us your needs and we will design a menu for every guest.",
      "Yes, we offer tasting sessions for weddings and large events. Tastings are included for events over 75 guests.",
      "Our full-service packages include professional servers, chefs, tables, linens, chafing dishes, and all serving equipment, plus setup and cleanup.",
      "For weddings and large events, book 3-6 months in advance. For corporate and smaller events, 2-4 weeks is usually sufficient. We accommodate last-minute requests when possible.",
      "Every menu is designed by our executive chef using seasonal, fresh ingredients. No frozen or pre-packaged food, everything made from scratch.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are Monday through Saturday, 8am to 8pm.",
      "We have 16+ years of experience, catered over 4,500 events, and maintain a 4.9-star average rating with 100% fresh ingredients.",
    ],
  },
};
