import type { IndustryProfile } from "@/lib/sitegen/types";

/**
 * Public chat backend lives on the main WebGenie deployment — generated
 * sites are static HTML with no server of their own, so the widget always
 * calls back here regardless of where the site itself ends up hosted.
 */
import { SITE_ORIGIN } from "@/lib/site-url";
const CHAT_API_URL = `${SITE_ORIGIN}/api/site-chat`;

/** Prevents embedded JSON from prematurely closing the surrounding <script> tag. */
export function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function chatWidgetStyles(): string {
  return `
  #wg-chat-launcher{position:fixed;right:20px;bottom:24px;z-index:80;width:58px;height:58px;
    border-radius:50%;background:var(--brand);color:#fff;display:grid;place-items:center;
    box-shadow:0 10px 28px -8px rgba(0,0,0,.4);cursor:pointer;border:none;transition:.2s;overflow:hidden}
  #wg-chat-launcher:hover{transform:scale(1.06)}
  #wg-chat-launcher img{width:100%;height:100%;object-fit:cover}
  #wg-chat-panel{position:fixed;right:20px;bottom:92px;z-index:80;width:340px;max-width:calc(100vw - 40px);
    max-height:min(480px,70vh);background:#fff;border-radius:16px;box-shadow:0 20px 50px -12px rgba(0,0,0,.35);
    display:none;flex-direction:column;overflow:hidden;border:1px solid var(--line)}
  #wg-chat-panel.open{display:flex}
  #wg-chat-head{background:var(--brand);color:#fff;padding:14px 16px;font-weight:700;font-size:.92rem}
  #wg-chat-head span{display:block;font-weight:500;font-size:.76rem;opacity:.85;margin-top:2px}
  #wg-chat-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:9px;background:var(--soft)}
  .wg-msg{max-width:85%;padding:9px 12px;border-radius:12px;font-size:.86rem;line-height:1.45}
  .wg-msg.user{align-self:flex-end;background:var(--brand);color:#fff;border-bottom-right-radius:3px}
  .wg-msg.bot{align-self:flex-start;background:#fff;border:1px solid var(--line);color:var(--ink);border-bottom-left-radius:3px}
  #wg-chat-form{display:flex;gap:8px;padding:10px;border-top:1px solid var(--line);background:#fff}
  #wg-chat-input{flex:1;border:1px solid var(--line);border-radius:10px;padding:9px 12px;font-size:.86rem;font-family:inherit}
  #wg-chat-input:focus{outline:2px solid var(--brand);outline-offset:1px}
  #wg-chat-send{background:var(--brand);color:#fff;border:none;border-radius:10px;padding:0 14px;font-weight:700;font-size:.86rem;cursor:pointer}
  #wg-chat-send:disabled{opacity:.5;cursor:default}
  @media (max-width:820px){
    #wg-chat-launcher{bottom:78px}
    #wg-chat-panel{bottom:146px}
  }`;
}

export function chatWidgetMarkup(
  business: {
    name: string;
    phone: string;
    city: string;
    state: string;
  },
  builtBy?: string,
  logoUrl?: string
): string {
  const subtitle = builtBy ? `${business.name} &middot; powered by ${builtBy}` : business.name;
  const launcherIcon = logoUrl
    ? `<img src="${logoUrl}" alt="" />`
    : `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`;
  return `
<button id="wg-chat-launcher" aria-label="Chat with us">
  ${launcherIcon}
</button>
<div id="wg-chat-panel">
  <div id="wg-chat-head">How Can We Help You<span>${subtitle}</span></div>
  <div id="wg-chat-msgs"></div>
  <form id="wg-chat-form">
    <input id="wg-chat-input" autocomplete="off" placeholder="Ask a question…" />
    <button id="wg-chat-send" type="submit">Send</button>
  </form>
</div>`;
}

export function chatWidgetScript(
  business: { name: string; phone: string; city: string; state: string; hours?: string },
  profile: Pick<IndustryProfile, "label" | "services" | "faq">,
  organizationId?: string
): string {
  const payload = {
    name: business.name,
    industryLabel: profile.label,
    phone: business.phone,
    city: business.city,
    state: business.state,
    hours: business.hours,
    services: profile.services.map((s) => ({ name: s.name, blurb: s.blurb })),
    faq: profile.faq.map((f) => ({ q: f.q, a: f.a }))
  };

  return `
(function(){
  var BUSINESS = ${safeJson(payload)};
  var ORG_ID = ${safeJson(organizationId ?? null)};
  var API_URL = ${safeJson(CHAT_API_URL)};
  var messages = [];
  var launcher = document.getElementById('wg-chat-launcher');
  var panel = document.getElementById('wg-chat-panel');
  var msgsEl = document.getElementById('wg-chat-msgs');
  var form = document.getElementById('wg-chat-form');
  var input = document.getElementById('wg-chat-input');
  var sendBtn = document.getElementById('wg-chat-send');
  var greeted = false;

  function addMessage(role, text) {
    var div = document.createElement('div');
    div.className = 'wg-msg ' + (role === 'user' ? 'user' : 'bot');
    div.textContent = text;
    msgsEl.appendChild(div);
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  launcher.addEventListener('click', function () {
    panel.classList.toggle('open');
    if (!greeted) {
      greeted = true;
      addMessage('bot', "Hi! Ask me anything about " + BUSINESS.name + ", or I can get someone to call you back.");
    }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    addMessage('user', text);
    messages.push({ role: 'user', content: text.slice(0, 600) });
    sendBtn.disabled = true;

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ business: BUSINESS, organizationId: ORG_ID, messages: messages.slice(-20) })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var reply = data.reply || "Sorry, please call us at " + BUSINESS.phone + ".";
        addMessage('bot', reply);
        messages.push({ role: 'assistant', content: reply });
      })
      .catch(function () {
        addMessage('bot', "Sorry, something went wrong — please call us at " + BUSINESS.phone + ".");
      })
      .finally(function () {
        sendBtn.disabled = false;
      });
  });
})();`;
}
