import fs from 'fs';
import path from 'path';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.tsx') || file.endsWith('.css')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('src');
let fixedCount = 0;

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let original = content;
    
    // Hard replaces
    content = content.replace(/bg-gradient-to-/g, 'bg-linear-to-');
    content = content.replace(/z-\[9999\]/g, 'z-9999');
    content = content.replace(/rounded-\[2rem\]/g, 'rounded-4xl');
    content = content.replace(/blur-\[4px\]/g, 'blur-xs');
    content = content.replace(/w-\[1px\]/g, 'w-px');
    content = content.replace(/h-\[1px\]/g, 'h-px');
    content = content.replace(/-left-\[2\.5px\]/g, 'left-[-2.5px]');
    content = content.replace(/from-\[#000\]/g, 'from-black');
    content = content.replace(/bg-\[#000\]/g, 'bg-black');
    content = content.replace(/border-\[8px\]/g, 'border-8');
    content = content.replace(/flex-\[2\]/g, 'flex-2');
    
    // CSS-specific variables that Tailwind v4 parses differently
    content = content.replace(/bg-\[length:100%_4px,3px_100%\]/g, 'bg-size-[100%_4px,3px_100%]');
    content = content.replace(/bg-\[radial-gradient\(ellipse_at_center,_var\(--tw-gradient-stops\)\)\]/g, 'bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))]');
    content = content.replace(/bg-\[radial-gradient\(circle_at_top_right,_#111,_#000\)\]/g, 'bg-[radial-gradient(circle_at_top_right,#111,#000)]');

    if (content !== original) {
        fs.writeFileSync(f, content);
        fixedCount++;
    }
});

console.log(`Fixed Tailwind v4 syntax in ${fixedCount} files.`);
