import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { build } from '../scripts/build.mjs';
import { validateAssetPack } from '../scripts/asset-pack.mjs';

test('publication autonome : meme jeu aux deux URL, commit exact et empreinte verifiable', () => {
  const output = mkdtempSync(join(tmpdir(), 'molly-build-'));
  try {
    const metadata = build(process.cwd(), output);
    const html = readFileSync(join(output, 'index.html'), 'utf8');
    assert.equal(html, readFileSync(join(output, 'molly_mine.html'), 'utf8'));
    assert.equal(metadata.commit, execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim());
    assert.equal(metadata.sha256, createHash('sha256').update(html).digest('hex'));
    assert.deepEqual(JSON.parse(html.match(/<script id="buildInfo" type="application\/json">([^<]*)<\/script>/)[1]), { version: metadata.version, commit: metadata.commit });
    assert.match(html, /id="buildVersion"/);
    const source = readFileSync('molly_mine.html', 'utf8');
    assert.match(html, /mollyPortrait\.src='assets\/molly_repos\.png'/);
    assert.match(html, /mollyAtlas\.src='assets\/molly_animations\.png'/);
    assert.ok(html.length < source.length - 3_000_000, 'Le build publié doit externaliser les grandes images intégrées.');
    const withoutMetadata = text => text
      .replace(/<script id="buildInfo" type="application\/json">[^<]*<\/script>/, '')
      .replace(/mollyPortrait\.src='[^']+';/, 'mollyPortrait.src=ASSET;')
      .replace(/mollyAtlas\.src='[^']+';/, 'mollyAtlas.src=ASSET;');
    assert.equal(withoutMetadata(html), withoutMetadata(source), 'Le build ne doit modifier que les metadonnees.');
    const published = JSON.parse(readFileSync(join(output, 'version.json'), 'utf8'));
    assert.equal(published.sha256, metadata.sha256);
    const { manifest } = validateAssetPack();
    assert.deepEqual(published.assetPack, { id: manifest.id, version: manifest.version });
  } finally { rmSync(output, { recursive: true, force: true }); }
});
