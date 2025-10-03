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

async function run() {
  const exists = await ensureFile(INPUT_PATH);
  if (!exists) {
    console.error('Input image not found:', INPUT_PATH);
    process.exit(1);
  }

  const baseName = path.parse(INPUT_NAME).name;

  const sizes = [320, 640, 1280];

  const outputs = [
    // original (skip overwrite)
    { suffix: '', width: null, format: 'jpeg' },
    // @2x original
    { suffix: '@2x', width: null, format: 'jpeg', scale: 2 },
    // widths (1x)
    ...sizes.map(s => ({ suffix: `-${s}w`, width: s, format: 'jpeg' })),
    // widths (2x)
    ...sizes.map(s => ({ suffix: `-${s}w@2x`, width: s * 2, format: 'jpeg' })),
    // webp variants
    { suffix: '', width: null, format: 'webp' },
    { suffix: '@2x', width: null, format: 'webp', scale: 2 },
    ...sizes.map(s => ({ suffix: `-${s}w`, width: s, format: 'webp' })),
    ...sizes.map(s => ({ suffix: `-${s}w@2x`, width: s * 2, format: 'webp' })),
  ];

  let metadata;
  try {
    metadata = await sharp(INPUT_PATH).metadata();
  } catch (err) {
    console.error('Failed to read image metadata. The file exists but is not a valid image or is in an unsupported format:', INPUT_PATH);
    console.error('Please replace it with a real JPEG/PNG image named', INPUT_NAME, 'in', INPUT_DIR);
    // rethrow to allow non-zero exit in catch below
    throw err;
  }
  const width = metadata.width || null;

  for (const out of outputs) {
    const outName = `${baseName}${out.suffix}.${out.format}`;
    const outPath = path.join(OUTPUT_DIR, outName);
    // avoid writing the same file that's used as input
    if (path.resolve(outPath) === path.resolve(INPUT_PATH)) {
      console.log('Skipping output (would overwrite input):', outPath);
      continue;
    }
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

run().catch(err => {
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});
