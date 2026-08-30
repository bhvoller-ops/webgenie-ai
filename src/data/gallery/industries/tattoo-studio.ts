import {
  Brush,
  PenTool,
  Eye,
  Shield,
  Sparkles,
  Gem,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const tattooStudioConfig: IndustryConfig = {
  id: 'tattoo-studio',
  industryName: 'Tattoo Studio',
  businessName: 'Iron Ink Tattoo Co.',
  tagline: 'Your Story. Our Art. Forever.',
  heroTitle: 'Custom Tattoos by Award-Winning Artists',
  heroSubtitle:
        'From fine line to bold realism, our artists bring your vision to life in a clean, professional studio. We prioritize your safety with hospital-grade sterilization and create one-of-a-kind art you will be proud to wear forever.',
  phone: '(555) 778-4451',
  email: 'bookings@ironinktattoo.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Tue-Sat 11am-9pm, Sun 12pm-6pm',
  yearsExperience: '16+',
  licenseNumber: 'TT-9920145',

  colors: {
    primary: '#1C1917',
    primaryDark: '#0C0A09',
    primaryLight: '#F5F5F4',
    accent: '#DC2626',
    background: '#FFFFFF',
    surface: '#FAFAF9',
    text: '#1C1917',
    textMuted: '#57534E',
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
    'https://images.pexels.com/photos/6593432/pexels-photo-6593432.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'Award-Winning Artists • Hospital-Grade Sterilization',
  ctaPrimary: 'Book Consultation',
  ctaSecondary: 'View Services',

  stats: [
    { value: '16+', label: 'Years Experience' },
    { value: '8,000+', label: 'Tattoos Created' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '12', label: 'Industry Awards' },
  ],

  services: [
    {
      icon: Brush,
      title: 'Custom Tattoos',
      description:
        'One-of-a-kind tattoos designed in collaboration with you. Bring your idea, reference, or just a feeling — our artists create original art tailored to your body, style, and story.',
      features: ['Original design', 'Custom artwork', 'Free consultation', 'All sizes welcome'],
    },
    {
      icon: PenTool,
      title: 'Fine Line Tattoos',
      description:
        'Delicate, precise single-needle work perfect for minimal designs, script, botanicals, and subtle detail. Our fine line artists create crisp, clean tattoos that age beautifully.',
      features: ['Single-needle precision', 'Minimal designs', 'Script & lettering', 'Botanical & delicate art'],
    },
    {
      icon: Eye,
      title: 'Black & Grey Realism',
      description:
        'Photorealistic black and grey tattoos including portraits, religious imagery, and detailed scenes. Our realism artists capture depth, texture, and emotion in stunning detail.',
      features: ['Portraits', 'Religious imagery', 'Realistic shading', 'Detailed scenes'],
    },
    {
      icon: Shield,
      title: 'Cover-Up Tattoos',
      description:
        'Expert cover-up artistry that transforms old or unwanted tattoos into beautiful new pieces. We assess your existing tattoo and design a custom piece to cover it effectively.',
      features: ['Old tattoo cover-ups', 'Custom redesign', 'Laser prep consultation', 'Seamless blending'],
    },
    {
      icon: Sparkles,
      title: 'Tattoo Touch-Ups',
      description:
        'Refresh and restore faded or aging tattoos. We re-line, re-shade, and brighten older work to bring it back to its original vibrancy — or better.',
      features: ['Faded tattoo refresh', 'Re-lining & shading', 'Color restoration', 'Aging tattoo repair'],
    },
    {
      icon: Gem,
      title: 'Piercings',
      description:
        'Professional body piercings using sterile, implant-grade jewelry. From earlobes to cartilage and select body piercings, performed by trained, certified piercers in a clean environment.',
      features: ['Ear & cartilage piercing', 'Implant-grade jewelry', 'Sterile technique', 'Aftercare guidance'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Award-Winning Artists',
      description:
        'Our artists have won 12 industry awards and been featured in national tattoo publications. You are working with recognized talent committed to the highest artistic standards.',
    },
    {
      icon: Clock,
      title: 'Hospital-Grade Sterilization',
      description:
        'Your safety is non-negotiable. We use medical-grade autoclave sterilization, single-use needles and tubes, and barrier protection for every single tattoo and piercing.',
    },
    {
      icon: Users,
      title: 'Collaborative Design',
      description:
        'We do not just tattoo flash. We work with you to design meaningful, original art. Your consultation is free, and we refine the design until it is exactly what you want.',
    },
    {
      icon: ThumbsUp,
      title: 'Lifetime Touch-Up',
      description:
        'Every tattoo comes with one free touch-up within the first year to ensure it heals perfectly. We stand behind our work and want you to love it for a lifetime.',
    },
  ],
  whyUsTitle: 'Why Collectors Choose Iron Ink',
  whyUsSubtitle:
    'Award-winning artists, hospital-grade sterilization, and original art designed with you.',

  process: [
    {
      step: '01',
      title: 'Free Consultation',
      description:
        'Meet with an artist to discuss your idea, placement, size, and style. We sketch concepts and provide a quote. No deposit required for the consultation itself.',
    },
    {
      step: '02',
      title: 'Design & Deposit',
      description:
        'Once you approve the concept, we finalize your custom design. A deposit secures your appointment and covers design time. We refine the art until it is perfect.',
    },
    {
      step: '03',
      title: 'Your Tattoo Session',
      description:
        'Arrive for your appointment. We set up sterile equipment, apply the stencil, and tattoo in a clean, comfortable private station. Breaks provided as needed.',
    },
    {
      step: '04',
      title: 'Healing & Touch-Up',
      description:
        'We provide detailed aftercare instructions and premium aftercare products. A free touch-up within the first year ensures your tattoo heals perfectly.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'A collaborative process from concept to a lifetime of ink.',

  testimonials: [
    {
      name: 'Marcus V.',
      location: 'Brookside',
      rating: 5,
      text: 'My sleeve is a masterpiece. My artist took my vague ideas and turned them into something better than I imagined. The line work and shading are flawless even two years later. Worth every dollar.',
    },
    {
      name: 'Jasmine R.',
      location: 'Fairfield',
      rating: 5,
      text: 'I had an old tattoo I hated and they covered it with a beautiful floral piece. You cannot even tell there was anything underneath. The studio is spotless and the artists are true professionals.',
    },
    {
      name: 'Tyler K.',
      location: 'Eastside',
      rating: 5,
      text: 'Got a fine line piece that is so crisp and clean. The single-needle work is incredibly precise. The whole experience was comfortable and the artist really listened to what I wanted. Already booked my next one.',
    },
  ],
  testimonialsTitle: 'What Our Clients Say',
  testimonialsSubtitle: 'Original art and lifelong clients who love their ink.',

  faqs: [
    {
      question: 'How much does a tattoo cost?',
      answer:
        'Pricing depends on size, detail, placement, and the artist. We provide a quote at your free consultation. Our shop minimum is $100, and custom work is typically priced at an hourly rate. Deposits apply toward your total.',
    },
    {
      question: 'How do I prepare for my tattoo appointment?',
      answer:
        'Get a good night of sleep, eat a full meal beforehand, stay hydrated, and avoid alcohol and blood-thinning medications for 24 hours. Wear comfortable clothing that allows easy access to the tattoo area.',
    },
    {
      question: 'How should I care for my new tattoo?',
      answer:
        'Keep it clean with gentle soap, apply a thin layer of the aftercare ointment we provide, and avoid sun, soaking, and picking. We give you detailed written aftercare instructions and premium aftercare products at your appointment.',
    },
    {
      question: 'Can you cover up an old tattoo?',
      answer:
        'Most tattoos can be covered with the right design. We assess your existing tattoo at consultation and recommend whether a cover-up, a few laser lightening sessions, or a rework is the best path to the result you want.',
    },
    {
      question: 'Do you do walk-ins?',
      answer:
        'We are primarily appointment-based to ensure each client gets dedicated time and a custom design. We occasionally take walk-ins for small pieces when artists have openings — call ahead to check availability.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about getting tattooed with us.',

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

  contactTitle: 'Book Your Free Consultation',
  contactSubtitle:
    'Call us or fill out the form with your tattoo idea. We respond within one business day.',

  galleryTitle: 'Our Recent Tattoo Work',
  gallerySubtitle: 'See the Iron Ink difference.',
  galleryImages: [
    'https://images.pexels.com/photos/6593432/pexels-photo-6593432.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/6593432/pexels-photo-6593432.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/6593432/pexels-photo-6593432.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Artists',
  teamSubtitle: 'Award-winning tattoo artists dedicated to your custom piece.',
  team: [
    { name: 'Diego "Diesel" Ramirez', role: 'Owner & Realism Artist', bio: 'Award-winning tattoo artist with 16 years of experience specializing in black and grey realism and portraits. Diego has won 12 industry awards and founded Iron Ink to elevate tattoo artistry and safety.' },
    { name: 'Suki Tanaka', role: 'Fine Line & Custom Artist', bio: 'Specializes in fine line, single-needle, and delicate custom work. Suki has 9 years of experience and is known for crisp, minimal designs that age beautifully.' },
    { name: 'Marcus "Bishop" Cole', role: 'Custom & Cover-Up Artist', bio: 'Expert in custom large-scale work and cover-up artistry. Marcus has 11 years of experience transforming old tattoos and creating bold, original pieces.' },
  ],

  pricingTitle: 'Tattoo Service Options',
  pricingSubtitle: 'Transparent pricing with free consultations.',
  pricing: [
    { name: 'Small Piece', price: 'From $100', description: 'Tattoos under 2 inches.', features: ['Custom design', 'Up to 1 hour', 'Free consultation', 'Aftercare kit', '1 free touch-up'], popular: false },
    { name: 'Custom Session', price: 'From $180/hour', description: 'Most custom tattoos by the hour.', features: ['Custom artwork', 'Hourly rate', 'Free consultation', 'Aftercare kit', '1 free touch-up'], popular: true },
    { name: 'Full Day Session', price: 'From $1,200', description: '6 to 8 hours for large pieces.', features: ['Custom design', '6 to 8 hour session', 'Priority scheduling', 'Aftercare kit', '1 free touch-up'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the Iron Ink Tattoo Co. assistant. How can I help you today?",
    placeholder: "Ask about tattoos, consultations, or pricing...",
    knowledgeBase: [
      "We offer custom tattoos, fine line tattoos, black and grey realism, cover-up tattoos, tattoo touch-ups, and piercings.",
      "Pricing depends on size, detail, and placement. Our shop minimum is $100 and custom work is priced hourly. We provide a quote at your free consultation.",
      "To prepare, get good sleep, eat a full meal beforehand, stay hydrated, and avoid alcohol and blood-thinning medications for 24 hours.",
      "Keep your new tattoo clean, apply the aftercare ointment we provide, and avoid sun, soaking, and picking. We provide detailed written aftercare instructions.",
      "Most old tattoos can be covered. We assess your tattoo at consultation and recommend a cover-up, laser lightening, or rework.",
      "We are primarily appointment-based, but occasionally take walk-ins for small pieces when artists have openings.",
      "All our artists are award-winning with 12 industry awards, and we use hospital-grade autoclave sterilization and single-use needles.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are Tuesday through Saturday 11am to 9pm and Sunday 12pm to 6pm.",
      "We have over 16 years of experience and have created more than 8,000 tattoos.",
    ],
  },
};
