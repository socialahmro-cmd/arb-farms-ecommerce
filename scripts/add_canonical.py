import os
import re

directory = '/Users/pc/Downloads/arb-farms-ecommerce-main'
files_to_process = [f for f in os.listdir(directory) if f.endswith('.html')]

base_url = "https://arbfarms.com"

def process_file(filepath, filename):
    with open(filepath, 'r') as f:
        content = f.read()

    # Determine canonical path
    if filename == 'index.html':
        path = "/"
    else:
        path = f"/{filename.replace('.html', '')}"

    canonical_tag = f'\n  <link rel="canonical" href="{base_url}{path}">\n</head>'
    
    if '<link rel="canonical"' not in content:
        content = content.replace('</head>', canonical_tag)
        with open(filepath, 'w') as f:
            f.write(content)

for f in files_to_process:
    process_file(os.path.join(directory, f), f)

print("Done Canonical")
