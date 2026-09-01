import type {
  Business,
  GeneratedSite,
  IconKey,
  SiteOptions,
} from "@/lib/sitegen/types";
import { INDUSTRIES, industryOf } from "@/lib/sitegen/industries";
import { chatWidgetMarkup, chatWidgetScript, chatWidgetStyles } from "@/lib/sitegen/chat-widget";
import { leadFormMarkup, leadFormScript, leadFormStyles } from "@/lib/sitegen/lead-form";
import { generateGallerySite } from "@/lib/sitegen/gallery-site";

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

const ICONS: Record<IconKey, string> = {
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  droplet: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/>',
  tree: '<path d="M12 2 7 9h3l-4 6h4l-3 5h10l-3-5h4l-4-6h3z"/><path d="M12 20v2"/>',
  sparkles: '<path d="M9.94 14.06 3 21m9-18 1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3z"/>',
  car: '<path d="M19 17h2l.64-2.54a6 6 0 0 0-.36-4.24l-.9-1.8A3 3 0 0 0 17.7 7H6.3a3 3 0 0 0-2.68 1.42l-.9 1.8a6 6 0 0 0-.36 4.24L3 17h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
  tooth: '<path d="M12 5.5c-1.5-1-3-1.5-4.5-1.5C5 4 3.5 6 3.5 9c0 2 .5 3.5 1 5.5.4 1.6.5 3 .8 4.5.2 1.2.7 2 1.7 2 1.2 0 1.6-1.2 2-3 .3-1.4.6-3 3-3s2.7 1.6 3 3c.4 1.8.8 3 2 3 1 0 1.5-.8 1.7-2 .3-1.5.4-2.9.8-4.5.5-2 1-3.5 1-5.5 0-3-1.5-5-4-5-1.5 0-3 .5-4.5 1.5z"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
  thumbsUp: '<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88z"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
};

function icon(k: IconKey, size = 24, stroke = "currentColor") {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k]}</svg>`;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const esc = (s: string) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const telHref = (phone: string) => "tel:" + phone.replace(/[^\d+]/g, "");

function stars(rating: number) {
  const full = Math.round(rating);
  return "★".repeat(Math.min(5, full)) + "☆".repeat(Math.max(0, 5 - full));
}

/**
 * "How It Works" — one shared, industry-agnostic process, not 14 bespoke
 * versions. The process a local service business actually follows (get
 * contacted, quote, schedule, do the work, get paid) is the same shape
 * whether it's a plumber or a dentist; only step 4's wording takes the
 * industry label, everything else reads naturally as-is for any of them.
 */
function howItWorksSteps(industryLabel: string): { icon: IconKey; title: string; blurb: string }[] {
  return [
    { icon: "phone", title: "Reach Out", blurb: "Call, text, or fill out the form below. Tell us what you need." },
    { icon: "award", title: "Get a Clear Quote", blurb: "Upfront, honest pricing before any work begins. No surprises." },
    { icon: "calendar", title: "Schedule a Time", blurb: "Pick a time that works for you. We show up when we say we will." },
    { icon: "wrench", title: "We Do The Work", blurb: `Careful, quality work from a ${industryLabel.toLowerCase()} you can trust.` },
    { icon: "thumbsUp", title: "You're Taken Care Of", blurb: "Simple payment and a follow-up to make sure you're satisfied." }
  ];
}

/* ------------------------------------------------------------------ */
/* Generator                                                           */
/* ------------------------------------------------------------------ */

/**
 * The one entry point both callers (the demo-site route, the Vercel
 * publisher) use — dispatches on which of the two industry spaces
 * business.industry belongs to. See the SiteGenIndustryKey/GalleryIndustryKey
 * doc comments in lib/sitegen/types.ts for why there are two at all.
 */
export function generateSite(
  business: Business,
  options: SiteOptions = {}
): GeneratedSite {
  if (!(business.industry in INDUSTRIES)) {
    return generateGallerySite(business, options);
  }
  const industry = industryOf(business.industry as keyof typeof INDUSTRIES);
  const p = {
    ...industry,
    heroImage: business.heroImageOverride || industry.heroImage,
    secondaryImage: business.secondaryImageOverride || industry.secondaryImage,
  };
  const city = `${business.city}, ${business.state}`;
  const sub = p.heroSub.replace(/\{city\}/g, city);
  const faq = p.faq.map((f) => ({ q: f.q, a: f.a.replace(/\{city\}/g, city) }));
  const hasRating = typeof business.rating === "number" && !!business.reviewCount;
  const builtBy = options.builtBy ?? "";

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": p.schemaType,
    name: business.name,
    telephone: business.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address,
      addressLocality: business.city,
      addressRegion: business.state,
    },
    areaServed: city,
    ...(hasRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: business.rating,
            reviewCount: business.reviewCount,
          },
        }
      : {}),
    ...(business.hours ? { openingHours: business.hours } : {}),
    makesOffer: p.services.map((s) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: s.name, description: s.blurb },
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const title = `${business.name} | ${p.label} in ${city}`;
  const description = `${business.name} provides ${p.label.toLowerCase()} services in ${city}. ${
    hasRating ? `Rated ${business.rating} from ${business.reviewCount} reviews. ` : ""
  }Call ${business.phone}.`;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:type" content="website" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
<script type="application/ld+json">${JSON.stringify(localBusinessSchema)}</script>
<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
<style>
  :root{
    --brand:${p.primary}; --brand-dark:${p.primaryDark};
    --ink:#0F172A; --body:#475569; --muted:#64748B; --line:#E2E8F0;
    --bg:#FFFFFF; --soft:#F8FAFC;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--body);
    background:var(--bg);line-height:1.6;-webkit-font-smoothing:antialiased}
  a{color:inherit;text-decoration:none}
  img{max-width:100%;display:block}
  .wrap{max-width:1140px;margin:0 auto;padding:0 24px}
  h1,h2,h3{color:var(--ink);line-height:1.15;letter-spacing:-.02em}
  h1{font-size:clamp(2.1rem,5vw,3.4rem);font-weight:800;letter-spacing:-.035em}
  h2{font-size:clamp(1.6rem,3.2vw,2.3rem);font-weight:700}
  h3{font-size:1.05rem;font-weight:700}
  .eyebrow{font-size:.75rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--brand)}
  section{padding:80px 0}
  .center{text-align:center}

  .btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;border-radius:10px;
    padding:15px 28px;font-size:1rem;font-weight:700;transition:.2s;border:2px solid transparent}
  .btn-primary{background:var(--brand);color:#fff;box-shadow:0 8px 24px -10px var(--brand)}
  .btn-primary:hover{background:var(--brand-dark);transform:translateY(-1px)}
  .btn-white{background:#fff;color:var(--brand)}
  .btn-white:hover{transform:translateY(-1px)}
  .btn-outline{border-color:rgba(255,255,255,.55);color:#fff}
  .btn-outline:hover{background:rgba(255,255,255,.12)}

  /* Header */
  header{position:sticky;top:0;z-index:60;background:rgba(255,255,255,.96);
    backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
  .hd{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 0}
  .bizwrap{min-width:0;flex:1 1 auto}
  .biz{font-size:1.1rem;font-weight:800;color:var(--ink);letter-spacing:-.02em;
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .bizmeta{font-size:.78rem;color:var(--muted);margin-top:2px;
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .hd .btn{flex-shrink:0}

  /* Hero */
  .hero{position:relative;color:#fff;overflow:hidden;
    background-image:linear-gradient(135deg,color-mix(in srgb,var(--brand-dark) 22%,transparent) 0%,
      color-mix(in srgb,var(--brand) 14%,transparent) 55%,color-mix(in srgb,var(--brand-dark) 25%,transparent) 100%),
      url('${p.heroImage}');
    background-size:cover;background-position:center;background-repeat:no-repeat;
    filter:brightness(1.15) saturate(1.08)}
  .hero::before{content:"";position:absolute;inset:0;opacity:.16;
    background-image:radial-gradient(circle at 18% 22%,#fff 0,transparent 42%),
      radial-gradient(circle at 82% 12%,#fff 0,transparent 34%),
      radial-gradient(circle at 62% 88%,#fff 0,transparent 38%)}
  .hero::after{content:"";position:absolute;inset:0;opacity:.07;
    background-image:linear-gradient(rgba(255,255,255,.9) 1px,transparent 1px),
      linear-gradient(90deg,rgba(255,255,255,.9) 1px,transparent 1px);background-size:44px 44px}
  .heroin{position:relative;padding:80px 20px 80px 40px;
    display:grid;grid-template-columns:minmax(0,1fr) 380px;gap:52px;align-items:center}
  .herocol{max-width:640px}
  .badge{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.16);
    border:1px solid rgba(255,255,255,.28);border-radius:999px;padding:7px 15px;
    font-size:.82rem;font-weight:600;margin-bottom:22px}
  .hero h1{color:#fff;text-shadow:0 2px 16px rgba(0,0,0,.55),0 1px 3px rgba(0,0,0,.5)}
  .herosub{font-size:1.14rem;line-height:1.65;color:rgba(255,255,255,.93);margin-top:20px;max-width:560px;
    text-shadow:0 1px 8px rgba(0,0,0,.5)}
  .herobtns{display:flex;gap:12px;flex-wrap:wrap;margin-top:34px}
  .chips{display:flex;gap:22px;flex-wrap:wrap;margin-top:34px;font-size:.86rem;color:rgba(255,255,255,.9);
    text-shadow:0 1px 6px rgba(0,0,0,.55)}
  .chip{display:inline-flex;align-items:center;gap:7px}
  .herorating{display:inline-flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:38px;max-width:100%;
    background:rgba(15,23,42,.62);border:1px solid rgba(255,255,255,.22);border-radius:999px;
    padding:9px 18px;font-size:.86rem;font-weight:600;color:#fff;box-shadow:0 8px 24px -12px rgba(0,0,0,.5)}
  .herorating-count{font-weight:500;color:rgba(255,255,255,.78)}

  /* Services */
  .grid3{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:22px;margin-top:46px}
  .svc{border:1px solid var(--line);border-radius:14px;padding:28px;background:#fff;transition:.22s}
  .svc:hover{border-color:var(--brand);box-shadow:0 14px 34px -20px rgba(15,23,42,.35);transform:translateY(-2px)}
  .svcico{width:46px;height:46px;border-radius:11px;display:grid;place-items:center;
    background:color-mix(in srgb,var(--brand) 12%,#fff);color:var(--brand);margin-bottom:16px}
  .svc p{font-size:.93rem;margin-top:9px}

  /* In-action image band */
  .imgband{position:relative;height:320px;overflow:hidden}
  .imgband img{width:100%;height:100%;object-fit:cover}
  .imgband .imgcaption{position:absolute;left:0;right:0;bottom:0;padding:26px 0;
    background:linear-gradient(0deg,rgba(15,23,42,.75),transparent)}
  .imgband .imgcaption h3{color:#fff}

  /* How it works */
  .howgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:30px;margin-top:46px}
  .how{text-align:center}
  .howstep{font-size:.72rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;
    color:var(--brand);margin-bottom:12px}
  .howico{width:58px;height:58px;border-radius:50%;display:grid;place-items:center;margin:0 auto 14px;
    background:color-mix(in srgb,var(--brand) 12%,#fff);color:var(--brand)}
  .how h3{font-size:1rem}
  .how p{font-size:.87rem;margin-top:8px;color:var(--muted)}

  /* Trust */
  .soft{background:var(--soft)}
  .grid4{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:30px;margin-top:46px}
  .tr{text-align:center}
  .trico{width:54px;height:54px;border-radius:50%;display:grid;place-items:center;margin:0 auto 16px;
    background:var(--brand);color:#fff}
  .tr p{font-size:.9rem;margin-top:8px}

  /* Reviews */
  .revwrap{display:grid;grid-template-columns:auto 1fr;gap:36px;align-items:center;
    border:1px solid var(--line);border-radius:16px;padding:34px;background:#fff;margin-top:36px}
  .revscore{text-align:center;padding-right:36px;border-right:1px solid var(--line)}
  .revnum{font-size:3.4rem;font-weight:800;color:var(--ink);line-height:1;letter-spacing:-.04em}
  .revstars{color:#F59E0B;font-size:1.3rem;letter-spacing:2px;margin-top:8px}
  .revcount{font-size:.85rem;color:var(--muted);margin-top:6px}

  /* FAQ */
  details{border:1px solid var(--line);border-radius:12px;padding:20px 24px;margin-top:12px;background:#fff}
  details summary{cursor:pointer;font-weight:700;color:var(--ink);list-style:none;
    display:flex;justify-content:space-between;align-items:center;gap:18px;font-size:1rem}
  details summary::-webkit-details-marker{display:none}
  details summary::after{content:"+";color:var(--brand);font-size:1.5rem;font-weight:400;line-height:1}
  details[open] summary::after{content:"−"}
  details p{margin-top:13px;font-size:.95rem}

  /* CTA */
  .cta{background:var(--brand);color:#fff;text-align:center;padding:78px 0}
  .cta h2{color:#fff}
  .cta p{color:rgba(255,255,255,.9);margin-top:14px;font-size:1.05rem}
  .ctanote{font-size:.83rem;color:rgba(255,255,255,.8);margin-top:18px}

  /* Footer */
  footer{background:#0F172A;color:#94A3B8;padding:56px 0 90px;font-size:.9rem}
  footer .fname{color:#fff;font-size:1.1rem;font-weight:700;margin-bottom:12px}
  .fgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:32px}
  footer a{color:#CBD5E1}
  .fbot{border-top:1px solid #1E293B;margin-top:34px;padding-top:22px;font-size:.8rem;color:#64748B}

  /* Sticky mobile call bar */
  .callbar{position:fixed;left:0;right:0;bottom:0;z-index:70;display:none;
    background:var(--brand);padding:13px 16px;box-shadow:0 -6px 22px rgba(0,0,0,.2)}
  .callbar a{display:flex;align-items:center;justify-content:center;gap:9px;color:#fff;font-weight:700;font-size:1.02rem}

  /* Hero lead-capture form */
  ${leadFormStyles()}

  /* Chat widget */
  ${chatWidgetStyles()}

  ${
    options.demoBadge
      ? `.demoribbon{position:fixed;top:0;left:0;right:0;z-index:90;background:#0F172A;color:#fff;
    text-align:center;font-size:.78rem;padding:7px 14px;font-weight:600;letter-spacing:.02em}
  header{top:32px} body{padding-top:32px}`
      : ""
  }

  @media (max-width:820px){
    section{padding:56px 0}
    .heroin{padding:48px 24px 64px;grid-template-columns:1fr;gap:36px}
    .herocol{max-width:none}
    .quoteform{max-width:440px}
    .imgband{height:220px}
    .revwrap{grid-template-columns:1fr;gap:24px}
    .revscore{padding-right:0;padding-bottom:24px;border-right:0;border-bottom:1px solid var(--line)}
    .callbar{display:block}
    footer{padding-bottom:96px}
  }
  @media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
</head>
<body>
${options.demoBadge ? `<div class="demoribbon">Preview site built for ${esc(business.name)}${builtBy ? ` by ${esc(builtBy)}` : ""}</div>` : ""}

<header>
  <div class="wrap hd">
    <div class="bizwrap">
      <div class="biz">${esc(business.name)}</div>
      <div class="bizmeta">${esc(p.label)} · ${esc(city)}</div>
    </div>
    <a class="btn btn-primary" href="${telHref(business.phone)}" style="padding:11px 20px;font-size:.92rem">
      ${icon("phone", 17, "#fff")} Call Now
    </a>
  </div>
</header>

<div class="hero">
  <div class="wrap heroin">
    <div class="herocol">
      <div class="badge">Serving ${esc(city)}</div>
      <h1>${esc(business.name)}</h1>
      <p class="herosub">${esc(sub)}</p>
      <div class="herobtns">
        <a class="btn btn-white" href="${telHref(business.phone)}">${icon("phone", 18)} ${esc(business.phone)}</a>
        <a class="btn btn-outline" href="#services">View Our Services</a>
      </div>
      <div class="chips">
        ${p.trust
          .slice(0, 3)
          .map((t) => `<span class="chip">${icon(t.icon, 16, "rgba(255,255,255,.9)")} ${esc(t.title)}</span>`)
          .join("")}
      </div>
      ${
        hasRating
          ? `<div class="herorating"><span style="color:#FCD34D;font-size:1.05em">★</span> ${business.rating} rated ${esc(
              p.label.toLowerCase()
            )} in ${esc(business.city)} <span class="herorating-count">· ${business.reviewCount} Google reviews</span></div>`
          : ""
      }
    </div>
    ${leadFormMarkup()}
  </div>
</div>

<section id="services">
  <div class="wrap">
    <div class="center">
      <div class="eyebrow">What We Do</div>
      <h2 style="margin-top:12px">Our Services</h2>
      <p style="margin:14px auto 0;max-width:560px">Professional ${esc(
        p.label.toLowerCase()
      )} services for homes and businesses across ${esc(city)}.</p>
    </div>
    <div class="grid3">
      ${p.services
        .map(
          (s) => `<div class="svc">
        <div class="svcico">${icon(s.icon, 22)}</div>
        <h3>${esc(s.name)}</h3>
        <p>${esc(s.blurb)}</p>
      </div>`
        )
        .join("")}
    </div>
  </div>
</section>

<div class="imgband">
  <img src="${esc(p.secondaryImage)}" alt="${esc(p.label)} work by ${esc(business.name)} in ${esc(city)}" loading="lazy" />
  <div class="imgcaption">
    <div class="wrap">
      <h3>See our ${esc(p.label.toLowerCase())} work in ${esc(city)}</h3>
    </div>
  </div>
</div>

<section>
  <div class="wrap">
    <div class="center">
      <div class="eyebrow">How It Works</div>
      <h2 style="margin-top:12px">Getting Started Is Simple</h2>
    </div>
    <div class="howgrid">
      ${howItWorksSteps(p.label)
        .map(
          (s, i) => `<div class="how">
        <div class="howstep">Step ${i + 1}</div>
        <div class="howico">${icon(s.icon, 24)}</div>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.blurb)}</p>
      </div>`
        )
        .join("")}
    </div>
  </div>
</section>

<section class="soft">
  <div class="wrap">
    <div class="center">
      <div class="eyebrow">Why Choose Us</div>
      <h2 style="margin-top:12px">Why ${esc(city)} Trusts ${esc(business.name)}</h2>
    </div>
    <div class="grid4">
      ${p.trust
        .map(
          (t) => `<div class="tr">
        <div class="trico">${icon(t.icon, 24, "#fff")}</div>
        <h3>${esc(t.title)}</h3>
        <p>${esc(t.blurb)}</p>
      </div>`
        )
        .join("")}
    </div>
  </div>
</section>

${
  hasRating
    ? `<section>
  <div class="wrap">
    <div class="center">
      <div class="eyebrow">Reputation</div>
      <h2 style="margin-top:12px">What Our Customers Say</h2>
    </div>
    <div class="revwrap">
      <div class="revscore">
        <div class="revnum">${business.rating}</div>
        <div class="revstars">${stars(business.rating!)}</div>
        <div class="revcount">${business.reviewCount} reviews</div>
      </div>
      <div>
        <p style="font-size:1.05rem;color:var(--ink);font-weight:600">
          ${business.reviewCount} customers across ${esc(city)} have rated ${esc(
        business.name
      )} an average of ${business.rating} out of 5.
        </p>
        <p style="margin-top:12px">
          That rating is earned on the things that matter locally: turning up when we said we would,
          quoting honestly, and doing the job properly the first time.
        </p>
        ${
          business.placeUrl
            ? `<a href="${esc(business.placeUrl)}" target="_blank" rel="noopener"
             style="display:inline-block;margin-top:16px;color:var(--brand);font-weight:700">Read our reviews →</a>`
            : ""
        }
      </div>
    </div>
  </div>
</section>`
    : ""
}

<section class="soft">
  <div class="wrap" style="max-width:820px">
    <div class="center">
      <div class="eyebrow">Questions</div>
      <h2 style="margin-top:12px">Frequently Asked</h2>
    </div>
    <div style="margin-top:36px">
      ${faq
        .map(
          (f, i) => `<details${i === 0 ? " open" : ""}>
        <summary>${esc(f.q)}</summary>
        <p>${esc(f.a)}</p>
      </details>`
        )
        .join("")}
    </div>
  </div>
</section>

<div class="cta">
  <div class="wrap">
    <h2>Ready to Get Started?</h2>
    <p>Call ${esc(business.name)} today${
    p.emergency ? " — including evenings and weekends" : ""
  }. We're here to help with all your ${esc(p.label.toLowerCase())} needs in ${esc(city)}.</p>
    <div style="margin-top:26px">
      <a class="btn btn-white" href="${telHref(business.phone)}" style="font-size:1.08rem;padding:17px 34px">
        ${icon("phone", 19)} ${esc(business.phone)}
      </a>
    </div>
    <div class="ctanote">${esc(p.ctaSub)}</div>
  </div>
</div>

<footer>
  <div class="wrap">
    <div class="fgrid">
      <div>
        <div class="fname">${esc(business.name)}</div>
        <div>${esc(p.label)}</div>
        <div style="margin-top:14px">${esc(business.address)}</div>
        <div>${esc(city)}</div>
      </div>
      <div>
        <div style="color:#fff;font-weight:600;margin-bottom:12px">Contact</div>
        <div><a href="${telHref(business.phone)}">${esc(business.phone)}</a></div>
        ${business.hours ? `<div style="margin-top:10px">${esc(business.hours)}</div>` : ""}
        ${p.emergency ? `<div style="margin-top:10px;color:#CBD5E1">Emergency service available</div>` : ""}
      </div>
      <div>
        <div style="color:#fff;font-weight:600;margin-bottom:12px">Services</div>
        ${p.services
          .slice(0, 4)
          .map((s) => `<div style="margin-bottom:7px">${esc(s.name)}</div>`)
          .join("")}
      </div>
    </div>
    <div class="fbot">
      © ${new Date().getFullYear()} ${esc(business.name)}. Serving ${esc(city)} and surrounding areas.${
    builtBy ? ` Site by ${esc(builtBy)}.` : ""
  }
    </div>
  </div>
</footer>

<div class="callbar">
  <a href="${telHref(business.phone)}">${icon("phone", 19, "#fff")} Call ${esc(business.phone)}</a>
</div>

${chatWidgetMarkup(business)}
<script>${chatWidgetScript(business, p)}</script>
<script>${leadFormScript({ name: business.name, industryLabel: p.label, phone: business.phone })}</script>

</body>
</html>`;

  return {
    business,
    html,
    bytes: Buffer.byteLength(html, "utf8"),
    schemaTypes: [p.schemaType, "FAQPage", ...(hasRating ? ["AggregateRating"] : [])],
    sections: [
      "Header",
      "Hero",
      "Services",
      "In-action photo",
      "Why choose us",
      ...(hasRating ? ["Reviews"] : []),
      "FAQ",
      "Call to action",
      "Footer",
      "Sticky mobile call bar",
      "AI chat widget",
    ],
  };
}
