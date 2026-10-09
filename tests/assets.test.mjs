import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateAssetPack } from '../scripts/asset-pack.mjs';

test('au chargement, un fichier absent et un crop invalide ne désactivent pas les slots valides', async () => {
  const manifest = {
    schemaVersion: 1, id: 'partial', name: 'Partial', version: '1.0.0',
    license: { commercialUse: true },
    sprites: {
      'terrain.0': { src: 'tile.png' },
      'rock.0': { src: 'missing.png' },
      'bedrock': { src: 'tile.png', frame: [0, 0, 65, 64] },
    },
  };
  class TestImage {
    naturalWidth = 64; naturalHeight = 64;
    set src(url) { queueMicrotask(() => url.endsWith('missing.png') ? this.onerror() : this.onload()); }
  }
  const context = vm.createContext({
    window: {}, document: { baseURI: 'https://example.test/MollyMine/' },
    URL, Image: TestImage, setTimeout, clearTimeout,
    $: () => null, sprites: new Map(), applyMollyAssetPack: () => {},
    fetch: async url => ({ ok: true, json: async () => url.pathname.endsWith('active-pack.json')
      ? { manifest: 'packs/test/pack.json' } : manifest }),
  });
  const html = readFileSync('molly_mine.html', 'utf8');
  const code = html.slice(html.indexOf('const ASSET_SLOTS='), html.indexOf('function tileSprite('));
  vm.runInContext(code, context);
  await vm.runInContext('loadActiveAssetPack()', context);
  assert.equal(context.window.MOLLY_ASSETS.status, 'ready');
  assert.deepEqual([...context.window.MOLLY_ASSETS.sprites.keys()], ['terrain.0']);
  assert.equal(context.window.MOLLY_ASSETS.errors.length, 2);
});

test('le pack actif est valide et déclare sa licence commerciale', () => {
  const result = validateAssetPack();
  assert.ok(result.manifest.id);
  assert.equal(result.manifest.license.commercialUse, true);
  assert.ok(Array.isArray(result.files));
});

test('le validateur accepte un pack partiel et refuse cadre, chemin ou licence invalides', () => {
  const root = mkdtempSync(join(tmpdir(), 'molly-assets-'));
  const assets = join(root, 'assets');
  const packDir = join(assets, 'packs', 'test');
  mkdirSync(packDir, { recursive: true });
  // PNG RGBA 1x1 transparent.
  writeFileSync(join(packDir, 'tile.png'), Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+X5W8WQAAAABJRU5ErkJggg==', 'base64'));
  writeFileSync(join(assets, 'active-pack.json'), JSON.stringify({ manifest: 'packs/test/pack.json' }));
  const base = {
    schemaVersion: 1,
    id: 'test', name: 'Test', version: '1.0.0',
    license: { name: 'Test', source: 'test fixture', commercialUse: true },
    sprites: { 'terrain.0': { src: 'tile.png' } },
  };
  const save = value => writeFileSync(join(packDir, 'pack.json'), JSON.stringify(value));
  try {
    save(base);
    assert.equal(validateAssetPack(root).manifest.id, 'test');
    save({ ...base, sprites: { 'terrain.0': { src: 'tile.png', frame: [0, 0, 2, 1] } } });
    assert.throws(() => validateAssetPack(root), /hors de l'image/);
    save({ ...base, sprites: { 'terrain.0': { src: '../../../../outside.png' } } });
    assert.throws(() => validateAssetPack(root), /rester dans assets/);
    save({ ...base, license: { ...base.license, commercialUse: false } });
    assert.throws(() => validateAssetPack(root), /commercialUse=true/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
