import {
  Scissors,
  Brush,
  Sparkles,
  Baby,
  Palette,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
  Crown,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

const BASE_URL = 'https://images.pexels.com/photos/';

export const barberShopConfig: IndustryConfig = {
  id: 'barber-shop',
  industryName: 'Barber Shop',
  businessName: 'The Gentleman’s Cut',
  tagline: 'Sharp Cuts. Classic Service.',
  heroTitle: 'A Better Cut, a Better Experience',
  heroSubtitle:
    'A traditional barber shop with modern skill. Hot towel shaves, precision fades, and classic cuts delivered by barbers who take pride in the craft. Walk in, relax, walk out sharp.',
  phone: '(555) 771-2240',
  email: 'bookings@gentlemenscut.com',
  serviceArea: 'Downtown Core & Surrounding Neighborhoods',
  hours: 'Tue-Sat 9am-7pm',
  yearsExperience: '15+',
  licenseNumber: 'BAR-2298-15',

  colors: {
    primary: '#A16207',
    primaryDark: '#854D0E',
    primaryLight: '#FEF3C7',
    accent: '#1C1917',
    background: '#FFFFFF',
    surface: '#FFFBEB',
    text: '#1A1408',
    textMuted: '#6B5E48',
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

  heroImage: `${BASE_URL}1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=1200`,
  heroBadge: 'Master Barbers • Walk-Ins Welcome',
  ctaPrimary: 'Book an Appointment',
  ctaSecondary: 'View Services',

  stats: [
    { value: '15+', label: 'Years in Business' },
    { value: '18K+', label: 'Cuts Delivered' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '6', label: 'Master Barbers' },
  ],

  services: [
    {
      icon: Scissors,
      title: 'Classic Haircut',
      description:
        'A timeless cut tailored to your face shape and style. Consultation, precision cut, and a clean finish with a hot towel and styling. The foundation of looking sharp.',
      features: ['Consultation', 'Precision cut', 'Hot towel finish', 'Styling included'],
    },
    {
      icon: Brush,
      title: 'Beard Trim & Shape',
      description:
        'Detailed beard grooming that defines your lines and keeps your beard healthy. Includes trim, shaping, beard oil, and a straight razor line-up for a clean edge.',
      features: ['Line-up', 'Beard oil', 'Straight razor edge', 'Shape & define'],
    },
    {
      icon: Sparkles,
      title: 'Hot Towel Shave',
      description:
        'The full traditional straight razor shave. Hot towels, rich lather, and a close, smooth finish followed by a cooling aftershave balm. Pure old-school relaxation.',
      features: ['Hot towels', 'Straight razor', 'Rich lather', 'Aftershave balm'],
    },
    {
      icon: Baby,
      title: 'Kids Cuts',
      description:
        'Patient, friendly cuts for kids 12 and under. Our barbers make it fun and quick so your little guy leaves smiling and looking sharp.',
      features: ['Ages 12 & under', 'Patient barbers', 'Quick service', 'First-cut keepsake'],
    },
    {
      icon: Palette,
      title: 'Hair Coloring',
      description:
        'Gray blending, full color, and beard tinting to keep you looking your best. Professional products, even coverage, and a natural-looking finish.',
      features: ['Gray blending', 'Full color', 'Beard tint', 'Professional products'],
    },
    {
      icon: Sparkles,
      title: 'Skin Fade',
      description:
        'Crisp, seamless fades — low, mid, high, or bald. Our barbers blend by hand for a smooth gradient that stays sharp for weeks.',
      features: ['Low / mid / high fade', 'Bald fade', 'Hand-blended', 'Sharp line-up'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Master Barbers',
      description:
        'Every barber on our team is licensed and trained in classic and modern technique. We invest in ongoing education so your cut benefits from the best of both worlds.',
    },
    {
      icon: Clock,
      title: 'On-Time Appointments',
      description:
        'We respect your time. Book online and we will be ready when you arrive. Walk-ins are welcome, and we will give you an honest wait estimate.',
    },
    {
      icon: Users,
      title: 'A Real Barbershop',
      description:
        'Good conversation, great music, and a chair that feels like yours. This is a place to relax, not just a place to get a haircut. You will feel the difference.',
    },
    {
      icon: ThumbsUp,
      title: 'Sharp Guarantee',
      description:
        'If something is not right, tell us within 48 hours and we will fix it free. We stand behind every cut, shave, and line-up that leaves our chairs.',
    },
  ],
  whyUsTitle: 'Why Gentlemen Trust The Gentleman’s Cut',
  whyUsSubtitle:
    'A traditional barbershop where the craft, the conversation, and the cut all matter.',

  process: [
    {
      step: '01',
      title: 'Book or Walk In',
      description:
        'Reserve your chair online or walk in. We will give you an honest wait time and a cold drink while you wait.',
    },
    {
      step: '02',
      title: 'Consultation',
      description:
        'Your barber asks what you want, checks your hair and face shape, and suggests the best approach before picking up the clippers.',
    },
    {
      step: '03',
      title: 'The Cut',
      description:
        'Precision cutting, hand-blended fades, and a hot towel finish. Sit back, relax, and let the barber work.',
    },
    {
      step: '04',
      title: 'Sharp Finish',
      description:
        'A clean line-up, styling, and a mirror check. You walk out looking sharp and feeling like a million bucks.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'A sharp cut from the moment you walk in.',

  testimonials: [
    {
      name: 'Anthony D.',
      location: 'Downtown Core',
      rating: 5,
      text: 'Best fade in the city, no contest. My barber remembers exactly how I like it and the line-up is always crisp. The hot towel finish is the best part of my week. I will not go anywhere else.',
    },
    {
      name: 'Kevin M.',
      location: 'Midtown',
      rating: 5,
      text: 'I brought my 6-year-old in for his first real haircut and they made it such a good experience. Patient, fun, and they even gave us a keepsake lock of hair. The cut was perfect too.',
    },
    {
      name: 'Derek S.',
      location: 'Uptown',
      rating: 5,
      text: 'The hot towel shave is worth every penny. It is the most relaxed I feel all week. The shop itself is clean, classic, and the conversation is always good. A real barbershop.',
    },
  ],
  testimonialsTitle: 'What Our Clients Say',
  testimonialsSubtitle: 'Sharp cuts and loyal clients — that is how we measure success.',

  faqs: [
    {
      question: 'Do you take walk-ins or do I need an appointment?',
      answer:
        'Both. We recommend booking online to guarantee your time, especially on Fridays and Saturdays. Walk-ins are always welcome and we will give you an honest wait estimate.',
    },
    {
      question: 'How long does a haircut take?',
      answer:
        'A classic haircut takes about 30 minutes. A skin fade or a cut with a beard service can take 45 minutes to an hour. We never rush, so plan accordingly and enjoy the chair.',
    },
    {
      question: 'Do you cut all hair types?',
      answer:
        'Yes. Our barbers are trained in all hair textures and types, from straight to coily. Tell us what you have and what you want, and we will match you with the right barber.',
    },
    {
      question: 'What is your policy on kids?',
      answer:
        'We cut kids 12 and under at a discounted rate. We are patient and make it fun, but if your child is very young or nervous, let us know when booking so we can plan extra time.',
    },
    {
      question: 'What if I do not like my cut?',
      answer:
        'Tell us within 48 hours and we will fix it at no charge. We stand behind our work and want you to leave happy. Your satisfaction is the whole point.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know before your visit.',

  serviceAreas: [
    { name: 'Downtown Core' },
    { name: 'Midtown' },
    { name: 'Uptown' },
    { name: 'Eastside' },
    { name: 'Riverside' },
    { name: 'Brookside' },
    { name: 'Fairfield' },
    { name: 'Westgate' },
  ],
  serviceAreasTitle: 'Neighborhoods We Serve',

  contactTitle: 'Book Your Chair',
  contactSubtitle:
    'Call us or fill out the form below. We confirm appointments within one business day.',

  galleryTitle: 'Recent Cuts & Styles',
  gallerySubtitle: 'A look at the work that comes out of our chairs.',
  galleryImages: [
    `${BASE_URL}1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=1200`,
    `${BASE_URL}3993465/pexels-photo-3993465.jpeg?auto=compress&cs=tinysrgb&w=1200`,
    `${BASE_URL}3992874/pexels-photo-3992874.jpeg?auto=compress&cs=tinysrgb&w=1200`,
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Licensed master barbers who take pride in every cut.',
  team: [
    { name: 'Frank Russo', role: 'Master Barber & Owner', bio: 'Fifteen years behind the chair and a third-generation barber. Frank opened The Gentleman’s Cut to bring classic craft and real conversation back to the neighborhood.' },
    { name: 'Devon Carter', role: 'Senior Barber', bio: 'Our fade specialist. Devon’s hand-blended skin fades have a loyal following and a reputation for staying sharp for weeks.' },
    { name: 'Luis Ortega', role: 'Barber', bio: 'Straight razor shave expert and beard shaping specialist. Luis brings old-school technique and a steady hand to every service.' },
  ],

  pricingTitle: 'Service Menu',
  pricingSubtitle: 'Straightforward pricing, no surprises.',
  pricing: [
    { name: 'Kids Cut', price: '$25', description: 'Cuts for ages 12 and under.', features: ['Consultation', 'Precision cut', 'Light styling', 'First-cut keepsake'], popular: false },
    { name: 'Classic Haircut', price: '$38', description: 'Our signature cut with hot towel finish.', features: ['Consultation', 'Precision cut', 'Hot towel finish', 'Line-up', 'Styling included'], popular: true },
    { name: 'Cut & Shave', price: '$65', description: 'Full service: cut, beard, and hot towel shave.', features: ['Classic haircut', 'Beard trim & shape', 'Hot towel straight razor shave', 'Line-up', 'Aftershave balm', 'Styling'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hey! I am The Gentleman’s Cut assistant. How can I help you today?",
    placeholder: "Ask about our services or booking...",
    knowledgeBase: [
      "We offer classic haircuts, beard trims and shaping, hot towel straight razor shaves, kids cuts, hair coloring, and skin fades.",
      "We take both appointments and walk-ins. Book online to guarantee your time, especially on Fridays and Saturdays. Walk-ins are always welcome.",
      "A classic haircut takes about 30 minutes. A skin fade or a cut with a beard service can take 45 minutes to an hour.",
      "Yes, our barbers are trained in all hair textures and types, from straight to coily. Tell us what you want and we will match you with the right barber.",
      "We cut kids 12 and under at a discounted rate of $25. We are patient and make it fun.",
      "If you are not happy with your cut, tell us within 48 hours and we will fix it at no charge.",
      "We serve Downtown Core, Midtown, Uptown, Eastside, Riverside, Brookside, Fairfield, and Westgate.",
      "Our hours are Tuesday through Saturday, 9am to 7pm. We are closed Sundays and Mondays.",
      "We have 15+ years in business and a team of 6 master barbers.",
      "To book an appointment, call us at (555) 771-2240 or book online through our website.",
    ],
  },
};
