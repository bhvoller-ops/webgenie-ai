import type { IntelligenceCaptureInput } from "./input";
import type { FootInTheDoorItem } from "./types";

/**
 * Only surfaces gaps that are literally present-or-absent in the captured HTML —
 * no scoring, no inference. Each item must be something a prospect can verify
 * themselves in their own browser in under ten seconds.
 */
export function deriveFootInTheDoorChecklist(
  captures: IntelligenceCaptureInput[]
): FootInTheDoorItem[] {
  const pageCount = captures.length;
  const items: FootInTheDoorItem[] = [];

  const hasChatWidget = captures.some((c) => c.features.hasChatWidget);
  if (!hasChatWidget) {
    items.push({
      id: "no_chat_widget",
      label: "No live chat widget",
      detail: `No chat widget script detected on any of the ${pageCount} page(s) checked.`,
      pitch: "Your site doesn't have a way for someone to message you instantly — most visitors just leave instead of calling."
    });
  }

  const hasBookingWidget = captures.some((c) => c.features.hasBookingWidget);
  if (!hasBookingWidget) {
    items.push({
      id: "no_online_booking",
      label: "No online booking or scheduling",
      detail: `No booking/scheduling embed detected on any of the ${pageCount} page(s) checked.`,
      pitch: "There's no way to book or schedule online — every lead has to call during business hours or they move on to a competitor who lets them book instantly."
    });
  }

  const hasReviewsDisplayed = captures.some((c) => {
    const trust = c.features.trustSignals ?? [];
    const schema = c.features.schemaTypes ?? [];
    return (
      trust.includes("testimonial") ||
      trust.includes("reviews") ||
      schema.some((type) => /review|aggregaterating/i.test(type))
    );
  });
  if (!hasReviewsDisplayed) {
    items.push({
      id: "no_reviews_displayed",
      label: "No reviews or testimonials shown on the site",
      detail: `No testimonial text or review/rating markup found on any of the ${pageCount} page(s) checked.`,
      pitch: "Your reviews live on Google but nowhere on your own site — visitors have no proof you're good before they decide to call."
    });
  }

  const hasStructuredData = captures.some((c) => (c.features.schemaTypes ?? []).length > 0);
  if (!hasStructuredData) {
    items.push({
      id: "no_ai_search_schema",
      label: "Invisible to AI search (ChatGPT, Perplexity, Google AI Overviews)",
      detail: `No structured data (schema.org markup) found on any of the ${pageCount} page(s) checked.`,
      pitch: "When someone asks ChatGPT or Google's AI to find a business like yours nearby, your site has none of the structured data that makes you show up."
    });
  }

  const hasMobileViewport = captures.some((c) => c.features.hasMobileViewport);
  if (!hasMobileViewport) {
    items.push({
      id: "no_mobile_viewport",
      label: "Not set up for mobile screens",
      detail: `No mobile viewport tag found on any of the ${pageCount} page(s) checked — the page will render zoomed out and tiny on a phone.`,
      pitch: "Pull this up on your own phone right now — you'll have to pinch and zoom just to read it. Most of your customers are finding you on mobile."
    });
  }

  return items;
}
