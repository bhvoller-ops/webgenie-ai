-- Generated sites are getting a hero lead-capture form (name/email/phone/
-- service/city) alongside the existing AI chat widget. Both are "someone on
-- a generated site wants a callback" -- same downstream action, same review
-- inbox -- so this extends chat_leads rather than forking a parallel table.
alter table public.chat_leads
  add column source text not null default 'chat'
    check (source in ('chat', 'form')),
  add column visitor_email text,
  add column service_requested text,
  add column city text;

comment on column public.chat_leads.source is
  'chat = captured by the AI intake widget; form = submitted via the hero quote form.';
