# Course pilot — a11y review notes (2026-06-12)

Static WCAG 2.1 AA pass over the lesson player, course map and `/learn` grid.

## Fixed in this pass

1. **option-list**: removed invalid `role="listbox"` (button children are not
   `option`s and no composite focus management exists). Plain list +
   `aria-pressed` toggle buttons.
2. **fill_blank word bank**: used tokens hide their text visually
   (`text-transparent` + `aria-hidden` span) which left nameless buttons —
   added `aria-label={token}`.
3. **step-order pool**: same nameless-button issue — added `aria-label`.
4. **course-map unit icons**: lucide `aria-label` without `role` is not
   reliably announced — added `role="img"` to the Check/Lock status icons.

## Already in place (verified)

- Player: `role="progressbar"` with name/min/max/now; `aria-live="polite"`
  feedback banner; exit button labeled; options state via icon + sr-only text,
  never color alone; keyboard 1–5 select + Enter check/continue.
- Map: every actionable node is a real `<a>`/`<button>` with full text state
  (`aria-label` includes lock/replay); decorative labels `aria-hidden`.
- Diagrams: `role="img"` + descriptive EN/TR `aria-label`; replay button
  labeled; all animation behind `prefers-reduced-motion` (confetti skipped).

## Manual follow-ups (not blocking)

- **Focus management on step change**: after the banner's Continue unmounts,
  focus falls to `<body>`. Move focus to the next step's heading
  (`tabIndex={-1}` + `ref.focus()`) — verify with a screen reader first.
- **match step**: a mispair is communicated by a red flash + selection reset
  only; consider an sr-only live region ("X and Y don't match").
- **Word-bank flying tokens**: verify the `layoutId` handoff doesn't confuse
  VoiceOver focus when a token moves between bank and blank.
- Screen-reader smoke test of one full lesson (NVDA + VoiceOver).
