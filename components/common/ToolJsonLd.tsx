export interface ToolJsonLdProps {
  title: string;
  description: string;
  toolUrl: string;
  category?: string;
  faqs?: Array<{ q: string; a: string }>;
}

export default function ToolJsonLd({
  title,
  description,
  toolUrl,
  category = "UtilitiesApplication",
  faqs,
}: ToolJsonLdProps) {
  const structuredData: any[] = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: title,
      description: description,
      url: toolUrl,
      applicationCategory: category,
      operatingSystem: "All",
      browserRequirements: "Requires JavaScript. Requires HTML5.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://desktools.run/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Tools",
          item: "https://desktools.run/tools/",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: title,
          item: toolUrl,
        },
      ],
    },
  ];

  if (faqs && faqs.length > 0) {
    structuredData.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      })),
    });
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}
