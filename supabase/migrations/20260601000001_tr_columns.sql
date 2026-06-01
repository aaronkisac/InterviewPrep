-- Add Turkish translation columns to mock_options and terms tables.

alter table public.mock_options
  add column if not exists option_text_tr text not null default '',
  add column if not exists explanation_tr  text not null default '';

alter table public.terms
  add column if not exists tooltip_tr    text not null default '',
  add column if not exists definition_tr text not null default '';

comment on column public.mock_options.option_text_tr is 'Turkish translation of option_text';
comment on column public.mock_options.explanation_tr  is 'Turkish translation of explanation';
comment on column public.terms.tooltip_tr             is 'Turkish translation of tooltip';
comment on column public.terms.definition_tr          is 'Turkish translation of definition';
