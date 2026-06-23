import sys

with open('src/components/EvoCopilot.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_glow_group = """                                  {/* Electric Static Dual Glow Stripes */}
                                  <g mask="url(#bot-silhouette-mask)">
                                    <g style={{ filter: `drop-shadow(0 0 6px ${zapColor1}) drop-shadow(0 0 12px ${zapColor2}) drop-shadow(0 0 20px ${zapColor1}) drop-shadow(0 0 30px ${zapColor2})` }} className="mix-blend-screen">
                                      <g mask="url(#bot-outline-mask)">
                                        <rect x="0" y="0" width="100%" height="100%" fill="url(#tiger-dual-glow)" filter="url(#electric-static-glow)" />
                                      </g>
                                    </g>
                                  </g>"""

new_glow_group = """                                  {/* Electric Static Solid Core */}
                                  <g mask="url(#bot-silhouette-mask)">
                                    {/* The electric static fills the entire silhouette, acting as a solid energy core */}
                                    <rect x="0" y="0" width="100%" height="100%" fill="url(#tiger-dual-glow)" filter="url(#electric-static-glow)" />
                                  </g>"""

content = content.replace(old_glow_group, new_glow_group)

with open('src/components/EvoCopilot.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Electric static core made solid.")
