import { safeJson } from "@/lib/sitegen/chat-widget";

/**
 * The hero quote-request card — the primary conversion point on every
 * generated site. Posts to /api/site-lead on the main WebGenie deployment,
 * same cross-origin pattern as the chat widget (generated sites are static
 * HTML with no server of their own).
 */
import { SITE_ORIGIN } from "@/lib/site-url";
const LEAD_API_URL = `${SITE_ORIGIN}/api/site-lead`;

export function leadFormStyles(): string {
  return `
  .quoteform{background:#fff;border-radius:18px;overflow:hidden;
    box-shadow:0 30px 70px -24px rgba(0,0,0,.55);width:100%}
  .quoteform-head{background:var(--brand-dark);color:#fff;padding:22px 26px}
  .qf-eyebrow{font-size:.72rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;opacity:.82}
  .quoteform-body{padding:22px 26px 26px}
  .qf-field{margin-bottom:11px}
  .qf-field input,.qf-field textarea{
    width:100%;border:1px solid var(--line);border-radius:10px;padding:11px 13px;
    font-size:.92rem;font-family:inherit;color:var(--ink);background:var(--soft)}
  .qf-field input:focus,.qf-field textarea:focus{
    outline:2px solid var(--brand);outline-offset:1px;background:#fff}
  .qf-field textarea{resize:vertical;min-height:64px}
  .qf-submit{width:100%;background:var(--brand);color:#fff;border:none;border-radius:10px;padding:14px;
    font-weight:800;font-size:.95rem;cursor:pointer;margin-top:4px;transition:.2s}
  .qf-submit:hover{background:var(--brand-dark)}
  .qf-submit:disabled{opacity:.6;cursor:default}
  .qf-note{font-size:.72rem;color:var(--muted);text-align:center;margin-top:11px}
  .qf-msg{font-size:.86rem;font-weight:700;margin-top:12px;text-align:center;display:none}
  .qf-msg.show{display:block}
  .qf-msg.ok{color:#15803D}
  .qf-msg.err{color:#B91C1C}`;
}

export function leadFormMarkup(): string {
  return `
<div class="quoteform">
  <div class="quoteform-head">
    <div class="qf-eyebrow">Free, No-Obligation Quote</div>
  </div>
  <form class="quoteform-body" id="wg-quote-form" novalidate>
    <div class="qf-field"><input type="text" name="name" placeholder="Name *" required maxlength="160" autocomplete="name"></div>
    <div class="qf-field"><input type="email" name="email" placeholder="Email" maxlength="200" autocomplete="email"></div>
    <div class="qf-field"><input type="tel" name="phone" placeholder="Phone Number *" required maxlength="40" autocomplete="tel"></div>
    <div class="qf-field"><textarea name="message" placeholder="Tell us what's going on." maxlength="600"></textarea></div>
    <button type="submit" class="qf-submit" id="wg-quote-submit">Get My Free Quote</button>
    <p class="qf-note">We respect your privacy. No spam, ever.</p>
    <p class="qf-msg" id="wg-quote-msg" role="status"></p>
  </form>
</div>`;
}

export function leadFormScript(business: { name: string; industryLabel: string; phone: string }): string {
  return `
(function(){
  var BUSINESS = ${safeJson(business)};
  var API_URL = ${safeJson(LEAD_API_URL)};
  var form = document.getElementById('wg-quote-form');
  var submitBtn = document.getElementById('wg-quote-submit');
  var msgEl = document.getElementById('wg-quote-msg');
  if (!form) return;

  function showMessage(text, kind) {
    msgEl.textContent = text;
    msgEl.className = 'qf-msg show ' + kind;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = new FormData(form);
    var name = (data.get('name') || '').toString().trim();
    var phone = (data.get('phone') || '').toString().trim();
    if (!name || !phone) {
      showMessage('Please fill in your name and phone number.', 'err');
      return;
    }
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business: BUSINESS,
        name: name,
        email: (data.get('email') || '').toString().trim(),
        phone: phone,
        message: (data.get('message') || '').toString().trim()
      })
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
      .then(function (res) {
        if (res.ok) {
          form.reset();
          showMessage("Thanks — we'll be in touch shortly!", 'ok');
        } else {
          showMessage(res.body && res.body.error ? res.body.error : 'Something went wrong — please call us instead.', 'err');
        }
      })
      .catch(function () {
        showMessage('Something went wrong — please call us instead.', 'err');
      })
      .then(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Get My Free Quote';
      });
  });
})();`;
}
