import './globals.css'
import Tracker from './components/Tracker'

export const metadata = {
  metadataBase: new URL('https://www.andreeaberta.com'),
  title: 'Salon de unghii în Piatra Neamț | Andreea Berta — EVOLIS MANI',
  description: 'Salon de unghii premium în Piatra Neamț (B-dul Dacia 6). Manichiură, unghii cu gel, semipermanent și nail art cu Andreea Berta, tehnician onicolog certificat. Programează online.',
  keywords: ['salon unghii Piatra Neamț', 'manichiură Piatra Neamț', 'unghii gel Piatra Neamț', 'semipermanent Piatra Neamț', 'nail art Piatra Neamț', 'Andreea Berta', 'salon EVOLIS Piatra Neamț', 'salon unghii Neamț'],
  alternates: { canonical: 'https://www.andreeaberta.com' },
  openGraph: {
    title: 'Salon de unghii în Piatra Neamț | Andreea Berta — EVOLIS',
    description: 'Salon de unghii premium în Piatra Neamț. Manichiură, gel, semipermanent, nail art. Programează online.',
    url: 'https://www.andreeaberta.com',
    siteName: 'EVOLIS MANI — Andreea Berta',
    locale: 'ro_RO',
    type: 'website',
    images: [{ url: '/icon-512.png', width: 512, height: 512, alt: 'Salon de unghii EVOLIS Piatra Neamț' }],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'EVOLIS Admin',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icon-192.png' }],
  },
}

export const viewport = {
  themeColor: '#c9a84c',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }) {
  return (
    <html lang="ro">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="EVOLIS Admin" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        <Tracker />
        {children}
      </body>
    </html>
  )
}
