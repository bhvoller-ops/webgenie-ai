import type { IndustryConfig } from '../types';
import { accountingTaxConfig } from './accounting-tax';
import { applianceRepairConfig } from './appliance-repair';
import { authorWriterConfig } from './author-writer';
import { autoBodyConfig } from './auto-body';
import { autoDetailingConfig } from './auto-detailing';
import { autoRepairConfig } from './auto-repair';
import { bakeryConfig } from './bakery';
import { barberShopConfig } from './barber-shop';
import { boutiqueConfig } from './boutique';
import { carWashConfig } from './car-wash';
import { cateringConfig } from './catering';
import { chiropracticConfig } from './chiropractic';
import { coachConsultantConfig } from './coach-consultant';
import { coffeeShopConfig } from './coffee-shop';
import { danceStudioConfig } from './dance-studio';
import { deckPatioConfig } from './deck-patio';
import { dentalConfig } from './dental';
import { djEntertainmentConfig } from './dj-entertainment';
import { dogTrainingConfig } from './dog-training';
import { drivingSchoolConfig } from './driving-school';
import { drywallConfig } from './drywall';
import { eventPlanningConfig } from './event-planning';
import { financialAdvisorConfig } from './financial-advisor';
import { flooringConfig } from './flooring';
import { floristConfig } from './florist';
import { giftShopConfig } from './gift-shop';
import { guttersConfig } from './gutters';
import { hairBraidingConfig } from './hair-braiding';
import { homeInspectionConfig } from './home-inspection';
import { insuranceAgencyConfig } from './insurance-agency';
import { interiorDesignConfig } from './interior-design';
import { itServicesConfig } from './it-services';
import { junkRemovalConfig } from './junk-removal';
import { legalServicesConfig } from './legal-services';
import { locksmithConfig } from './locksmith';
import { makeupArtistConfig } from './makeup-artist';
import { marketingAgencyConfig } from './marketing-agency';
import { masonryConfig } from './masonry';
import { medSpaConfig } from './med-spa';
import { medicalWellnessConfig } from './medical-wellness';
import { mentalHealthConfig } from './mental-health';
import { mortgageBrokerConfig } from './mortgage-broker';
import { movingConfig } from './moving';
import { musicLessonsConfig } from './music-lessons';
import { nailSalonConfig } from './nail-salon';
import { nonprofitCharityConfig } from './nonprofit-charity';
import { optometryConfig } from './optometry';
import { pestControlConfig } from './pest-control';
import { petBoardingConfig } from './pet-boarding';
import { photographerVideographerConfig } from './photographer-videographer';
import { physicalTherapyConfig } from './physical-therapy';
import { pressureWashingConfig } from './pressure-washing';
import { propertyManagementConfig } from './property-management';
import { restaurantsCafesConfig } from './restaurants-cafes';
import { restorationConfig } from './restoration';
import { spaMassageConfig } from './spa-massage';
import { tattooStudioConfig } from './tattoo-studio';
import { tireShopConfig } from './tire-shop';
import { towingConfig } from './towing';
import { tutoringConfig } from './tutoring';
import { urgentCareConfig } from './urgent-care';
import { veterinaryClinicConfig } from './veterinary-clinic';
import { weddingServicesConfig } from './wedding-services';
import { windowsDoorsConfig } from './windows-doors';

export type { IndustryConfig, Service, WhyUsItem, ProcessStep, Testimonial, FAQItem, NavLink, Stat, ServiceArea } from '../types';

export const industries: Record<string, IndustryConfig> = {
  'accounting-tax': accountingTaxConfig,
  'appliance-repair': applianceRepairConfig,
  'author-writer': authorWriterConfig,
  'auto-body': autoBodyConfig,
  'auto-detailing': autoDetailingConfig,
  'auto-repair': autoRepairConfig,
  bakery: bakeryConfig,
  'barber-shop': barberShopConfig,
  boutique: boutiqueConfig,
  'car-wash': carWashConfig,
  catering: cateringConfig,
  chiropractic: chiropracticConfig,
  'coach-consultant': coachConsultantConfig,
  'coffee-shop': coffeeShopConfig,
  'dance-studio': danceStudioConfig,
  'deck-patio': deckPatioConfig,
  dental: dentalConfig,
  'dj-entertainment': djEntertainmentConfig,
  'dog-training': dogTrainingConfig,
  'driving-school': drivingSchoolConfig,
  drywall: drywallConfig,
  'event-planning': eventPlanningConfig,
  'financial-advisor': financialAdvisorConfig,
  flooring: flooringConfig,
  florist: floristConfig,
  'gift-shop': giftShopConfig,
  gutters: guttersConfig,
  'hair-braiding': hairBraidingConfig,
  'home-inspection': homeInspectionConfig,
  'insurance-agency': insuranceAgencyConfig,
  'interior-design': interiorDesignConfig,
  'it-services': itServicesConfig,
  'junk-removal': junkRemovalConfig,
  'legal-services': legalServicesConfig,
  locksmith: locksmithConfig,
  'makeup-artist': makeupArtistConfig,
  'marketing-agency': marketingAgencyConfig,
  masonry: masonryConfig,
  'med-spa': medSpaConfig,
  'medical-wellness': medicalWellnessConfig,
  'mental-health': mentalHealthConfig,
  'mortgage-broker': mortgageBrokerConfig,
  moving: movingConfig,
  'music-lessons': musicLessonsConfig,
  'nail-salon': nailSalonConfig,
  'nonprofit-charity': nonprofitCharityConfig,
  optometry: optometryConfig,
  'pest-control': pestControlConfig,
  'pet-boarding': petBoardingConfig,
  'photographer-videographer': photographerVideographerConfig,
  'physical-therapy': physicalTherapyConfig,
  'pressure-washing': pressureWashingConfig,
  'property-management': propertyManagementConfig,
  'restaurants-cafes': restaurantsCafesConfig,
  restoration: restorationConfig,
  'spa-massage': spaMassageConfig,
  'tattoo-studio': tattooStudioConfig,
  'tire-shop': tireShopConfig,
  towing: towingConfig,
  tutoring: tutoringConfig,
  'urgent-care': urgentCareConfig,
  'veterinary-clinic': veterinaryClinicConfig,
  'wedding-services': weddingServicesConfig,
  'windows-doors': windowsDoorsConfig,
};

export const industryList = Object.values(industries);
