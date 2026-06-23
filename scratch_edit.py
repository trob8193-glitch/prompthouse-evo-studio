import sys

with open('src/components/EvoCopilot.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = lines[:737] + [
    '                                  {/* Solid Silhouette Base (Dark shape) */}\n',
    '                                  <g mask="url(#bot-silhouette-mask)">\n',
    '                                    <rect x="-50%" y="-50%" width="200%" height="200%" fill="#030303" />\n',
    '                                  </g>\n',
    '\n',
    '                                  {/* Thin Trace as a Solid White Glow */}\n',
    '                                  <g style={{ filter: \'drop-shadow(0 0 3px #ffffff) drop-shadow(0 0 8px #ffffff)\' }} className="mix-blend-screen">\n',
    '                                    <g mask="url(#bot-outline-mask)">\n',
    '                                      <rect x="0" y="0" width="100%" height="100%" fill="#ffffff" opacity="0.9" />\n',
    '                                    </g>\n',
    '                                  </g>\n',
    '\n',
    '                                  {/* Animated Blinking Dual Color Dots overlaid on the trace */}\n',
    '                                  <g style={{ filter: `drop-shadow(0 0 3px ${zapColor1}) drop-shadow(0 0 6px ${zapColor2})` }} className="mix-blend-screen">\n',
    '                                    <g mask="url(#bot-outline-mask)">\n',
    '                                      <rect x="0" y="0" width="100%" height="100%" fill="url(#blinking-dots-pattern)" />\n',
    '                                    </g>\n',
    '                                  </g>\n'
] + lines[790:]

with open('src/components/EvoCopilot.jsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Update complete")
