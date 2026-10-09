import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ASSET_SLOTS, validateAssetPack } from '../scripts/asset-pack.mjs';

test('les variantes graphiques utilisent leur slot puis le terrain commun si une image manque', () => {
  const html = readFileSync('molly_mine.html', 'utf8');
  const code = html.match(/^function drawPackedTile[^\n]+/m)[0];
  const available = new Set(['terrain.0.1', 'terrain.0']), calls = [];
  const context = vm.createContext({ drawPackedSprite: slot => { calls.push(slot); return available.has(slot); } });
  vm.runInContext(code, context);
  assert.equal(vm.runInContext("drawPackedTile('terrain.0',null,0,0,64,64,1)", context), true);
  assert.deepEqual(calls.splice(0), ['terrain.0.1']);
  assert.equal(vm.runInContext("drawPackedTile('terrain.0',null,0,0,64,64,2)", context), true);
  assert.deepEqual(calls.splice(0), ['terrain.0.2', 'terrain.0']);
  available.clear();
  assert.equal(vm.runInContext("drawPackedTile('terrain.0',null,0,0,64,64,2)", context), false);
  for (let z = 0; z < 5; z++) {
    for (let v = 0; v < 3; v++) assert.ok(ASSET_SLOTS.has(`terrain.${z}.${v}`));
    for (let v = 0; v < 2; v++) assert.ok(ASSET_SLOTS.has(`tunnel.${z}.${v}`));
  }
});

test('la répartition des variantes est stable et ne consomme pas le RNG de gameplay', () => {
  const html = readFileSync('molly_mine.html', 'utf8');
  const code = ['caveNoise', 'visualVariant'].map(name => html.match(new RegExp(`^function ${name}[^\\n]+`, 'm'))[0]).join('\n');
  const context = vm.createContext({ worldSeed: 123, seed: 987 });
  vm.runInContext(code, context);
  const first = vm.runInContext('Array.from({length:12},(_,y)=>visualVariant(8,y,3))', context);
  assert.equal(new Set(first).size, 3, 'Les variantes ne doivent pas former une colonne uniforme.');
  assert.deepEqual(first, vm.runInContext('Array.from({length:12},(_,y)=>visualVariant(8,y,3))', context));
  assert.equal(context.seed, 987);
});

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
