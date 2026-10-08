import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { build } from '../scripts/build.mjs';

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
    const withoutMetadata = text => text.replace(/<script id="buildInfo" type="application\/json">[^<]*<\/script>/, '');
    assert.equal(withoutMetadata(html), withoutMetadata(source), 'Le build ne doit modifier que les metadonnees.');
    assert.equal(JSON.parse(readFileSync(join(output, 'version.json'), 'utf8')).sha256, metadata.sha256);
  } finally { rmSync(output, { recursive: true, force: true }); }
});
