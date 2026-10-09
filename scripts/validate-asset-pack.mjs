import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { validateAssetPack } from './asset-pack.mjs';

export function printAssetPackReport(root = process.cwd()) {
  const { manifest, files } = validateAssetPack(root);
  const report = {
    id: manifest.id,
    name: manifest.name,
    version: manifest.version,
    sprites: Object.keys(manifest.sprites).length,
    files,
    license: manifest.license,
  };
  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) printAssetPackReport();
