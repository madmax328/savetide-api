import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SaveTide - Comparateur de Prix Intelligent',
  description:
    'Comparez les prix de millions de produits en un instant. Scannez un code-barre ou recherchez un produit pour trouver le meilleur prix parmi Amazon, Fnac, Cdiscount, Darty et des centaines de marchands.',
  keywords: [
    'comparateur de prix',
    'meilleur prix',
    'scan code-barre',
    'price comparison',
    'amazon',
    'fnac',
    'cdiscount',
    'bon plan',
    'alerte prix',
  ],
  openGraph: {
    title: 'SaveTide - Comparateur de Prix Intelligent',
    description:
      'Trouvez le meilleur prix en un instant. Scannez, comparez, economisez.',
    url: 'https://savetide.com',
    siteName: 'SaveTide',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SaveTide - Comparateur de Prix Intelligent',
    description:
      'Trouvez le meilleur prix en un instant. Scannez, comparez, economisez.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
