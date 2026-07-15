import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mngesports.my.id'; // Sesuaikan dengan domain aslimu nanti

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/absen/', '/riwayat/'], // Hide internal/auth-only routes
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
