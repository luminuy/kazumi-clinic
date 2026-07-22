import glob
import re
import sys

replacements = {
    # Backgrounds
    "bg-cream": "bg-[var(--store-surface)]",
    "bg-sand": "bg-[var(--background)]",
    "bg-olive/": "bg-[var(--store-control)]/",
    "bg-olive-deep/": "bg-[var(--store-surface)]/",
    "bg-olive-deep": "bg-[var(--store-ink)]",
    "bg-clay": "bg-[var(--store-control)]",
    
    # Text
    "text-olive-deep": "text-[var(--store-ink)]",
    "text-ink/": "text-[var(--store-muted)]/",
    "text-olive/": "text-[var(--store-muted)]/",
    "text-olive-light": "text-[var(--store-muted)]",
    
    # Borders
    "border-olive/": "border-black/",
    "border-olive-deep/": "border-[var(--store-ink)]/",
    "border-olive-deep": "border-[var(--store-ink)]",
    
    # Hovers
    "hover:border-olive-deep": "hover:border-[var(--store-ink)]",
    "hover:bg-olive-deep/": "hover:bg-[var(--store-ink)]/",
    "hover:text-forest": "hover:opacity-60",
    "hover:bg-sand": "hover:bg-black/5"
}

files = glob.glob("components/*-service-page.tsx")

for file_path in files:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    original_content = content
    
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    content = re.sub(r'text-\[var\(--store-muted\)\\]/\d+', 'text-[var(--store-muted)]', content)
    content = re.sub(r'border-black/\d+', 'border-black/[0.08]', content)
    content = re.sub(r'bg-\[var\(--store-surface\)\\]/\d+', 'bg-[var(--store-surface)]', content)
    content = re.sub(r'bg-\[var\(--store-control\)\\]/\d+', 'bg-[var(--store-control)]', content)
    
    content = content.replace('rounded-[2rem]', 'rounded-[1.75rem]')
    content = content.replace('rounded-[2.5rem]', 'rounded-[1.75rem]')
    content = content.replace('rounded-[3rem]', 'rounded-[1.75rem]')
    
    if content != original_content:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {file_path}")
    else:
        print(f"No changes for {file_path}")

print("Done.")
