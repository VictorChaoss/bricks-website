import os
import re

def check_assets():
    # 1. Read script.js sets manually (parsing the array string)
    with open('script.js', 'r') as f:
        content = f.read()
        
    match = re.search(r'const sets = \[(.*?)\];', content, re.DOTALL)
    if not match:
        print("Could not find sets array in script.js")
        return

    # Clean and parse the JS array items
    js_raw = match.group(1)
    # Remove quotes and whitespace, split by comma
    js_sets = [x.strip().strip('"').strip("'") for x in js_raw.split(',') if x.strip()]
    
    print(f"Found {len(js_sets)} sets in script.js")

    # 2. List files in assets/sets
    files = os.listdir('assets/sets')
    # Use a set for case-insensitive lookup if needed, but we want exact matches for Vercel
    files_set = set(files)
    
    print(f"Found {len(files)} files in assets/sets")

    # 3. Validation
    print("\n--- Checking JS items against Disk (Case Sensitive) ---")
    for s in js_sets:
        if s not in files_set:
            print(f"[MISSING ON DISK] {s}")
        else:
            # Check for back/side
            base = os.path.splitext(s)[0]
            back = f"{base}_back.png"
            side = f"{base}_side.png"
            
            missing_views = []
            if back not in files_set: missing_views.append("Back")
            if side not in files_set: missing_views.append("Side")
            
            if missing_views:
                print(f"[NO EXTRA VIEWS] {s} (Missing: {', '.join(missing_views)})")

    print("\n--- Checking Disk items against JS ---")
    # Identify potential main images (jpg/png/jpeg) that are NOT back/side and NOT in JS
    for f in files:
        if '_back' in f or '_side' in f: continue
        if f.lower().endswith(('.jpg', '.png', '.jpeg')):
            if f not in js_sets:
                print(f"[MISSING IN JS] {f}")

if __name__ == "__main__":
    check_assets()
