const fs = require('fs');
const files = fs.readdirSync('./src/features').filter(f => f.endsWith('.js'));
files.forEach(f => {
  if (fs.readFileSync('./src/features/' + f).length < 500) fs.unlinkSync('./src/features/' + f);
});