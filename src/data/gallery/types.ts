import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';

export interface Service {
  icon: ComponentType<LucideProps>;
  title: string;
  description: string;
  features: string[];
}

export interface WhyUsItem {
  icon: ComponentType<LucideProps>;
  title: string;
  description: string;
}

export interface ProcessStep {
  step: string;
  title: string;
  description: string;
}

export interface Testimonial {
  name: string;
  location: string;
  rating: number;
  text: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface ServiceArea {
  name: string;
}

export interface IndustryConfig {
  id: string;
  industryName: string;
  businessName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  phone: string;
  email: string;
  serviceArea: string;
  hours: string;
  yearsExperience: string;
  licenseNumber: string;

  colors: {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
  };

  navLinks: NavLink[];
  heroImage: string;
  /** CSS `object-position` for the hero background image. Defaults to `"center"` when absent. */
  heroImagePosition?: string;
  /** Mobile-viewport override for `heroImagePosition` (applied under a max-width media query). Defaults to `heroImagePosition` when absent. */
  heroImagePositionMobile?: string;
  /**
   * A separate, smaller derivative for the /gallery grid card — deliberately
   * distinct from heroImage so the thumbnail grid never has to download the
   * full-resolution hero payload. Falls back to heroImage when absent (the
   * pre-refresh behavior every not-yet-updated template still gets).
   */
  thumbnailImage?: string;
  heroBadge: string;
  ctaPrimary: string;
  ctaSecondary: string;

  stats: Stat[];

  services: Service[];

  whyUs: WhyUsItem[];
  whyUsTitle: string;
  whyUsSubtitle: string;

  process: ProcessStep[];
  processTitle: string;
  processSubtitle: string;

  testimonials: Testimonial[];
  testimonialsTitle: string;
  testimonialsSubtitle: string;

  faqs: FAQItem[];
  faqTitle: string;
  faqSubtitle: string;

  serviceAreas: ServiceArea[];
  serviceAreasTitle: string;

  contactTitle: string;
  contactSubtitle: string;

  galleryTitle: string;
  gallerySubtitle: string;
  galleryImages: string[];

  teamTitle: string;
  teamSubtitle: string;
  team: { name: string; role: string; bio: string }[];

  pricingTitle: string;
  pricingSubtitle: string;
  pricing: { name: string; price: string; description: string; features: string[]; popular: boolean }[];

  chatbot: {
    welcomeMessage: string;
    placeholder: string;
    knowledgeBase: string[];
  };
}
