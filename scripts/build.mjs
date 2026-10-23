import {mkdtemp, readFile, rm, writeFile, access} from 'node:fs/promises';
import {resolve, join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from 'vite';

await build();

// Keep the temporary server bundle under node_modules so React resolves normally.
// Only the rendered HTML ships; no server or new runtime dependency is needed.
const temporary = await mkdtemp(resolve('node_modules/.zingg-prerender-'));
try {
  await build({
    build: {
      ssr: 'src/prerender.tsx',
      outDir: temporary,
      copyPublicDir: false,
      minify: false,
      rolldownOptions: {input: 'src/prerender.tsx', output: {entryFileNames: 'prerender.mjs'}},
    },
  });
  const {renderLanding} = await import(pathToFileURL(join(temporary, 'prerender.mjs')).href);
  const landing = renderLanding();
  // Fail the build if server-rendered images do not exist in the client output.
  for (const [, url] of landing.matchAll(/(?:src|href)="(\/[^"]+)"/g)) {
    await access(resolve('dist', url.slice(1)));
  }
  const filename = resolve('dist/index.html');
  const html = await readFile(filename, 'utf8');
  const placeholder = '<div id="root"></div>';
  if (!html.includes(placeholder)) throw new Error('Missing landing-page prerender placeholder');
  await writeFile(filename, html.replace(placeholder, () => `<div id="root">${landing}</div>`));
} finally {
  await rm(temporary, {recursive: true, force: true});
}
