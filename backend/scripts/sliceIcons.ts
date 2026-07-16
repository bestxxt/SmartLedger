import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const imagePath = '/Users/terry/.gemini/antigravity-ide/brain/4645a2c4-b0bd-4d13-a043-0b25256003ab/retro_icon_spritesheet_5x5_1784069604298.png';
const outputDir = '/Users/terry/Documents/projects/SmartLedger/frontend/public/icons';

async function slice() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Resize to exactly 1000x1000 to divide by 5 perfectly (200x200 each)
  const image = sharp(imagePath).resize(1000, 1000, { fit: 'fill' });
  
  let count = 1;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const x = col * 200;
      const y = row * 200;
      
      const outPath = path.join(outputDir, `icon_${String(count).padStart(2, '0')}.png`);
      await image.clone().extract({ left: x, top: y, width: 200, height: 200 }).toFile(outPath);
      console.log(`Saved ${outPath}`);
      count++;
    }
  }
}

slice().catch(console.error);
