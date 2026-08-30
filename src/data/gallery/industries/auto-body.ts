import {
  Car,
  Wrench,
  SprayCan,
  Frame,
  Shield,
  Eye,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const autoBodyConfig: IndustryConfig = {
  id: 'auto-body',
  industryName: 'Auto Body',
  businessName: 'CollisionCare Auto Body',
  tagline: 'Restoring Your Ride. Restoring Your Peace of Mind.',
  heroTitle: 'Expert Collision Repair You Can Trust',
  heroSubtitle:
    'From minor dents to major collision repair, our certified technicians restore your vehicle to pre-accident condition. We work with all insurance companies and guarantee our work for as long as you own your car.',
  phone: '(555) 245-8841',
  email: 'estimates@collisioncare.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Fri 7am-6pm, Sat 8am-2pm',
  yearsExperience: '20+',
  licenseNumber: 'ICAR-8841207',

  colors: {
    primary: '#1E3A5F',
    primaryDark: '#172554',
    primaryLight: '#DBEAFE',
    accent: '#DC2626',
    background: '#FFFFFF',
    surface: '#F1F5F9',
    text: '#0A0F1A',
    textMuted: '#5B6675',
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
    'https://images.pexels.com/photos/4480507/pexels-photo-4480507.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'I-CAR Gold Certified • Insurance Approved',
  ctaPrimary: 'Get Free Estimate',
  ctaSecondary: 'View Services',

  stats: [
    { value: '20+', label: 'Years Experience' },
    { value: '15,000+', label: 'Vehicles Repaired' },
    { value: '4.9★', label: 'Average Rating' },
    { value: 'Lifetime', label: 'Workmanship Warranty' },
  ],

  services: [
    {
      icon: Car,
      title: 'Collision Repair',
      description:
        'Full-service collision repair from minor fender benders to major structural damage. We restore your vehicle to factory safety and appearance standards.',
      features: ['Frame & structural repair', 'Panel replacement', 'Safety system recalibration', 'Airbag replacement'],
    },
    {
      icon: Wrench,
      title: 'Dent Removal',
      description:
        'Paintless dent repair for small to medium dents caused by hail, door dings, and minor impacts. Fast, affordable, and preserves your factory finish.',
      features: ['Paintless dent repair', 'Hail damage', 'Door dings', 'Crease removal'],
    },
    {
      icon: SprayCan,
      title: 'Auto Painting',
      description:
        'Factory-quality auto painting and color matching. Our downdraft paint booth and certified technicians deliver a flawless, durable finish every time.',
      features: ['Computer color matching', 'Full repaints', 'Spot blending', 'Clear coat restoration'],
    },
    {
      icon: Frame,
      title: 'Frame Straightening',
      description:
        'Precision frame straightening using laser-measurement technology to restore your vehicle to factory specifications and ensure proper safety system operation.',
      features: ['Laser frame measurement', 'Uni-body repair', 'Chassis alignment', 'Structural integrity check'],
    },
    {
      icon: Shield,
      title: 'Bumper Repair',
      description:
        'Bumper repair and replacement for all makes and models. We restore impact protection and appearance, from scuffs and cracks to full replacement.',
      features: ['Plastic bumper repair', 'Bumper replacement', 'Reinforcement bar', 'Sensor recalibration'],
    },
    {
      icon: Eye,
      title: 'Auto Glass',
      description:
        'Windshield and auto glass replacement with OEM-quality materials. We handle calibration of cameras and sensors mounted to the glass.',
      features: ['Windshield replacement', 'Side & rear glass', 'ADAS calibration', 'Rock chip repair'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'I-CAR Gold Certified',
      description:
        'Our technicians hold I-CAR Gold Class certification, the industry standard for collision repair training. Your vehicle is repaired right the first time.',
    },
    {
      icon: Clock,
      title: 'Fast Turnaround',
      description:
        'We provide accurate timelines and keep you updated throughout the repair. Most repairs are completed in days, not weeks, without sacrificing quality.',
    },
    {
      icon: Users,
      title: 'Insurance Approved',
      description:
        'We work directly with all major insurance companies and handle the paperwork for you. Direct billing means no upfront cost in most cases.',
    },
    {
      icon: ThumbsUp,
      title: 'Lifetime Warranty',
      description:
        'Our workmanship is guaranteed for as long as you own your vehicle. If any repair we performed fails, we will fix it at no cost to you.',
    },
  ],
  whyUsTitle: 'Why Drivers Choose CollisionCare',
  whyUsSubtitle:
    'Certified technicians, genuine parts, and a lifetime warranty on every repair we perform.',

  process: [
    {
      step: '01',
      title: 'Free Estimate',
      description:
        'Bring in your vehicle or upload photos for a free, no-obligation estimate. We document all damage and provide a detailed repair plan.',
    },
    {
      step: '02',
      title: 'Insurance Coordination',
      description:
        'We work directly with your insurance company, handle the claim paperwork, and schedule the repair once approval is received.',
    },
    {
      step: '03',
      title: 'Expert Repair',
      description:
        'Our certified technicians repair your vehicle using OEM parts and factory procedures. You receive progress updates throughout.',
    },
    {
      step: '04',
      title: 'Quality Inspection',
      description:
        'Every vehicle undergoes a multi-point quality inspection and test drive before delivery. You inspect the work with our team.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'A clear, stress-free repair process from estimate to delivery.',

  testimonials: [
    {
      name: 'Marcus T.',
      location: 'Brookside',
      rating: 5,
      text: 'After a nasty highway collision, CollisionCare made the whole process painless. They handled the insurance, kept me updated every step, and my SUV looks brand new. The paint match is perfect.',
    },
    {
      name: 'Diane R.',
      location: 'Fairfield',
      rating: 5,
      text: 'I had a dent from a parking lot hit-and-run. They did paintless dent repair in one day and you cannot even tell it happened. Fair price, honest people, and the car was ready when promised.',
    },
    {
      name: 'Kevin L.',
      location: 'Eastside',
      rating: 5,
      text: 'My truck needed frame straightening after a rear-end collision. The laser measurements showed it was back to spec and it drives straight as an arrow. Lifetime warranty gave me real peace of mind.',
    },
  ],
  testimonialsTitle: 'What Our Customers Say',
  testimonialsSubtitle: 'Thousands of vehicles restored to pre-accident condition.',

  faqs: [
    {
      question: 'Do I need to get multiple estimates for my insurance?',
      answer:
        'Most states only require one estimate. We work directly with your insurance company and provide the estimate they need. You have the right to choose your repair shop regardless of what your insurer suggests.',
    },
    {
      question: 'Will you use original equipment manufacturer (OEM) parts?',
      answer:
        'We use OEM parts whenever possible and whenever your insurance policy allows. We will discuss parts options with you and your insurer before the repair begins so there are no surprises.',
    },
    {
      question: 'How long will my repair take?',
      answer:
        'Repair time depends on the extent of the damage and parts availability. We provide an estimated completion date with your estimate and keep you updated throughout. Most minor repairs take 2-5 days.',
    },
    {
      question: 'Do you offer a rental car or loaner vehicle?',
      answer:
        'We coordinate with Enterprise and Hertz for rental cars, and your insurance may cover the cost. We also have a limited number of loaner vehicles available for longer repairs — ask about availability.',
    },
    {
      question: 'Is your work guaranteed?',
      answer:
        'Yes. All our repairs come with a lifetime workmanship warranty valid for as long as you own the vehicle. If any defect appears in a repair we performed, bring it back and we will fix it free of charge.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about collision repair.',

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

  contactTitle: 'Get Your Free Collision Estimate',
  contactSubtitle:
    'Call us or fill out the form with photos of the damage. We respond within one business day.',

  galleryTitle: 'Our Recent Repair Work',
  gallerySubtitle: 'See the CollisionCare difference.',
  galleryImages: [
    'https://images.pexels.com/photos/4480507/pexels-photo-4480507.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/4480507/pexels-photo-4480507.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/4480507/pexels-photo-4480507.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'I-CAR certified technicians dedicated to restoring your vehicle.',
  team: [
    { name: 'Frank Delgado', role: 'Master Technician', bio: 'I-CAR Gold certified with 22 years of collision repair experience. Frank oversees all structural and frame repairs and leads our technician training program.' },
    { name: 'Maria Santos', role: 'Paint Specialist', bio: 'Certified auto paint technician specializing in computer color matching and factory-quality finishes. Maria has 15 years of experience in auto refinishing.' },
    { name: 'Tom Bradley', role: 'Estimator & Insurance Liaison', bio: 'Handles all estimates and insurance coordination. Tom works directly with adjusters to ensure your claim is processed quickly and accurately.' },
  ],

  pricingTitle: 'Repair Service Options',
  pricingSubtitle: 'Transparent estimates with no hidden costs.',
  pricing: [
    { name: 'Minor Repair', price: 'From $250', description: 'Small dents, dings, and scratches.', features: ['Paintless dent repair', 'Spot painting', 'Bumper scuffs', 'Same-day service'], popular: false },
    { name: 'Standard Collision', price: 'Insurance Claim', description: 'Most insurance-covered collision repairs.', features: ['OEM parts', 'Frame measurement', 'Full paint matching', 'ADAS recalibration', 'Lifetime warranty'], popular: true },
    { name: 'Major Collision', price: 'Insurance Claim', description: 'Structural and extensive damage repair.', features: ['Frame straightening', 'Multiple panel replacement', 'Full repaint', 'Mechanical repairs', 'Rental car coordination'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the CollisionCare Auto Body assistant. How can I help you today?",
    placeholder: "Ask about collision repair, estimates, or insurance...",
    knowledgeBase: [
      "We offer collision repair, dent removal, auto painting, frame straightening, bumper repair, and auto glass replacement.",
      "We are I-CAR Gold Certified, the highest training standard in the collision repair industry.",
      "We work directly with all major insurance companies and handle the claim paperwork for you.",
      "Most states only require one estimate, and you have the right to choose your repair shop.",
      "We use OEM parts whenever possible and whenever your insurance policy allows.",
      "Most minor repairs take 2 to 5 days, while major collision repairs can take 1 to 3 weeks depending on parts availability.",
      "All our repairs come with a lifetime workmanship warranty valid for as long as you own the vehicle.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are Monday through Friday 7am to 6pm and Saturday 8am to 2pm.",
      "We have over 20 years of experience and have repaired more than 15,000 vehicles.",
    ],
  },
};
