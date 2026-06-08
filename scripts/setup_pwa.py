import os
import glob
import json

base_path = '/Users/pc/Downloads/arb-farms-ecommerce-main'

# 1. Create manifest.json
manifest = {
  "name": "ARB Farms",
  "short_name": "ARB Farms",
  "description": "Premium organic produce and livestock feed delivered across Pakistan.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2b422a",
  "icons": [
    {
      "src": "/catalog/arbfarms-logo-v2.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ]
}
with open(os.path.join(base_path, 'manifest.json'), 'w') as f:
    json.dump(manifest, f, indent=2)

# 2. Create sw.js (Service Worker)
sw_content = """const CACHE_NAME = 'arbfarms-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/index.css',
  '/js/main.js',
  '/js/products-db.js',
  '/catalog/arbfarms-logo-v2.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
"""
with open(os.path.join(base_path, 'sw.js'), 'w') as f:
    f.write(sw_content)

# 3. Inject into all HTML files
html_files = glob.glob(os.path.join(base_path, '**', '*.html'), recursive=True)

head_injection = """
  <!-- PWA Meta Tags -->
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#2b422a">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <link rel="apple-touch-icon" href="/catalog/arbfarms-logo-v2.svg">
"""

body_injection = """
  <!-- PWA Service Worker Registration -->
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('ServiceWorker registration successful');
        }).catch(err => {
          console.log('ServiceWorker registration failed: ', err);
        });
      });
    }
  </script>
</body>"""

count = 0
for filepath in html_files:
    with open(filepath, 'r') as f:
        content = f.read()

    # Skip if already injected
    if 'rel="manifest"' in content:
        continue

    # Inject in head
    if '</head>' in content:
        content = content.replace('</head>', head_injection + '\n</head>')
    
    # Inject before body
    if '</body>' in content:
        content = content.replace('</body>', body_injection)

    with open(filepath, 'w') as f:
        f.write(content)
    count += 1

print(f"PWA files created. Meta tags and scripts injected into {count} HTML files.")
