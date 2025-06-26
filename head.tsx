// public/favicon.ico already exists, so add meta tags to _app or layout

// In Next.js 13+, meta tags go in app/layout.tsx or app/head.tsx

export default function Head() {
  return (
    <>
      <title>Mix & Mingle – Social DJ Streaming</title>
      <meta
        name="description"
        content="Mix & Mingle: The social DJ streaming app for music lovers, creators, and communities. Go live, chat, and connect!"
      />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
      <meta property="og:title" content="Mix & Mingle – Social DJ Streaming" />
      <meta
        property="og:description"
        content="Go live, chat, and connect with DJs and music fans worldwide."
      />
      <meta property="og:image" content="/favicon.ico" />
      <meta property="og:type" content="website" />
      <meta name="theme-color" content="#1a1a2e" />
    </>
  );
}
