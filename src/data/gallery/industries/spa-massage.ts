import {
  Hand,
  Activity,
  Flame,
  Flower2,
  Users,
  Crown,
  Award,
  Clock,
  Sparkles,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const spaMassageConfig: IndustryConfig = {
  id: 'spa-massage',
  industryName: 'Spa & Massage',
  businessName: 'Serenity Spa & Wellness',
  tagline: 'Restore. Renew. Rejuvenate.',
  heroTitle: 'Escape to Serenity. Restore Your Balance.',
  heroSubtitle:
    'From therapeutic deep tissue massage to luxurious spa packages, our licensed massage therapists and estheticians help you release tension, relieve pain, and reconnect with your wellbeing in a tranquil sanctuary.',
  phone: '(555) 634-8891',
  email: 'relax@serenityspa.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Sat 9am-8pm, Sun 10am-6pm',
  yearsExperience: '14+',
  licenseNumber: 'MT-7712084',

  colors: {
    primary: '#0D9488',
    primaryDark: '#0F766E',
    primaryLight: '#CCFBF1',
    accent: '#92400E',
    background: '#FFFFFF',
    surface: '#F0FDFA',
    text: '#0A1A1C',
    textMuted: '#5B6B6E',
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
    'https://images.pexels.com/photos/9146381/pexels-photo-9146381.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'Licensed Therapists • Tranquil Sanctuary',
  ctaPrimary: 'Book Session',
  ctaSecondary: 'View Services',

  stats: [
    { value: '14+', label: 'Years Experience' },
    { value: '35,000+', label: 'Sessions Delivered' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '100%', label: 'Licensed Therapists' },
  ],

  services: [
    {
      icon: Hand,
      title: 'Swedish Massage',
      description:
        'A gentle, relaxing full-body massage using long, flowing strokes to improve circulation, ease tension, and promote deep relaxation. The perfect introduction to massage therapy.',
      features: ['Full-body relaxation', 'Improved circulation', 'Stress relief', 'Light to medium pressure'],
    },
    {
      icon: Activity,
      title: 'Deep Tissue Massage',
      description:
        'Targeted, firm-pressure massage that reaches deep muscle layers to release chronic tension, knots, and pain. Ideal for recovery from injury or persistent muscle tightness.',
      features: ['Chronic pain relief', 'Deep muscle release', 'Knot & tension work', 'Firm pressure'],
    },
    {
      icon: Flame,
      title: 'Hot Stone Therapy',
      description:
        'Smooth, heated stones placed on key points and used in massage to melt away tension and warm deep muscle tissue. A deeply soothing and grounding experience.',
      features: ['Heated basalt stones', 'Deep muscle relaxation', 'Improved blood flow', 'Stress melting'],
    },
    {
      icon: Flower2,
      title: 'Aromatherapy',
      description:
        'Massage enhanced with custom essential oil blends chosen for your needs — calming lavender, energizing citrus, or balancing eucalyptus. A multisensory wellness experience.',
      features: ['Custom essential oils', 'Stress & mood support', 'Enhanced relaxation', 'Aromatic journey'],
    },
    {
      icon: Users,
      title: 'Couples Massage',
      description:
        'Share a relaxing experience side by side in our couples suite. Perfect for anniversaries, date nights, or simply unwinding together with your favorite massage styles.',
      features: ['Side-by-side massage', 'Private couples suite', 'Choice of massage style', 'Perfect for special occasions'],
    },
    {
      icon: Crown,
      title: 'Spa Packages',
      description:
        'Full-day and half-day spa packages combining massage, body treatments, and skincare for the ultimate wellness retreat. Includes access to our relaxation lounge and amenities.',
      features: ['Multi-service packages', 'Body treatments', 'Skincare add-ons', 'Relaxation lounge access'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Licensed Therapists',
      description:
        'Every massage therapist and esthetician is state-licensed and experienced in multiple modalities. We match you with the right therapist for your specific needs and preferences.',
    },
    {
      icon: Clock,
      title: 'Tranquil Environment',
      description:
        'Our spa is a true sanctuary — calm lighting, soothing music, and private treatment rooms designed for complete relaxation. Step in and leave the world behind.',
    },
    {
      icon: Sparkles,
      title: 'Premium Products',
      description:
        'We use only high-quality, natural massage oils, essential oils, and skincare products. Better products mean a better experience and healthier results for your skin and body.',
    },
    {
      icon: ThumbsUp,
      title: 'Personalized Care',
      description:
        'Your therapist consults with you before every session to understand your goals and adjust pressure, focus areas, and techniques. Every massage is tailored to you.',
    },
  ],
  whyUsTitle: 'Why Guests Choose Serenity',
  whyUsSubtitle:
    'Licensed therapists, a tranquil sanctuary, and personalized care for true relaxation and renewal.',

  process: [
    {
      step: '01',
      title: 'Book Your Session',
      description:
        'Reserve online or by phone. Choose your service, preferred therapist, and time. Gift cards and package bookings available.',
    },
    {
      step: '02',
      title: 'Arrive & Unwind',
      description:
        'Arrive 15 minutes early to check in, change into a robe, and relax in our tranquility lounge with complimentary tea and infused water.',
    },
    {
      step: '03',
      title: 'Your Treatment',
      description:
        'Your therapist consults with you, then delivers a personalized session. Communicate any pressure or focus preferences throughout your treatment.',
    },
    {
      step: '04',
      title: 'Linger & Rebook',
      description:
        'Take your time in our relaxation lounge afterward. We provide aftercare tips and help you schedule your next session before you leave.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'A seamless journey from booking to blissful relaxation.',

  testimonials: [
    {
      name: 'Olivia P.',
      location: 'Brookside',
      rating: 5,
      text: 'The deep tissue massage was exactly what my back needed after months of tension. My therapist found every knot and worked it out. I left feeling like a new person. The whole spa is so peaceful.',
    },
    {
      name: 'Daniel & Rachel M.',
      location: 'Fairfield',
      rating: 5,
      text: 'We did a couples massage for our anniversary and it was perfect. The private suite, the robes, the tea afterward — it felt like a mini vacation. We are already booking our next one.',
    },
    {
      name: 'Vanessa T.',
      location: 'Eastside',
      rating: 5,
      text: 'The hot stone therapy is unreal. I have never been so relaxed in my life. The aromatherapy add-on made it even better. This is my monthly self-care ritual now and I look forward to it every time.',
    },
  ],
  testimonialsTitle: 'What Our Guests Say',
  testimonialsSubtitle: 'Thousands of guests restored, renewed, and rejuvenated.',

  faqs: [
    {
      question: 'What should I wear to my massage?',
      answer:
        'Wear comfortable clothing. You will be given a private room to undress to your comfort level and will be properly draped with a sheet throughout your massage. Your modesty and comfort are always respected.',
    },
    {
      question: 'How early should I arrive?',
      answer:
        'Please arrive 15 minutes before your appointment to check in and relax in our tranquility lounge. Arriving late may shorten your session to accommodate the next guest.',
    },
    {
      question: 'What type of massage is right for me?',
      answer:
        'Swedish massage is best for relaxation and stress relief. Deep tissue is ideal for chronic pain and tension. Hot stone provides deep warmth and relaxation. Your therapist can recommend the best option based on your goals.',
    },
    {
      question: 'Do you offer gift cards?',
      answer:
        'Yes! Gift cards are available in any amount and can be purchased online or in person. They make perfect gifts for birthdays, holidays, anniversaries, or just to show someone you care about their wellbeing.',
    },
    {
      question: 'What is your cancellation policy?',
      answer:
        'We require 24 hours notice for cancellations or rescheduling. Cancellations within 24 hours may incur a 50% charge. Packages and special bookings have a 48-hour policy. We appreciate your understanding.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about your spa visit.',

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

  contactTitle: 'Book Your Spa Experience',
  contactSubtitle:
    'Call us or book online. We respond within one business day to confirm your reservation.',

  galleryTitle: 'Our Spa & Treatment Rooms',
  gallerySubtitle: 'See the Serenity sanctuary.',
  galleryImages: [
    'https://images.pexels.com/photos/9146381/pexels-photo-9146381.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/9146381/pexels-photo-9146381.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/9146381/pexels-photo-9146381.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Licensed therapists and estheticians dedicated to your wellbeing.',
  team: [
    { name: 'Sofia Romano, LMT', role: 'Lead Massage Therapist & Owner', bio: 'Licensed massage therapist with 14 years of experience specializing in deep tissue, sports massage, and aromatherapy. Sofia founded Serenity to create a true wellness sanctuary.' },
    { name: 'Aisha Bennett, LMT', role: 'Massage Therapist', bio: 'Licensed therapist with expertise in hot stone therapy, prenatal massage, and reflexology. Aisha has 9 years of experience and a calming, intuitive touch.' },
    { name: 'Grace Liu, LE', role: 'Lead Esthetician', bio: 'Licensed esthetician specializing in facials, body treatments, and skincare. Grace designs our spa packages and helps guests build personalized wellness routines.' },
  ],

  pricingTitle: 'Massage & Spa Packages',
  pricingSubtitle: 'Transparent pricing with package options available.',
  pricing: [
    { name: 'Single Session', price: 'From $85', description: '60-minute massage of your choice.', features: ['60-minute massage', 'Choice of modality', 'Personalized pressure', 'Tranquility lounge access'], popular: false },
    { name: 'Signature Package', price: 'From $165', description: '90-minute massage plus aromatherapy.', features: ['90-minute massage', 'Aromatherapy add-on', 'Hot towel treatment', 'Relaxation lounge', 'Complimentary tea'], popular: true },
    { name: 'Full Spa Day', price: 'From $295', description: 'Half-day multi-service wellness retreat.', features: ['90-minute massage', 'Custom facial', 'Body scrub treatment', 'Lunch in lounge', 'Take-home products'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the Serenity Spa & Wellness assistant. How can I help you today?",
    placeholder: "Ask about massages, spa packages, or booking...",
    knowledgeBase: [
      "We offer Swedish massage, deep tissue massage, hot stone therapy, aromatherapy, couples massage, and full spa packages.",
      "Swedish massage is best for relaxation, deep tissue for chronic pain, and hot stone for deep warmth and relaxation.",
      "Wear comfortable clothing. You will undress to your comfort level and be properly draped throughout your massage.",
      "Please arrive 15 minutes before your appointment to check in and relax in our tranquility lounge.",
      "Yes, gift cards are available in any amount and can be purchased online or in person.",
      "We require 24 hours notice for cancellations, and 48 hours for packages and special bookings.",
      "All our massage therapists and estheticians are state-licensed and experienced in multiple modalities.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are Monday through Saturday 9am to 8pm and Sunday 10am to 6pm.",
      "We have over 14 years of experience and have delivered more than 35,000 sessions with 100% licensed therapists.",
    ],
  },
};
