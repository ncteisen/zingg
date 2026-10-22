import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import CardDataList from './CardDataList';
import Game from './Game';
import MobileGame from './MobileGame';
import {VirtualMode} from './GameOpts';
import {
  CardPosition, DeckState, playableCardIndexes,
  SerializedGameState, SerializedMobileGameState,
} from './GamePersistence';

const opts = {virtualMode: VirtualMode.LIVE};
const fullDeck = playableCardIndexes(opts);
const categoriesIndex = CardDataList.findIndex(card => card.title === 'Categories');
const undercoverIndex = CardDataList.findIndex(card => card.interaction === 'undercover');
const names = ['Alex', 'Sam'];

afterEach(() => {cleanup(); vi.restoreAllMocks();});

function classicState(deck = fullDeck, playerNames = names): SerializedGameState {
  return {deck, deck_idx: 0, deckState: DeckState.BACK, pos: CardPosition.UNSET,
    player_idx: 0, players: playerNames.map((name, idx) => ({name, idx, status: ''}))};
}

function renderMode(mode: string, initialState: SerializedGameState, playerNames = names) {
  const onChange = vi.fn();
  const element = (state: SerializedMobileGameState) => mode === 'classic'
    ? <Game player_names={playerNames} gameOpts={opts} initialGameState={state as SerializedGameState}
      onGameStateChange={onChange} onResetRequest={() => {}} onSwitchMode={() => {}} />
    : <MobileGame initialGameState={state} onGameStateChange={onChange}
      onResetRequest={() => {}} onSwitchMode={() => {}} />;
  const view = render(element(initialState));
  return {onChange, rerenderSaved: () => view.rerender(element(onChange.mock.lastCall![0]))};
}

test.each(['classic', 'mobile'])('%s focuses public headings on reveal/next without stealing focus on saved-prop updates', mode => {
  const deck = [categoriesIndex, ...fullDeck.filter(idx => idx !== categoriesIndex)];
  const {rerenderSaved} = renderMode(mode, classicState(deck));
  const choice = screen.getByRole('button', {name: mode === 'classic' ? 'Flip card A' : 'Card A'});
  choice.focus();
  fireEvent.click(choice);
  expect(screen.getByRole('heading', {name: 'Categories'})).toHaveFocus();
  const hint = screen.getByRole('button', {name: 'Hint'});
  hint.focus();
  rerenderSaved();
  expect(hint).toHaveFocus();
  fireEvent.click(screen.getByRole('button', {name: /next player/i}));
  expect(screen.getByRole('heading', {name: mode === 'classic' ? 'Sam’s turn.' : 'Pick A or B.'})).toHaveFocus();
});

test.each(['classic', 'mobile'])('%s focuses exhaustion and reshuffle destinations', mode => {
  const deck = [...fullDeck.filter(idx => idx !== categoriesIndex), categoriesIndex];
  const initial = {...classicState(deck), deck_idx: deck.length - 1, deckState: DeckState.FRONT, pos: CardPosition.LEFT};
  renderMode(mode, initial);
  fireEvent.click(screen.getByRole('button', {name: /next player/i}));
  expect(screen.getByRole('heading', {name: 'Deck exhausted!'})).toHaveFocus();
  fireEvent.click(screen.getByRole('button', {name: /reshuffle and continue/i}));
  expect(screen.getByRole('heading', {name: mode === 'classic' ? 'Sam’s turn.' : 'Pick A or B.'})).toHaveFocus();
});

test.each([DeckState.BACK, DeckState.FRONT])('two-player classic resume skips Undercover in state %s without spending a turn', deckState => {
  const deck = [undercoverIndex, categoriesIndex, ...fullDeck.filter(idx => idx !== undercoverIndex && idx !== categoriesIndex)];
  const initial = {...classicState(deck), deckState, pos: deckState === DeckState.FRONT ? CardPosition.RIGHT : CardPosition.UNSET};
  const {onChange} = renderMode('classic', initial);
  expect(onChange.mock.lastCall![0]).toEqual({...initial, deck_idx: 1, deckState: DeckState.BACK, pos: CardPosition.UNSET});
  fireEvent.click(screen.getByRole('button', {name: 'Flip card A'}));
  expect(screen.getByRole('heading', {name: 'Categories'})).toHaveFocus();
  expect(screen.getByRole('heading', {name: 'Alex’s turn.'})).toBeInTheDocument();
});

test('two-player classic skips an upcoming Undercover and retains the next player across reshuffle', () => {
  const deck = [...fullDeck.filter(idx => idx !== categoriesIndex && idx !== undercoverIndex), categoriesIndex, undercoverIndex];
  const initial = {...classicState(deck), deck_idx: deck.length - 2, deckState: DeckState.FRONT, pos: CardPosition.LEFT};
  const {onChange} = renderMode('classic', initial);
  fireEvent.click(screen.getByRole('button', {name: /next player/i}));
  const exhausted = onChange.mock.lastCall![0] as SerializedGameState;
  expect(exhausted).toMatchObject({deck, deck_idx: deck.length - 1, deckState: DeckState.EXHAUSTED, player_idx: 1});
  // Place Undercover first without removing any deck entry.
  let shuffleIndex = fullDeck.length;
  vi.spyOn(Math, 'random').mockImplementation(() => --shuffleIndex === fullDeck.indexOf(undercoverIndex) ? 0 : 0.99999);
  fireEvent.click(screen.getByRole('button', {name: /reshuffle and continue/i}));
  const restarted = onChange.mock.lastCall![0] as SerializedGameState;
  expect(restarted.deck[0]).toBe(undercoverIndex);
  expect(restarted).toMatchObject({deck_idx: 1, deckState: DeckState.BACK, player_idx: 1});
  expect([...restarted.deck].sort()).toEqual([...fullDeck].sort());
  expect(screen.getByRole('heading', {name: 'Sam’s turn.'})).toHaveFocus();
});

test.each(['classic', 'mobile'])('%s retains Undercover for a compatible or unknown roster and explains its minimum', mode => {
  const threePlayers = [...names, 'Jo'];
  const deck = [undercoverIndex, ...fullDeck.filter(idx => idx !== undercoverIndex)];
  renderMode(mode, classicState(deck, threePlayers), threePlayers);
  fireEvent.click(screen.getByRole('button', {name: mode === 'classic' ? 'Flip card B' : 'Card B'}));
  expect(screen.getByRole('heading', {name: 'Undercover'})).toHaveFocus();
  expect(screen.getByText(/For 3–12 players\. Pass the phone/)).toBeInTheDocument();
  expect(screen.getByRole('button', {name: /next player/i})).toBeInTheDocument();
});
