import "./globals.css";

export const metadata = {
  title: "Sourcing.AI — Agent Fournisseurs",
  description: "Agent IA de sourcing et gestion fournisseurs B2B",
  manifest: "/manifest.json",
  themeColor: "#00C896",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sourcing.AI",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Sourcing.AI" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#00C896" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
