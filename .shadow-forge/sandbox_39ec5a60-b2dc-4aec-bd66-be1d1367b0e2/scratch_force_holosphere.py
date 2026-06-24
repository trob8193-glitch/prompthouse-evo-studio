import sys

with open('src/components/EvoCopilot.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Force inject HoloSphere right before the final closing div of the whole EvoCopilot
if '<HoloSphere size={250} />' not in content:
    # We will inject it at the very bottom of the component so it's absolutely positioned over everything
    injection = """
        {/* FORCED OVERLAY HOLOSPHERE */}
        <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center">
          <HoloSphere size={250} />
        </div>
      </div>
    );
}"""
    content = content.replace("      </div>\n    );\n}", injection)

    with open('src/components/EvoCopilot.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Injected HoloSphere at the root level z-[9999] so it CANNOT be missed.")
else:
    print("Already injected.")
