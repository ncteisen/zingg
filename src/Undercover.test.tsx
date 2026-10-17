import {act, cleanup, fireEvent, render, screen, within} from '@testing-library/react';
import Card from './Card';
import CardDataList from './CardDataList';
import Game from './Game';
import MobileGame from './MobileGame';
import {VirtualMode} from './GameOpts';
import {CardPosition, DeckState, playableCardIndexes} from './GamePersistence';
import {createUndercoverWordPicker, UNDERCOVER_WORDS} from './UndercoverWords';

const card = CardDataList.find(card => card.interaction === 'undercover')!;

beforeEach(() => {
  vi.useFakeTimers();
  // jsdom lacks modal methods; native focus containment is verified in-browser.
  HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  HTMLDialogElement.prototype.close = function () { this.open = false; };
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  delete window.umami;
});

function start(count = 3) {
  fireEvent.click(screen.getByRole('button', {name: 'Deal roles'}));
  fireEvent.change(screen.getByRole('combobox', {name: 'Players'}), {target: {value: count}});
  fireEvent.click(screen.getByRole('button', {name: 'Start round'}));
}

function peek() {
  act(() => vi.advanceTimersByTime(700));
  fireEvent.click(screen.getByRole('button', {name: 'Reveal my role'}));
}

function dealAll(count: number) {
  for (let player = 0; player < count; player++) {
    peek();
    fireEvent.click(screen.getByRole('button', {name: 'Hide & pass'}));
  }
}

test('the word pool is unique and does not repeat within or across cycle boundaries', () => {
  const pick = createUndercoverWordPicker();
  expect(new Set(UNDERCOVER_WORDS).size).toBe(UNDERCOVER_WORDS.length);
  const words = Array.from({length: UNDERCOVER_WORDS.length}, pick);
  expect(new Set(words)).toEqual(new Set(UNDERCOVER_WORDS));
  expect(pick()).not.toBe(words[words.length - 1]);
});

test.each([[3, 0], [3, 0.999], [12, 0], [12, 0.999]])('deals exactly one undercover role among %i players with random %f', (count, random) => {
  vi.spyOn(Math, 'random').mockReturnValue(random);
  render(<Card data={card} />);
  start(count);
  const word = UNDERCOVER_WORDS[Math.floor(random * UNDERCOVER_WORDS.length)];
  const undercover = Math.floor(random * count);
  let secretCount = 0;
  for (let player = 0; player < count; player++) {
    expect(screen.getByRole('heading', {name: `Player ${player + 1} of ${count}`})).toBeVisible();
    expect(screen.queryByText(word, {exact: true})).not.toBeInTheDocument();
    expect(screen.queryByText('You’re undercover.')).not.toBeInTheDocument();
    peek();
    if (player === undercover) {
      expect(screen.getByText('You’re undercover.')).toBeVisible();
      expect(screen.queryByText(word, {exact: true})).not.toBeInTheDocument();
      secretCount++;
    } else {
      expect(screen.getByText(word, {exact: true})).toBeVisible();
      expect(screen.getByText(word, {exact: true}).closest('[aria-live]')).toBeNull();
    }
    fireEvent.click(screen.getByRole('button', {name: 'Hide & pass'}));
  }
  expect(secretCount).toBe(1);
  expect(screen.queryByText(word, {exact: true})).not.toBeInTheDocument();
  expect(screen.getAllByRole('radio')).toHaveLength(count);
  expect(screen.getByRole('button', {name: 'Reveal undercover'})).toBeDisabled();
});

test('handoffs cannot immediately expose the next player through a double tap', () => {
  render(<Card data={card} />);
  start();
  peek();
  fireEvent.click(screen.getByRole('button', {name: 'Hide & pass'}));
  const reveal = screen.getByRole('button', {name: 'Reveal my role'});
  expect(reveal).toBeDisabled();
  fireEvent.click(reveal);
  expect(screen.queryByText('Your secret')).not.toBeInTheDocument();
  act(() => vi.advanceTimersByTime(699));
  expect(reveal).toBeDisabled();
  act(() => vi.advanceTimersByTime(1));
  expect(reveal).toBeEnabled();
});

test.each([1, 2])('voting for Player %i reveals the right outcome and replay hides it', suspect => {
  vi.spyOn(Math, 'random').mockReturnValue(0);
  const track = vi.fn();
  window.umami = {track};
  render(<Card data={card} />);
  start();
  dealAll(3);
  fireEvent.click(screen.getByRole('radio', {name: `Player ${suspect}`}));
  expect(screen.queryByText('Airport')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name: 'Reveal undercover'}));
  expect(screen.getByRole('heading', {name: suspect === 1 ? 'Caught!' : 'They got away.'})).toBeVisible();
  expect(screen.getByText('Player 1 was undercover.')).toBeVisible();
  expect(screen.getByText(suspect === 1 ? 'Player 1 drinks.' : 'Everyone except Player 1 drinks.')).toBeVisible();
  expect(track).toHaveBeenCalledWith('interactive_round_finished', {card_title: 'Undercover', player_count: 3, caught: suspect === 1});
  expect(JSON.stringify(track.mock.calls)).not.toContain('Airport');
  fireEvent.click(screen.getByRole('button', {name: 'Play again'}));
  expect(screen.getByRole('heading', {name: 'Player 1 of 3'})).toBeVisible();
  expect(screen.queryByText('Player 1 was undercover.')).not.toBeInTheDocument();
  peek();
  fireEvent.click(screen.getByRole('button', {name: 'Hide & pass'}));
  peek();
  expect(screen.getByText('Wedding', {exact: true})).toBeVisible();
});

test('backgrounding hides the secret and preserves the same player and role', () => {
  vi.spyOn(Math, 'random').mockReturnValue(0.5);
  render(<Card data={card} />);
  start();
  peek();
  const word = screen.getByText('Penguin', {exact: true});
  expect(word).toBeVisible();
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
  fireEvent(document, new Event('visibilitychange'));
  expect(word).not.toBeInTheDocument();
  expect(screen.getByRole('heading', {name: 'Player 1 of 3'})).toBeVisible();
  peek();
  expect(screen.getByText('Penguin', {exact: true})).toBeVisible();
});

test('Escape hides a role before confirming exit, then restores focus and clears timers', () => {
  render(<Card data={card} />);
  start();
  peek();
  fireEvent(screen.getByRole('dialog'), new Event('cancel', {cancelable: true}));
  expect(screen.getByRole('heading', {name: 'End this round?'})).toBeVisible();
  expect(screen.queryByText('Your secret')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name: 'Keep playing'}));
  expect(screen.getByRole('button', {name: 'Reveal my role'})).toBeDisabled();
  fireEvent.click(screen.getByRole('button', {name: 'End round'}));
  fireEvent.click(screen.getByRole('button', {name: 'End round'}));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByRole('button', {name: 'Deal roles'})).toHaveFocus();
  expect(document.body.style.overflow).toBe('');
  act(() => vi.runOnlyPendingTimers());
  expect(vi.getTimerCount()).toBe(0);
});

test('setup limits the group size and unmount removes the modal and handoff timer', () => {
  const {unmount} = render(<Card data={card} />);
  fireEvent.click(screen.getByRole('button', {name: 'Deal roles'}));
  expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual(['3', '4', '5', '6', '7', '8', '9', '10', '11', '12']);
  fireEvent.click(screen.getByRole('button', {name: 'Start round'}));
  unmount();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(document.body.style.overflow).toBe('');
  act(() => vi.runOnlyPendingTimers());
  expect(vi.getTimerCount()).toBe(0);
});

test.each(['classic', 'mobile'])('the %s deck advances only after the round is closed and Next player is pressed', mode => {
  const opts = {virtualMode: VirtualMode.LIVE};
  const index = CardDataList.indexOf(card);
  const deck = [index, ...playableCardIndexes(opts).filter(idx => idx !== index)];
  const state = {deck, deck_idx: 0, deckState: DeckState.BACK, pos: CardPosition.UNSET};
  const onChange = vi.fn();
  if (mode === 'classic') {
    const names = ['Alex', 'Sam', 'Jo'];
    render(<Game player_names={names} gameOpts={opts}
      initialGameState={{...state, players: names.map((name, idx) => ({name, idx, status: ''})), player_idx: 0}}
      onGameStateChange={onChange} onResetRequest={() => {}} />);
  } else render(<MobileGame initialGameState={state} onGameStateChange={onChange} onResetRequest={() => {}} />);
  fireEvent.click(screen.getByRole('button', {name: /^(flip )?card b$/i}));
  start();
  dealAll(3);
  fireEvent.click(screen.getByRole('radio', {name: 'Player 1'}));
  fireEvent.click(screen.getByRole('button', {name: 'Reveal undercover'}));
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', {name: 'Done'}));
  expect(onChange.mock.lastCall![0]).toMatchObject({deck_idx: 0, deckState: DeckState.FRONT});
  fireEvent.click(screen.getByRole('button', {name: /next player/i}));
  expect(onChange.mock.lastCall![0]).toMatchObject({deck_idx: 1, deckState: DeckState.BACK});
  expect(playableCardIndexes({virtualMode: VirtualMode.VIRTUAL})).not.toContain(index);
});
