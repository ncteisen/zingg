import CardDataList, {ELEPHANT_CARD_TITLE, LEGACY_CARD_COUNTS} from './CardDataList';
import GameOpts, {VirtualMode} from './GameOpts';

export enum CardPosition {
  UNSET,
  LEFT,
  RIGHT,
}

export enum DeckState {
  // Back of a card.
  BACK,
  // Front of a card.
  FRONT,
  EXHAUSTED,
}

export type SerializedPlayerState = {
  name: string;
  status: string;
  idx: number;
};

export type SerializedGameState = {
  deck: number[];
  deck_idx: number;
  deckState: DeckState;
  players: SerializedPlayerState[];
  player_idx: number;
  pos: CardPosition;
};

export type SerializedMobileGameState = {
  deck: number[];
  deck_idx: number;
  deckState: DeckState;
  pos: CardPosition;
};

// Keep the saved deck intact so changing settings preserves its order and older saves.
// Call before presenting a new or resumed turn, including after a reshuffle.
export function skipElephant<T extends SerializedMobileGameState>(state: T, removeElephant?: boolean): T {
  if (!removeElephant || state.deckState === DeckState.EXHAUSTED ||
      CardDataList[state.deck[state.deck_idx]].title !== ELEPHANT_CARD_TITLE) {
    return state;
  }
  const exhausted = state.deck_idx === state.deck.length - 1;
  return {
    ...state,
    deck_idx: exhausted ? state.deck_idx : state.deck_idx + 1,
    deckState: exhausted ? DeckState.EXHAUSTED : DeckState.BACK,
    pos: CardPosition.UNSET,
  };
}

export function playableCardIndexes(gameOpts: GameOpts) {
  return CardDataList.map(function (_card, idx) {
    return idx;
  }).filter(function (idx) {
    var card = CardDataList[idx];
    return (
      card.mode === VirtualMode.UNSET || card.mode === gameOpts.virtualMode
    );
  });
}

export function shuffleCardIndexes(arr: number[]) {
  var i, j, temp;
  for (i = arr.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

export function createPlayableDeck(gameOpts: GameOpts) {
  return shuffleCardIndexes(playableCardIndexes(gameOpts));
}

function isDeckState(value: unknown): value is DeckState {
  return value === DeckState.BACK || value === DeckState.FRONT || value === DeckState.EXHAUSTED;
}

function isCardPosition(value: unknown): value is CardPosition {
  return (
    value === CardPosition.UNSET ||
    value === CardPosition.LEFT ||
    value === CardPosition.RIGHT
  );
}

function isValidSavedDeck(deck: unknown, gameOpts: GameOpts): deck is number[] {
  if (!Array.isArray(deck) || new Set(deck).size !== deck.length) {
    return false;
  }
  const playableIndexes = playableCardIndexes(gameOpts);
  // Finish older decks in their saved order; new cards join on the next shuffle.
  return [...LEGACY_CARD_COUNTS, CardDataList.length].some(cardCount => {
    const playableSet = new Set(playableIndexes.filter(idx => idx < cardCount));
    return deck.length === playableSet.size && deck.every(idx =>
      Number.isInteger(idx) && playableSet.has(idx));
  });
}

export function isValidSerializedGameState(
  value: unknown,
  playerNames: string[],
  gameOpts: GameOpts
): value is SerializedGameState {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  var state = value as SerializedGameState;

  return (
    isValidSavedDeck(state.deck, gameOpts) &&
    Number.isInteger(state.deck_idx) &&
    state.deck_idx >= 0 &&
    state.deck_idx < state.deck.length &&
    isDeckState(state.deckState) &&
    (state.deckState !== DeckState.EXHAUSTED || state.deck_idx === state.deck.length - 1) &&
    Array.isArray(state.players) &&
    state.players.length === playerNames.length &&
    state.players.every(function (player, idx) {
      return (
        typeof player === 'object' && player !== null &&
        typeof player.name === 'string' &&
        player.name === playerNames[idx] &&
        typeof player.status === 'string' &&
        player.idx === idx
      );
    }) &&
    Number.isInteger(state.player_idx) &&
    state.player_idx >= 0 &&
    state.player_idx < state.players.length &&
    isCardPosition(state.pos) &&
    (state.deckState !== DeckState.FRONT || state.pos !== CardPosition.UNSET)
  );
}

export function isValidSerializedMobileGameState(
  value: unknown,
  gameOpts: GameOpts
): value is SerializedMobileGameState {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  var state = value as SerializedMobileGameState;

  return (
    isValidSavedDeck(state.deck, gameOpts) &&
    Number.isInteger(state.deck_idx) &&
    state.deck_idx >= 0 &&
    state.deck_idx < state.deck.length &&
    isDeckState(state.deckState) &&
    (state.deckState !== DeckState.EXHAUSTED || state.deck_idx === state.deck.length - 1) &&
    isCardPosition(state.pos) &&
    (state.deckState !== DeckState.FRONT || state.pos !== CardPosition.UNSET)
  );
}
