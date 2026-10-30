import type { AppProps } from "next/app";
import Head from "next/head";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>ASTRA-Grid Tactical | Civic Crisis & Hotspot Command Center</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen bg-obsidian bg-tactical-grid flex flex-col text-slate-200">
        <Component {...pageProps} />
      </div>
    </>
  );
}
