import {createBattle} from './battle.js';
import {robotArtwork} from './components/RobotArtwork.js';
export function mountBattle(app,id,onExit,chime){
 let battle=createBattle(id),busy=false,epoch=0,message='Your turn! Pick a move.',effect=null;
 const pause=()=>new Promise(r=>setTimeout(r,650));
 function draw(){
 app.innerHTML=`<section class="battle-screen"><h1 tabindex="-1">${battle.winner===null?'ROBOT RUMBLE!':battle.winner===0?'YOU WIN!':'GOOD TRY, TEAM!'}</h1><p>${battle.winner===null?(battle.turn===0?'YOUR TURN':'OPPONENT’S TURN'):'Every battle makes you stronger.'}</p><div class="battle-arena">${battle.fighters.map((c,i)=>`<article class="fighter ${effect?.actor===i?effect.move:''} ${effect?.actor===1-i&&effect.move==='axe'?(effect.dodged?'dodged':'hit'):''}"><h2>${c.name} <small>${i===0?'YOU':'OPPONENT'}</small></h2><progress max="${c.maxHp}" value="${c.hp}" aria-label="${c.name} health"></progress><p>${c.hp} / ${c.maxHp} HP</p><div class="battle-art">${robotArtwork(c)}${effect?.actor===i?(effect.move==='dance'?'<span class="notes" aria-hidden="true">♪ ✦ ♫</span>':'<span class="energy-axe" aria-hidden="true"><svg width="80" height="100" viewBox="0 0 80 100"><path d="M38 90V12" stroke="#fff" stroke-width="7"/><path d="M38 15Q65 8 70 40L42 48Z" fill="#7ffff0" stroke="white" stroke-width="4"/></svg></span>'):''}</div><p class="dodge-label">${c.dodgeReady?'♫ Ready to dodge!':'&nbsp;'}</p></article>`).join('')}</div><p class="battle-message" role="status" aria-live="polite">${message}</p><div class="battle-controls">${battle.winner===null?`<button class="toy-button" data-move="dance" ${busy?'disabled':''}>♫ Dance Dance<small>70% dodge chance</small></button><button class="toy-button" data-move="axe" ${busy?'disabled':''}>ϟ Axe Chop<small>12 damage</small></button>`:'<button class="toy-button" data-rematch>REMATCH ↻</button>'}<button class="back-button" data-exit>Choose another robot</button></div></section>`;
 }
 async function action(move,token){
 const actor=battle.fighters[battle.turn];effect={actor:battle.turn,move};message=`${actor.name} used ${move==='dance'?'Dance Dance':'Axe Chop'}!`;chime('select');draw();await pause();if(token!==epoch)return false;
 const result=battle.act(move);effect=result;message=move==='dance'?`${actor.name} is ready to dodge!`:result.dodged?'Dodged! No damage.':'Wham! 12 damage!';draw();await pause();if(token!==epoch)return false;effect=null;
 if(battle.winner!==null){message=battle.winner===0?'You did it! Brilliant teamwork.':'Nice moves! Ready for another go?';busy=false;chime('confirm');draw();app.querySelector('h1').focus();return false;}return true;
 }
 async function turn(move){if(busy||battle.winner!==null||battle.turn!==0)return;busy=true;const token=epoch;if(!await action(move,token))return;if(!await action(Math.random()<.5?'dance':'axe',token))return;busy=false;message='Your turn! Pick a move.';draw();app.querySelector('[data-move]').focus({preventScroll:true});}
 function click(e){if(e.target.closest('[data-exit]')){epoch++;app.removeEventListener('click',click);onExit();return;}if(e.target.closest('[data-rematch]')){epoch++;battle=createBattle(id);busy=false;effect=null;message='Fresh batteries! Your turn.';draw();app.querySelector('h1').focus();return;}const move=e.target.closest('[data-move]');if(move)void turn(move.dataset.move);}
 app.addEventListener('click',click);draw();app.querySelector('h1').focus();return ()=>{epoch++;app.removeEventListener('click',click);};
}

