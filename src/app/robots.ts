import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mngesports.my.id'; // Sesuaikan dengan domain aslimu nanti

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'], // Kamu bisa tambahkan route rahasia yang tidak mau diindeks bot Google di sini
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
