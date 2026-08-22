const LINKS = [
  {
    nume: 'Instagram',
    href: 'https://www.instagram.com/andreeaberta.ro',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    nume: 'TikTok',
    href: 'https://www.tiktok.com/@andreeaberta.ro',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.7 2h-2.9v13.4a2.4 2.4 0 1 1-2.1-2.4v-2.9a5.3 5.3 0 1 0 5 5.3V8.9a7.4 7.4 0 0 0 4.3 1.4V7.4a4.5 4.5 0 0 1-4.3-4.5z" />
      </svg>
    ),
  },
]

/**
 * Iconite Instagram + TikTok.
 * varianta: 'ruby' (implicit, pentru pagina publica) sau 'gold' (zona clientului).
 * marginTop / marginBottom: spatiere, ca sa nu fie nevoie de wrapper.
 */
export default function SocialIcons({ varianta = 'ruby', marginTop = '20px', marginBottom = 0 }) {
  const clasa = varianta === 'gold' ? 'social-link social-link--gold' : 'social-link'
  return (
    <div className="social-row" style={{ marginTop, marginBottom }}>
      {LINKS.map(l => (
        <a key={l.nume} className={clasa} href={l.href} target="_blank" rel="noopener noreferrer" aria-label={l.nume}>
          {l.icon}
        </a>
      ))}
    </div>
  )
}
