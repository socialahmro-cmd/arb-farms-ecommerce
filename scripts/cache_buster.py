import os
import glob

def bust_cache():
    # Directory setup
    base_dir = '/Users/pc/Downloads/arb-farms-ecommerce-main'
    catalog_dir = os.path.join(base_dir, 'catalog')
    
    # Get all files in catalog
    catalog_files = [f for f in os.listdir(catalog_dir) if os.path.isfile(os.path.join(catalog_dir, f))]
    
    renames = {}
    
    print(f"Scanning {len(catalog_files)} files in catalog directory...")
    
    for filename in catalog_files:
        name, ext = os.path.splitext(filename)
        # Skip files that are already versioned or system files
        if name.endswith('-v2') or filename.startswith('.') or ext not in ['.svg', '.png', '.jpg', '.jpeg', '.webp']:
            continue
            
        new_name = f"{name}-v2{ext}"
        old_path = os.path.join(catalog_dir, filename)
        new_path = os.path.join(catalog_dir, new_name)
        
        # Rename physical file
        os.rename(old_path, new_path)
        renames[filename] = new_name
        print(f"Renamed: {filename} -> {new_name}")

    if not renames:
        print("No files needed renaming.")
        return

    print(f"Total renamed files: {len(renames)}. Now searching codebase...")

    # Search and replace in all .html and .js files
    files_to_check = []
    
    # Recursively find all html and js files
    for root, _, files in os.walk(base_dir):
        # Skip node_modules or .git if they exist
        if '.git' in root or 'node_modules' in root:
            continue
            
        for file in files:
            if file.endswith('.html') or file.endswith('.js'):
                files_to_check.append(os.path.join(root, file))

    updated_files_count = 0

    for file_path in files_to_check:
        # Don't modify this script itself
        if 'cache_buster.py' in file_path:
            continue
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            original_content = content
            for old_name, new_name in renames.items():
                # Simple string replacement for the filename
                content = content.replace(old_name, new_name)
                
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                updated_files_count += 1
                print(f"Updated references in: {os.path.relpath(file_path, base_dir)}")
                
        except Exception as e:
            print(f"Error processing {file_path}: {e}")

    print(f"Done! Updated references in {updated_files_count} files.")

if __name__ == '__main__':
    bust_cache()
