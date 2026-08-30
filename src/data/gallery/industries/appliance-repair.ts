import {
  Refrigerator,
  WashingMachine,
  Microwave,
  Wrench,
  Shield,
  Zap,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import type { IndustryConfig } from '../types';
import { SITE_ORIGIN } from '@/lib/site-url';

export const applianceRepairConfig: IndustryConfig = {
  id: 'appliance-repair',
  industryName: 'Appliance Repair',
  businessName: 'AppliancePro Repair',
  tagline: 'Fast Fixes. Honest Diagnostics. Appliances Running Again.',
  heroTitle: 'We Get Your Appliances Back to Work',
  heroSubtitle:
    'Same-day diagnostics and repair for all major household appliances. Factory-trained technicians, genuine parts, and upfront pricing — no surprises.',
  phone: '(555) 123-4567',
  email: 'service@applianceprorepair.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Sat 7am-8pm | Sun Emergency Only',
  yearsExperience: '12+',
  licenseNumber: 'AR-3849506',

  colors: {
    primary: '#4B5563',
    primaryDark: '#374151',
    primaryLight: '#F3F4F6',
    accent: '#B45309',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textMuted: '#6B7280',
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

  heroImage: `${SITE_ORIGIN}/gallery-photos/appliance-repair.jpg`,
  heroBadge: 'Same-Day Service • 90-Day Parts Warranty',
  ctaPrimary: 'Schedule Repair',
  ctaSecondary: 'View Services',

  stats: [
    { value: '12+', label: 'Years Experience' },
    { value: '15,000+', label: 'Appliances Repaired' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '90-Day', label: 'Parts Warranty' },
  ],

  services: [
    {
      icon: Refrigerator,
      title: 'Refrigerator Repair',
      description:
        'Cooling issues, leaks, ice makers, and strange noises — we diagnose and fix all major refrigerator brands, often on the first visit.',
      features: ['Cooling problems', 'Ice maker repair', 'Water dispenser', 'Compressor service'],
    },
    {
      icon: WashingMachine,
      title: 'Washer & Dryer',
      description:
        'From draining failures to heating problems, we get your laundry appliances running so you are not stuck at the laundromat.',
      features: ['Drainage issues', 'Spin cycle repair', 'Heating elements', 'Door seal replacement'],
    },
    {
      icon: Microwave,
      title: 'Oven & Stove',
      description:
        'Gas or electric, we repair ovens, stoves, and ranges that will not heat, unevenly bake, or have faulty burners and igniters.',
      features: ['Heating element', 'Igniter replacement', 'Burner repair', 'Thermostat calibration'],
    },
    {
      icon: Wrench,
      title: 'Dishwasher',
      description:
        'Dishes not getting clean? Leaks or draining problems? We fix the common and complex issues that keep your dishwasher off duty.',
      features: ['Drain pump repair', 'Spray arm fix', 'Door latch', 'Water inlet valve'],
    },
    {
      icon: Shield,
      title: 'Microwave',
      description:
        'Microwave not heating or making odd sounds? We safely repair magnetrons, door switches, and control boards.',
      features: ['Magnetron repair', 'Door switch fix', 'Turntable motor', 'Control panel'],
    },
    {
      icon: Zap,
      title: 'Garbage Disposal',
      description:
        'Jams, leaks, and dead disposals are no match for our fast, clean repair service that keeps your kitchen sink working.',
      features: ['Jam clearing', 'Leak repair', 'Motor replacement', 'Reset and wiring'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Factory-Trained Techs',
      description:
        'Our technicians are trained and certified on all major brands. We service Whirlpool, GE, Samsung, LG, Bosch, and more.',
    },
    {
      icon: Clock,
      title: 'Same-Day Availability',
      description:
        'A broken appliance cannot wait. We offer same-day and next-day appointments with evening and Saturday slots available.',
    },
    {
      icon: Users,
      title: 'Upfront, Honest Pricing',
      description:
        'You approve the price before we begin. No surprise charges, no inflated parts costs — just honest, flat-rate repair quotes.',
    },
    {
      icon: ThumbsUp,
      title: '90-Day Parts Warranty',
      description:
        'Every part we install is backed by a 90-day warranty. If the same part fails, we return and replace it at no charge.',
    },
  ],
  whyUsTitle: 'Why Customers Choose AppliancePro',
  whyUsSubtitle:
    'We make appliance repair fast, fair, and frustration-free.',

  process: [
    {
      step: '01',
      title: 'Book Your Appointment',
      description:
        'Call or book online. Tell us the appliance, brand, and the problem — we will schedule the earliest available slot.',
    },
    {
      step: '02',
      title: 'Diagnose & Quote',
      description:
        'Our technician inspects the appliance, identifies the issue, and gives you a flat-rate quote before any work begins.',
    },
    {
      step: '03',
      title: 'Repair With Genuine Parts',
      description:
        'Once you approve, we complete the repair using genuine OEM parts — most fixes are done in a single visit.',
    },
    {
      step: '04',
      title: 'Test & Warranty',
      description:
        'We test the appliance, clean up, and provide a 90-day parts warranty on everything we installed.',
    },
  ],
  processTitle: 'Our Repair Process',
  processSubtitle: 'From broken to working in four simple steps.',

  testimonials: [
    {
      name: 'Marcus B.',
      location: 'Hillcrest',
      rating: 5,
      text: 'Our fridge stopped cooling on a Sunday. They had a tech out Monday morning, diagnosed a bad compressor, and had it running by noon. Fair price and no upselling.',
    },
    {
      name: 'Elena V.',
      location: 'Glenwood',
      rating: 5,
      text: 'I was ready to throw out my washing machine. AppliancePro fixed a clogged pump in 30 minutes for a fraction of what a new one would cost. Highly recommend.',
    },
    {
      name: 'Tom H.',
      location: 'Westfield',
      rating: 5,
      text: 'Booked online in two minutes. Tech showed up on time, fixed my oven igniter, and even checked my range burners for free. Professional and friendly.',
    },
  ],
  testimonialsTitle: 'What Our Customers Say',
  testimonialsSubtitle: 'Real reviews from households we have rescued.',

  faqs: [
    {
      question: 'Do you offer same-day repair service?',
      answer:
        'Yes. We offer same-day appointments for most calls booked before noon, subject to availability. Evening and Saturday slots are also available. Call (555) 123-4567 to check today\'s schedule.',
    },
    {
      question: 'Which appliance brands do you service?',
      answer:
        'We service all major brands including Whirlpool, GE, Samsung, LG, Bosch, KitchenAid, Maytag, Frigidaire, and more. Our technicians are factory-trained and carry common parts for the most popular models.',
    },
    {
      question: 'Is there a diagnostic fee, and does it apply to the repair?',
      answer:
        'Yes, there is a flat diagnostic fee to come out and identify the problem. If you approve the repair, that fee is credited toward the total cost of the repair. You will know the full price before any work begins.',
    },
    {
      question: 'Do you use genuine parts?',
      answer:
        'Always. We use genuine OEM parts whenever available to ensure reliability and preserve any remaining manufacturer warranty. Every part we install is covered by our 90-day parts warranty.',
    },
    {
      question: 'Should I repair or replace my appliance?',
      answer:
        'A good rule of thumb: if the repair cost is less than half the price of a comparable new appliance and the unit is under 10 years old, repair is usually the better value. We will give you an honest assessment either way.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Answers before your technician arrives.',

  serviceAreas: [
    { name: 'Hillcrest' },
    { name: 'Glenwood' },
    { name: 'Westfield' },
    { name: 'Kensington' },
    { name: 'Riverdale' },
    { name: 'Northgate' },
    { name: 'Southpoint' },
    { name: 'Cedar Park' },
  ],
  serviceAreasTitle: 'Communities We Proudly Serve',

  contactTitle: 'Schedule Your Appliance Repair',
  contactSubtitle:
    'Call us or fill out the form below. Same-day appointments available — we respond within hours.',

  galleryTitle: 'Recent Appliance Repairs',
  gallerySubtitle: 'See the appliances we have brought back to life.',
  galleryImages: ['/hero-hvac.webp', '/hero-cleaning.webp', '/hero-restoration.webp'],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'The factory-trained technicians behind every repair.',
  team: [
    { name: 'Ray Patel', role: 'Founder & Master Technician', bio: '12+ years repairing every major appliance brand. Ray started AppliancePro to bring honest, fast service to the area.' },
    { name: 'Monica Diaz', role: 'Service Coordinator', bio: 'Schedules your appointment and keeps techs on time. Monica makes sure your repair happens when it works for you.' },
    { name: 'Derek Walsh', role: 'Senior Repair Technician', bio: 'Specializes in refrigeration and laundry appliances. Derek has completed over 5,000 successful repairs.' },
  ],

  pricingTitle: 'Appliance Repair Pricing',
  pricingSubtitle: 'Flat-rate, upfront pricing. Diagnostic fee credited toward repair.',
  pricing: [
    { name: 'Diagnostic Visit', price: '$89', description: 'Identify the problem and get a flat-rate quote.', features: ['On-site diagnosis', 'Flat-rate quote', 'Fee credited to repair', 'Brand expertise'], popular: false },
    { name: 'Standard Repair', price: 'From $189', description: 'Most common repairs including parts and labor.', features: ['Genuine OEM parts', 'Labor included', '90-day parts warranty', 'Single-visit completion', 'All major brands'], popular: true },
    { name: 'Preventive Maintenance', price: '$149/visit', description: 'Tune-up service to extend appliance life.', features: ['Full inspection', 'Cleaning & calibration', 'Wear-part check', 'Priority scheduling', '10% off future repairs'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the AppliancePro Repair assistant. What appliance can I help you with today?",
    placeholder: "Ask about repairs, brands, or scheduling...",
    knowledgeBase: [
      "We repair refrigerators, washers and dryers, ovens and stoves, dishwashers, microwaves, and garbage disposals.",
      "We service all major brands including Whirlpool, GE, Samsung, LG, Bosch, KitchenAid, Maytag, and Frigidaire.",
      "We are licensed (AR-3849506) and insured. Our technicians are factory-trained and background-checked.",
      "Yes, we offer same-day appointments for most calls booked before noon, subject to availability.",
      "There is a flat $89 diagnostic fee, which is credited toward the repair cost if you approve the work.",
      "We use genuine OEM parts and every part is backed by a 90-day warranty.",
      "Our hours are Monday-Saturday 7am-8pm, with Sunday emergency service available.",
      "We serve Hillcrest, Glenwood, Westfield, Kensington, Riverdale, Northgate, Southpoint, and Cedar Park.",
      "A repair is usually worth it if it costs less than half the price of a new appliance and the unit is under 10 years old.",
      "We have 12+ years of experience and have repaired over 15,000 appliances with a 4.9-star average rating.",
    ],
  },
};
