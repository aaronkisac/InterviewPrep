/**
 * Brand mark — a question mark whose dot has become a checkmark
 * ("questions, answered"), set on a solid primary disc.
 * Theme-aware via CSS variables. Server-safe (no hooks).
 */
export function Logo({
  size = 20,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="16" cy="16" r="15" fill="var(--primary)" />
      <g transform="translate(4.53 5.46) scale(0.62)">
        <path
          d="M11.55 12.5 A5.8 5.8 0 1 1 20.3 15.25 C19 17.5 17.3 18.5 17.3 21.5"
          fill="none"
          stroke="var(--primary-foreground)"
          strokeWidth="3.8"
          strokeLinecap="round"
        />
        <path
          d="M14 26 L16.8 28.6 L23.5 20.5"
          fill="none"
          stroke="var(--primary-foreground)"
          strokeWidth="3.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
