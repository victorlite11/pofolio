const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Config
const INPUT_DIR = path.join(__dirname, '..', 'public', 'lovable-uploads');
const INPUT_NAME = 'victorlight.jpeg';
const INPUT_PATH = path.join(INPUT_DIR, INPUT_NAME);

const OUTPUT_DIR = INPUT_DIR; // write next to original

async function ensureFile(p) {
  return fs.promises.access(p, fs.constants.R_OK).then(() => true).catch(() => false);
}

async function process() {
  const exists = await ensureFile(INPUT_PATH);
  if (!exists) {
    console.error('Input image not found:', INPUT_PATH);
    process.exit(1);
  }

  const baseName = path.parse(INPUT_NAME).name;

  const outputs = [
    { suffix: '', width: null, format: 'jpeg' },
    { suffix: '@2x', width: null, format: 'jpeg', scale: 2 },
    { suffix: '', width: null, format: 'webp' },
    { suffix: '@2x', width: null, format: 'webp', scale: 2 },
  ];

  const metadata = await sharp(INPUT_PATH).metadata();
  const width = metadata.width || null;

  for (const out of outputs) {
    const outName = `${baseName}${out.suffix}.${out.format}`;
    const outPath = path.join(OUTPUT_DIR, outName);
    let pipeline = sharp(INPUT_PATH);
    if (out.scale) {
      if (!width) {
        console.warn('Original width unknown, skipping scale');
      } else {
        pipeline = pipeline.resize(Math.round(width * out.scale));
      }
    }
    if (out.format === 'webp') {
      pipeline = pipeline.webp({ quality: 80 });
    } else if (out.format === 'jpeg') {
      pipeline = pipeline.jpeg({ quality: 85 });
    }

    await pipeline.toFile(outPath);
    console.log('Written', outPath);
  }
}

process().catch(err => {
  console.error(err);
  process.exit(1);
});
