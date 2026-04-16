import os
import glob

# Mappings from New to Old
replacements = {
    '#2A6899': '#00aaff',
    '#C03020': '#ff3366',
    '#F2A89C': '#05070a',
    '#B8B89A': 'rgba(0,170,255,0.3)',
    '#FFFFFF': '#0a0a0a',
    '#1A1A1A': '#e8edf2',
    'rgba(42,104,153': 'rgba(0,170,255',
    'rgba(192,48,32': 'rgba(255,51,102',
    'rgba(26,26,26': 'rgba(255,255,255',
    'a02518': 'cc0044', # darker brick
    'boxShadow: `0 4px 15px rgba(255,51,102,0.2)`': 'boxShadow: `0 0 30px rgba(0,170,255,0.4)`',
    "filter: 'invert(1) hue-rotate(180deg)'": "filter: 'none'",
}

files = [
    'src/components/WorksSection.jsx',
    'src/components/WorksPage.jsx',
    'src/components/TextRevealSection.jsx',
    'src/components/HeroScene.jsx',
    'src/components/ProjectDetails.jsx',
    'src/components/TreeSection.jsx',
    'src/components/ContactSection.jsx',
    'src/components/TokyoHero.jsx'
]

for filepath in files:
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            content = f.read()
        
        for new_col, old_col in replacements.items():
            content = content.replace(new_col, old_col)
            
        with open(filepath, 'w') as f:
            f.write(content)

print("Done reverting colors.")
