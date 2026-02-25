import type { Metadata } from 'next';
import './globals.css';
import { LocaleProvider } from './lib/LocaleProvider';

export const metadata: Metadata = {
  title: 'SaveTide - Smart Price Comparison | Comparateur de Prix',
  description:
    'Compare prices on millions of products instantly. Scan a barcode or search for a product to find the best price across Amazon, Walmart, Fnac, Cdiscount, and hundreds of retailers.',
  keywords: [
    'comparateur de prix',
    'price comparison',
    'meilleur prix',
    'best price',
    'scan code-barre',
    'barcode scan',
    'amazon',
    'fnac',
    'cdiscount',
    'walmart',
    'bon plan',
    'deals',
    'alerte prix',
    'price alert',
  ],
  openGraph: {
    title: 'SaveTide - Smart Price Comparison',
    description:
      'Find the best price instantly. Scan, compare, save.',
    url: 'https://www.savetide.com',
    siteName: 'SaveTide',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SaveTide - Smart Price Comparison',
    description:
      'Find the best price instantly. Scan, compare, save.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
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
      <body>
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
