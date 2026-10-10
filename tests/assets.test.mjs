import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ASSET_SLOTS, MINERAL_IDS, validateAssetPack } from '../scripts/asset-pack.mjs';

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
    URL, Image: TestImage, setTimeout, clearTimeout, MINERALS: {},
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

test('les slots mineral.* sont synchronisés entre validateur et jeu, avec repli intégré', () => {
  const html = readFileSync('molly_mine.html', 'utf8');
  // Identifiants réels issus des tables de butin du jeu.
  const lootStart = html.indexOf('const LOOT=');
  const lootSrc = html.slice(lootStart, html.indexOf('];', lootStart) + 1);
  const lootIds = vm.runInContext(`${lootSrc};LOOT.flat().map(i=>i.id)`, vm.createContext({}));
  assert.deepEqual(new Set(lootIds), new Set(MINERAL_IDS));
  // Ensemble du jeu : MINERALS réduit aux ids du validateur pour isoler la construction des slots.
  const code = html.slice(html.indexOf('const ASSET_SLOTS='), html.indexOf('function tileSprite('));
  const stubMinerals = Object.fromEntries(MINERAL_IDS.map(id => [id, {}]));
  const context = vm.createContext({ window: {}, MINERALS: stubMinerals });
  vm.runInContext(code, context);
  const gameSlots = vm.runInContext('[...ASSET_SLOTS]', context);
  for (const id of MINERAL_IDS) assert.ok(gameSlots.includes(`mineral.${id}`), id);
  assert.ok(gameSlots.includes('find.stone'));
});

test('drawMineral utilise le sprite du pack puis la gemme procédurale', () => {
  const html = readFileSync('molly_mine.html', 'utf8');
  const code = [
    html.match(/^function poly[^\n]+/m)[0],
    html.match(/^function gem[^\n]+/m)[0],
    'function packedSprite(slot){return null}',
    html.match(/^function drawPackedSprite[^\n]+/m)[0],
    html.match(/^function drawMineral[^\n]+/m)[0],
  ].join('\n');
  const noop = () => {};
  const ctx2d = () => ({ save: noop, restore: noop, translate: noop, scale: noop,
    beginPath: noop, moveTo: noop, lineTo: noop, closePath: noop, fill: noop,
    stroke: noop, drawImage: noop, set fillStyle(v) {}, set strokeStyle(v) {}, set lineWidth(v) {} });
  const context = vm.createContext({ MINERALS: { gold: { color: '#ffcf63' } } });
  vm.runInContext(code, context);
  // Sans sprite : repli procédural, aucun drawImage.
  let drew = 0;
  context.c = { ...ctx2d(), drawImage: () => { drew++; } };
  vm.runInContext('drawMineral(c,"gold",50,50,20)', context);
  assert.equal(drew, 0);
});

test('le record mondial est validé avant envoi', () => {
  const html = readFileSync('molly_mine.html', 'utf8');
  const code = [
    html.match(/^function playerUuid[^\n]+/m)[0],
    html.match(/^function buildRecord[^\n]+/m)[0],
  ].join('\n');
  const store = {};
  const context = vm.createContext({
    MINERALS: { gold: { color: '#ffcf63' } },
    sellValue: () => 500,
    localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); } },
    crypto: { randomUUID: () => 'uuid-test' },
  });
  vm.runInContext(code, context);
  assert.equal(
    JSON.stringify(vm.runInContext('buildRecord({id:"gold",grams:120,baseValue:100}," Molly ")', context)),
    JSON.stringify({ player_uuid: 'uuid-test', pseudo: 'Molly', mineral_id: 'gold', grams: 120, valeur: 500 }));
  assert.equal(vm.runInContext('buildRecord({id:"gold",grams:120},"")', context), null);
  assert.equal(vm.runInContext('buildRecord({id:"inconnu",grams:120},"Molly")', context), null);
  assert.equal(vm.runInContext('buildRecord({id:"gold",grams:99999},"Molly")', context), null);
});

test('le validateur accepte un slot mineral.* et refuse un id inconnu', () => {
  const root = mkdtempSync(join(tmpdir(), 'molly-minerals-'));
  const assets = join(root, 'assets');
  const packDir = join(assets, 'packs', 'test');
  mkdirSync(packDir, { recursive: true });
  // PNG RGBA 1x1 transparent.
  writeFileSync(join(packDir, 'gold.png'), Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+X5W8WQAAAABJRU5ErkJggg==', 'base64'));
  writeFileSync(join(assets, 'active-pack.json'), JSON.stringify({ manifest: 'packs/test/pack.json' }));
  const base = {
    schemaVersion: 1,
    id: 'test', name: 'Test', version: '1.0.0',
    license: { name: 'Test', source: 'test fixture', commercialUse: true },
    sprites: { 'mineral.gold': { src: 'gold.png' } },
  };
  const save = value => writeFileSync(join(packDir, 'pack.json'), JSON.stringify(value));
  try {
    save(base);
    assert.equal(validateAssetPack(root).manifest.id, 'test');
    save({ ...base, sprites: { 'mineral.unobtainium': { src: 'gold.png' } } });
    assert.throws(() => validateAssetPack(root), /Slot inconnu/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
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
