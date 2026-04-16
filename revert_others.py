import os

# index.css
with open('src/index.css', 'r') as f:
    css = f.read()
css = css.replace('#FFFFFF', '#0a0a0a').replace('#1A1A1A', '#e8edf2')
with open('src/index.css', 'w') as f:
    f.write(css)

# GlobalBackground.jsx
with open('src/components/GlobalBackground.jsx', 'r') as f:
    bg = f.read()
bg = bg.replace('zIndex:        -1', 'zIndex:        0')
with open('src/components/GlobalBackground.jsx', 'w') as f:
    f.write(bg)

# theme.js
theme_content = """export const ACCENT   = '#00aaff'
export const BRIGHT   = '#e8edf2'
export const MID      = 'rgba(255,255,255,0.4)'
export const BG       = '#0a0f19'
export const DARK_BG  = 'rgba(0,12,28,0.80)'
"""
with open('src/constant/theme.js', 'w') as f:
    f.write(theme_content)

print("Others reverted.")
