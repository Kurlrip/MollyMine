import { existsSync, readFileSync } from 'node:fs';
import { dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path';

export const ASSET_SLOTS = new Set([
  'molly.idle', 'molly.atlas',
  ...Array.from({ length: 5 }, (_, i) => `terrain.${i}`),
  'bedrock',
  ...Array.from({ length: 5 }, (_, i) => `rock.${i}`),
  'find.stone', 'gas', 'monster', 'warning', 'stall.shop', 'stall.market',
]);

function readJson(path) {
  try { return JSON.parse(readFileSync(path, 'utf8')); }
  catch (error) { throw new Error(`${path}: JSON invalide (${error.message})`); }
}

function pngSize(path) {
  const data = readFileSync(path);
  const signature = '89504e470d0a1a0a';
  if (data.length < 24 || data.subarray(0, 8).toString('hex') !== signature) {
    throw new Error(`${path}: le fichier n'est pas un PNG valide.`);
  }
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
}

function validateRect(rect, size, label, expectedLength = 4) {
  if (!Array.isArray(rect) || rect.length !== expectedLength || rect.some(n => !Number.isInteger(n) || n < 0)) {
    throw new Error(`${label}: rectangle invalide.`);
  }
  const [x, y, width, height] = rect;
  if (width < 1 || height < 1 || x + width > size.width || y + height > size.height) {
    throw new Error(`${label}: rectangle hors de l'image ${size.width}x${size.height}.`);
  }
}

export function validateAssetPack(root = process.cwd()) {
  const assetsRoot = resolve(root, 'assets');
  const pointerPath = resolve(assetsRoot, 'active-pack.json');
  const pointer = readJson(pointerPath);
  if (!pointer || typeof pointer.manifest !== 'string' || !pointer.manifest.trim()) {
    throw new Error('assets/active-pack.json: champ manifest requis.');
  }
  if (isAbsolute(pointer.manifest)) throw new Error('Le manifeste doit être relatif à assets/.');
  const manifestPath = resolve(assetsRoot, pointer.manifest);
  const pointerRelative = relative(assetsRoot, manifestPath);
  if (pointerRelative.startsWith(`..${sep}`) || pointerRelative === '..') throw new Error('Le manifeste doit rester dans assets/.');
  const manifest = readJson(manifestPath);
  if (manifest.schemaVersion !== 1) throw new Error('Version de schéma de pack non supportée.');
  for (const field of ['id', 'name', 'version']) if (typeof manifest[field] !== 'string' || !manifest[field].trim()) throw new Error(`Pack: champ ${field} requis.`);
  if (!manifest.license || typeof manifest.license.name !== 'string' || typeof manifest.license.source !== 'string' || manifest.license.commercialUse !== true) {
    throw new Error('Pack: licence, source et commercialUse=true requis.');
  }
  if (!manifest.sprites || typeof manifest.sprites !== 'object' || Array.isArray(manifest.sprites)) throw new Error('Pack: objet sprites requis.');
  const files = new Set();
  for (const [slot, sprite] of Object.entries(manifest.sprites)) {
    if (!ASSET_SLOTS.has(slot)) throw new Error(`Slot inconnu: ${slot}.`);
    if (!sprite || typeof sprite.src !== 'string' || !sprite.src.trim() || isAbsolute(sprite.src)) throw new Error(`${slot}: src relatif requis.`);
    const file = resolve(dirname(manifestPath), sprite.src);
    const fileRelative = relative(assetsRoot, file);
    if (fileRelative.startsWith(`..${sep}`) || fileRelative === '..') throw new Error(`${slot}: src doit rester dans assets/.`);
    if (extname(file).toLowerCase() !== '.png') throw new Error(`${slot}: seuls les PNG sont acceptés.`);
    if (!existsSync(file)) throw new Error(`${slot}: fichier absent (${fileRelative}).`);
    const size = pngSize(file);
    if (sprite.frame) validateRect(sprite.frame, size, `${slot}.frame`);
    if (slot === 'molly.atlas') {
      if (sprite.referenceHeight !== undefined && (!Number.isFinite(sprite.referenceHeight) || sprite.referenceHeight <= 0)) throw new Error('molly.atlas: referenceHeight doit être positif.');
      if (!Array.isArray(sprite.frames) || sprite.frames.length !== 8) throw new Error('molly.atlas: huit frames requises.');
      sprite.frames.forEach((frame, index) => validateRect(frame, size, `molly.atlas.frames[${index}]`, 6));
    } else if (sprite.frames) throw new Error(`${slot}: frames est réservé à molly.atlas.`);
    files.add(fileRelative.replaceAll('\\', '/'));
  }
  return { pointerPath, manifestPath, manifest, files: [...files].sort() };
}
