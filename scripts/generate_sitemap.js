const fs = require('fs');
const path = require('path');

const basePath = '/Users/pc/Downloads/arb-farms-ecommerce-main';

// 1. Core pages
const corePages = [
  '',
  'shop',
  'about',
  'compare',
  'calculator',
  'contact',
  'delivery'
];

// 2. Read products
const productsJs = fs.readFileSync(path.join(basePath, 'js', 'products-db.js'), 'utf8');
// remove "const productsDb = " and trailing semicolon
const productsArrayStr = productsJs.replace(/const\s+productsDb\s*=\s*/, '').replace(/;$/, '');
let productsDb;
try {
  productsDb = eval('(' + productsArrayStr + ')');
} catch(e) {
  console.log("Error parsing products-db", e);
  process.exit(1);
}

// 3. Read cities
const citiesJs = fs.readFileSync(path.join(basePath, 'js', 'cities-db.js'), 'utf8');
const citiesArrayStr = citiesJs.replace(/const\s+deliveryCities\s*=\s*/, '').replace(/;$/, '');
let deliveryCities;
try {
  deliveryCities = eval('(' + citiesArrayStr + ')');
} catch(e) {
  console.log("Error parsing cities-db", e);
  process.exit(1);
}

// Generate XML
let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

const today = new Date().toISOString().split('T')[0];

// Core pages
xml += `  <!-- Core Pages -->\n`;
corePages.forEach(page => {
  const urlPath = page === '' ? '' : `/${page}`;
  const priority = page === '' ? '1.0' : '0.8';
  xml += `  <url>\n    <loc>https://arbfarms.com${urlPath}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
});

// Product pages
xml += `\n  <!-- Product Pages -->\n`;
productsDb.forEach(p => {
  xml += `  <url>\n    <loc>https://arbfarms.com/product/${p.id}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
});

// City pages
xml += `\n  <!-- Programmatic City Landing Pages -->\n`;
deliveryCities.forEach(c => {
  xml += `  <url>\n    <loc>https://arbfarms.com/delivery/${c.id}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
});

xml += `</urlset>`;

fs.writeFileSync(path.join(basePath, 'sitemap.xml'), xml);
console.log("sitemap.xml successfully generated.");
