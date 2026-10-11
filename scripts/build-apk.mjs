import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { build } from './build.mjs';

const root = process.cwd();
build(root);
const www = resolve(root, 'www');
rmSync(www, { recursive: true, force: true });
mkdirSync(www, { recursive: true });
cpSync(resolve(root, '_site'), www, { recursive: true });
console.log('Site copié vers www/.');
try {
  execFileSync('npx', ['cap', 'sync', 'android'], { cwd: root, stdio: 'inherit' });
} catch {
  console.log('Plateforme android absente : exécute `npx cap add android` puis relance.');
}
