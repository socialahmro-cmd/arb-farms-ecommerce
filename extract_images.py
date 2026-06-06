import re
import base64
import os

files = ['White Chaunsa.svg', 'Sindhri Mango.svg', 'Dusehri Mango.svg', 'Anwar Ratol.svg']
for file in files:
    path = f"/Users/pc/Downloads/arb-farms-ecommerce-main/catalog/{file}"
    if not os.path.exists(path): continue
    with open(path, 'r') as f:
        content = f.read()
    
    match = re.search(r'data:image/(jpeg|png);base64,([^"]+)', content)
    if match:
        ext = match.group(1)
        img_data = base64.b64decode(match.group(2))
        out_name = f"/Users/pc/Downloads/arb-farms-ecommerce-main/catalog/{file.replace('.svg', '.jpg')}"
        with open(out_name, 'wb') as out_f:
            out_f.write(img_data)
        print(f"Saved {out_name}")

