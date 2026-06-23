import sys
import re

with open('src/components/EvoCopilot.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Import HoloSphere at the top
if 'import HoloSphere from "./HoloSphere";' not in content:
    content = content.replace("import React,", "import HoloSphere from \"./HoloSphere\";\nimport React,")

# 2. Find the bot avatar rendering block
# In EvoCopilot.jsx, the avatar is rendered inside:
# {/* MAIN BOT VISUAL CONTAINER */}
# <div className="absolute inset-0 z-10 flex items-center justify-center">

pattern_avatar_container = r"(\{\/\* MAIN BOT VISUAL CONTAINER \*\/\}\s*<div className=\"absolute inset-0 z-10 flex items-center justify-center\">\s*)\{\/\* BASE PERFECT HOLLOWED SHELL \*\/\}"

# We need to render the HoloSphere if it's omni, otherwise render the normal bot shell (the tiger)
replacement = r"""\1{currentBot.id === 'omni' ? (
                                    <HoloSphere size={160} />
                                  ) : (
                                    <React.Fragment>
                                      {/* BASE PERFECT HOLLOWED SHELL */}"""

content = re.sub(pattern_avatar_container, replacement, content)

# We also need to close the React.Fragment after the image rendering.
# The image rendering ends with:
#                                       />
#                                     </svg>
#                                   )}

pattern_close = r"(\s*/>\s*</svg>\s*)\)\}"
content = re.sub(pattern_close, r"\1\n                                    </React.Fragment>\n                                  )}", content)

with open('src/components/EvoCopilot.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated EvoCopilot.jsx to use HoloSphere for the Omni bot.")
