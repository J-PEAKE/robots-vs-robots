import {createBattle} from './battle.js';
import {createAnimator,axeMarkup} from './animation.js';
import karatSource from '../public/assets/robots/karat.svg?raw';
import canoSource from '../public/assets/robots/cano.svg?raw';

// Inline originals retain their expressive accessory groups; prefix paint IDs per fighter.
function artwork(robot,index){return (robot.id==='karat'?karatSource:canoSource).replace(/id="([^"]+)"/g,`id="bot${index}-$1"`).replace(/url\(#([^)]+)\)/g,`url(#bot${index}-$1)`);}
export function mountBattle(app,id,onExit,chime){
 let battle=createBattle(id),busy=false,animator=createAnimator();
 const q=s=>app.querySelector(s);
 function mount(){
 app.innerHTML=`<section class="battle-screen polished"><div class="battle-heading"><span class="eyebrow">THE FRIENDLY ROBOT RUMBLE</span><h1 tabindex="-1">BIG MOVES. BIG FUN.</h1><p class="turn-label">YOUR TURN</p></div><div class="health-panels">${battle.fighters.map((c,i)=>`<article class="health-panel"><div><h2>${c.name}</h2><span>${i===0?'YOUR TEAM':'OPPONENT'} · LV ${c.level}</span></div><div class="health-track" role="progressbar" aria-label="${c.name} health" aria-valuemin="0" aria-valuemax="${c.maxHp}" aria-valuenow="${c.hp}"><span></span></div><p class="hp-value">${c.hp} / ${c.maxHp} HP</p><span class="status-badge">Ready to rumble</span></article>`).join('')}</div><div class="shared-arena" data-phase="idle"><div class="arena-sun" aria-hidden="true">✦</div><div class="arena-floor" aria-hidden="true"></div><span class="arena-vs" aria-hidden="true">VS</span>${battle.fighters.map((c,i)=>`<div class="combatant side-${i} ${c.id}" data-fighter="${i}"><div class="bot-shadow"></div><div class="motion"><div class="facing"><div class="bot-drawing" role="img" aria-label="${c.name}">${artwork(c,i)}</div><div class="weapon-slot"></div></div></div><div class="effects" aria-hidden="true"></div></div>`).join('')}</div><p class="battle-message" role="status" aria-live="polite">Your turn! Pick a move.</p><div class="battle-controls"><button class="toy-button" data-move="dance">♫ Dance Dance<small>Get ready to dodge • 70% chance</small></button><button class="toy-button" data-move="axe">ϟ Axe Chop<small>Summon an energy axe • 12 damage</small></button><button class="toy-button" data-rematch hidden>REMATCH ↻</button><button class="back-button" data-exit>Choose another robot</button></div></section>`;
 q('h1').focus({preventScroll:true});
 }
 const bot=i=>q(`[data-fighter="${i}"]`);
 const phase=name=>{q('.shared-arena').dataset.phase=name;};
 const say=text=>{q('.battle-message').textContent=text;};
 function update(){battle.fighters.forEach((c,i)=>{const panel=app.querySelectorAll('.health-panel')[i];panel.querySelector('.health-track').setAttribute('aria-valuenow',c.hp);panel.querySelector('.health-track span').style.width=`${c.hp/c.maxHp*100}%`;panel.querySelector('.hp-value').textContent=`${c.hp} / ${c.maxHp} HP`;panel.querySelector('.status-badge').textContent=c.dodgeReady?'♫ Dodge ready':'Ready to rumble';bot(i).classList.toggle('dodge-ready',c.dodgeReady);});}
 function controls(){app.querySelectorAll('[data-move]').forEach(b=>{b.disabled=busy||battle.winner!==null;b.hidden=battle.winner!==null;});q('[data-rematch]').hidden=battle.winner===null;}
 async function action(move){
 const a=battle.turn,d=1-a,actor=battle.fighters[a],motion=bot(a).querySelector('.motion'),target=bot(d).querySelector('.motion'),direction=a===0?1:-1;
 q('.turn-label').textContent=a===0?'YOUR MOVE!':'OPPONENT’S TURN';say(`${actor.name} used ${move==='axe'?'Axe Chop':'Dance Dance'}!`);
 if(move==='dance'){
 phase('dancing');chime('dance');bot(a).querySelector('.effects').innerHTML='<span class="music-notes">♪ ✦ ♫</span>';
 await animator.play(motion,[{transform:'translateY(0) rotate(0)'},{transform:'translate(-9px,-10px) rotate(-12deg) scale(1.04,.96)'},{transform:'translate(10px,-4px) rotate(12deg)'},{transform:'translate(-6px,-15px) rotate(-8deg)'},{transform:'translateY(0) rotate(0)'}],800);
 battle.act(move);update();say(`${actor.name} is ready to dodge!`);bot(a).querySelector('.effects').replaceChildren();
 }else{
 const travel=Math.min(q('.shared-arena').clientWidth*.19,145)*direction;
 phase('anticipation');await animator.play(motion,[{transform:'translateX(0)'},{transform:`translateX(${-12*direction}px) rotate(${-9*direction}deg) scale(.96,1.04)`}],160);
 phase('summon');chime('summon');const slot=bot(a).querySelector('.weapon-slot');slot.innerHTML=axeMarkup;
 await animator.play(slot,[{opacity:0,transform:'scale(.2) rotate(-50deg)'},{opacity:1,transform:'scale(1) rotate(-35deg)'}],130);
 phase('attacking');chime('swing');
 await Promise.all([animator.play(motion,[{transform:`translateX(${-12*direction}px) rotate(${-9*direction}deg)`},{transform:`translateX(${travel}px) rotate(${12*direction}deg) scale(1.05,.95)`}],230),animator.play(slot,[{transform:'rotate(-70deg)'},{transform:'rotate(60deg)'}],230)]);
 // Logic resolves exactly at impact, never during anticipation or the swing.
 phase('impact');const result=battle.act(move);update();chime(result.dodged?'dodge':'impact');const fx=bot(d).querySelector('.effects');
 fx.innerHTML=result.dodged?'<strong class="impact-word dodge-word">DODGED!</strong>':'<span class="impact-burst">✹</span><span class="slash-mark"></span><strong class="damage-number">−12</strong><span class="impact-particles">✦ · ✧ · ✦</span>';
 say(result.dodged?`${battle.fighters[d].name} dodged! No damage.`:`POW! ${battle.fighters[d].name} takes 12 damage.`);
 await Promise.all([animator.play(target,result.dodged?[{transform:'translateY(0)'},{transform:`translate(${-direction*26}px,-42px) rotate(${-direction*14}deg)`},{transform:`translate(${-direction*26}px,-42px) rotate(${-direction*14}deg)`}]:[{transform:'translateX(0)'},{transform:`translateX(${direction*15}px) rotate(${direction*10}deg) scale(.94,1.05)`,filter:'brightness(1.35)'},{transform:`translateX(${direction*8}px) rotate(${direction*5}deg)`}],240),animator.play(fx,[{opacity:0,transform:'scale(.55)'},{opacity:1,transform:'scale(1.1)'},{opacity:1,transform:'translateY(-10px) scale(1)'}],240),animator.play(motion,[{transform:`translateX(${travel}px) rotate(${12*direction}deg)`},{transform:`translateX(${travel*.8}px) rotate(${8*direction}deg)`}],240)]);
 phase('recovering');slot.replaceChildren();
 await Promise.all([animator.play(motion,[{transform:`translateX(${travel*.8}px) rotate(${8*direction}deg)`},{transform:'translateX(0) rotate(0)'}],260),animator.play(target,[{transform:result.dodged?`translate(${-direction*26}px,-42px)`:`translateX(${direction*8}px)`},{transform:'translate(0,0)'}],260),animator.play(fx,[{opacity:1,transform:'translateY(-10px)'},{opacity:0,transform:'translateY(-35px)'}],260)]);fx.replaceChildren();
 }
 if(battle.winner!==null){phase('finished');busy=false;controls();q('h1').textContent=battle.winner===0?'YOU WIN!':'GOOD TRY, TEAM!';say(battle.winner===0?'Brilliant teamwork! Ready for a rematch?':'Great moves! Recharge and try again.');q('.turn-label').textContent='ROUND COMPLETE';chime('confirm');q('h1').focus({preventScroll:true});return false;}return true;
 }
 async function turn(move){if(busy||battle.winner!==null||battle.turn!==0)return;busy=true;controls();try{if(!await action(move))return;phase('opponent-turn');if(!await action(Math.random()<.5?'dance':'axe'))return;busy=false;phase('idle');controls();q('.turn-label').textContent='YOUR TURN';say('Your turn! Pick a move.');q('[data-move]').focus({preventScroll:true});}catch(error){if(error.name!=='AbortError')console.error(error);}}
 function click(e){if(e.target.closest('[data-exit]')){cleanup();onExit();return;}if(e.target.closest('[data-rematch]')){animator.cancel();animator=createAnimator();battle=createBattle(id);busy=false;mount();return;}const move=e.target.closest('[data-move]');if(move)void turn(move.dataset.move);}
 function cleanup(){animator.cancel();app.removeEventListener('click',click);}
 mount();app.addEventListener('click',click);return cleanup;
}
