import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="dark">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta
          name="description"
          content="ASTRA-Grid Tactical: Enterprise AI-Powered Civic Crisis, Hotspot Detection & Explainable Triage Command Center. From Complaints to Action — AI for Civic Impact: Capture, Understand, Reveal, Act."
        />
        <meta name="theme-color" content="#07090E" />
      </Head>
      <body className="bg-obsidian text-slate-200 antialiased selection:bg-tactical-cyan/20 selection:text-tactical-cyan">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
