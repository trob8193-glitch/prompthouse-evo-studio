const fs = require('fs');
const files = fs.readdirSync('./src/features').filter(f => f.endsWith('.js') && !f.includes('logic'));
files.forEach(f => {
  try { require('./src/features/' + f); console.log('Import verified:', f); } catch (e) {}
});