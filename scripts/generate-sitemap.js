const fs = require('fs');
const path = require('path');

// Static routes from the app
const staticRoutes = [
  '',
  '/home',
  '/list',
  '/free-listings',
  '/search',
  '/messages',
  '/saved',
  '/buying-process',
  '/legal-guide',
  '/resources',
  '/knowledge-base',
  '/costa-rica-laws',
  '/title-types',
  '/due-diligence',
  '/blog',
  '/explore',
  '/auth',
  '/login',
  '/signup',
  '/profile',
  '/user-dashboard',
  '/realtor-dashboard',
  '/admin-dashboard'
];

// Town pages
const townRoutes = [
  '/tamarindo',
  '/nosara',
  '/flamingo',
  '/playa-grande',
  '/samara'
];

// Knowledge base towns (municipal)
const kbTownRoutes = [
  '/town-avellanas-junquillal-negra',
  '/town-brasilito-conchal',
  '/town-coco-ocotal',
  '/town-flamingo-potrero',
  '/town-liberia',
  '/town-marbella-san-juanillo-ostional',
  '/town-nosara',
  '/town-papagayo',
  '/town-playa-grande',
  '/town-profiles',
  '/town-samara',
  '/town-tamarindo'
];

// Generate sitemap XML
function generateSitemap() {
  const baseUrl = 'https://guanacastereal.com';
  const currentDate = new Date().toISOString().split('T')[0];

  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  sitemap += '         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
  sitemap += '         xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n';
  sitemap += '         http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n\n';

  // Add static routes
  [...staticRoutes, ...townRoutes, ...kbTownRoutes].forEach(route => {
    const priority = route === '' ? '1.0' : route.startsWith('/town-') ? '0.6' : '0.8';
    const changefreq = route === '' ? 'daily' : 'weekly';

    sitemap += '  <url>\n';
    sitemap += `    <loc>${baseUrl}${route}</loc>\n`;
    sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
    sitemap += `    <changefreq>${changefreq}</changefreq>\n`;
    sitemap += `    <priority>${priority}</priority>\n`;
    sitemap += '  </url>\n\n';
  });

  // Note: In a real implementation, you would fetch properties from your database
  // and add them dynamically. For now, we'll add some example property URLs
  const exampleProperties = [
    { id: 1, lastmod: '2024-10-08' },
    { id: 2, lastmod: '2024-10-07' },
    { id: 3, lastmod: '2024-10-06' }
  ];

  exampleProperties.forEach(property => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${baseUrl}/property/${property.id}</loc>\n`;
    sitemap += `    <lastmod>${property.lastmod}</lastmod>\n`;
    sitemap += '    <changefreq>weekly</changefreq>\n';
    sitemap += '    <priority>0.7</priority>\n';
    sitemap += '  </url>\n\n';
  });

  sitemap += '</urlset>';

  return sitemap;
}

// Write sitemap to public directory
const sitemapContent = generateSitemap();
const outputPath = path.join(__dirname, '..', 'apps', 'web', 'public', 'sitemap.xml');

fs.writeFileSync(outputPath, sitemapContent, 'utf8');
console.log('Sitemap generated successfully at:', outputPath);

// Also generate a simple sitemap index if needed
const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://guanacastereal.com/sitemap.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
</sitemapindex>`;

const indexPath = path.join(__dirname, '..', 'apps', 'web', 'public', 'sitemap-index.xml');
fs.writeFileSync(indexPath, sitemapIndex, 'utf8');
console.log('Sitemap index generated successfully at:', indexPath);