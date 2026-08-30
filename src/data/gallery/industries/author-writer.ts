import {
  BookOpen,
  PenLine,
  ScrollText,
  Mic,
  GraduationCap,
  Award,
  Clock,
  Users,
  ThumbsUp,
  Mail,
  ClipboardCheck,
  Feather,
  Sparkles,
} from 'lucide-react';
import type { IndustryConfig } from '../types';

const BASE_URL = 'https://images.pexels.com/photos/';

export const authorWriterConfig: IndustryConfig = {
  id: 'author-writer',
  industryName: 'Author / Writer',
  businessName: 'Eleanor Whitfield',
  tagline: 'Stories That Linger Long After the Last Page.',
  heroTitle: 'Where Words Become Worlds',
  heroSubtitle:
    'Award-winning novelist and memoirist Eleanor Whitfield crafts stories that move, challenge, and stay with you. Explore her books, attend a workshop, or invite her to speak at your next event.',
  phone: '(555) 733-2098',
  email: 'hello@eleanorwhitfield.com',
  serviceArea: 'Nationwide & International (Virtual & In-Person)',
  hours: 'Mon-Fri 9am-5pm',
  yearsExperience: '14+',
  licenseNumber: 'ISBN-978-0-5538',

  colors: {
    primary: '#92400E',
    primaryDark: '#78350F',
    primaryLight: '#FEF3C7',
    accent: '#1E293B',
    background: '#FFFFFF',
    surface: '#FFFBEB',
    text: '#1A1408',
    textMuted: '#6B5B45',
  },

  navLinks: [
    { label: 'Services', href: '#services' },
    { label: 'Why Me', href: '#why-us' },
    { label: 'Process', href: '#process' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Reviews', href: '#testimonials' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#contact' },
  ],

  heroImage: `${BASE_URL}261909/pexels-photo-261909.jpeg?auto=compress&cs=tinysrgb&w=1200`,
  heroBadge: 'Award-Winning Author • 3 NYT Bestsellers',
  ctaPrimary: 'Explore the Books',
  ctaSecondary: 'Book a Speaking Event',

  stats: [
    { value: '14+', label: 'Years Writing' },
    { value: '7', label: 'Published Books' },
    { value: '1.2M+', label: 'Copies Sold' },
    { value: '4.9★', label: 'Reader Rating' },
  ],

  services: [
    {
      icon: BookOpen,
      title: 'Novel Writing',
      description:
        'Literary and historical novels that transport readers to another time and place. Each book is the product of years of research, drafting, and revision.',
      features: ['Historical fiction', 'Literary fiction', 'Character-driven stories', 'Meticulous research'],
    },
    {
      icon: ScrollText,
      title: 'Memoir & Biography',
      description:
        'Commissioned memoirs and biographies that capture a life with honesty, craft, and care. Your story, told with the artistry it deserves.',
      features: ['Personal memoir', 'Family biography', 'Corporate histories', 'Interview-based research'],
    },
    {
      icon: PenLine,
      title: 'Editorial Services',
      description:
        'Developmental editing, line editing, and manuscript consultations for writers at any stage. Sharpen your prose and strengthen your story.',
      features: ['Developmental editing', 'Line editing', 'Manuscript critique', 'Query letter review'],
    },
    {
      icon: Feather,
      title: 'Ghostwriting',
      description:
        'Confidential ghostwriting for books, articles, and speeches. Your voice and ideas, rendered with professional polish and discretion.',
      features: ['Book ghostwriting', 'Article writing', 'Speech writing', 'Full confidentiality'],
    },
    {
      icon: Mic,
      title: 'Speaking Engagements',
      description:
        'Keynote talks and readings for festivals, conferences, universities, and book clubs. Thoughtful, engaging, and tailored to your audience.',
      features: ['Keynote addresses', 'Festival readings', 'University lectures', 'Book club events'],
    },
    {
      icon: GraduationCap,
      title: 'Writing Workshops',
      description:
        'Small-group and one-on-one workshops on craft, structure, and the publishing process. Learn from a working author in a supportive setting.',
      features: ['Craft workshops', 'Manuscript intensives', 'Publishing guidance', 'One-on-one mentorship'],
    },
  ],

  whyUs: [
    {
      icon: Award,
      title: 'Award-Winning Craft',
      description:
        'Three New York Times bestsellers and multiple literary awards. Eleanor brings proven craft and a distinctive voice to every project.',
    },
    {
      icon: Clock,
      title: '14+ Years of Experience',
      description:
        'Over a decade of professional writing, editing, and teaching. Every manuscript benefits from deep, hard-won expertise.',
    },
    {
      icon: Users,
      title: 'A Trusted Voice',
      description:
        'Eleanor is known for honesty, warmth, and rigor. Readers, students, and clients return because they trust the work and the person behind it.',
    },
    {
      icon: ThumbsUp,
      title: 'Personal & Responsive',
      description:
        'No ghostwriting factories or assistants. When you work with Eleanor, you work with Eleanor — directly, from first conversation to final draft.',
    },
  ],
  whyUsTitle: 'Why Readers and Clients Trust Eleanor',
  whyUsSubtitle:
    'A working author who brings craft, care, and a singular voice to every page and every engagement.',

  process: [
    {
      step: '01',
      title: 'Initial Conversation',
      description:
        'We discuss your project, goals, and timeline. For editorial and ghostwriting work, this is where we decide if we are a good fit.',
    },
    {
      step: '02',
      title: 'Proposal & Agreement',
      description:
        'You receive a clear proposal outlining scope, deliverables, timeline, and fees. Once you approve, we begin with a deposit and a schedule.',
    },
    {
      step: '03',
      title: 'Drafting & Collaboration',
      description:
        'For books and ghostwriting, we work in stages with regular check-ins. For editing, you receive marked manuscripts with detailed notes.',
    },
    {
      step: '04',
      title: 'Final Delivery',
      description:
        'You receive the polished final manuscript or deliverable, with one round of revisions included. Your satisfaction is the goal.',
    },
  ],
  processTitle: 'How It Works',
  processSubtitle: 'A thoughtful, collaborative process from first conversation to final page.',

  testimonials: [
    {
      name: 'Rebecca S.',
      location: 'Brookside',
      rating: 5,
      text: 'Eleanor ghostwrote my memoir and I could not be happier. She captured my voice perfectly and the book reads like I wrote every word myself. Truly a gift.',
    },
    {
      name: 'James P.',
      location: 'Fairfield',
      rating: 5,
      text: 'Her developmental edit transformed my novel. She saw structural issues I had missed for years and helped me fix them without losing my voice. I owe my publishing deal to her notes.',
    },
    {
      name: 'Margaret D.',
      location: 'Eastside',
      rating: 5,
      text: 'Eleanor spoke at our literary festival and the audience was spellbound. Warm, funny, and deeply insightful about the craft. We have already invited her back next year.',
    },
  ],
  testimonialsTitle: 'What Readers and Clients Say',
  testimonialsSubtitle: 'Stories and partnerships built on craft and trust.',

  faqs: [
    {
      question: 'How can I buy Eleanor\u2019s books?',
      answer:
        'All of Eleanor\u2019s books are available in hardcover, paperback, ebook, and audiobook wherever books are sold. Signed copies and limited editions are available directly through this site.',
    },
    {
      question: 'Do you offer editorial services for unpublished writers?',
      answer:
        'Yes. Eleanor offers developmental editing, line editing, manuscript critiques, and query letter reviews for writers at any stage. Visit the services section for details and current availability.',
    },
    {
      question: 'How does the ghostwriting process work?',
      answer:
        'We begin with a conversation about your story and goals. Eleanor then drafts in stages with your input at each milestone. You retain full authorship credit, and the process is completely confidential.',
    },
    {
      question: 'Can I book Eleanor for a speaking engagement?',
      answer:
        'Yes. Eleanor is available for keynotes, festival readings, university lectures, and book club events, both in-person and virtual. Use the contact form with your event details for availability and fees.',
    },
    {
      question: 'Are the writing workshops suitable for beginners?',
      answer:
        'Absolutely. Workshops are designed to meet writers wherever they are. Beginners get foundational craft instruction, while experienced writers receive advanced critique and publishing guidance.',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Everything you need to know about working with Eleanor.',

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
  serviceAreasTitle: 'Where Eleanor Works and Teaches',

  contactTitle: 'Let\u2019s Start a Conversation',
  contactSubtitle:
    'Whether you want to discuss a book, an editing project, or a speaking engagement, I would love to hear from you.',

  galleryTitle: 'Books and Moments',
  gallerySubtitle: 'A glimpse into Eleanor\u2019s published work and events.',
  galleryImages: [
    `${BASE_URL}261909/pexels-photo-261909.jpeg?auto=compress&cs=tinysrgb&w=1200`,
    `${BASE_URL}256541/pexels-photo-256541.jpeg?auto=compress&cs=tinysrgb&w=1200`,
    `${BASE_URL}6207364/pexels-photo-6207364.jpeg?auto=compress&cs=tinysrgb&w=1200`,
  ],

  teamTitle: 'About Eleanor',
  teamSubtitle: 'A working author, editor, and teacher with a singular voice.',
  team: [
    { name: 'Eleanor Whitfield', role: 'Author & Founder', bio: 'Award-winning novelist and memoirist with 14+ years of experience and 7 published books, including 3 New York Times bestsellers. Eleanor writes, edits, and teaches full-time.' },
    { name: 'Thomas Aris', role: 'Literary Agent', bio: 'Represents Eleanor\u2019s publishing rights and handles foreign and film inquiries. Thomas has 18 years in literary representation at a top New York agency.' },
    { name: 'Naomi Brooks', role: 'Editorial Assistant', bio: 'Manages scheduling, workshop logistics, and first-pass research. Naomi is a recent MFA graduate and aspiring novelist herself.' },
  ],

  pricingTitle: 'Services and Pricing',
  pricingSubtitle: 'Transparent rates for editorial, ghostwriting, and speaking work.',
  pricing: [
    { name: 'Editorial Critique', price: 'From $450', description: 'Manuscript critique with detailed notes.', features: ['Up to 80,000 words', 'Written critique', 'Structural feedback', 'One follow-up call'], popular: false },
    { name: 'Developmental Edit', price: 'From $2,500', description: 'In-depth developmental editing of a full manuscript.', features: ['Full manuscript edit', 'Two rounds of notes', 'Chapter-by-chapter feedback', 'One revision pass'], popular: true },
    { name: 'Ghostwriting', price: 'Custom quote', description: 'Confidential book ghostwriting from concept to final draft.', features: ['Interview-based research', 'Staged drafting', 'Multiple revisions', 'Full confidentiality'], popular: false },
  ],

  chatbot: {
    welcomeMessage: "Hi! I am Eleanor Whitfield's assistant. How can I help you today?",
    placeholder: "Ask about books, editing, or speaking...",
    knowledgeBase: [
      "Eleanor offers novel writing, memoir and biography, editorial services, ghostwriting, speaking engagements, and writing workshops.",
      "Eleanor's books are available in hardcover, paperback, ebook, and audiobook wherever books are sold. Signed copies are available through this site.",
      "Editorial services include developmental editing, line editing, manuscript critiques, and query letter reviews for writers at any stage.",
      "Ghostwriting is confidential and interview-based. You retain full authorship credit and Eleanor drafts in stages with your input at each milestone.",
      "Eleanor is available for keynotes, festival readings, university lectures, and book club events, both in-person and virtual.",
      "Workshops are suitable for writers at any level, from beginners learning foundational craft to experienced writers seeking advanced critique.",
      "Eleanor has 14+ years of experience, 7 published books, 3 New York Times bestsellers, and over 1.2 million copies sold.",
      "Eleanor is based locally and serves Brookside, Fairfield, Eastside, Downtown Core, Midtown, Riverside, Uptown, and Westgate, plus virtual engagements nationwide.",
      "Office hours are Monday through Friday, 9am to 5pm.",
      "To discuss a project, use the contact form or email hello@eleanorwhitfield.com and you will receive a response within one business day.",
    ],
  },
};
