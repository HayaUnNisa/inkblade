# Search and discovery files

Run `npm run generate:seo` after editing the catalog, then `npm run check:links`.
The production build automatically runs both through prebuild.

- sitemap.xml: published series, chapters and public information routes.
- rss.xml: published chapter feed, using the dates stored in the catalog.
- search-index.json: reusable search records; existing in-app search is unchanged.
- robots.txt: permits crawling and identifies the sitemap.
- manifest.json and icons: browser app metadata (no offline/service-worker support).
- og-image.png: social preview composed from existing InkBlade branding.
- Seo.tsx: route-aware titles, descriptions, canonical URLs, social metadata and JSON-LD. ComicSeries, ComicStory, WebSite, BreadcrumbList and FAQPage are used. The FAQ answers are also visible on About. No fabricated reviews or author identities are added.

The link checker checks catalog image files and generated internal links; it is not an external-link or browser crawler. Metadata/schema is updated by React, so crawlers must render JavaScript for route-specific data. Search engines decide indexing and rich-result eligibility. Deploy before submitting https://inkblade.xyz/sitemap.xml to Search Console.
