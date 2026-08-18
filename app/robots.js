export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/client'],
    },
    sitemap: 'https://www.andreeaberta.com/sitemap.xml',
  }
}
