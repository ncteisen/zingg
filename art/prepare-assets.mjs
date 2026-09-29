// Packaging only: preserve approved art and alpha; create web-sized delivery copies.
// Run with Sharp available through NODE_PATH or the local dependency environment.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {log} from 'node:console';
const sharp = createRequire(import.meta.url)('sharp');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const approved = [
  ['mind-meld-v3.png', 'mind-meld'],
  ['compliment-sandwich-v3.png', 'compliment-sandwich'],
  ['viking-master-v3-clean.png', 'viking-master'],
  ['elephant-in-the-room-v3.png', 'elephant-in-the-room'],
];
(async () => {
  const sources = approved.map(([file, slug]) => [path.join(root, 'art/pilots', file), slug]);
  for (const file of await fs.readdir(path.join(root, 'art/deck'))) {
    if (file.endsWith('.png')) sources.push([path.join(root, 'art/deck', file), file.slice(0,-4)]);
  }
  let total = 0;
  for (const [source, slug] of sources) {
    const output = path.join(root, 'src/assets/deck', slug + '.webp');
    const stat = await fs.stat(output).catch(() => null);
    if (stat && stat.mtimeMs >= (await fs.stat(source)).mtimeMs) { total += stat.size; continue; }
    const info = await sharp(source).resize({width:640,withoutEnlargement:true}).webp({quality:86,alphaQuality:100,effort:6}).toFile(output);
    total += info.size;
    log(slug + ': ' + Math.round(info.size/1024) + ' KB');
  }
  log(sources.length + ' assets; ' + Math.round(total/1024) + ' KB total');
})();
