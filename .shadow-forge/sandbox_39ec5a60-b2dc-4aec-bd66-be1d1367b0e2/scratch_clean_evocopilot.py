import sys

with open('src/components/EvoCopilot.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Clean up the forced injection
injection = """
        {/* FORCED OVERLAY HOLOSPHERE */}
        <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center">
          <HoloSphere size={250} />
        </div>
      </div>
    );
}"""

content = content.replace(injection, "      </div>\n    );\n}")

# Also let's clean up the internal HoloSphere in EvoCopilot since they wanted the main bot to be the sphere
# Wait, actually I'll just leave it for omni and revert the sovereignty check
content = content.replace("currentBot.id === 'sovereignty' ?", "currentBot.id === 'omni' ?")

with open('src/components/EvoCopilot.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
