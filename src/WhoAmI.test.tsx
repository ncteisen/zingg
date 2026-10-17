import {act, cleanup, fireEvent, render, screen} from '@testing-library/react';
import Card from './Card';
import CardDataList from './CardDataList';
import Game from './Game';
import MobileGame from './MobileGame';
import {VirtualMode} from './GameOpts';
import {CardPosition, DeckState, playableCardIndexes} from './GamePersistence';
import {createIdentityPicker, WHO_AM_I_NAMES} from './WhoAmINames';

const card = CardDataList.find(card => card.interaction === 'who-am-i')!;

beforeEach(() => {
  vi.useFakeTimers();
  // jsdom lacks modal dialog methods; real focus containment is checked in-browser.
  HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  HTMLDialogElement.prototype.close = function () { this.open = false; };
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

test('unique identities are drawn without replacement or a repeat between cycles', () => {
  expect(new Set(WHO_AM_I_NAMES).size).toBe(WHO_AM_I_NAMES.length);
  const pick = createIdentityPicker();
  const firstCycle = Array.from({length: WHO_AM_I_NAMES.length}, pick);
  expect(new Set(firstCycle)).toEqual(new Set(WHO_AM_I_NAMES));
  expect(pick()).not.toBe(firstCycle[firstCycle.length - 1]);
});

test('keeps the answer out of the DOM for the full three-second countdown', () => {
  vi.spyOn(Math, 'random').mockReturnValue(0);
  render(<Card data={card} />);
  fireEvent.click(screen.getByRole('button', {name: 'Start'}));
  expect(screen.getByRole('dialog', {name: 'Identity Crisis'})).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent('3');
  expect(screen.queryByText('Beyoncé')).not.toBeInTheDocument();
  act(() => vi.advanceTimersByTime(1000));
  expect(screen.getByRole('status')).toHaveTextContent('2');
  act(() => vi.advanceTimersByTime(1000));
  expect(screen.getByRole('status')).toHaveTextContent('1');
  act(() => vi.advanceTimersByTime(999));
  expect(screen.queryByText('Beyoncé')).not.toBeInTheDocument();
  act(() => vi.advanceTimersByTime(1));
  expect(screen.getByText('Beyoncé')).toBeVisible();
  expect(screen.getByText('Beyoncé').closest('[aria-live]')).toBeNull();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(vi.getTimerCount()).toBe(0);
  fireEvent.click(screen.getByRole('button', {name: 'Done'}));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.queryByText('Beyoncé')).not.toBeInTheDocument();
  expect(screen.getByRole('button', {name: 'Play again'})).toHaveFocus();
  fireEvent.click(screen.getByRole('button', {name: 'Play again'}));
  expect(screen.getByRole('status')).toHaveTextContent('3');
  act(() => vi.advanceTimersByTime(3000));
  expect(screen.getByText('Taylor Swift')).toBeVisible();
});

test.each(['button', 'escape', 'unmount', 'background'])('%s cancels and cleans up the round', method => {
  const interval = vi.spyOn(window, 'setInterval');
  const clearInterval = vi.spyOn(window, 'clearInterval');
  const {unmount} = render(<Card data={card} />);
  fireEvent.click(screen.getByRole('button', {name: 'Start'}));
  act(() => vi.advanceTimersByTime(1000));
  if (method === 'button') fireEvent.click(screen.getByRole('button', {name: 'Cancel'}));
  if (method === 'escape') fireEvent(screen.getByRole('dialog'), new Event('cancel', {cancelable: true}));
  if (method === 'unmount') unmount();
  if (method === 'background') {
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    fireEvent(document, new Event('visibilitychange'));
  }
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(document.body.style.overflow).toBe('');
  expect(clearInterval).toHaveBeenCalledWith(interval.mock.results[0].value);
  act(() => vi.advanceTimersByTime(5000));
  expect(screen.queryByText(WHO_AM_I_NAMES[0])).not.toBeInTheDocument();
});

test.each(['classic', 'mobile'])('plays inside %s without advancing the deck until Next player', mode => {
  const opts = {virtualMode: VirtualMode.LIVE};
  const index = CardDataList.indexOf(card);
  const deck = [index, ...playableCardIndexes(opts).filter(idx => idx !== index)];
  const state = {deck, deck_idx: 0, deckState: DeckState.BACK, pos: CardPosition.UNSET};
  const onChange = vi.fn();
  if (mode === 'classic') {
    render(<Game player_names={['Alex', 'Sam']} gameOpts={opts}
      initialGameState={{...state, players: [{name: 'Alex', status: '', idx: 0}, {name: 'Sam', status: '', idx: 1}], player_idx: 0}}
      onGameStateChange={onChange} onResetRequest={() => {}} />);
  } else {
    render(<MobileGame initialGameState={state} onGameStateChange={onChange} onResetRequest={() => {}} />);
  }
  fireEvent.click(screen.getByRole('button', {name: /^(flip )?card a$/i}));
  fireEvent.click(screen.getByRole('button', {name: 'Start'}));
  act(() => vi.advanceTimersByTime(3000));
  fireEvent.click(screen.getByRole('button', {name: 'Done'}));
  expect(onChange.mock.lastCall![0]).toMatchObject({deck_idx: 0, deckState: DeckState.FRONT});
  fireEvent.click(screen.getByRole('button', {name: /next player/i}));
  expect(onChange.mock.lastCall![0]).toMatchObject({deck_idx: 1, deckState: DeckState.BACK});
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(playableCardIndexes({virtualMode: VirtualMode.VIRTUAL})).not.toContain(index);
});
