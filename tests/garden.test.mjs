import test from 'node:test';
import assert from 'node:assert/strict';
import {Session,gardenSolution,traceGarden} from '../src/sim.js';
import {advance} from './route-pilots.mjs';
const board=m=>JSON.stringify(m.gardenSnapshot());

test('First garden teaches a single tap; later gardens add mirrors and independent mechanics',()=>{
 const first=new Session(1,0);assert.equal(first.phase,'play');assert.equal(first.garden.mirrors.length,1);assert.deepEqual(first.advice,{kind:'mirror',id:0});assert.equal(first.par,1);
 assert.equal(new Session(1,1).garden.mirrors.length,2);assert.ok(new Session(1,14).garden.mirrors.length>=6);
});
test('All flowers occupy their own cells, separate from mirrors, filters and shutters',()=>{
 for(let i=0;i<15;i++){
  const m=new Session(1,i),key=q=>q.x+','+q.z,used=new Set(m.garden.mirrors.map(key));
  for(const q of [m.garden.filter,m.garden.shutter,m.garden.splitter].filter(Boolean)){assert.ok(!used.has(key(q)),`Stage ${i+1}: overlapping mechanism`);used.add(key(q));}
  for(const q of m.garden.goals){assert.ok(!used.has(key(q)),`Stage ${i+1}: overlapping flower`);used.add(key(q));}
 }
});
test('Legal hints solve all fifteen gardens, including boards altered by exploratory taps, without authored answers',()=>{
 for(let i=0;i<15;i++)for(let trial=0;trial<3;trial++){
  const m=new Session(1,i);m.garden.mirrors.forEach(q=>delete q.solution);
  for(let j=0;j<trial*9;j++){const q=m.garden.mirrors[(j*3+trial)%m.garden.mirrors.length];m.touch('mirror',q.id);}
  if(trial&&i>=5)m.touch('source');if(trial&&m.garden.shutter)m.touch('switch');
  const before=board(m),path=gardenSolution(m);assert.equal(board(m),before,'Search must not mutate live state');assert.ok(path,`Stage ${i+1}, trial ${trial}`);
  for(const step of path)m.touch(step.kind,step.id);
  assert.equal(traceGarden(m).lit.size,m.total);advance(m,1.2);assert.equal(m.won,true);
 }
});
test('Hints give one action without playing it; undo restores mirrors, color, shutter and move count',()=>{
 const m=new Session(1,14),initial=board(m);m.requestHint();assert.equal(board(m),initial);assert.ok(m.advice);assert.equal(m.moves,0);
 m.touch('mirror',0);m.touch('source');m.touch('switch');assert.equal(m.history.length,3);
 for(let i=0;i<3;i++)m.undoGarden();assert.equal(board(m),initial);assert.equal(m.history.length,0);
 m.undoGarden();assert.equal(board(m),initial);m.paused=true;m.touch('mirror',0);m.requestHint();m.undoGarden();assert.equal(board(m),initial);
});
test('Puzzles can be explored without a time limit and reward a solution by move count',()=>{
 const m=new Session(1,14);advance(m,600);assert.equal(m.phase,'play');assert.equal(m.remaining,m.budget);assert.ok(m.time>=599);
 for(const a of gardenSolution(m))m.touch(a.kind,a.id);advance(m,1.2);assert.equal(m.won,true);assert.equal(m.stars,3);
 m.touch('source');assert.equal(m.moves,m.par,'Finished input must be ignored');
});
