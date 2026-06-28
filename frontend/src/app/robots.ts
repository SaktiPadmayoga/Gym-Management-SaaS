import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/auth/', '/tenant-auth/'],
    },
    sitemap: 'https://gymfit.id/sitemap.xml',
  }
}
