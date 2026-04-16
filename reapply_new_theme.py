import os

# Mappings from Old back to New
replacements = {
    '#00aaff': '#2A6899', # STEEL
    '#ff3366': '#C03020', # BRICK
    '#05070a': '#F2A89C', # SALMON
    'rgba(0,170,255,0.3)': '#B8B89A', # KHAKI
    '#0a0a0a': '#FFFFFF', # WHITE bg
    '#e8edf2': '#1A1A1A', # CHARCOAL
    'rgba(0,170,255': 'rgba(42,104,153', # STEEL rgba
    'rgba(255,51,102': 'rgba(192,48,32', # BRICK rgba
    'rgba(255,255,255': 'rgba(26,26,26', # CHARCOAL rgba
    'cc0044': 'a02518', # darker brick
    'boxShadow: `0 0 30px rgba(0,170,255,0.4)`': 'boxShadow: `0 4px 15px rgba(192,48,32,0.2)`',
    "filter: 'none'": "filter: 'invert(1) hue-rotate(180deg)'",
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
        
        for old_col, new_col in replacements.items():
            content = content.replace(old_col, new_col)
            
        with open(filepath, 'w') as f:
            f.write(content)

print("Restored original flat colors to components.")
