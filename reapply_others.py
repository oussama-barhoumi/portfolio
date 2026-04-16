import os

# index.css
with open('src/index.css', 'r') as f:
    css = f.read()
css = css.replace('#0a0a0a', '#FFFFFF').replace('#e8edf2', '#1A1A1A')
with open('src/index.css', 'w') as f:
    f.write(css)

# GlobalBackground.jsx
with open('src/components/GlobalBackground.jsx', 'r') as f:
    bg = f.read()
bg = bg.replace('zIndex:        0', 'zIndex:        -1')
with open('src/components/GlobalBackground.jsx', 'w') as f:
    f.write(bg)

# theme.js
theme_content = """// ─── New Palette ──────────────────────────────────────────────────────────────
export const SALMON   = '#F2A89C'   // hero bg, warm sections
export const STEEL    = '#2A6899'   // navbar, buttons, dominant brand
export const BRICK    = '#C03020'   // CTAs, badges — use sparingly
export const KHAKI    = '#B8B89A'   // footer, dividers, secondary sections
export const WHITE    = '#FFFFFF'
export const CHARCOAL = '#1A1A1A'   // all body text

// ─── Legacy aliases (keep 3-D scenes working) ─────────────────────────────────
export const ACCENT   = STEEL
export const BRIGHT   = '#4a9ec9'   // lighter steel for 3-D glows
export const MID      = '#1d4d73'
export const BG       = '#05070a'
export const DARK_BG  = 'rgba(0,12,28,0.80)'
"""
with open('src/constant/theme.js', 'w') as f:
    f.write(theme_content)

print("Restored theme.js, index.css, and GlobalBackground.jsx.")
