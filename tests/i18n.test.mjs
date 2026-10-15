import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync('molly_mine.html', 'utf8');

function dictKeys() {
  const defined = new Set();
  for (const tag of ['Object.assign(S.fr,{', 'Object.assign(S.en,{']) {
    let i = -1;
    while ((i = html.indexOf(tag, i + 1)) >= 0) {
      const end = html.indexOf('\n', i);
      const body = html.slice(i + tag.length, end);
      for (const k of body.matchAll(/(?:^|\{|,)([A-Za-z0-9_]+):'/gm)) defined.add(tag.includes('.fr') ? 'fr:' + k[1] : 'en:' + k[1]);
    }
  }
  return defined;
}

test('i18n : chaque clé utilisée existe en FR et en EN', () => {
  const defined = dictKeys();
  const missing = new Set();
  for (const m of html.matchAll(/T\('([A-Za-z0-9_]+)'/g)) {
    if (!defined.has('fr:' + m[1])) missing.add('fr:' + m[1]);
    if (!defined.has('en:' + m[1])) missing.add('en:' + m[1]);
  }
  assert.deepEqual([...missing].sort(), []);
});

test('i18n : les deux langues partagent exactement les mêmes clés', () => {
  const defined = dictKeys();
  const fr = new Set([...defined].filter(k => k.startsWith('fr:')).map(k => k.slice(3)));
  const en = new Set([...defined].filter(k => k.startsWith('en:')).map(k => k.slice(3)));
  assert.deepEqual([...fr].sort(), [...en].sort());
});

test('i18n : T interpole et retombe sur le français', () => {
  const dicts = [...html.matchAll(/^Object\.assign\(S\.(?:fr|en),\{.*\}\);\r?$/gm)].map(m => m[0]).join('\n');
  const code = html.slice(html.indexOf('let lang='), html.indexOf('const EMPTY=')) + '\n' + dicts;
  const context = vm.createContext({ localStorage: { getItem: () => null, setItem: () => {} }, navigator: { language: 'fr-FR' } });
  vm.runInContext(code, context);
  assert.equal(vm.runInContext("T('shop')", context), 'Boutique');
  vm.runInContext('lang="en"', context);
  assert.equal(vm.runInContext("T('shop')", context), 'Shop');
  assert.equal(vm.runInContext("T('cardPill',{n:2,s:'s'})", context), '2 cards to scratch at camp');
  assert.equal(vm.runInContext("T('nope-missing-key')", context), 'nope-missing-key');
});
