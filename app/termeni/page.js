export const metadata = {
  title: 'Termeni de utilizare EVOLIS Studio | Terms of Service',
  description: 'Termenii de utilizare ai aplicației EVOLIS Studio.',
  alternates: { canonical: '/termeni' },
}

const wrap = { maxWidth: 760, margin: '0 auto', padding: '48px 20px 80px', fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif', lineHeight: 1.65, color: '#1C1C1C' }
const h1 = { color: '#9B1B30', fontSize: 28, marginBottom: 4 }
const h2 = { color: '#9B1B30', fontSize: 20, marginTop: 32 }
const muted = { color: '#666', fontSize: 14 }
const hr = { border: 0, borderTop: '1px solid #e5d9c3', margin: '48px 0' }

export default function Termeni() {
  return (
    <main style={wrap}>
      <h1 style={h1}>Termeni de utilizare – EVOLIS Studio</h1>
      <p style={muted}>Ultima actualizare: 27.11.2026 · <a href="#en">English version below</a></p>

      <p>
        <strong>EVOLIS Studio</strong> este aplicația de montaj și publicare video a <strong>ABROAN S.R.L.</strong>
        {' '}(Piatra Neamț, România). Contact: <a href="mailto:abroansrl@gmail.com">abroansrl@gmail.com</a>.
      </p>
      <h2 style={h2}>Folosirea aplicației</h2>
      <ul>
        <li>Aplicația este folosită de echipa ABROAN S.R.L. pentru conturile proprii (TikTok, YouTube, Instagram, Facebook).</li>
        <li>Fiecare clip este verificat și aprobat de un om înainte de publicare. Vizibilitatea și setările sunt alese de mână la fiecare postare.</li>
        <li>Publicăm doar conținut pe care îl deținem sau pentru care avem acordul persoanelor filmate.</li>
        <li>Respectăm regulile fiecărei platforme: <a href="https://www.tiktok.com/legal/terms-of-service">Termenii TikTok</a>,
          {' '}<a href="https://www.tiktok.com/community-guidelines">Regulile comunității TikTok</a>,
          {' '}<a href="https://www.youtube.com/t/terms">Termenii YouTube</a> și politicile Meta.</li>
      </ul>
      <h2 style={h2}>Datele</h2>
      <p>Cum folosim datele conturilor conectate: <a href="/confidentialitate">Politica de confidențialitate</a>.</p>
      <h2 style={h2}>Răspundere și modificări</h2>
      <p>
        Aplicația este oferită „ca atare”. Putem modifica acești termeni; versiunea actuală este mereu pe această pagină.
        Se aplică legea română.
      </p>

      <hr style={hr} />

      <h1 id="en" style={h1}>Terms of Service – EVOLIS Studio</h1>
      <p style={muted}>Last updated: 27 November 2026</p>
      <p>
        <strong>EVOLIS Studio</strong> is the video editing and publishing tool of <strong>ABROAN S.R.L.</strong> (Piatra Neamț, Romania).
        It is used by our team to publish to our own TikTok, YouTube, Instagram and Facebook accounts.
        Every video is reviewed and approved by a person before publishing; privacy level and interaction settings are chosen
        manually for each post. We only publish content we own or have consent for, and we follow the
        {' '}<a href="https://www.tiktok.com/legal/terms-of-service">TikTok Terms of Service</a>,
        {' '}<a href="https://www.tiktok.com/community-guidelines">TikTok Community Guidelines</a>,
        {' '}<a href="https://www.youtube.com/t/terms">YouTube Terms of Service</a> and Meta policies.
        Data handling is described in our <a href="/confidentialitate">Privacy Policy</a>. The service is provided “as is”;
        these terms may change and the current version is always on this page. Romanian law applies.
      </p>
      <p style={{ marginTop: 40 }}><a href="/confidentialitate">Politica de confidențialitate / Privacy Policy</a> · <a href="/">andreeaberta.com</a></p>
    </main>
  )
}
