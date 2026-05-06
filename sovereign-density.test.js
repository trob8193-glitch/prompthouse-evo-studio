test('Sovereign Density Compliance', () => {
    const fs = require('fs');
    const files = fs.readdirSync('./src/features').filter(f => f.endsWith('.js'));
    files.forEach(f => {
      const content = fs.readFileSync(`./src/features/${f}`, 'utf8');
      expect(content.split('\n').length).toBeGreaterThan(60);
    });
  });