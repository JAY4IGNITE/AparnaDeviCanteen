const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

const filesToConvert = [
  'order-your-food.png',
  'aparnadevi-logo.png'
];

async function convert() {
  for (const file of filesToConvert) {
    const inputPath = path.join(publicDir, file);
    const outputPath = path.join(publicDir, file.replace('.png', '.webp'));
    
    if (fs.existsSync(inputPath)) {
      await sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(outputPath);
      console.log(`Converted ${file} to WebP`);
    } else {
      console.log(`File not found: ${inputPath}`);
    }
  }
}

convert().catch(console.error);
