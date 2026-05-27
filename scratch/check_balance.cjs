const fs = require('fs');
const content = fs.readFileSync('c:/Users/Noname/Documents/Codex/2026-05-03/prompthouse-evo-studio-files-in-my/src/mobile-engine.js', 'utf8');

function checkBalance(text) {
  let stack = [];
  let inString = null;
  let lines = text.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    for (let j = 0; j < line.length; j++) {
      let char = line[j];
      let nextChar = line[j+1];
      
      if (inString) {
        if (char === inString && line[j-1] !== '\\') {
          inString = null;
        }
        continue;
      }
      
      if (char === '"' || char === "'" || char === '`') {
        inString = char;
        continue;
      }
      
      if (char === '{') stack.push({ char, line: i + 1 });
      if (char === '}') {
        if (stack.length === 0) {
          console.log(`Extra } at line ${i + 1}`);
          return;
        }
        stack.pop();
      }
    }
  }
  
  if (stack.length > 0) {
    console.log('Unclosed braces:');
    stack.forEach(s => console.log(`${s.char} at line ${s.line}`));
  } else {
    console.log('Braces are balanced');
  }
}

checkBalance(content);
