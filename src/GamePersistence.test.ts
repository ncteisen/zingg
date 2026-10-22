import CardDataList from './CardDataList';
import {VirtualMode} from './GameOpts';
import {
  CardPosition,
  DeckState,
  isValidSerializedGameState,
  isValidSerializedMobileGameState,
  playableCardIndexes,
  skipUnavailableCards,
} from './GamePersistence';

const opts = {virtualMode: VirtualMode.LIVE};
const currentDeck = playableCardIndexes(opts);
const oldDeck = currentDeck.filter(idx => idx < 64);
const virtualOnlyIndex = CardDataList.findIndex(card => card.mode === VirtualMode.VIRTUAL);

test.each([
  ['empty', []],
  ['incomplete old deck', oldDeck.slice(1)],
  ['missing original card', currentDeck.slice(1)],
  ['duplicate card', [oldDeck[1], ...oldDeck.slice(1)]],
  ['wrong mode', [virtualOnlyIndex, ...oldDeck.slice(1)]],
  ['out of range', [CardDataList.length, ...oldDeck.slice(1)]],
  ['fractional index', [0.5, ...oldDeck.slice(1)]],
  ['string index', [String(oldDeck[0]), ...oldDeck.slice(1)]],
  ['not an array', null],
])('rejects %s without mistaking it for a legacy deck', (_label, deck) => {
  const state = {
    deck, deck_idx: 0, deckState: DeckState.BACK, pos: CardPosition.UNSET,
    players: [{name: 'Alex', status: '', idx: 0}, {name: 'Sam', status: '', idx: 1}],
    player_idx: 0,
  };
  expect(isValidSerializedGameState(state, ['Alex', 'Sam'], opts)).toBe(false);
  expect(isValidSerializedMobileGameState(state, opts)).toBe(false);
});

const undercoverIndex = CardDataList.findIndex(card => card.interaction === 'undercover');
const elephantIndex = CardDataList.findIndex(card => card.title === 'Elephant in the Room');
const supportedIndexes = currentDeck.filter(idx => idx !== undercoverIndex && idx !== elephantIndex);

test('eligibility skips consecutive unavailable cards without changing the saved deck or player turn', () => {
  const deck = [undercoverIndex, elephantIndex, ...supportedIndexes];
  const state = {deck, deck_idx: 0, deckState: DeckState.FRONT, pos: CardPosition.LEFT, player_idx: 1};
  const next = skipUnavailableCards(state, {playerCount: 2, removeElephant: true});
  expect(next).toEqual({...state, deck_idx: 2, deckState: DeckState.BACK, pos: CardPosition.UNSET});
  expect(next.deck).toBe(deck);
  expect(state.deck_idx).toBe(0);
  expect(isValidSerializedMobileGameState(next, opts)).toBe(true);
});

test('eligibility exhausts a saved deck when all remaining cards are unavailable', () => {
  const deck = [...supportedIndexes, elephantIndex, undercoverIndex];
  const state = {deck, deck_idx: deck.length - 2, deckState: DeckState.BACK, pos: CardPosition.UNSET};
  const next = skipUnavailableCards(state, {playerCount: 2, removeElephant: true});
  expect(next.deck).toBe(deck);
  expect(next.deck_idx).toBe(deck.length - 1);
  expect(next.deckState).toBe(DeckState.EXHAUSTED);
  expect(isValidSerializedMobileGameState(next, opts)).toBe(true);
});

test('Undercover stays available for a known three-player table and a rosterless mobile game', () => {
  const state = {deck: [undercoverIndex, ...currentDeck.filter(idx => idx !== undercoverIndex)],
    deck_idx: 0, deckState: DeckState.BACK, pos: CardPosition.UNSET};
  expect(skipUnavailableCards(state, {playerCount: 3})).toBe(state);
  expect(skipUnavailableCards(state, {})).toBe(state);
});
