import fs from 'node:fs';

const path = 'src/features/EvoEyesView.jsx';
let content = fs.readFileSync(path, 'utf8');

const targetStr = 'export function EvoEyesView() {';
const firstIdx = content.indexOf(targetStr);
if (firstIdx !== -1) {
  const secondIdx = content.indexOf(targetStr, firstIdx + targetStr.length);
  if (secondIdx !== -1) {
    content = content.slice(0, secondIdx) + content.slice(secondIdx + targetStr.length);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Successfully removed duplicate function header from EvoEyesView.jsx!');
  } else {
    console.error('Second occurrence of function header not found!');
  }
} else {
  console.error('First occurrence of function header not found!');
}
