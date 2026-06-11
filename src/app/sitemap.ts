import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();

  // Only publicly crawlable routes — everything else is auth-gated.
  return [
    {
      url: base,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/questions`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];
}
