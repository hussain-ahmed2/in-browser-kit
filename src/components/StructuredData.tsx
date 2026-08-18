"use client";

import { SITE_NAME, SITE_URL, SITE_TAGLINE } from "@/lib/site";

interface StructuredDataProps {
  name?: string;
  description?: string;
  url: string;
  category?: string;
}

export function StructuredData({ name, description, url, category }: StructuredDataProps) {
  const finalName = name ?? SITE_NAME;
  const finalDescription = description ?? SITE_TAGLINE;
  const finalCategory = category ?? "Utilities";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: finalName,
    description: finalDescription,
    url,
    applicationCategory: finalCategory,
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function WebSiteStructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_TAGLINE,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/tools/{tool_slug}`,
      },
      queryInput: "required name=tool_slug",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}