import './globals.css'
import Tracker from './components/Tracker'

export const metadata = {
  title: 'Andreea Berta — Salon EVOLIS Piatra Neamț',
  description: 'Programări online salon unghii EVOLIS — Andreea Berta, Piatra Neamț',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ro">
      <body>
        <Tracker />
        {children}
      </body>
    </html>
  )
}
