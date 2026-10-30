import { Html, Head, Main, NextScript } from "next/document";

/** Custom document with lang attribute, web fonts, and theme-color. */
export default function Document() {
  return (
    <Html lang="en" className="dark">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta
          name="description"
          content="CampusFix: From Complaints to Action — AI for Civic & Campus Impact: 1. Capture (Under-60-Second Intake), 2. Understand (AI Categorization & Summary, Duplicate Report Detection, Explainable Priority Scoring), 3. Reveal (Geographic Hotspot Clustering, 60-Second Executive Action Briefs), 4. Act (Live Citizen/Student Status Tracking). Smart-facility infrastructure operations platform powered by Gemini 2.5 Flash."
        />
        <meta name="theme-color" content="#000000" />
      </Head>
      <body className="bg-black text-neutral-200 antialiased selection:bg-white selection:text-black">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
