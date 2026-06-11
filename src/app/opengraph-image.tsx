import { ImageResponse } from "next/og";

import { SITE_NAME } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = SITE_NAME;

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 36,
          backgroundColor: "#f5f1e6",
        }}
      >
        <svg viewBox="0 0 32 32" width="160" height="160">
          <circle cx="16" cy="16" r="15" fill="#a67c52" />
          <g transform="translate(4.53 5.46) scale(0.62)">
            <path
              d="M11.55 12.5 A5.8 5.8 0 1 1 20.3 15.25 C19 17.5 17.3 18.5 17.3 21.5"
              fill="none"
              stroke="#fffcf5"
              strokeWidth="3.8"
              strokeLinecap="round"
            />
            <path
              d="M14 26 L16.8 28.6 L23.5 20.5"
              fill="none"
              stroke="#fffcf5"
              strokeWidth="3.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 600,
            color: "#4a3f35",
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "#7d6b56",
          }}
        >
          React · TypeScript · Next.js — questions, mock sessions, glossary
        </div>
      </div>
    ),
    size,
  );
}
