import type { AppProps } from "next/app";
import Head from "next/head";
import "@/styles/globals.css";

/** CampusFix root application wrapper with skip-link, meta, and layout shell. */
export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>CampusFix | From Complaints to Action — AI for Campus Impact: Capture, Understand, Reveal, Act</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta
          name="description"
          content="CampusFix: From Complaints to Action — AI for Civic & Campus Impact: 1. Capture (Under-60-Second Intake), 2. Understand (AI Categorization & Summary, Duplicate Report Detection, Explainable Priority Scoring), 3. Reveal (Geographic Hotspot Clustering, 60-Second Executive Action Briefs), 4. Act (Live Student Status Tracking). Powered by Gemini 2.5 Flash."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* Keyboard-accessible skip link — first focusable element */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded focus:font-mono focus:text-sm focus:font-bold focus:shadow-lg"
      >
        Skip to main content
      </a>
      <div className="min-h-screen bg-black bg-campus-grid flex flex-col text-neutral-200">
        <Component {...pageProps} />
      </div>
    </>
  );
}
