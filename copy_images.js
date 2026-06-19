const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\aryan\\.gemini\\antigravity-ide\\brain\\1cc6fe00-1ae1-4174-8930-c1f6478adf91';
const destDir = 'e:\\Eloris\\Frontend\\public';

const images = {
  'eloris_resort_1781807408508.png': 'eloris_resort.png',
  'eloris_lake_como_1781807431209.png': 'eloris_lake_como.png',
  'eloris_turtleneck_1781807449895.png': 'eloris_turtleneck.png',
  'eloris_earring_1781807469767.png': 'eloris_earring.png'
};

Object.entries(images).forEach(([srcName, destName]) => {
  const srcPath = path.join(srcDir, srcName);
  const destPath = path.join(destDir, destName);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${srcName} to ${destName}`);
  } else {
    console.error(`Source file not found: ${srcPath}`);
  }
});
