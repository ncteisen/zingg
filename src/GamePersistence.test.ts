import CardDataList from './CardDataList';
import {VirtualMode} from './GameOpts';
import {
  CardPosition,
  DeckState,
  isValidSerializedGameState,
  isValidSerializedMobileGameState,
  playableCardIndexes,
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
