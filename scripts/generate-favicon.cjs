/* eslint-disable no-console */

const fs = require('fs/promises');
const path = require('path');
const Jimp = require('jimp');
const pngToIco = require('png-to-ico');

async function main() {
  const root = path.resolve(__dirname, '..');
  const inputPng = path.join(root, 'public', 'logofavicon.png');

  const out16 = path.join(root, 'public', 'favicon-16x16.png');
  const out32 = path.join(root, 'public', 'favicon-32x32.png');
  const outApple = path.join(root, 'public', 'apple-touch-icon.png');
  const outIco = path.join(root, 'public', 'favicon.ico');
  const outManifest = path.join(root, 'public', 'site.webmanifest');

  const base = await Jimp.read(inputPng);

  await base.clone().resize(16, 16).writeAsync(out16);
  await base.clone().resize(32, 32).writeAsync(out32);
  await base.clone().resize(180, 180).writeAsync(outApple);

  const buf16 = await fs.readFile(out16);
  const buf32 = await fs.readFile(out32);
  const ico = await pngToIco([buf16, buf32]);
  await fs.writeFile(outIco, ico);

  const manifest = {
    name: 'Logistics Pro',
    short_name: 'Logistics',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    theme_color: '#0F2940',
    background_color: '#ffffff',
    display: 'standalone',
  };

  // Optional Android icons (favicon.io style)
  const out192 = path.join(root, 'public', 'android-chrome-192x192.png');
  const out512 = path.join(root, 'public', 'android-chrome-512x512.png');
  await base.clone().resize(192, 192).writeAsync(out192);
  await base.clone().resize(512, 512).writeAsync(out512);

  await fs.writeFile(outManifest, JSON.stringify(manifest, null, 2));

  console.log('Favicon assets generated in /public');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
