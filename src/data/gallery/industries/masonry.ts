import {
  Blocks,
  Mountain,
  Flame,
  Construction,
  Wrench,
  Gem,
  Building2,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  ClipboardCheck,
  Search,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const masonryConfig: IndustryConfig = {
  id: 'masonry',
  industryName: 'Masonry',
  businessName: 'StoneCraft Masonry',
  tagline: 'Built to Last for Generations.',
  heroTitle: 'Master Masonry & Stonework',
  heroSubtitle:
    'From brick walls to stone veneer, chimney repair to retaining walls, our master masons build structures that stand the test of time. Traditional craftsmanship meets modern precision.',
  phone: '(555) 712-5534',
  email: 'info@stonecraftmasonry.com',
  serviceArea: 'Greater Metro Area & Surrounding Suburbs',
  hours: 'Mon-Sat 7am-6pm',
  yearsExperience: '25+',
  licenseNumber: 'MA-9384756',

  colors: {
    primary: '#78716C',
    primaryDark: '#57534E',
    primaryLight: '#F5F5F4',
    accent: '#B45309',
    background: '#FFFFFF',
    surface: '#FAFAF9',
    text: '#1C1917',
    textMuted: '#78716C',
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
    'https://images.pexels.com/photos/9497822/pexels-photo-9497822.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: 'Licensed & Insured • Free Estimates',
  ctaPrimary: 'Get Free Quote',
  ctaSecondary: 'View Services',

  stats: [
    { value: '25+', label: 'Years Experience' },
    { value: '3,600+', label: 'Projects Completed' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '100%', label: 'Satisfaction Guarantee' },
  ],

  services: [
    {
      icon: Blocks,
      title: 'Brickwork',
      description:
        'Expert bricklaying for walls, facades, fireplaces, and walkways. Traditional and modern brick patterns laid with precision and durability.',
      features: ['Brick walls', 'Brick facades', 'Fireplaces', 'Walkways & paths'],
    },
    {
      icon: Mountain,
      title: 'Stone Veneer',
      description:
        'Natural and manufactured stone veneer that transforms any exterior or interior. Lightweight, durable, and indistinguishable from full stone.',
      features: ['Natural stone veneer', 'Manufactured stone', 'Interior accent walls', 'Exterior facades'],
    },
    {
      icon: Flame,
      title: 'Chimney Repair',
      description:
        'Complete chimney repair and restoration. Tuckpointing, crown repair, flashing, and full rebuilds to keep your chimney safe and watertight.',
      features: ['Tuckpointing', 'Crown repair', 'Flashing repair', 'Full chimney rebuild'],
    },
    {
      icon: Construction,
      title: 'Retaining Walls',
      description:
        'Structural retaining walls in stone, brick, and block that hold back earth and add beauty. Engineered for drainage and built to last.',
      features: ['Stone retaining walls', 'Block walls', 'Segmental walls', 'Drainage solutions'],
    },
    {
      icon: Wrench,
      title: 'Tuckpointing',
      description:
        'Precision mortar joint repair that restores weathered brick and stone. We match mortar color and texture for a seamless, durable repair.',
      features: ['Mortar matching', 'Joint repair', 'Weatherproofing', 'Color blending'],
    },
    {
      icon: Gem,
      title: 'Custom Stonework',
      description:
        'One-of-a-kind stonework — fire pits, outdoor kitchens, columns, and architectural features. Bring your vision to life in natural stone.',
      features: ['Fire pits', 'Stone columns', 'Outdoor kitchens', 'Architectural features'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Master Masons',
      description:
        'Our masons are trained in traditional techniques and modern materials. With 25 years of experience, we build structures that outlast us all.',
    },
    {
      icon: Clock,
      title: 'Built to Last',
      description:
        'Proper foundations, correct mortar mix, and weather-appropriate materials mean your masonry stands strong for generations, not just years.',
    },
    {
      icon: Users,
      title: 'Material Experts',
      description:
        'We source the right stone and brick for your climate and application. From local fieldstone to imported marble, we know what works.',
    },
    {
      icon: ThumbsUp,
      title: '25-Year Warranty',
      description:
        'Our masonry work carries a 25-year warranty on workmanship. Stone and brick should last a lifetime — we guarantee ours will.',
    },
  ],
  whyUsTitle: 'Why Homeowners Choose StoneCraft Masonry',
  whyUsSubtitle:
    'Master craftsmanship, premium materials, and masonry built to last for generations.',

  process: [
    {
      step: '01',
      title: 'Site Consultation',
      description:
        'We assess your project, take measurements, and discuss materials and design. You get a detailed quote and a clear timeline.',
    },
    {
      step: '02',
      title: 'Material Selection',
      description:
        'Choose your brick, stone, mortar color, and pattern. We provide samples and help you match or complement existing masonry.',
    },
    {
      step: '03',
      title: 'Foundation & Layout',
      description:
        'We pour footings, set layout lines, and prepare the base. Proper foundation work is the secret to masonry that lasts decades.',
    },
    {
      step: '04',
      title: 'Construction & Cleanup',
      description:
        'Our masons lay brick or stone with precision, tool the joints, and clean every surface. We leave your property neat and your masonry flawless.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'From consultation to lasting masonry in four simple steps.',

  testimonials: [
    {
      name: 'Edward B.',
      location: 'Stonebridge',
      rating: 5,
      text: 'StoneCraft rebuilt my chimney after a storm damaged it. The tuckpointing matches the original so well you cannot tell where old meets new. True craftsmen who take pride in their work.',
    },
    {
      name: 'Lucia G.',
      location: 'Old Mill',
      rating: 5,
      text: 'The stone veneer they installed on our front facade completely transformed the house. Neighbors stop and ask who did the work. The crew was professional and the cleanup was impeccable.',
    },
    {
      name: 'Harold S.',
      location: 'Quarry Town',
      rating: 5,
      text: 'They built a retaining wall that solved a 20-year erosion problem. The engineering was solid and the stonework is beautiful. Worth every penny. I will use them again for the patio.',
    },
  ],
  testimonialsTitle: 'What Our Clients Say',
  testimonialsSubtitle: 'Lasting masonry and happy homeowners are what we do best.',

  faqs: [
    {
      question: 'How long does masonry work take?',
      answer:
        'Small repairs like tuckpointing take 1-2 days. Walls and veneer projects take 3-7 days. Large retaining walls or full chimney rebuilds can take 1-2 weeks. We provide a clear timeline during your consultation.',
    },
    {
      question: 'What is the difference between stone veneer and full stone?',
      answer:
        'Full stone is structural and requires a full foundation. Stone veneer is a non-structural facing applied to a framed wall. Veneer is lighter, faster, and less expensive while delivering the same visual impact.',
    },
    {
      question: 'Can you match existing brick or mortar?',
      answer:
        'Yes. We source matching brick from regional suppliers and custom-blend mortar to match color, texture, and joint profile. Repairs blend seamlessly with existing masonry.',
    },
    {
      question: 'How long does masonry last?',
      answer:
        'Properly built masonry lasts 100+ years. The key is correct mortar mix, proper drainage, and weather-appropriate materials. Our 25-year warranty reflects our confidence in the work.',
    },
    {
      question: 'Do you handle chimney inspections and repairs?',
      answer:
        'Yes. We inspect chimneys for structural integrity, water damage, and mortar condition. We handle tuckpointing, crown repair, flashing, and full rebuilds to keep your chimney safe and watertight.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about our masonry services.',

  serviceAreas: [
    { name: 'Stonebridge' },
    { name: 'Old Mill' },
    { name: 'Quarry Town' },
    { name: 'Downtown Core' },
    { name: 'Midtown' },
    { name: 'Riverside' },
    { name: 'Uptown' },
    { name: 'Westgate' },
  ],
  serviceAreasTitle: 'Communities We Proudly Serve',

  contactTitle: 'Get Your Free Masonry Estimate',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day with a custom quote.',

  galleryTitle: 'Our Recent Masonry Projects',
  gallerySubtitle: 'See the StoneCraft Masonry difference.',
  galleryImages: [
    'https://images.pexels.com/photos/9497822/pexels-photo-9497822.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/8961346/pexels-photo-8961346.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/534220/pexels-photo-534220.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Master masons who build structures to last for generations.',
  team: [
    { name: 'Sal Romano', role: 'Master Mason', bio: 'Sal leads our masonry crews with 25 years of bricklaying and stonework experience, trained in both traditional and modern techniques.' },
    { name: 'Greta Olsson', role: 'Design Consultant', bio: 'Greta helps clients choose stone, brick, mortar color, and patterns that complement their home and landscape.' },
    { name: 'Marcus Webb', role: 'Restoration Specialist', bio: 'Marcus specializes in chimney repair, tuckpointing, and matching mortar for seamless repairs on historic and modern masonry.' },
  ],

  pricingTitle: 'Masonry Service Packages',
  pricingSubtitle: 'Transparent pricing with no hidden fees.',
  pricing: [
    { name: 'Tuckpointing & Repair', price: 'From $8/sq ft', description: 'Mortar joint repair and restoration.', features: ['Mortar matching', 'Joint repair', 'Weatherproofing', 'Color blending'], popular: false },
    { name: 'Stone Veneer Installation', price: 'From $18/sq ft', description: 'Natural or manufactured stone veneer.', features: ['Material selection', 'Surface prep', 'Veneer installation', '25-year warranty'], popular: true },
    { name: 'Custom Stonework', price: 'Custom Quote', description: 'Retaining walls, fire pits, and custom features.', features: ['Custom design', 'Foundation work', 'Premium stone', 'Drainage engineering', '25-year warranty'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the StoneCraft Masonry assistant. How can I help you today?",
    placeholder: "Ask about our masonry services...",
    knowledgeBase: [
      "We offer brickwork, stone veneer, chimney repair, retaining walls, tuckpointing, and custom stonework.",
      "Small repairs like tuckpointing take 1-2 days. Walls and veneer take 3-7 days. Large projects like retaining walls or chimney rebuilds can take 1-2 weeks.",
      "Full stone is structural and requires a full foundation. Stone veneer is a non-structural facing that is lighter, faster, and less expensive with the same visual impact.",
      "Yes, we source matching brick and custom-blend mortar to match color, texture, and joint profile so repairs blend seamlessly.",
      "Properly built masonry lasts 100+ years with correct mortar mix, proper drainage, and weather-appropriate materials.",
      "We handle chimney inspections and repairs including tuckpointing, crown repair, flashing, and full rebuilds.",
      "Our masonry work carries a 25-year warranty on workmanship.",
      "We serve Stonebridge, Old Mill, Quarry Town, Downtown Core, Midtown, Riverside, Uptown, and Westgate.",
      "Our hours are Monday through Saturday, 7am to 6pm.",
      "We have 25+ years of experience and have completed over 3,600 projects.",
    ],
  },
};
