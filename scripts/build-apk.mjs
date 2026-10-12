import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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
// IDs AdMob : si ADMOB_REWARD_ID est défini, on injecte les vrais IDs et on
// coupe le mode test (APK distribué en direct, sans Play Store). Sinon on
// garde les IDs de test Google (annonces factices, zéro revenu).
// --release exige un ID réel (erreur sinon).
const rewardId = process.env.ADMOB_REWARD_ID?.trim();
if (process.argv.includes('--release') && !rewardId) throw new Error('ADMOB_REWARD_ID requis pour une release.');
if (rewardId) {
  for (const file of ['index.html', 'molly_mine.html']) {
    const path = resolve(www, file);
    const html = readFileSync(path, 'utf8')
      .split('ca-app-pub-3940256099942544/5224354917').join(rewardId)
      .split('isTesting:true').join('isTesting:false');
    writeFileSync(path, html);
  }
  console.log('IDs AdMob réels injectés.');
}
try {
  execFileSync('npx', ['cap', 'sync', 'android'], { cwd: root, stdio: 'inherit' });
} catch {
  console.log('Plateforme android absente : exécute `npx cap add android` puis relance.');
}
