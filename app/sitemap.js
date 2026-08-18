export default function sitemap() {
  const base = 'https://www.andreeaberta.com'
  const now = new Date()
  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/programare`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/roata-libera`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ]
}
