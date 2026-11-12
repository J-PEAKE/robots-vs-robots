import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createBattle} from '../src/battle.js';
test('dance dodges exactly the next attack and consumes status on success or failure',()=>{for(const roll of [0,.9]){const b=createBattle('karat',()=>roll);b.act('dance');b.act('axe');assert.equal(b.fighters[0].hp,roll===0?40:28);assert.equal(b.fighters[0].dodgeReady,false);b.act('axe');b.act('axe');assert.equal(b.fighters[0].hp,roll===0?28:16);}});
test('both winners, HP clamps, finished battles reject moves, fresh battle resets',()=>{for(const id of ['karat','cano']){const b=createBattle(id,()=>.9);while(b.winner===null)b.act('axe');assert.equal(b.winner,id==='cano'?0:1);assert.equal(b.fighters[1-b.winner].hp,0);assert.equal(b.act('dance'),null);const fresh=createBattle(id);assert.equal(fresh.turn,0);assert.equal(fresh.winner,null);assert.equal(fresh.fighters[0].hp,fresh.fighters[0].maxHp);}});
