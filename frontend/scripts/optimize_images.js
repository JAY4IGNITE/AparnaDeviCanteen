import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.resolve(__dirname, '../public');
const menuDir = path.join(publicDir, 'menu');

async function optimizeImages() {
  console.log('🚀 Starting image optimization...');

  // 1. Optimize Menu Images
  const menuFiles = fs.readdirSync(menuDir).filter(f => f.endsWith('.png') && !f.includes('-thumb'));
  let originalMenuTotal = 0;
  let optimizedWebpTotal = 0;
  let optimizedPngTotal = 0;

  for (const file of menuFiles) {
    const filePath = path.join(menuDir, file);
    const stat = fs.statSync(filePath);
    originalMenuTotal += stat.size;

    const baseName = path.basename(file, '.png');

    // Create retina card WebP (800x450, 16:9 ratio)
    const webpPath = path.join(menuDir, `${baseName}.webp`);
    await sharp(filePath)
      .resize(800, 450, { fit: 'cover' })
      .webp({ quality: 82, effort: 6 })
      .toFile(webpPath);

    // Create thumbnail WebP (400x225)
    const thumbWebpPath = path.join(menuDir, `${baseName}-thumb.webp`);
    await sharp(filePath)
      .resize(400, 225, { fit: 'cover' })
      .webp({ quality: 80, effort: 6 })
      .toFile(thumbWebpPath);

    // Generate WebP alternatives without overwriting original PNGs to preserve 100% full clarity
    const webpStat = fs.statSync(webpPath);
    optimizedWebpTotal += webpStat.size;

    console.log(`  ✓ ${file}: ${Math.round(stat.size / 1024)} KB -> WebP: ${Math.round(webpStat.size / 1024)} KB`);
  }

  // 2. Favicon (64x64)
  const faviconPath = path.join(publicDir, 'favicon.png');
  if (fs.existsSync(faviconPath)) {
    const stat = fs.statSync(faviconPath);
    await sharp(faviconPath)
      .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toFile(path.join(publicDir, 'favicon-64.png'));
  }

  // 3. Canteen Logo WebP
  const logoPath = path.join(publicDir, 'canteen-logo.png');
  if (fs.existsSync(logoPath)) {
    const logoWebp = path.join(publicDir, 'canteen-logo.webp');
    await sharp(logoPath)
      .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 90 })
      .toFile(logoWebp);
    console.log(`  ✓ canteen-logo.webp generated`);
  }

  // 4. Hero order-your-food image preserved at full 2x clarity (no downscaling)
  console.log(`  ✓ order-your-food.png kept at full clarity`);

  console.log('\n📊 Image Optimization Summary:');
  console.log(`  Original Menu Total: ${Math.round(originalMenuTotal / 1024)} KB (~${(originalMenuTotal / (1024 * 1024)).toFixed(2)} MB)`);
  console.log(`  Optimized WebP Total: ${Math.round(optimizedWebpTotal / 1024)} KB (~${(optimizedWebpTotal / (1024 * 1024)).toFixed(2)} MB)`);
  console.log(`  Optimized PNG Total:  ${Math.round(optimizedPngTotal / 1024)} KB (~${(optimizedPngTotal / (1024 * 1024)).toFixed(2)} MB)`);
  console.log(`  Total Savings:        ${Math.round((1 - (optimizedWebpTotal / originalMenuTotal)) * 100)}% reduction!`);
}

optimizeImages().catch(err => {
  console.error('Error optimizing images:', err);
  process.exit(1);
});
