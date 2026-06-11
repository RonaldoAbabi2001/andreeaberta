import './globals.css'
import Tracker from './components/Tracker'

export const metadata = {
  title: 'Andreea Berta — Salon EVOLIS Piatra Neamț',
  description: 'Programări online salon unghii EVOLIS — Andreea Berta, Piatra Neamț',
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
