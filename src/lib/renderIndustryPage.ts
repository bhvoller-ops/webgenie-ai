import type { IndustryConfig } from "@/data/gallery/types";
import { SITE_ORIGIN } from "@/lib/site-url";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stars(n: number): string {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

/**
 * The lead form's submit handler. Two very different jobs depending on
 * caller:
 *
 *   - Default (no `live`): what /gallery's preview modal renders — a
 *     decorative confirmation swap, nothing sent anywhere. Correct there
 *     specifically because /gallery is public and unauthenticated; if this
 *     posted for real, anyone just browsing the showcase would create a
 *     fake lead for a placeholder business like "BrightSmile Dental".
 *   - `live: true` — used only by lib/sitegen/gallery-site.ts when
 *     generating an actual prospect's site (cfg's businessName/phone/email
 *     have already been overridden with that business's real data by then).
 *     Posts to /api/site-lead, same endpoint and payload shape the core 14
 *     industries' lead-form.ts already uses, so a submission here lands in
 *     the same /leads inbox instead of vanishing.
 */
function leadSubmitScript(cfg: IndustryConfig, live: boolean): string {
  const c = cfg.colors;
  const thankYou = `'<div style="text-align:center;padding:40px 20px"><div style="font-size:3rem;margin-bottom:16px">✓</div><h3 style="font-size:1.4rem;color:${c.text};margin-bottom:8px">Thank You!</h3><p style="color:${c.textMuted};font-size:.95rem">We received your request and will call you within one business day. Talk soon!</p></div>'`;

  if (!live) {
    return `function handleLeadSubmit(e){
  e.preventDefault();
  var form=e.target;
  form.innerHTML=${thankYou};
}`;
  }

  const apiUrl = JSON.stringify(`${SITE_ORIGIN}/api/site-lead`);
  const business = JSON.stringify({ name: cfg.businessName, industryLabel: cfg.industryName, phone: cfg.phone });

  return `function handleLeadSubmit(e){
  e.preventDefault();
  var form=e.target;
  var data=new FormData(form);
  var name=(data.get('name')||'').toString().trim();
  var phone=(data.get('phone')||'').toString().trim();
  if(!name||!phone)return;
  var btn=form.querySelector('.lead-submit');
  var originalText=btn.textContent;
  var err=form.querySelector('.lead-error');
  if(!err){
    err=document.createElement('p');
    err.className='lead-error';
    err.style.cssText='color:#B91C1C;font-size:.85rem;text-align:center;margin-top:10px';
    form.appendChild(err);
  }
  err.textContent='';
  btn.disabled=true;
  btn.textContent='Sending…';
  fetch(${apiUrl},{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      business:${business},
      name:name,
      email:(data.get('email')||'').toString().trim(),
      phone:phone,
      service:(data.get('service')||'').toString().trim(),
      message:(data.get('message')||'').toString().trim()
    })
  })
    .then(function(r){return r.json().then(function(j){return {ok:r.ok,body:j};});})
    .then(function(res){
      if(res.ok){
        form.innerHTML=${thankYou};
      } else {
        btn.disabled=false;
        btn.textContent=originalText;
        err.textContent=(res.body&&res.body.error)?res.body.error:'Something went wrong — please call us instead.';
      }
    })
    .catch(function(){
      btn.disabled=false;
      btn.textContent=originalText;
      err.textContent='Something went wrong — please call us instead.';
    });
}`;
}

export function renderIndustryPage(cfg: IndustryConfig, opts: { live?: boolean } = {}): string {
  const c = cfg.colors;

  const serviceCards = cfg.services
    .map(
      (s, i) => `
      <div class="service-card" style="animation-delay:${i * 80}ms">
        <div class="service-icon" style="background:${c.primaryLight};color:${c.primary}">${escapeHtml(s.title.charAt(0))}</div>
        <h3>${escapeHtml(s.title)}</h3>
        <p>${escapeHtml(s.description)}</p>
        <ul>${s.features.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}</ul>
      </div>`,
    )
    .join("");

  const whyUsCards = cfg.whyUs
    .map(
      (w, i) => `
      <div class="why-card fade-up" style="animation-delay:${i * 80}ms">
        <div class="why-check" style="background:${c.primary}">✓</div>
        <h3>${escapeHtml(w.title)}</h3>
        <p>${escapeHtml(w.description)}</p>
      </div>`,
    )
    .join("");

  const processSteps = cfg.process
    .map(
      (p, i) => `
      <div class="process-step fade-up" style="animation-delay:${i * 100}ms">
        <div class="step-num">${escapeHtml(p.step)}</div>
        <h3>${escapeHtml(p.title)}</h3>
        <p>${escapeHtml(p.description)}</p>
      </div>`,
    )
    .join("");

  const testimonialCards = cfg.testimonials
    .map(
      (t, i) => `
      <div class="testimonial-card fade-up" style="animation-delay:${i * 80}ms">
        <div class="stars">${stars(t.rating)}</div>
        <p>"${escapeHtml(t.text)}"</p>
        <div class="testimonial-author">
          <div class="author-avatar" style="background:linear-gradient(135deg,${c.primary},${c.primaryDark})">${escapeHtml(t.name.charAt(0))}</div>
          <div>
            <p class="author-name">${escapeHtml(t.name)}</p>
            <p class="author-loc">${escapeHtml(t.location)}</p>
          </div>
        </div>
      </div>`,
    )
    .join("");

  const faqItems = cfg.faqs
    .map(
      (f, i) => `
      <details class="faq-item" style="animation-delay:${i * 60}ms"${i === 0 ? " open" : ""}>
        <summary>${escapeHtml(f.question)}<span class="faq-toggle">+</span></summary>
        <p>${escapeHtml(f.answer)}</p>
      </details>`,
    )
    .join("");

  const pricingCards = cfg.pricing
    .map(
      (p) => `
      <div class="pricing-card${p.popular ? " popular" : ""}">
        ${p.popular ? '<span class="badge">Most Popular</span>' : ""}
        <h3>${escapeHtml(p.name)}</h3>
        <div class="price">${escapeHtml(p.price)}</div>
        <p>${escapeHtml(p.description)}</p>
        <ul>${p.features.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}</ul>
        <a href="#lead-form" class="pricing-cta" style="background:${p.popular ? c.primary : c.surface};color:${p.popular ? "#fff" : c.primary}">${p.popular ? "Get Started" : "Choose Plan"}</a>
      </div>`,
    )
    .join("");

  const teamCards = cfg.team
    .map(
      (t) => `
      <div class="team-card">
        <div class="team-photo" style="background:linear-gradient(135deg,${c.primary},${c.primaryDark})">${escapeHtml(t.name.charAt(0))}</div>
        <h3>${escapeHtml(t.name)}</h3>
        <p class="role">${escapeHtml(t.role)}</p>
        <p>${escapeHtml(t.bio)}</p>
      </div>`,
    )
    .join("");

  const galleryItems = cfg.galleryImages
    .map(
      (img, i) => `
      <div class="gallery-item">
        <img src="${escapeHtml(img)}" alt="${escapeHtml(cfg.industryName)} project ${i + 1}" loading="lazy" />
        <div class="gallery-overlay">View Project</div>
      </div>`,
    )
    .join("");

  const areaTags = cfg.serviceAreas
    .map((a) => `<span class="area-tag">${escapeHtml(a.name)}</span>`)
    .join("");

  const statsBar = cfg.stats
    .map(
      (s) => `
      <div class="stat">
        <div class="stat-num">${escapeHtml(s.value)}</div>
        <div class="stat-label">${escapeHtml(s.label)}</div>
      </div>`,
    )
    .join("");

  const serviceOptions = cfg.services
    .map((s) => `<option value="${escapeHtml(s.title)}">${escapeHtml(s.title)}</option>`)
    .join("");

  const navLinksHtml = cfg.navLinks
    .map((l) => `<a href="${escapeHtml(l.href)}">${escapeHtml(l.label)}</a>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(cfg.businessName)} | ${escapeHtml(cfg.industryName)}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth;scroll-padding-top:60px}
body{font-family:'Segoe UI',system-ui,sans-serif;color:${c.text};line-height:1.7;background:${c.background};padding-bottom:64px}

/* Animations */
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes slideIn{from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
.fade-up{animation:fadeUp .6s ease-out both}

/* Urgency Banner */
.urgency-bar{background:linear-gradient(90deg,${c.primary},${c.primaryDark});color:#fff;text-align:center;padding:10px 20px;font-size:.85rem;font-weight:600;position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:center;gap:8px}
.urgency-bar .pulse-dot{width:8px;height:8px;border-radius:50%;background:#fbbf24;animation:pulse 1.5s infinite}

/* Navbar */
.navbar{position:sticky;top:0;z-index:90;background:rgba(255,255,255,.96);backdrop-filter:blur(10px);border-bottom:1px solid ${c.surface};padding:12px 20px;transition:box-shadow .3s}
.navbar-inner{max-width:1100px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
.navbar-brand{font-family:Georgia,serif;font-weight:700;font-size:1.1rem;color:${c.text};text-decoration:none}
.navbar-links{display:flex;gap:16px;flex-wrap:wrap;align-items:center}
.navbar-links a{font-size:.85rem;color:${c.textMuted};text-decoration:none;transition:color .2s}
.navbar-links a:hover{color:${c.primary}}
.navbar-cta{background:${c.primary};color:#fff!important;padding:8px 18px;border-radius:8px;font-weight:600;transition:transform .2s,box-shadow .2s}
.navbar-cta:hover{transform:translateY(-1px);box-shadow:0 4px 12px ${c.primary}40}

/* Hero */
.hero{position:relative;min-height:580px;display:flex;align-items:center;overflow:hidden;background:${c.primaryDark}}
.hero-bg{position:absolute;inset:0}
.hero-bg img{width:100%;height:100%;object-fit:cover}
.hero-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.75) 0%,rgba(0,0,0,0.4) 50%,rgba(0,0,0,0.15) 100%)}
.hero-content{position:relative;z-index:1;max-width:1100px;margin:0 auto;padding:80px 20px}
.hero-badge{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:9999px;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.25);color:#fff;font-size:.85rem;font-weight:500;margin-bottom:24px;backdrop-filter:blur(4px)}
.hero h1{font-size:2.8rem;color:#fff;font-family:Georgia,serif;margin-bottom:16px;line-height:1.2}
.hero p.sub{font-size:1.15rem;color:rgba(255,255,255,.9);margin-bottom:32px;max-width:600px}
.hero .btns{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:24px}
.btn{display:inline-block;padding:16px 32px;border-radius:10px;font-weight:700;text-decoration:none;font-size:1rem;transition:transform .2s,box-shadow .2s}
.btn:hover{transform:translateY(-2px)}
.btn-primary{background:${c.primary};color:#fff;box-shadow:0 4px 20px ${c.primary}40}
.btn-primary:hover{box-shadow:0 8px 30px ${c.primary}60}
.btn-secondary{background:rgba(255,255,255,.15);color:#fff;border:2px solid rgba(255,255,255,.3);backdrop-filter:blur(4px)}
.hero-phone{color:rgba(255,255,255,.9);font-size:1.1rem;font-weight:600;display:flex;align-items:center;gap:8px}
.hero-phone a{color:inherit;text-decoration:none}

/* Trust badges under hero */
.trust-bar{display:flex;gap:24px;flex-wrap:wrap;justify-content:center;padding:20px;max-width:1100px;margin:0 auto}
.trust-badge{display:flex;align-items:center;gap:8px;font-size:.85rem;color:${c.textMuted};font-weight:500}
.trust-badge .check{width:20px;height:20px;border-radius:50%;background:${c.primary};color:#fff;display:flex;align-items:center;justify-content:center;font-size:.7rem;flex-shrink:0}

/* Stats bar */
.stats-bar{display:flex;gap:40px;flex-wrap:wrap;justify-content:center;padding:24px 20px;max-width:1100px;margin:0 auto;background:${c.surface};border-radius:16px;margin-top:32px}
.stat{text-align:center;flex:1;min-width:120px}
.stat-num{font-size:1.8rem;font-weight:700;color:${c.primary};font-family:Georgia,serif}
.stat-label{font-size:.85rem;color:${c.textMuted}}

/* Sections */
section{padding:64px 20px;max-width:1100px;margin:0 auto}
.section-head{text-align:center;margin-bottom:40px}
.section-tag{display:inline-block;padding:4px 14px;border-radius:9999px;font-size:.8rem;font-weight:600;margin-bottom:12px;background:${c.primaryLight};color:${c.primary}}
.section-head h2{font-size:2rem;font-family:Georgia,serif;color:${c.text};margin-bottom:8px}
.section-head p{color:${c.textMuted};font-size:1rem;max-width:600px;margin:0 auto}
.grid{display:grid;gap:24px}
.grid-3{grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
.grid-4{grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}

/* Service cards */
.service-card{background:#fff;border:1px solid ${c.surface};border-radius:16px;padding:28px;transition:transform .3s,box-shadow .3s;animation:fadeUp .6s ease-out both}
.service-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,.08)}
.service-icon{width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;font-weight:700;margin-bottom:16px}
.service-card h3{font-size:1.15rem;margin-bottom:10px;color:${c.text}}
.service-card p{font-size:.9rem;color:${c.textMuted};margin-bottom:14px}
.service-card ul{list-style:none}
.service-card li{font-size:.85rem;padding:4px 0;padding-left:20px;position:relative}
.service-card li::before{content:"✓";color:${c.primary};position:absolute;left:0;font-weight:700}

/* Why Us */
.why-card{background:#fff;border-radius:16px;padding:28px;text-align:center;transition:transform .3s}
.why-card:hover{transform:translateY(-4px)}
.why-check{width:40px;height:40px;border-radius:50%;color:#fff;display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:700;margin:0 auto 16px}
.why-card h3{font-size:1.05rem;margin-bottom:8px;color:${c.text}}
.why-card p{font-size:.88rem;color:${c.textMuted}}

/* Mid-page CTA banner */
.cta-banner{background:linear-gradient(135deg,${c.primary},${c.primaryDark});border-radius:20px;padding:48px 32px;text-align:center;margin:48px auto;max-width:1000px}
.cta-banner h2{color:#fff;font-family:Georgia,serif;font-size:1.8rem;margin-bottom:12px}
.cta-banner p{color:rgba(255,255,255,.9);font-size:1rem;margin-bottom:24px;max-width:500px;margin-left:auto;margin-right:auto}
.cta-banner .btn{background:#fff;color:${c.primaryDark};box-shadow:0 4px 20px rgba(0,0,0,.15)}
.cta-banner .btn:hover{box-shadow:0 8px 30px rgba(0,0,0,.25)}
.cta-banner-trust{display:flex;gap:20px;justify-content:center;flex-wrap:wrap;margin-top:20px}
.cta-banner-trust span{color:rgba(255,255,255,.8);font-size:.8rem;display:flex;align-items:center;gap:6px}

/* Process */
.process-step{text-align:center;padding:24px}
.step-num{width:56px;height:56px;border-radius:50%;background:${c.primary};color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.3rem;font-weight:700;margin:0 auto 16px}
.process-step h3{font-size:1.05rem;margin-bottom:6px;color:${c.text}}
.process-step p{font-size:.85rem;color:${c.textMuted}}

/* Gallery */
.gallery-item{border-radius:16px;overflow:hidden;aspect-ratio:4/3;position:relative;cursor:pointer}
.gallery-item img{width:100%;height:100%;object-fit:cover;transition:transform .4s}
.gallery-item:hover img{transform:scale(1.08)}
.gallery-overlay{position:absolute;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;font-size:.9rem;opacity:0;transition:opacity .3s}
.gallery-item:hover .gallery-overlay{opacity:1}

/* Testimonials */
.testimonial-card{background:#fff;border-radius:16px;padding:28px;transition:transform .3s,box-shadow .3s}
.testimonial-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,.08)}
.testimonial-card .stars{color:${c.primary};font-size:1.1rem;margin-bottom:12px}
.testimonial-card p{font-size:.9rem;color:${c.text};margin-bottom:16px}
.testimonial-author{display:flex;align-items:center;gap:12px}
.author-avatar{width:44px;height:44px;border-radius:50%;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1rem;flex-shrink:0}
.author-name{font-weight:600;font-size:.85rem;color:${c.text};margin:0}
.author-loc{font-size:.8rem;color:${c.textMuted};margin:0}

/* FAQ */
.faq-item{border-bottom:1px solid ${c.surface};padding:0}
.faq-item summary{padding:20px 0;font-size:1rem;font-weight:600;color:${c.text};cursor:pointer;display:flex;justify-content:space-between;align-items:center;list-style:none}
.faq-item summary::-webkit-details-marker{display:none}
.faq-toggle{font-size:1.5rem;color:${c.primary};transition:transform .3s;flex-shrink:0}
.faq-item[open] .faq-toggle{transform:rotate(45deg)}
.faq-item p{font-size:.88rem;color:${c.textMuted};padding-bottom:20px}

/* Pricing */
.pricing-card{background:#fff;border:2px solid ${c.surface};border-radius:16px;padding:32px;text-align:center;position:relative;transition:transform .3s,box-shadow .3s}
.pricing-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,.08)}
.pricing-card.popular{border-color:${c.primary};transform:scale(1.03)}
.pricing-card.popular:hover{transform:scale(1.03) translateY(-4px)}
.badge{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:${c.primary};color:#fff;padding:4px 16px;border-radius:9999px;font-size:.75rem;font-weight:600}
.pricing-card h3{font-size:1.2rem;margin-bottom:8px;color:${c.text}}
.price{font-size:1.8rem;font-weight:700;color:${c.primary};margin:12px 0}
.pricing-card p{font-size:.85rem;color:${c.textMuted};margin-bottom:16px}
.pricing-card ul{list-style:none;text-align:left;margin-bottom:20px}
.pricing-card li{font-size:.85rem;padding:6px 0;padding-left:20px;position:relative}
.pricing-card li::before{content:"✓";color:${c.primary};position:absolute;left:0;font-weight:700}
.pricing-cta{display:inline-block;padding:12px 28px;border-radius:10px;font-weight:700;text-decoration:none;font-size:.9rem;transition:transform .2s}
.pricing-cta:hover{transform:translateY(-2px)}

/* Team */
.team-card{text-align:center}
.team-photo{width:120px;height:120px;border-radius:50%;color:#fff;display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:700;margin:0 auto 16px}
.team-card h3{font-size:1rem;color:${c.text}}
.team-card .role{color:${c.primary};font-size:.85rem;font-weight:500;margin-bottom:8px}
.team-card p{font-size:.83rem;color:${c.textMuted}}

/* Service areas */
.areas{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
.area-tag{background:${c.surface};padding:8px 18px;border-radius:9999px;font-size:.85rem;color:${c.text}}

/* Lead Form */
.lead-section{background:linear-gradient(135deg,${c.primaryDark},${c.primary});padding:64px 20px}
.lead-inner{max-width:600px;margin:0 auto;text-align:center}
.lead-section h2{color:#fff;font-family:Georgia,serif;font-size:2rem;margin-bottom:12px}
.lead-section .lead-sub{color:rgba(255,255,255,.9);font-size:1.05rem;margin-bottom:32px}
.lead-form{background:#fff;border-radius:20px;padding:36px 32px;text-align:left;box-shadow:0 20px 60px rgba(0,0,0,.2)}
.lead-form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.form-group{margin-bottom:18px}
.form-group label{display:block;font-size:.85rem;font-weight:600;color:${c.text};margin-bottom:6px}
.form-group input,.form-group select,.form-group textarea{width:100%;padding:12px 16px;border:2px solid ${c.surface};border-radius:10px;font-size:.9rem;font-family:inherit;color:${c.text};transition:border-color .2s,box-shadow .2s}
.form-group input:focus,.form-group select:focus,.form-group textarea:focus{outline:none;border-color:${c.primary};box-shadow:0 0 0 3px ${c.primaryLight}}
.form-group textarea{resize:vertical;min-height:80px}
.lead-submit{width:100%;padding:16px;border:none;border-radius:10px;background:${c.primary};color:#fff;font-size:1rem;font-weight:700;cursor:pointer;transition:transform .2s,box-shadow .2s}
.lead-submit:hover{transform:translateY(-2px);box-shadow:0 8px 24px ${c.primary}40}
.lead-trust{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-top:20px}
.lead-trust span{color:rgba(255,255,255,.8);font-size:.8rem;display:flex;align-items:center;gap:6px}
.lead-trust .check{width:16px;height:16px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:.6rem;color:#fff}

/* What Happens Next */
.next-steps{max-width:800px;margin:0 auto;padding:48px 20px;text-align:center}
.next-steps h2{font-size:1.6rem;font-family:Georgia,serif;color:${c.text};margin-bottom:32px}
.next-steps-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px}
.next-step{padding:24px 16px}
.next-step-num{width:48px;height:48px;border-radius:50%;background:${c.primaryLight};color:${c.primary};display:flex;align-items:center;justify-content:center;font-size:1.2rem;font-weight:700;margin:0 auto 12px}
.next-step h3{font-size:1rem;color:${c.text};margin-bottom:6px}
.next-step p{font-size:.85rem;color:${c.textMuted}}

/* Contact */
.contact{background:${c.primaryDark};color:#fff;text-align:center;padding:64px 20px}
.contact h2{color:#fff;font-family:Georgia,serif;font-size:1.8rem;margin-bottom:12px}
.contact p{opacity:.9;margin:6px 0}
.contact a{color:inherit;text-decoration:none}

/* Sticky CTA */
.sticky-cta{position:fixed;bottom:0;left:0;right:0;z-index:50;display:flex;align-items:center;justify-content:center;gap:12px;padding:14px 20px;background:${c.primary};color:#fff;text-decoration:none;font-weight:700;box-shadow:0 -4px 20px rgba(0,0,0,.15);transition:background .2s}
.sticky-cta:hover{background:${c.primaryDark}}
.sticky-cta-phone{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.2);padding:6px 14px;border-radius:8px;font-size:.85rem}

/* Chatbot */
.chat-toggle{position:fixed;bottom:80px;right:20px;width:56px;height:56px;border-radius:50%;background:${c.primary};color:#fff;border:none;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,.2);z-index:60;display:flex;align-items:center;justify-content:center;font-size:1.5rem;transition:transform .2s}
.chat-toggle:hover{transform:scale(1.1)}
.chat-toggle .chat-badge{position:absolute;top:-2px;right:-2px;width:18px;height:18px;border-radius:50%;background:#ef4444;color:#fff;font-size:.65rem;display:flex;align-items:center;justify-content:center;font-weight:700}
.chat-window{position:fixed;bottom:80px;right:20px;width:340px;max-width:calc(100vw - 40px);height:440px;max-height:calc(100vh - 120px);background:#fff;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,.2);z-index:61;display:none;flex-direction:column;overflow:hidden}
.chat-window.open{display:flex;animation:slideIn .3s ease-out}
.chat-header{background:${c.primary};color:#fff;padding:16px 20px;display:flex;align-items:center;justify-content:space-between}
.chat-header-info{display:flex;align-items:center;gap:10px}
.chat-header-avatar{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:1rem}
.chat-header h3{font-size:.9rem;font-weight:600;margin:0}
.chat-header span{font-size:.75rem;opacity:.8;display:flex;align-items:center;gap:4px}
.chat-header .dot{width:8px;height:8px;border-radius:50%;background:#4ade80}
.chat-close{background:none;border:none;color:#fff;font-size:1.3rem;cursor:pointer;padding:4px}
.chat-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;background:${c.surface}}
.chat-msg{max-width:80%;padding:10px 14px;border-radius:12px;font-size:.85rem;line-height:1.5}
.chat-msg.bot{background:#fff;color:${c.text};align-self:flex-start;border-bottom-left-radius:4px}
.chat-msg.user{background:${c.primary};color:#fff;align-self:flex-end;border-bottom-right-radius:4px}
.chat-typing{display:flex;gap:4px;padding:10px 14px;align-self:flex-start}
.chat-typing span{width:8px;height:8px;border-radius:50%;background:#bbb;animation:bounce 1.4s infinite}
.chat-typing span:nth-child(2){animation-delay:.2s}
.chat-typing span:nth-child(3){animation-delay:.4s}
.chat-input-row{display:flex;gap:8px;padding:12px 16px;border-top:1px solid ${c.surface};background:#fff}
.chat-input{flex:1;padding:10px 14px;border:2px solid ${c.surface};border-radius:10px;font-size:.85rem;font-family:inherit;outline:none;transition:border-color .2s}
.chat-input:focus{border-color:${c.primary}}
.chat-send{padding:10px 16px;background:${c.primary};color:#fff;border:none;border-radius:10px;cursor:pointer;font-size:.85rem;font-weight:600;transition:background .2s}
.chat-send:hover{background:${c.primaryDark}}
.chat-quick{display:flex;gap:6px;flex-wrap:wrap;padding:0 16px 8px}
.chat-quick button{font-size:.78rem;padding:6px 12px;border:1px solid ${c.surface};border-radius:9999px;background:#fff;color:${c.text};cursor:pointer;transition:all .2s}
.chat-quick button:hover{background:${c.primaryLight};border-color:${c.primary};color:${c.primary}}
</style>
</head>
<body>

<div class="urgency-bar">
  <span class="pulse-dot"></span>
  <span>Limited Time: Free Consultation This Week — <a href="#lead-form" style="color:#fff;text-decoration:underline">Claim Yours Now</a></span>
</div>

<nav class="navbar"><div class="navbar-inner"><a class="navbar-brand" href="#">${escapeHtml(cfg.businessName)}</a><div class="navbar-links">${navLinksHtml}<a href="#lead-form" class="navbar-cta">${escapeHtml(cfg.ctaPrimary)}</a></div></div></nav>

<div class="hero">
  <div class="hero-bg"><img src="${escapeHtml(cfg.heroImage)}" alt="" /></div>
  <div class="hero-overlay"></div>
  <div class="hero-content">
    <div class="hero-badge">${escapeHtml(cfg.heroBadge)}</div>
    <h1>${escapeHtml(cfg.heroTitle)}</h1>
    <p class="sub">${escapeHtml(cfg.heroSubtitle)}</p>
    <div class="btns">
      <a href="#lead-form" class="btn btn-primary">${escapeHtml(cfg.ctaPrimary)}</a>
      <a href="#services" class="btn btn-secondary">${escapeHtml(cfg.ctaSecondary)}</a>
    </div>
    <div class="hero-phone">📞 <a href="tel:${escapeHtml(cfg.phone)}">${escapeHtml(cfg.phone)}</a></div>
  </div>
  <div class="stats-bar">${statsBar}</div>
</div>

<div class="trust-bar">
  <div class="trust-badge"><span class="check">✓</span> Licensed & Insured</div>
  <div class="trust-badge"><span class="check">✓</span> ${escapeHtml(cfg.yearsExperience)} Years Experience</div>
  <div class="trust-badge"><span class="check">✓</span> Same-Day Response</div>
  <div class="trust-badge"><span class="check">✓</span> Satisfaction Guaranteed</div>
</div>

<section id="services" style="background:${c.surface}">
  <div class="section-head">
    <span class="section-tag">Our Services</span>
    <h2>What We Do Best</h2>
    <p>Comprehensive ${escapeHtml(cfg.industryName.toLowerCase())} services delivered by experienced professionals.</p>
  </div>
  <div class="grid grid-3">${serviceCards}</div>
</section>

<section id="why-us">
  <div class="section-head">
    <span class="section-tag">Why Choose Us</span>
    <h2>${escapeHtml(cfg.whyUsTitle)}</h2>
    <p>${escapeHtml(cfg.whyUsSubtitle)}</p>
  </div>
  <div class="grid grid-4">${whyUsCards}</div>
</section>

<div class="cta-banner">
  <h2>Ready to Get Started?</h2>
  <p>Join hundreds of satisfied customers who chose ${escapeHtml(cfg.businessName)}. Get your free, no-obligation quote today.</p>
  <a href="#lead-form" class="btn">${escapeHtml(cfg.ctaPrimary)} →</a>
  <div class="cta-banner-trust">
    <span>✓ No obligation</span>
    <span>✓ Free consultation</span>
    <span>✓ Fast response</span>
  </div>
</div>

<section id="process" style="background:${c.surface}">
  <div class="section-head">
    <span class="section-tag">Our Process</span>
    <h2>${escapeHtml(cfg.processTitle)}</h2>
    <p>${escapeHtml(cfg.processSubtitle)}</p>
  </div>
  <div class="grid grid-4">${processSteps}</div>
</section>

<section id="gallery">
  <div class="section-head">
    <span class="section-tag">Gallery</span>
    <h2>${escapeHtml(cfg.galleryTitle)}</h2>
    <p>${escapeHtml(cfg.gallerySubtitle)}</p>
  </div>
  <div class="grid grid-3">${galleryItems}</div>
</section>

<section id="testimonials" style="background:${c.surface}">
  <div class="section-head">
    <span class="section-tag">Reviews</span>
    <h2>${escapeHtml(cfg.testimonialsTitle)}</h2>
    <p>${escapeHtml(cfg.testimonialsSubtitle)}</p>
  </div>
  <div class="grid grid-3">${testimonialCards}</div>
</section>

<section id="pricing">
  <div class="section-head">
    <span class="section-tag">Pricing</span>
    <h2>${escapeHtml(cfg.pricingTitle)}</h2>
    <p>${escapeHtml(cfg.pricingSubtitle)}</p>
  </div>
  <div class="grid grid-3">${pricingCards}</div>
</section>

<section id="team" style="background:${c.surface}">
  <div class="section-head">
    <span class="section-tag">Our Team</span>
    <h2>${escapeHtml(cfg.teamTitle)}</h2>
    <p>${escapeHtml(cfg.teamSubtitle)}</p>
  </div>
  <div class="grid grid-4">${teamCards}</div>
</section>

<section id="faq">
  <div class="section-head">
    <span class="section-tag">FAQ</span>
    <h2>${escapeHtml(cfg.faqTitle)}</h2>
    <p>${escapeHtml(cfg.faqSubtitle)}</p>
  </div>
  <div style="max-width:800px;margin:0 auto">${faqItems}</div>
</section>

<section id="areas" style="background:${c.surface}">
  <div class="section-head">
    <span class="section-tag">Service Areas</span>
    <h2>${escapeHtml(cfg.serviceAreasTitle)}</h2>
  </div>
  <div class="areas">${areaTags}</div>
</section>

<div id="lead-form" class="lead-section">
  <div class="lead-inner">
    <h2>${escapeHtml(cfg.contactTitle)}</h2>
    <p class="lead-sub">${escapeHtml(cfg.contactSubtitle)}</p>
    <form class="lead-form" onsubmit="handleLeadSubmit(event)">
      <div class="lead-form-row">
        <div class="form-group">
          <label>Full Name *</label>
          <input type="text" name="name" placeholder="John Smith" required />
        </div>
        <div class="form-group">
          <label>Phone *</label>
          <input type="tel" name="phone" placeholder="(555) 123-4567" required />
        </div>
      </div>
      <div class="lead-form-row">
        <div class="form-group">
          <label>Email *</label>
          <input type="email" name="email" placeholder="john@example.com" required />
        </div>
        <div class="form-group">
          <label>Service Needed *</label>
          <select name="service" required>
            <option value="">Select a service...</option>
            ${serviceOptions}
            <option value="other">Other / Not Sure</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>How Can We Help?</label>
        <textarea name="message" placeholder="Tell us briefly what you need..."></textarea>
      </div>
      <button type="submit" class="lead-submit">${escapeHtml(cfg.ctaPrimary)} — It's Free!</button>
      <div class="lead-trust">
        <span><span class="check">✓</span> No obligation</span>
        <span><span class="check">✓</span> Free consultation</span>
        <span><span class="check">✓</span> Response within 1 business day</span>
      </div>
    </form>
  </div>
</div>

<div class="next-steps">
  <h2>What Happens After You Reach Out?</h2>
  <div class="next-steps-grid">
    <div class="next-step">
      <div class="next-step-num">1</div>
      <h3>We Call You</h3>
      <p>Within one business day, we'll reach out to discuss your needs.</p>
    </div>
    <div class="next-step">
      <div class="next-step-num">2</div>
      <h3>Free Consultation</h3>
      <p>We assess your situation and provide expert recommendations.</p>
    </div>
    <div class="next-step">
      <div class="next-step-num">3</div>
      <h3>Clear Quote</h3>
      <p>You get a transparent, upfront price with no hidden fees.</p>
    </div>
    <div class="next-step">
      <div class="next-step-num">4</div>
      <h3>Done Right</h3>
      <p>We deliver quality work backed by our satisfaction guarantee.</p>
    </div>
  </div>
</div>

<div id="contact" class="contact">
  <h2>${escapeHtml(cfg.contactTitle)}</h2>
  <p>${escapeHtml(cfg.contactSubtitle)}</p>
  <p>📞 <a href="tel:${escapeHtml(cfg.phone)}">${escapeHtml(cfg.phone)}</a> | ✉ <a href="mailto:${escapeHtml(cfg.email)}">${escapeHtml(cfg.email)}</a></p>
  <p>${escapeHtml(cfg.serviceArea)}</p>
  <p>${escapeHtml(cfg.hours)}</p>
  <p style="margin-top:16px;font-size:.8rem;opacity:.7">License #${escapeHtml(cfg.licenseNumber)}</p>
</div>

<a href="tel:${escapeHtml(cfg.phone)}" class="sticky-cta">
  <span>${escapeHtml(cfg.ctaPrimary)}</span>
  <span class="sticky-cta-phone">📞 ${escapeHtml(cfg.phone)}</span>
</a>

<button class="chat-toggle" onclick="toggleChat()" aria-label="Open chat">
  💬<span class="chat-badge">1</span>
</button>

<div class="chat-window" id="chatWindow">
  <div class="chat-header">
    <div class="chat-header-info">
      <div class="chat-header-avatar">🤖</div>
      <div>
        <h3>${escapeHtml(cfg.businessName)} Assistant</h3>
        <span><span class="dot"></span> Online Now</span>
      </div>
    </div>
    <button class="chat-close" onclick="toggleChat()">×</button>
  </div>
  <div class="chat-messages" id="chatMessages">
    <div class="chat-msg bot">${escapeHtml(cfg.chatbot.welcomeMessage)}</div>
  </div>
  <div class="chat-quick" id="chatQuick">
    <button onclick="askChat('What services do you offer?')">What services do you offer?</button>
    <button onclick="askChat('How much does it cost?')">Pricing?</button>
    <button onclick="askChat('How do I book?')">How do I book?</button>
  </div>
  <div class="chat-input-row">
    <input type="text" class="chat-input" id="chatInput" placeholder="${escapeHtml(cfg.chatbot.placeholder)}" onkeypress="if(event.key==='Enter')sendChat()" />
    <button class="chat-send" onclick="sendChat()">Send</button>
  </div>
</div>

<script>
function toggleChat(){
  var w=document.getElementById('chatWindow');
  w.classList.toggle('open');
  var b=document.querySelector('.chat-badge');
  if(b&&w.classList.contains('open'))b.style.display='none';
}
var kb=${JSON.stringify(cfg.chatbot.knowledgeBase)};
var welcome="${escapeHtml(cfg.chatbot.welcomeMessage)}";
function findAnswer(q){
  q=q.toLowerCase();
  var best=null,bestScore=0;
  for(var i=0;i<kb.length;i++){
    var words=kb[i].toLowerCase().split(/\\s+/);
    var score=0;
    for(var j=0;j<words.length;j++){if(q.includes(words[j])&&words[j].length>3)score++;}
    if(score>bestScore){bestScore=score;best=kb[i];}
  }
  return best||"I'd be happy to help with that! Please call us at ${escapeHtml(cfg.phone)} or fill out the form above, and we'll get back to you within one business day.";
}
function addMsg(txt,cls){
  var m=document.createElement('div');
  m.className='chat-msg '+cls;
  m.textContent=txt;
  document.getElementById('chatMessages').appendChild(m);
  document.getElementById('chatMessages').scrollTop=999999;
}
function sendChat(){
  var input=document.getElementById('chatInput');
  var q=input.value.trim();
  if(!q)return;
  addMsg(q,'user');
  input.value='';
  var typing=document.createElement('div');
  typing.className='chat-typing';
  typing.innerHTML='<span></span><span></span><span></span>';
  document.getElementById('chatMessages').appendChild(typing);
  document.getElementById('chatMessages').scrollTop=999999;
  setTimeout(function(){
    typing.remove();
    addMsg(findAnswer(q),'bot');
  },800);
}
function askChat(q){
  document.getElementById('chatInput').value=q;
  sendChat();
}
${leadSubmitScript(cfg, opts.live ?? false)}
</script>
</body>
</html>`;
}
