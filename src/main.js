import './styles/main.css';
import { characters } from './data/characters.js';
import { createGame } from './state.js';
import { robotArtwork } from './components/RobotArtwork.js';
import { robotCard } from './components/RobotCard.js';

const game = createGame();
const app = document.querySelector('#app');
let audioContext;
let soundEnabled = false;
const button = (text, action, extra = '') => `<button class="toy-button ${extra}" data-action="${action}">${text}</button>`;
const back = action => `<button class="back-button" data-action="${action}"><span aria-hidden="true">←</span> Back</button>`;
const steps = active => `<div class="steps" aria-label="Step ${active} of 3"><span class="${active >= 1 ? 'active' : ''}">1 <small>CHOOSE</small></span><i></i><span class="${active >= 2 ? 'active' : ''}">2 <small>GET READY</small></span><i></i><span class="${active >= 3 ? 'active' : ''}">3 <small>LET’S PLAY</small></span></div>`;

function chime(kind = 'click') {
  if (!soundEnabled) return;
  try {
    audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
    audioContext.resume().catch(() => {});
    const notes = kind === 'confirm' ? [523, 659, 784] : kind === 'select' ? [440, 660] : [600];
    notes.forEach((frequency, i) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const start = audioContext.currentTime + i * 0.085;
      oscillator.type = 'sine'; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(0.06, start + 0.012); gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
      oscillator.connect(gain); gain.connect(audioContext.destination); oscillator.start(start); oscillator.stop(start + 0.16);
    });
  } catch { soundEnabled = false; updateSound(); }
}
function updateSound() {
  const sound = document.querySelector('#sound');
  sound.setAttribute('aria-pressed', String(soundEnabled));
  sound.setAttribute('aria-label', soundEnabled ? 'Turn sound off' : 'Turn sound on');
  sound.innerHTML = `♪${soundEnabled ? '' : '<span class="sound-slash">/</span>'}`;
}
document.querySelector('#sound').addEventListener('click', () => { soundEnabled = !soundEnabled; updateSound(); chime(); });
document.querySelector('.brand').addEventListener('click', e => { e.preventDefault(); if (game.navigate('title')) render(); });

function render(focus = true) {
  const robot = game.selected;
  app.dataset.screen = game.screen;
  if (game.screen === 'title') app.innerHTML = `<section class="title-screen"><span class="eyebrow pill">A LITTLE ROBOT. A BIG ADVENTURE.</span><h1 class="game-logo" tabindex="-1"><span>ROBOTS</span><em>VS</em><span>ROBOTS</span></h1><p class="tagline">Find your robot. Make a mighty team.</p><div class="title-cast"><div class="title-robot title-karat">${robotArtwork(characters[0])}<span class="name-tag">Karat <i>↗</i></span></div><div class="title-center">${button('PLAY <span aria-hidden="true">▶</span>', 'select')}<span class="play-note">Your adventure starts here!</span><span class="mini-stars" aria-hidden="true">✦ &nbsp; ✧ &nbsp; ✦</span></div><div class="title-robot title-cano">${robotArtwork(characters[1])}<span class="name-tag">Cano <i>↖</i></span></div></div><div class="title-bottom"><span class="bolt-icon">ϟ</span> TWO ROBOTS. ENDLESS POSSIBILITIES. <span class="bolt-icon">ϟ</span></div></section>`;
  if (game.screen === 'select') app.innerHTML = `<section class="select-screen"><div class="screen-nav">${back('title')}${steps(1)}</div><div class="screen-heading"><span class="eyebrow">MEET YOUR NEW TEAMMATE</span><h1 tabindex="-1">CHOOSE YOUR <span>ROBOT!</span></h1><p>Two awesome bots. Who’s your favourite?</p></div><div class="cards">${characters.map(c => robotCard(c, robot?.id === c.id)).join('')}</div><div class="selection-footer"><p id="selection-hint">${robot ? `${robot.name} is ready for an adventure!` : 'Tap a robot to team up!'}</p><button class="toy-button" data-action="ready" ${robot ? '' : 'disabled'}>LET’S GO! <span aria-hidden="true">→</span></button></div></section>`;
  if (game.screen === 'ready') app.innerHTML = `<section class="ready-screen"><div class="screen-nav">${back('select')}${steps(2)}</div><div class="screen-heading"><span class="eyebrow">DREAM TEAM? ASSEMBLED.</span><h1 tabindex="-1">READY TO <span>BATTLE!</span></h1><p>You and ${robot.name}. A mighty little team.</p></div><div class="ready-stage ${robot.id}"><span class="celebration c1">✦</span><span class="celebration c2">✦</span><span class="celebration c3">✧</span><span class="ready-halo"></span>${robotArtwork(robot)}<div class="ready-name"><h2>${robot.name}</h2><span>LV ${robot.level} <i>•</i> <b>♥ ${robot.maxHp} HP</b></span></div></div>${button('START BATTLE <span aria-hidden="true">ϟ</span>', 'soon')}<p class="small-note">Adventure looks good on you.</p></section>`;
  if (game.screen === 'soon') app.innerHTML = `<section class="soon-screen"><div class="screen-nav">${back('select')}${steps(3)}</div><div class="soon-panel"><span class="eyebrow pill">GREAT THINGS ARE CHARGING UP</span><div class="battery" aria-hidden="true"><span></span><span></span><span></span><b>ϟ</b></div><h1 tabindex="-1">BATTLES<br><span>COMING SOON!</span></h1><p>${robot.name} is warming up!<br>Our next adventure is still in the workshop.</p><div class="soon-robots">${characters.map(c => robotArtwork(c)).join('')}</div>${button('CHOOSE A ROBOT <span aria-hidden="true">↻</span>', 'select')}<p class="small-note">For now, get to know your team.</p></div></section>`;
  if (focus) { app.querySelector('h1')?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }); }
}
app.addEventListener('click', event => {
  const card = event.target.closest('[data-select]');
  if (card && game.select(card.dataset.select)) {
    chime('select'); render(false);
    const selected = app.querySelector(`[data-select="${game.selected.id}"]`);
    selected.classList.add('celebrate'); selected.focus({ preventScroll: true });
    document.querySelector('#announcement').textContent = `${game.selected.name} selected. Level ${game.selected.level}, ${game.selected.maxHp} HP. Let’s go!`;
    return;
  }
  const target = event.target.closest('[data-action]');
  if (target && game.navigate(target.dataset.action)) { chime(['ready', 'soon'].includes(target.dataset.action) ? 'confirm' : 'click'); render(); }
});
render(false);
