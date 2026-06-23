const fs = require('fs');
function generateBranch(x, y, length, angle, depth) {
    if (depth === 0) return '';
    let paths = '';
    const numSegments = Math.floor(Math.random() * 3) + 3;
    let currX = x;
    let currY = y;
    for(let i=0; i<numSegments; i++) {
        angle += (Math.random() - 0.5) * 1.5;
        const dist = length / numSegments;
        currX += Math.cos(angle) * dist;
        currY += Math.sin(angle) * dist;
        paths += `L ${currX.toFixed(1)} ${currY.toFixed(1)} `;
        if (Math.random() > 0.3 && depth > 1) {
            let branchPaths = generateBranch(currX, currY, length * 0.7, angle + (Math.random() > 0.5 ? 1 : -1) * 0.8, depth - 1);
            if (branchPaths) {
                paths += branchPaths;
                paths += `M ${currX.toFixed(1)} ${currY.toFixed(1)} `;
            }
        }
    }
    return paths;
}

let result = '';
const colors = ['{zapColor1}', '{zapColor2}', '#ffffff'];
const widths = [0.4, 0.6, 0.8, 1.0, 1.2, 1.5];
for(let i=0; i<16; i++) {
  let sx, sy, angle;
  if (Math.random() > 0.5) {
      sx = Math.random() > 0.5 ? 0 : 100;
      sy = Math.random() * 100;
      angle = sx === 0 ? 0 : Math.PI;
  } else {
      sx = Math.random() * 100;
      sy = Math.random() > 0.5 ? 0 : 100;
      angle = sy === 0 ? Math.PI/2 : -Math.PI/2;
  }
  let d = `M ${sx.toFixed(1)} ${sy.toFixed(1)} ` + generateBranch(sx, sy, 80 + Math.random()*50, angle, 4);
  let color = colors[Math.floor(Math.random()*colors.length)];
  let width = widths[Math.floor(Math.random()*widths.length)];
  let delay = (Math.random() * 1.5).toFixed(2);
  let dur = (0.3 + Math.random()*0.8).toFixed(2);
  result += `                                        <path d="${d.trim()}" stroke="${color}" strokeWidth="${width}" fill="none" className="animate-lightning" style={{ animationDelay: '${delay}s', animationDuration: '${dur}s' }} />\n`;
}
fs.writeFileSync('C:/Users/Noname/.gemini/antigravity-ide/brain/b61cbce7-e448-4541-8758-9f346cc57736/scratch/paths.txt', result);
