export const seo = (title: string, description: string) => ({
  meta: [
    { title: `${title} · KUSASA-ELIHLE Essential Candles` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} · KUSASA-ELIHLE` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ],
});
