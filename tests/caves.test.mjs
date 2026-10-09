import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Execute the actual standalone game's generator, without maintaining a second implementation.
const html = readFileSync('molly_mine.html', 'utf8');
const line = name => html.match(new RegExp(`^function ${name}\\([^\\n]+`, 'm'))[0];
const source = [
  html.match(/^const TILE_SIZE=.*$/m)[0], html.match(/^const EMPTY=.*$/m)[0],
  html.match(/const ZONES=\[[\s\S]*?\n\];/)[0],
  ...['key', 'depthAt', 'zoneAt', 'rand', 'generateLegacy', 'setCell'].map(line),
  html.split('// CAVE_GENERATOR_BEGIN')[1].split('// CAVE_WORLD_END')[0].replace(/^[^\r\n]*\r?\n/, ''),
].join('\n');
function world(seed = 1, generation = 2) {
  const context = vm.createContext({});
  vm.runInContext(`let rows=[],rocks=new Map(),gas=new Set(),enemies=[],generated=0,seed=${seed},digProgress=new Map();\n${source}\nworldSeed=${seed};worldGeneration=${generation};`, context);
  return code => vm.runInContext(code, context);
}

test('200 seeds: exactly one 2–6 tile opening at each zone boundary, sealed map edges', () => {
  const positions = new Set(), widths = new Set();
  for (let seed = 1; seed <= 200; seed++) {
    const run = world(seed);
    run('generate(170)');
    const gates = JSON.parse(run(`JSON.stringify([1,2,3,4].map(i=>caveGate(worldSeed,i)))`));
    for (const gate of gates) {
      positions.add(gate.x); widths.add(gate.width);
      const row = JSON.parse(run(`JSON.stringify(rows[${gate.y}])`));
      const openings = row.flatMap((tile, x) => tile !== 3 ? [x] : []);
      assert.deepEqual(openings, Array.from({ length: gate.width }, (_, i) => gate.x + i));
      assert.ok(gate.width >= 2 && gate.width <= 6);
      assert.equal(run(`rocks.has(key(${gate.center},${gate.y}))`), false);
      assert.equal(run(`gas.has(key(${gate.center},${gate.y}))`), false);
    }
    assert.equal(run('rows.every(row=>row[0]===WALL&&row[WORLD_W-1]===WALL)'), true);
  }
  assert.equal(widths.size, 5);
  assert.ok(positions.size > 20);
});

test('100 seeds: irregular rooms connect to both gates, safe tunnels start unobstructed', () => {
  for (let seed = 1; seed <= 100; seed++) {
    const run = world(seed);
    run('generate(230)');
    assert.equal(run(`(() => {
      for(let i=0;i<7;i++){
        const b=createCaveBand(worldSeed,i),start=key(b.entrance.center,b.start);
        const seen=new Set([start]),queue=[start];
        for(let n=0;n<queue.length;n++){
          const [x,y]=queue[n].split(',').map(Number);
          for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){
            const p=key(x+dx,y+dy);if(b.open.has(p)&&!seen.has(p)){seen.add(p);queue.push(p)}
          }
        }
        if(seen.size!==b.open.size||!seen.has(key(b.exit.center,b.exit.y)))return false;
        // The final row is a gate owned by the neighbouring band's barrier.
        for(const p of b.route){const [x,y]=p.split(',').map(Number);if(y>=generated||y===b.exit.y)continue;
          if(rows[y][x]!==EMPTY||rocks.has(p)||gas.has(p)||enemies.some(e=>e.x===x&&e.y===y))return false;
        }
      }
      return true;
    })()`), true, `seed ${seed}`);
  }
});

test('incremental generation and resumed saves produce the same deeper terrain', () => {
  const one = world(98765), incremental = world(98765);
  one('generate(340)');
  for (let y = 0; y <= 340; y += 5) incremental(`generate(${y}); rand(); rand();`);
  assert.equal(incremental('JSON.stringify(rows)'), one('JSON.stringify(rows)'));
  const resumed = world(98765);
  resumed('generate(160);setCell(24,12,EMPTY)');
  const saved = resumed('JSON.stringify({rows,rocks:[...rocks],gas:[...gas],enemies,worldSeed,worldGeneration,seed})');
  const loaded = world(10);
  loaded(`const data=${saved};rows=data.rows;generated=rows.length;rocks=new Map(data.rocks);gas=new Set(data.gas);enemies=data.enemies;worldSeed=data.worldSeed;worldGeneration=data.worldGeneration;seed=data.seed;caveBands.clear();generate(340)`);
  resumed('generate(340)');
  assert.equal(loaded('JSON.stringify(rows)'), resumed('JSON.stringify(rows)'));
  assert.equal(loaded('JSON.stringify([...rocks])'), resumed('JSON.stringify([...rocks])'));
});

test('bedrock resists terrain edits, while ordinary soil can still be mined', () => {
  const run = world(77);
  run('generate(150)');
  run('setCell(1,16,EMPTY);setCell(0,20,ORE);setCell(24,12,EMPTY)');
  assert.equal(run('rows[16][1]'), 3);
  assert.equal(run('rows[20][0]'), 3);
  assert.equal(run('rows[12][24]'), 0);
});

test('legacy generator remains available for an existing concession', () => {
  const run = world(42, 1);
  run('generate(150)');
  assert.equal(run('rows[16].slice(1,-1).every(tile=>tile!==WALL)'), true);
  assert.equal(run('rows.length'), 151);
  run('worldGeneration=2;rows=[];rocks.clear();gas.clear();enemies=[];generated=0;generate(150)');
  assert.equal(run('rows[16].filter(tile=>tile===WALL).length>=42'), true);
});
