import { characters } from './data/characters.js';
export function createBattle(id, random = Math.random) {
 const player = characters.find(c=>c.id===id);
 if(!player) throw Error('Unknown robot');
 const fighters = [player, characters.find(c=>c.id!==id)].map(c=>({...c,hp:c.maxHp,dodgeReady:false}));
 return {fighters,turn:0,winner:null,act(move){
 if(this.winner!==null || !['dance','axe'].includes(move)) return null;
 const actor=fighters[this.turn], target=fighters[1-this.turn];
 let dodged=false;
 if(move==='dance') actor.dodgeReady=true;
 else {dodged=target.dodgeReady && random()<.7;target.dodgeReady=false;if(!dodged) target.hp=Math.max(0,target.hp-12);}
 if(target.hp===0)this.winner=this.turn;
 const result={actor:this.turn,move,dodged};this.turn=1-this.turn;return result;
 }};
}
