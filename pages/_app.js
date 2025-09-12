import { Analytics } from "@vercel/analytics/next";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <body className="home-page">
        <Component {...pageProps} />
      <Analytics />
    </>
  );
}

export default MyApp;
