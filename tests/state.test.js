import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame } from '../src/state.js';
import { characters } from '../src/data/characters.js';

test('a new game requires a valid selection before confirmation', () => {
  const game = createGame();
  assert.equal(game.screen, 'title'); assert.equal(game.selected, null);
  assert.equal(game.navigate('ready'), false);
  assert.equal(game.select('karat'), false);
  assert.equal(game.navigate('select'), true);
  assert.equal(game.navigate('ready'), false);
  assert.equal(game.select('unknown'), false);
});
test('switching selection carries only the chosen robot through the full flow', () => {
  const game = createGame(); game.navigate('select');
  for (const character of characters) {
    assert.equal(game.select(character.id), true);
    assert.equal(game.selected.id, character.id);
    assert.equal(game.selected.maxHp, character.maxHp);
  }
  assert.equal(game.navigate('ready'), true);
  assert.equal(game.selected.id, 'cano'); assert.equal(game.selected.maxHp, 70);
  assert.equal(game.select('karat'), false);
  assert.equal(game.navigate('soon'), true);
  assert.equal(game.navigate('select'), true);
  assert.equal(game.selected.id, 'cano');
});
test('back from ready preserves selection; home starts a fresh choice', () => {
  const game = createGame(); game.navigate('select'); game.select('karat'); game.navigate('ready');
  assert.equal(game.navigate('select'), true); assert.equal(game.selected.maxHp, 40);
  assert.equal(game.navigate('title'), true); assert.equal(game.selected, null);
  game.navigate('select'); assert.equal(game.navigate('ready'), false);
});
