export type PageType =
  | "home"
  | "about"
  | "services"
  | "service_detail"
  | "contact"
  | "pricing"
  | "portfolio"
  | "testimonials"
  | "blog"
  | "article"
  | "faq"
  | "location"
  | "custom";

export interface DesignTokens {
  colorRoles: {
    background: string;
    surface: string;
    text: string;
    mutedText: string;
    primary: string;
    primaryText: string;
    accent: string;
    border: string;
    success: string;
    warning: string;
    danger: string;
  };
  typography: {
    headingStyle: string;
    bodyStyle: string;
    scale: string[];
  };
  spacing: {
    section: string;
    container: string;
    card: string;
  };
  radius: {
    button: string;
    card: string;
    input: string;
  };
  shadows: {
    card: string;
    elevated: string;
  };
}

export interface ComponentSpec {
  id: string;
  type: string;
  purpose: string;
  contentRequirements: string[];
  behavior: string[];
  conversionRole?: string;
  evidenceRefs?: string[];
}

export interface PageSectionSpec {
  id: string;
  name: string;
  objective: string;
  component: ComponentSpec;
  order: number;
}

export interface PageBlueprint {
  id: string;
  slug: string;
  pageType: PageType;
  title: string;
  primaryGoal: string;
  primaryCta: string;
  seo: {
    titleTemplate: string;
    metaDescriptionBrief: string;
    targetIntent: string;
    schemaTypes: string[];
  };
  sections: PageSectionSpec[];
}

export interface WebsiteBlueprint {
  schemaVersion: "1.0";
  projectId: string;
  sourceAnalysisJobId: string;
  generatedAt: string;
  websiteStrategy: {
    positioning: string;
    audience: string;
    primaryGoal: string;
    primaryCta: string;
    conversionPath: string[];
  };
  sitemap: Array<{
    pageId: string;
    slug: string;
    label: string;
    priority: number;
    parentPageId?: string;
  }>;
  navigation: {
    primary: string[];
    utility: string[];
    footerGroups: Array<{
      label: string;
      pageIds: string[];
    }>;
  };
  designTokens: DesignTokens;
  reusableComponents: ComponentSpec[];
  pages: PageBlueprint[];
  globalRequirements: {
    accessibility: string[];
    performance: string[];
    seo: string[];
    aiSearch: string[];
    analytics: string[];
  };
}
