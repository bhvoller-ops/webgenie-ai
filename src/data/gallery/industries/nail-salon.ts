import {
  Sparkles,
  Droplets,
  Gem,
  Brush,
  Palette,
  Crown,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const nailSalonConfig: IndustryConfig = {
  id: 'nail-salon',
  industryName: 'Nail Salon',
  businessName: 'Polished Nail Studio',
  tagline: 'Beautiful Nails. Beautiful You.',
  heroTitle: 'Luxury Nail Care in a Clean, Relaxing Studio',
  heroSubtitle:
    'From classic manicures to intricate nail art, our licensed technicians deliver flawless results using premium products and hospital-grade sanitation. Book your appointment and treat yourself to the pampering you deserve.',
  phone: '(555) 917-2204',
  email: 'bookings@polishednails.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Tue-Sat 9am-7pm, Sun 10am-5pm',
  yearsExperience: '8+',
  licenseNumber: 'CL-6612087',

  colors: {
    primary: '#BE185D',
    primaryDark: '#9F1239',
    primaryLight: '#FCE7F3',
    accent: '#0D9488',
    background: '#FFFFFF',
    surface: '#FDF2F8',
    text: '#1A0A12',
    textMuted: '#6B5B62',
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
    'https://images.pexels.com/photos/14267565/pexels-photo-14267565.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'Licensed Technicians • Hospital-Grade Sanitation',
  ctaPrimary: 'Book Appointment',
  ctaSecondary: 'View Services',

  stats: [
    { value: '8+', label: 'Years Experience' },
    { value: '20,000+', label: 'Clients Served' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '100%', label: 'Sanitation Guarantee' },
  ],

  services: [
    {
      icon: Sparkles,
      title: 'Manicures',
      description:
        'Classic, gel, and luxury manicures that leave your hands soft and your nails flawless. Includes shaping, cuticle care, massage, and polish or gel finish.',
      features: ['Classic manicure', 'Gel manicure', 'Luxury spa manicure', 'Cuticle & hand care'],
    },
    {
      icon: Droplets,
      title: 'Pedicures',
      description:
        'Relaxing pedicures with warm soak, exfoliation, callus removal, and massage. Choose classic polish or long-lasting gel for beautiful, smooth feet.',
      features: ['Classic pedicure', 'Spa pedicure', 'Gel pedicure', 'Callus & heel care'],
    },
    {
      icon: Gem,
      title: 'Gel & Shellac',
      description:
        'Long-lasting gel and shellac polish that stays glossy for up to three weeks with no chipping. Dozens of colors and finishes to choose from.',
      features: ['Gel polish', 'Shellac finish', 'No-chip wear', 'Quick LED cure'],
    },
    {
      icon: Brush,
      title: 'Acrylic Nails',
      description:
        'Custom acrylic extensions and overlays for length, strength, and a flawless finish. Natural-looking or bold — your nails, your style.',
      features: ['Full set acrylics', 'Acrylic fills', 'Custom shaping', 'Natural or bold'],
    },
    {
      icon: Palette,
      title: 'Nail Art',
      description:
        'Custom nail art from subtle accents to full designs. Our artists create hand-painted art, rhinestone detailing, ombre, and seasonal looks.',
      features: ['Hand-painted designs', 'Rhinestone & charms', 'Ombre & gradient', 'Seasonal art'],
    },
    {
      icon: Crown,
      title: 'Dip Powder Nails',
      description:
        'Durable, lightweight dip powder nails that last up to a month with no UV light. A healthier alternative that strengthens your natural nails.',
      features: ['Long-lasting wear', 'No UV light', 'Strengthens natural nails', 'Dozens of colors'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Licensed Technicians',
      description:
        'Every technician is state-licensed and continuously trained in the latest techniques. You receive expert care and beautiful, long-lasting results every visit.',
    },
    {
      icon: Clock,
      title: 'On-Time Appointments',
      description:
        'We respect your schedule. Appointments start on time, and we offer online booking so you can reserve your spot anytime, day or night.',
    },
    {
      icon: Users,
      title: 'Hospital-Grade Sanitation',
      description:
        'Your health is our priority. We use medical-grade autoclave sterilization for all metal tools and single-use items for everything else. 100% safe, every time.',
    },
    {
      icon: ThumbsUp,
      title: 'Premium Products',
      description:
        'We use only high-quality, long-wear polishes and nail care products from trusted brands. Better products mean better, longer-lasting results for your nails.',
    },
  ],
  whyUsTitle: 'Why Clients Love Polished',
  whyUsSubtitle:
    'Licensed technicians, premium products, and the highest sanitation standards in town.',

  process: [
    {
      step: '01',
      title: 'Book Your Visit',
      description:
        'Reserve your appointment online or by phone. Choose your service and a time that fits your schedule. Walk-ins welcome based on availability.',
    },
    {
      step: '02',
      title: 'Consultation',
      description:
        'Your technician discusses your preferences for shape, length, color, and any nail art. We help you choose the perfect look for your style.',
    },
    {
      step: '03',
      title: 'Pampering Service',
      description:
        'Relax while your technician provides expert nail care in a clean, comfortable setting. Enjoy complimentary beverages and a calming atmosphere.',
    },
    {
      step: '04',
      title: 'Beautiful Results',
      description:
        'Leave with flawless nails and a plan for maintenance. We provide aftercare tips to keep your manicure or pedicure looking fresh longer.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'A relaxing experience from booking to beautiful results.',

  testimonials: [
    {
      name: 'Brittany A.',
      location: 'Brookside',
      rating: 5,
      text: 'The cleanest nail salon I have ever been to. They open all tools from sealed pouches and the dip powder lasted four weeks without lifting. My go-to spot now — worth every penny.',
    },
    {
      name: 'Latoya M.',
      location: 'Fairfield',
      rating: 5,
      text: 'The nail art here is incredible. I bring in inspiration photos and they nail it every time. The hand-painted designs are true art. Plus the pedicure massage chairs are so relaxing.',
    },
    {
      name: 'Sophie C.',
      location: 'Eastside',
      rating: 5,
      text: 'I have weak, peeling nails and the dip powder has actually helped them grow. The technicians are so gentle and knowledgeable about nail health. My nails have never looked better.',
    },
  ],
  testimonialsTitle: 'What Our Clients Say',
  testimonialsSubtitle: 'Beautiful nails and happy clients are what we do best.',

  faqs: [
    {
      question: 'How long does a gel manicure last?',
      answer:
        'A gel or shellac manicure typically lasts 2 to 3 weeks without chipping when properly cared for. We recommend scheduling a fill or removal at the 3-week mark to keep your nails healthy.',
    },
    {
      question: 'How do you sanitize your tools?',
      answer:
        'We use medical-grade autoclave sterilization for all metal tools, which is the highest standard in the industry. Files, buffers, and orangewood sticks are single-use and disposed of after each client.',
    },
    {
      question: 'Do you take walk-ins?',
      answer:
        'We welcome walk-ins based on availability, but we strongly recommend booking an appointment to guarantee your preferred time and technician. You can book online anytime or call us during business hours.',
    },
    {
      question: 'What is the difference between gel and dip powder?',
      answer:
        'Gel polish is cured under a UV or LED lamp and lasts 2 to 3 weeks. Dip powder is applied without UV light, lasts up to 4 weeks, and tends to be lighter and healthier for natural nails. We can help you choose.',
    },
    {
      question: 'Can I bring my own design or inspiration photo?',
      answer:
        'Absolutely! We love bringing your vision to life. Bring photos, screenshots, or describe your idea and our nail artists will create a custom look. Complex designs may require a longer appointment.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about your nail care.',

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

  contactTitle: 'Book Your Nail Appointment',
  contactSubtitle:
    'Call us or book online. We respond within one business day to confirm your appointment.',

  galleryTitle: 'Our Recent Nail Art',
  gallerySubtitle: 'See the Polished difference.',
  galleryImages: [
    'https://images.pexels.com/photos/14267565/pexels-photo-14267565.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/14267565/pexels-photo-14267565.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/14267565/pexels-photo-14267565.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Licensed, talented nail technicians who love what they do.',
  team: [
    { name: 'Mia Tran', role: 'Lead Nail Artist & Owner', bio: 'Licensed nail technician with 8 years of experience and advanced training in nail art and acrylics. Mia founded Polished to set a new standard for sanitation and artistry in nail care.' },
    { name: 'Destiny Williams', role: 'Senior Technician', bio: 'Specializes in gel manicures, dip powder, and intricate nail art. Destiny has 6 years of experience and is known for her creative, Instagram-worthy designs.' },
    { name: 'Hannah Kim', role: 'Nail Technician', bio: 'Licensed technician with expertise in spa pedicures and natural nail care. Hannah focuses on nail health and relaxation, making every visit a pampering experience.' },
  ],

  pricingTitle: 'Nail Service Packages',
  pricingSubtitle: 'Transparent pricing with no hidden fees.',
  pricing: [
    { name: 'Essential', price: 'From $35', description: 'Classic manicure or pedicure.', features: ['Classic manicure or pedicure', 'Shaping & cuticle care', 'Hand or foot massage', 'Polish application'], popular: false },
    { name: 'Signature', price: 'From $65', description: 'Gel or dip with premium care.', features: ['Gel or dip powder', 'Spa manicure & pedicure', 'Premium products', 'Massage & exfoliation', 'Aftercare kit'], popular: true },
    { name: 'Artistry', price: 'From $95', description: 'Acrylics or full custom nail art.', features: ['Acrylic full set or fill', 'Custom nail art', 'Hand-painted designs', 'Rhinestones & charms', 'Aftercare kit'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the Polished Nail Studio assistant. How can I help you today?",
    placeholder: "Ask about nail services, booking, or pricing...",
    knowledgeBase: [
      "We offer manicures, pedicures, gel and shellac, acrylic nails, custom nail art, and dip powder nails.",
      "A gel or shellac manicure typically lasts 2 to 3 weeks without chipping.",
      "We use medical-grade autoclave sterilization for all metal tools and single-use items for everything else.",
      "We welcome walk-ins based on availability, but booking an appointment is strongly recommended.",
      "Dip powder lasts up to 4 weeks, is applied without UV light, and is lighter and healthier for natural nails.",
      "Yes, you can bring inspiration photos and our nail artists will create a custom look for you.",
      "All our technicians are state-licensed and continuously trained in the latest techniques.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are Tuesday through Saturday 9am to 7pm and Sunday 10am to 5pm.",
      "We have over 8 years of experience and have served more than 20,000 clients with a 100% sanitation guarantee.",
    ],
  },
};
