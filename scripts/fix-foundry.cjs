const fs = require('fs');

let content = fs.readFileSync('src/features/FeatureFoundryView.jsx', 'utf8');

const firstReturnIdx = content.indexOf('  return (');
const secondReturnIdx = content.indexOf('  return (', firstReturnIdx + 1);

if (firstReturnIdx > -1 && secondReturnIdx > -1) {
  const head = content.substring(0, firstReturnIdx);
  const tail = content.substring(secondReturnIdx);
  
  const endOfBuild = `        // In Phase D, this would trigger the actual code generation
      }
    } catch (e) {
      console.error('Build initiation error:', e);
    }
  }, []);\n\n`;
  
  fs.writeFileSync('src/features/FeatureFoundryView.jsx', head + endOfBuild + tail);
  console.log('Fixed file via script');
} else {
  console.log('Could not find duplicate returns.');
}
