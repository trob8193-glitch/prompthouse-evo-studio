import sys
import re

with open('src/components/EvoCopilot.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to replace the feFuncA inside evo-hollow
old_func = '<feFuncA type="linear" slope="50" intercept="-5" />'
new_func = '<feFuncA type="linear" slope="10" intercept="-4" />'

# Let's find exactly where it is inside evo-hollow.
# We can use a regex to safely replace it only inside evo-hollow
pattern = r'(<filter id={`evo-hollow-\${currentBot\.name\.replace\(/\[\^a-zA-Z0-9\]/g, \'\'\)}`}>.*?<feComponentTransfer in="lum" result="hollowMask">\s*)<feFuncA type="linear" slope="50" intercept="-5" />'
replacement = r'\g<1><feFuncA type="linear" slope="10" intercept="-4" />'

new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('src/components/EvoCopilot.jsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("evo-hollow filter threshold updated to 40% to keep dark fur opaque.")
