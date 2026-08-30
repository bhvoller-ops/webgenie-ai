import {
  Monitor,
  Network,
  ShieldCheck,
  Cloud,
  DatabaseBackup,
  Package,
  Award,
  Clock,
  Users,
  ThumbsUp,
  PhoneCall,
  Server,
  Lock,
  Headphones,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

export const itServicesConfig: IndustryConfig = {
  id: 'it-services',
  industryName: 'IT Services',
  businessName: 'TechShield IT Solutions',
  tagline: 'Your Technology, Fully Managed.',
  heroTitle: 'IT Support That Keeps Your Business Running',
  heroSubtitle:
    'Managed IT, cybersecurity, cloud, and support for small and mid-size businesses. Proactive monitoring, fast response, and technology that just works.',
  phone: '(555) 392-7745',
  email: 'support@techshieldit.com',
  serviceArea: 'Greater Metro Area & Remote Nationwide',
  hours: '24/7 Monitoring, Mon-Fri 7am-7pm Support',
  yearsExperience: '14+',
  licenseNumber: 'MSP-4827193',

  colors: {
    primary: '#1E40AF',
    primaryDark: '#1E3A8A',
    primaryLight: '#DBEAFE',
    accent: '#0D9488',
    background: '#FFFFFF',
    surface: '#F1F5F9',
    text: '#0A1929',
    textMuted: '#5B6B7E',
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

  heroImage: 'https://images.pexels.com/photos/37730211/pexels-photo-37730211.jpeg?auto=compress&cs=tinysrgb&w=1200',
  heroBadge: '24/7 Monitoring • Fast Response',
  ctaPrimary: 'Get a Free IT Assessment',
  ctaSecondary: 'View Services',

  stats: [
    { value: '14+', label: 'Years Experience' },
    { value: '320+', label: 'Businesses Supported' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '99.9%', label: 'Uptime Guarantee' },
  ],

  services: [
    {
      icon: Monitor,
      title: 'Managed IT Support',
      description:
        'Comprehensive IT management for your business. Help desk, monitoring, maintenance, and strategic guidance all included in one predictable monthly plan.',
      features: ['24/7 help desk', 'Proactive monitoring', 'Patch management', 'Strategic planning'],
    },
    {
      icon: Network,
      title: 'Network Setup',
      description:
        'Professional network design, installation, and configuration. Wired and wireless networks built for speed, security, and reliability.',
      features: ['Network design', 'Wired & wireless', 'Router & switch setup', 'Performance optimization'],
    },
    {
      icon: ShieldCheck,
      title: 'Cybersecurity',
      description:
        'Multi-layered security that protects your business from threats. Antivirus, firewalls, training, and 24/7 threat monitoring and response.',
      features: ['Threat monitoring', 'Firewall management', 'Security training', 'Incident response'],
    },
    {
      icon: Cloud,
      title: 'Cloud Solutions',
      description:
        'Cloud migration, management, and optimization. We help you move to the cloud, reduce costs, and scale with Microsoft 365, Azure, and AWS.',
      features: ['Cloud migration', 'Microsoft 365', 'Azure & AWS', 'Cost optimization'],
    },
    {
      icon: DatabaseBackup,
      title: 'Data Backup & Recovery',
      description:
        'Automated backups and disaster recovery that protect your data. Local and cloud backups with tested recovery so you are never caught off guard.',
      features: ['Automated backups', 'Cloud replication', 'Disaster recovery', 'Recovery testing'],
    },
    {
      icon: Package,
      title: 'Hardware & Software Procurement',
      description:
        'We source, configure, and deploy the right hardware and software for your needs. Volume pricing, setup, and ongoing support all handled.',
      features: ['Volume pricing', 'Configuration', 'Deployment', 'Asset management'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Certified Engineers',
      description:
        'Our team holds Microsoft, Cisco, and CompTIA certifications. You get enterprise-level expertise at a price small businesses can afford.',
    },
    {
      icon: Clock,
      title: '24/7 Monitoring',
      description:
        'We monitor your systems around the clock. Most issues are detected and resolved before you even notice, minimizing downtime and disruption.',
    },
    {
      icon: Users,
      title: 'Real Humans, Fast Response',
      description:
        'When you call, a real person answers. Our average help desk response time is under 15 minutes, with a 99% first-contact resolution rate.',
    },
    {
      icon: ThumbsUp,
      title: 'Predictable Pricing',
      description:
        'One flat monthly fee covers everything. No surprise invoices, no hourly billing, no nickel-and-diming. You budget with confidence.',
    },
  ],
  whyUsTitle: 'Why Businesses Choose TechShield',
  whyUsSubtitle:
    'We are your outsourced IT department — proactive, responsive, and genuinely invested in your success.',

  process: [
    {
      step: '01',
      title: 'Free IT Assessment',
      description:
        'We audit your current systems, identify risks and gaps, and deliver a clear report with prioritized recommendations — at no cost.',
    },
    {
      step: '02',
      title: 'Onboarding & Setup',
      description:
        'We deploy monitoring tools, document your environment, and establish support procedures. Transition is smooth and disruption-free.',
    },
    {
      step: '03',
      title: 'Proactive Management',
      description:
        'We monitor, maintain, and support your systems 24/7. You get help desk access, regular maintenance, and strategic guidance.',
    },
    {
      step: '04',
      title: 'Ongoing Optimization',
      description:
        'We meet quarterly to review performance, plan upgrades, and align technology with your business goals as you grow.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'A proactive approach that prevents problems before they happen.',

  testimonials: [
    {
      name: 'Cascade Law Group',
      location: 'Brookside',
      rating: 5,
      text: 'TechShield migrated us to the cloud without a single hour of downtime. Their help desk responds in minutes and actually solves the problem. We finally trust our IT.',
    },
    {
      name: 'Marcus B.',
      location: 'Fairfield',
      rating: 5,
      text: 'They caught a ransomware attempt at 2am and stopped it before any damage. That alone paid for three years of service. Their monitoring is worth every penny.',
    },
    {
      name: 'Eastside Manufacturing',
      location: 'Eastside',
      rating: 5,
      text: 'From network setup to ongoing support, they handle everything. Our team calls the help desk and gets a real person in minutes. No more IT headaches.',
    },
  ],
  testimonialsTitle: 'What Our Clients Say',
  testimonialsSubtitle: 'Businesses that trust us to keep their technology running.',

  faqs: [
    {
      question: 'What size businesses do you work with?',
      answer:
        'We specialize in small to mid-size businesses with 5-250 employees. Whether you have no internal IT or a small team that needs support, we scale to fit.',
    },
    {
      question: 'How fast is your help desk response?',
      answer:
        'Our average response time is under 15 minutes, with a 99% first-contact resolution rate. When you call, a real person answers — not a phone tree.',
    },
    {
      question: 'Do you offer remote support?',
      answer:
        'Yes. Most issues are resolved remotely through secure screen-sharing. For on-site needs, we have technicians available throughout the service area.',
    },
    {
      question: 'What is included in your monthly fee?',
      answer:
        'Help desk, monitoring, maintenance, patch management, cloud management, cybersecurity, and strategic planning are all included. One flat fee, no surprises.',
    },
    {
      question: 'Can you help us migrate to the cloud?',
      answer:
        'Absolutely. We handle cloud migrations to Microsoft 365, Azure, and AWS with minimal disruption. We also optimize costs and manage your cloud ongoing.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about our IT services.',

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

  contactTitle: 'Get Your Free IT Assessment',
  contactSubtitle:
    'Call us or fill out the form below. We respond within one business day to schedule your assessment.',

  galleryTitle: 'Our IT Work in Action',
  gallerySubtitle: 'See how we keep businesses secure, connected, and productive.',
  galleryImages: [
    'https://images.pexels.com/photos/37730211/pexels-photo-37730211.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/37730211/pexels-photo-37730211.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/37730211/pexels-photo-37730211.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ],

  teamTitle: 'Meet the Team',
  teamSubtitle: 'Certified engineers and support specialists who actually answer the phone.',
  team: [
    { name: 'Steven Park', role: 'Founder & Lead Engineer', bio: 'Microsoft and Cisco certified with 14 years of IT experience. Steven leads the engineering team and oversees every client environment.' },
    { name: 'Natalie Brooks', role: 'Help Desk Manager', bio: 'Leads our support team with a focus on fast, friendly, first-contact resolution. Natalie ensures every ticket is handled with care.' },
    { name: 'Raj Mehta', role: 'Cybersecurity Specialist', bio: 'CompTIA Security+ certified. Raj manages threat monitoring, security training, and incident response for every client environment.' },
  ],

  pricingTitle: 'IT Service Packages',
  pricingSubtitle: 'Flat monthly pricing per user. No surprise invoices.',
  pricing: [
    { name: 'Basic Support', price: 'From $99/user/mo', description: 'Help desk and monitoring essentials.', features: ['24/7 help desk', 'Proactive monitoring', 'Patch management', 'Antivirus included', 'Email support'], popular: false },
    { name: 'Managed IT', price: 'From $149/user/mo', description: 'Full managed IT support.', features: ['Everything in Basic', 'Cloud management', 'Cybersecurity suite', 'Quarterly reviews', 'Priority support'], popular: true },
    { name: 'Enterprise IT', price: 'From $249/user/mo', description: 'Advanced security and compliance.', features: ['Everything in Managed', 'Advanced cybersecurity', 'Disaster recovery', 'Compliance management', 'Dedicated engineer'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am the TechShield IT Solutions assistant. How can I help you today?",
    placeholder: "Ask about our IT services...",
    knowledgeBase: [
      "We offer managed IT support, network setup, cybersecurity, cloud solutions, data backup and recovery, and hardware and software procurement.",
      "We specialize in small to mid-size businesses with 5-250 employees, scaling to fit whether you have no internal IT or a small team that needs support.",
      "Our average help desk response time is under 15 minutes with a 99% first-contact resolution rate. A real person answers every call.",
      "Yes, most issues are resolved remotely through secure screen-sharing. On-site technicians are available throughout the service area when needed.",
      "Our monthly fee includes help desk, monitoring, maintenance, patch management, cloud management, cybersecurity, and strategic planning.",
      "We handle cloud migrations to Microsoft 365, Azure, and AWS with minimal disruption, plus ongoing cost optimization and management.",
      "We provide 24/7 monitoring and support, with most issues detected and resolved before you notice them.",
      "We serve Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate, plus remote clients nationwide.",
      "We offer 24/7 monitoring with support available Monday through Friday 7am to 7pm.",
      "We have 14+ years of experience, support over 320 businesses, and maintain a 99.9% uptime guarantee with a 4.9-star average rating.",
    ],
  },
};
