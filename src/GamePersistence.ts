import CardDataList from './CardDataList';
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

function isDeckState(value: unknown): value is DeckState {
  return value === DeckState.BACK || value === DeckState.FRONT;
}

function isCardPosition(value: unknown): value is CardPosition {
  return (
    value === CardPosition.UNSET ||
    value === CardPosition.LEFT ||
    value === CardPosition.RIGHT
  );
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
  var playableIndexes = playableCardIndexes(gameOpts);
  var playableSet = new Set(playableIndexes);

  return (
    Array.isArray(state.deck) &&
    state.deck.length === playableIndexes.length &&
    new Set(state.deck).size === playableIndexes.length &&
    state.deck.every(function (idx) {
      return (
        Number.isInteger(idx) &&
        idx >= 0 &&
        idx < CardDataList.length &&
        playableSet.has(idx)
      );
    }) &&
    Number.isInteger(state.deck_idx) &&
    state.deck_idx >= 0 &&
    state.deck_idx < state.deck.length &&
    isDeckState(state.deckState) &&
    Array.isArray(state.players) &&
    state.players.length === playerNames.length &&
    state.players.every(function (player, idx) {
      return (
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
