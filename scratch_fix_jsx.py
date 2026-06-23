import sys

with open('src/components/EvoCopilot.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

bad_jsx = """{currentBot.id === 'sovereignty' && (
                                  {/* Electric Static Thin Stripes (Moved here to fix parallax) */}
                                  <g mask="url(#bot-outline-mask)">
                                    <rect x="-50%" y="-50%" width="200%" height="200%" fill="url(#tiger-dual-glow)" filter="url(#electric-static-glow)" />
                                  </g>
                                )}"""

good_jsx = """{currentBot.id === 'sovereignty' && (
                                  <g mask="url(#bot-outline-mask)">
                                    {/* Electric Static Thin Stripes (Moved here to fix parallax) */}
                                    <rect x="-50%" y="-50%" width="200%" height="200%" fill="url(#tiger-dual-glow)" filter="url(#electric-static-glow)" />
                                  </g>
                                )}"""

content = content.replace(bad_jsx, good_jsx)

with open('src/components/EvoCopilot.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed JSX parse error by moving comment inside the <g> element.")
