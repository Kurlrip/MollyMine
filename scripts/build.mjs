import { readFileSync, writeFileSync, mkdirSync, cpSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';

export function build(root = process.cwd(), output = resolve(root, '_site')) {
  const source = readFileSync(resolve(root, 'molly_mine.html'), 'utf8');
  const version = JSON.parse(readFileSync(resolve(root, 'version.json'), 'utf8'));
  if (!/^\d+\.\d+\.\d+$/.test(version.version)) throw new Error('Version semantique invalide.');
  const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  if (process.env.GITHUB_SHA && process.env.GITHUB_SHA !== commit) throw new Error('Le checkout ne correspond pas au commit du workflow.');
  const marker = /<script id="buildInfo" type="application\/json">[^<]*<\/script>/g;
  if ([...source.matchAll(marker)].length !== 1) throw new Error('Metadonnees de version absentes ou dupliquees.');
  const html = source.replace(marker, `<script id="buildInfo" type="application/json">${JSON.stringify({ version: version.version, commit })}</script>`);
  let checked = 0;
  for (const [index, match] of [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)].entries()) {
    if (/\bsrc\s*=/i.test(match[1])) throw new Error('Le jeu doit rester autonome.');
    const type = match[1].match(/\btype\s*=\s*["']([^"']+)["']/i)?.[1];
    if (type === 'application/json') { JSON.parse(match[2]); continue; }
    if (type && !['text/javascript', 'application/javascript'].includes(type)) throw new Error(`Type de script non verifie : ${type}`);
    new vm.Script(match[2], { filename: `molly-script-${index}.js` });
    checked++;
  }
  if (!checked || !/<\/html>\s*$/i.test(html)) throw new Error('Jeu incomplet.');
  const metadata = { ...version, commit, sha256: createHash('sha256').update(html).digest('hex') };
  mkdirSync(output, { recursive: true });
  for (const filename of ['index.html', 'molly_mine.html']) writeFileSync(resolve(output, filename), html);
  writeFileSync(resolve(output, 'version.json'), JSON.stringify(metadata, null, 2) + '\n');
  cpSync(resolve(root, 'assets'), resolve(output, 'assets'), { recursive: true });
  writeFileSync(resolve(output, '.nojekyll'), '');
  return metadata;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(JSON.stringify(build(), null, 2));
}
