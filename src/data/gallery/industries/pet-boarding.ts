import {
  Bed,
  Sun,
  Cat,
  Sparkles,
  HeartPulse,
  Truck,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
  PawPrint,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const petBoardingConfig: IndustryConfig = {
  id: 'pet-boarding',
  industryName: 'Pet Boarding & Daycare',
  businessName: 'Happy Tails Resort',
  tagline: 'Where Your Pet Goes on Vacation, Too.',
  heroTitle: 'A Home Away From Home for Your Pet',
  heroSubtitle:
    'Safe, loving overnight boarding, daycare, and grooming for dogs and cats. Climate-controlled suites, live webcams, and certified staff give you peace of mind while you are away.',
  phone: '(555) 884-3310',
  email: 'stay@happytailsresort.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Sun 7am-7pm',
  yearsExperience: '13+',
  licenseNumber: 'PB-2291845',

  colors: {
    primary: '#0EA5E9',
    primaryDark: '#0284C7',
    primaryLight: '#E0F2FE',
    accent: '#BE185D',
    background: '#FFFFFF',
    surface: '#F0F9FF',
    text: '#0A121A',
    textMuted: '#5B636B',
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

  heroImage: 'https://images.pexels.com/photos/16465605/pexels-photo-16465605.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'Climate-Controlled • Live Webcams',
  ctaPrimary: 'Book a Stay',
  ctaSecondary: 'View Services',

  stats: [
    { value: '13+', label: 'Years Experience' },
    { value: '28,000+', label: 'Pets Hosted' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '24/7', label: 'Staff On-Site' },
  ],

  services: [
    {
      icon: Bed,
      title: 'Overnight Boarding',
      description:
        'Spacious, climate-controlled suites with cozy bedding and personalized care. Webcams let you check on your pet anytime.',
      features: ['Private suites', 'Climate control', 'Live webcams', 'Nightly tuck-in'],
    },
    {
      icon: Sun,
      title: 'Doggy Daycare',
      description:
        'Supervised group play, exercise, and socialization for dogs of all sizes. A fun, safe day while you are at work or away.',
      features: ['Group play', 'Size-appropriate groups', 'Outdoor yards', 'Nap time'],
    },
    {
      icon: Cat,
      title: 'Cat Boarding',
      description:
        'Quiet, cozy cat condos with perches, scratching posts, and daily one-on-one attention in a separate, calm wing.',
      features: ['Private cat condos', 'Quiet wing', 'Daily playtime', 'Perches & posts'],
    },
    {
      icon: Sparkles,
      title: 'Pet Spa & Grooming',
      description:
        'Baths, haircuts, nail trims, and spa treatments to keep your pet looking and feeling their best during their stay.',
      features: ['Baths & haircuts', 'Nail trims', 'Ear cleaning', 'Spa add-ons'],
    },
    {
      icon: HeartPulse,
      title: 'Special Needs Care',
      description:
        'Medication administration, senior care, and customized attention for pets with medical or behavioral needs.',
      features: ['Medication admin', 'Senior care', 'Special diets', 'Customized attention'],
    },
    {
      icon: Truck,
      title: 'Pet Transportation',
      description:
        'Door-to-door pickup and drop-off so your pet\u2019s stay is effortless for you. Safe, climate-controlled transport.',
      features: ['Pickup & drop-off', 'Climate-controlled', 'Safe transport', 'Scheduled service'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Certified & Insured',
      description:
        'Our staff is trained and certified in pet care and CPR. We are fully insured and follow strict safety protocols at all times.',
    },
    {
      icon: Clock,
      title: '24/7 Staff On-Site',
      description:
        'Staff is on-site around the clock. Your pet is never left alone, and someone is always there to respond to any need.',
    },
    {
      icon: Users,
      title: 'Live Webcams',
      description:
        'Watch your pet play and rest from anywhere with our live webcam access. Peace of mind while you are away from your best friend.',
    },
    {
      icon: ThumbsUp,
      title: 'Free First-Day Trial',
      description:
        'New daycare dogs get a free trial day so we can assess temperament and you can see how much your pet loves it here.',
    },
  ],
  whyUsTitle: 'Why Pet Parents Choose Happy Tails',
  whyUsSubtitle:
    'Safe, loving care with the amenities and attention your pet deserves.',

  process: [
    {
      step: '01',
      title: 'Create a Profile',
      description:
        'Book online or call us. We collect your pet\u2019s details, vaccination records, and any special needs or preferences.',
    },
    {
      step: '02',
      title: 'Meet & Greet',
      description:
        'First-time daycare dogs get a free trial day. We assess temperament and introduce your dog to appropriate play groups.',
    },
    {
      step: '03',
      title: 'Enjoy the Stay',
      description:
        'Your pet enjoys spacious suites, supervised play, and personalized care. You check in anytime via live webcam.',
    },
    {
      step: '04',
      title: 'Pickup or Delivery',
      description:
        'Pick up your happy, tired pet or use our door-to-door transportation service. You receive a stay report card.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'A simple, stress-free experience for you and your pet.',

  testimonials: [
    {
      name: 'Michelle P.',
      location: 'Brookside',
      rating: 5,
      text: 'I was nervous boarding my dog for the first time, but the live webcams put me at ease. I could see him playing and happy. He came home tired and clean. We are customers for life.',
    },
    {
      name: 'Andre W.',
      location: 'Fairfield',
      rating: 5,
      text: 'Doggy daycare twice a week has been amazing for my high-energy pup. He comes home exhausted and happy. The staff knows him by name and the trial day made starting easy.',
    },
    {
      name: 'Jenna K.',
      location: 'Eastside',
      rating: 5,
      text: 'My senior cat needs medication twice a day. Happy Tails handles it perfectly in their quiet cat wing. The daily updates give me total peace of mind when I travel.',
    },
  ],
  testimonialsTitle: 'What Pet Parents Say',
  testimonialsSubtitle: 'Happy pets and relaxed owners are our goal every day.',

  faqs: [
    {
      question: 'What vaccinations does my pet need to board?',
      answer:
        'Dogs need current rabies, DHPP, and bordetella vaccines. Cats need rabies and FVRCP. Upload records when booking or bring them on your first visit.',
    },
    {
      question: 'Can I check on my pet during their stay?',
      answer:
        'Yes! Our live webcams let you watch your pet play and rest anytime, from anywhere. You also receive daily updates and a stay report card at pickup.',
    },
    {
      question: 'What should I bring for my pet\u2019s stay?',
      answer:
        'Bring vaccination records, any medications, and your pet\u2019s food if they have a special diet. We provide bedding, bowls, toys, and treats — but you are welcome to bring favorites.',
    },
    {
      question: 'Do you accept pets with special needs?',
      answer:
        'Yes. We provide medication administration, senior care, and customized attention for pets with medical or behavioral needs. Let us know your pet\u2019s requirements when booking.',
    },
    {
      question: 'Do you offer pickup and drop-off?',
      answer:
        'Yes. We offer door-to-door pet transportation in climate-controlled vehicles. Schedule pickup and drop-off when you book — fees vary by distance.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about boarding with us.',

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

  contactTitle: 'Book Your Pet\u2019s Stay',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day.',

  galleryTitle: 'Our Resort & Happy Guests',
  gallerySubtitle: 'A look at the fun and care we provide.',
  galleryImages: [
    'https://images.pexels.com/photos/16465605/pexels-photo-16465605.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/16465605/pexels-photo-16465605.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/16465605/pexels-photo-16465605.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Certified, caring staff who treat your pet like family.',
  team: [
    { name: 'Karen Mitchell', role: 'Owner & Resort Director', bio: 'Karen founded Happy Tails Resort 13 years ago and oversees all operations, ensuring every pet receives safe, loving care.' },
    { name: 'Tyler Sanders', role: 'Daycare Lead', bio: 'Tyler manages our daycare program, assessing temperaments and leading supervised group play for dogs of all sizes.' },
    { name: 'Rosa Delgado', role: 'Pet Care Specialist', bio: 'Rosa specializes in special needs and senior pet care, including medication administration and customized attention.' },
  ],

  pricingTitle: 'Boarding & Daycare Pricing',
  pricingSubtitle: 'Transparent pricing for every type of stay.',
  pricing: [
    { name: 'Daycare', price: 'From $38/day', description: 'Full-day supervised play.', features: ['Full-day play', 'Size-appropriate groups', 'Outdoor yards', 'Nap time', 'Stay report card'], popular: false },
    { name: 'Overnight Boarding', price: 'From $58/night', description: 'Private suite with care.', features: ['Private suite', 'Climate control', 'Live webcam access', 'Two meals & walks', 'Nightly tuck-in', 'Daily updates'], popular: true },
    { name: 'All-Inclusive Package', price: 'From $89/night', description: 'Boarding, daycare & grooming.', features: ['Overnight suite', 'Daycare play', 'Bath & brush', 'Spa add-on', 'Daily updates', 'Transportation included'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the Happy Tails Resort assistant. How can I help you and your pet today?",
    placeholder: "Ask about boarding and daycare...",
    knowledgeBase: [
      "We offer overnight boarding, doggy daycare, cat boarding, pet spa and grooming, special needs care, and pet transportation.",
      "Dogs need current rabies, DHPP, and bordetella vaccines. Cats need rabies and FVRCP. Upload records when booking or bring them on your first visit.",
      "Yes, our live webcams let you watch your pet play and rest anytime, from anywhere. You also get daily updates and a stay report card.",
      "Bring vaccination records, medications, and special diet food if needed. We provide bedding, bowls, toys, and treats, but you may bring favorites.",
      "We accept pets with special needs, including medication administration, senior care, and customized attention. Tell us your pet\u2019s requirements when booking.",
      "Yes, we offer door-to-door pickup and drop-off in climate-controlled vehicles. Fees vary by distance and are added to your booking.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "We are open seven days a week, 7am to 7pm, with staff on-site 24/7.",
      "We are certified and insured with 13+ years of experience and over 28,000 pets hosted.",
      "Daycare starts at $38/day, overnight boarding at $58/night, and all-inclusive packages at $89/night.",
    ],
  },
};
