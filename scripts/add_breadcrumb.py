import os
import re

directory = '/Users/pc/Downloads/arb-farms-ecommerce-main'
files = ['shop.html', 'about.html', 'contact.html', 'calculator.html']

def process_file(filename):
    filepath = os.path.join(directory, filename)
    with open(filepath, 'r') as f:
        content = f.read()

    name = filename.replace('.html', '').capitalize()
    
    schema = f"""
  <!-- Breadcrumb Schema -->
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {{
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://arbfarms.com/"
      }},
      {{
        "@type": "ListItem",
        "position": 2,
        "name": "{name}",
        "item": "https://arbfarms.com/{filename.replace('.html', '')}"
      }}
    ]
  }}
  </script>
</head>"""

    if "BreadcrumbList" not in content:
        content = content.replace("</head>", schema)
        with open(filepath, 'w') as f:
            f.write(content)

for f in files:
    if os.path.exists(os.path.join(directory, f)):
        process_file(f)

print("Breadcrumbs added")
