import { characters } from './data/characters.js';
export function createGame() {
  let screen = 'title';
  let selectedId = null;
  return {
    get screen() { return screen; },
    get selected() { return characters.find(c => c.id === selectedId) ?? null; },
    select(id) { if (screen !== 'select' || !characters.some(c => c.id === id)) return false; selectedId = id; return true; },
    navigate(next) {
      const routes = { title: ['select'], select: ['title', 'ready'], ready: ['select', 'soon', 'title'], soon: ['select', 'title'] };
      if (!routes[screen].includes(next) || (['ready', 'soon'].includes(next) && !selectedId)) return false;
      if (next === 'title') selectedId = null;
      screen = next; return true;
    }
  };
}
