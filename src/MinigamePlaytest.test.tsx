import {act, cleanup, fireEvent, render, screen, within} from '@testing-library/react';
import App from './App';
import Brand from './Brand';
import CardDataList from './CardDataList';
import {CardPosition, DeckState, playableCardIndexes} from './GamePersistence';
import {VirtualMode} from './GameOpts';

const storageKey = 'zingg-game-state-v1';

beforeEach(() => {
  vi.useFakeTimers();
  HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  HTMLDialogElement.prototype.close = function () { this.open = false; };
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  window.localStorage.clear();
  delete window.umami;
});

function openPlaytest() {
  const logo = screen.getByRole('button', {name: 'Zingg'});
  for (let tap = 0; tap < 5; tap++) fireEvent.click(logo);
}

test('five quick logo taps open every interactive card; ordinary taps do nothing', () => {
  render(<Brand />);
  const logo = screen.getByRole('button', {name: 'Zingg'});
  for (let tap = 0; tap < 4; tap++) fireEvent.click(logo);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  act(() => vi.advanceTimersByTime(2001));
  fireEvent.click(logo);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  for (let tap = 0; tap < 4; tap++) fireEvent.click(logo);
  const menu = screen.getByRole('dialog', {name: 'Minigames'});
  for (const card of CardDataList.filter(card => card.interaction)) {
    expect(within(menu).getByRole('button', {name: card.title})).toBeVisible();
  }
  expect(within(menu).getByRole('button', {name: /On Your Frequency/})).toBeVisible();
  fireEvent.click(screen.getByRole('button', {name: 'Close playtest'}));
  expect(logo).toHaveFocus();
  expect(document.body.style.overflow).toBe('');
  fireEvent.click(logo);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('the in-game logo still goes straight home', () => {
  const onHome = vi.fn();
  render(<Brand onHome={onHome} />);
  fireEvent.click(screen.getByRole('button', {name: 'Zingg home'}));
  expect(onHome).toHaveBeenCalledOnce();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test.each([390, 1280])('the home-screen shortcut works at %i px', width => {
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({matches: query === '(max-width: 767px)' && width <= 767,
    addEventListener: vi.fn(), removeEventListener: vi.fn()} as unknown as MediaQueryList)));
  render(<App />);
  openPlaytest();
  expect(screen.getByRole('dialog', {name: 'Minigames'})).toBeVisible();
  fireEvent.click(screen.getByRole('button', {name: 'Undercover'}));
  expect(screen.getByRole('button', {name: 'Deal roles'})).toBeVisible();
  fireEvent.click(screen.getByRole('button', {name: '← All minigames'}));
  expect(screen.getByRole('button', {name: 'Identity Crisis'})).toBeVisible();
});

test('nested minigame Escape leaves the playtest menu open and its scroll lock intact', () => {
  render(<Brand />);
  openPlaytest();
  fireEvent.click(screen.getByRole('button', {name: 'Identity Crisis'}));
  fireEvent.click(screen.getByRole('button', {name: 'Start'}));
  const round = screen.getByRole('dialog', {name: 'Identity Crisis'});
  expect(round).toBeVisible();
  fireEvent(round, new Event('cancel', {bubbles: true, cancelable: true}));
  expect(round).not.toBeInTheDocument();
  expect(screen.getByRole('dialog', {name: 'Minigames'})).toBeVisible();
  expect(screen.getByRole('button', {name: 'Play again'})).toHaveFocus();
  expect(document.body.style.overflow).toBe('hidden');
  fireEvent(screen.getByRole('dialog', {name: 'Minigames'}), new Event('cancel', {cancelable: true}));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(document.body.style.overflow).toBe('');
});

test('playtesting preserves both saved decks and does not emit gameplay analytics', () => {
  const deck = playableCardIndexes({virtualMode: VirtualMode.LIVE});
  const saved = {version: 3, playMode: 'classic', screen: 'HOME', value: '', names: ['Alex', 'Sam'],
    opts: {virtualMode: VirtualMode.LIVE},
    gameState: {deck, deck_idx: 1, deckState: DeckState.FRONT, pos: CardPosition.RIGHT,
      players: [{name: 'Alex', status: '', idx: 0}, {name: 'Sam', status: '', idx: 1}], player_idx: 1},
    mobileGameState: {deck: [...deck].reverse(), deck_idx: 2, deckState: DeckState.BACK, pos: CardPosition.UNSET}};
  const serialized = JSON.stringify(saved);
  window.localStorage.setItem(storageKey, serialized);
  const track = vi.fn();
  window.umami = {track};
  render(<App />);
  openPlaytest();
  fireEvent.click(screen.getByRole('button', {name: 'Undercover'}));
  fireEvent.click(screen.getByRole('button', {name: 'Deal roles'}));
  fireEvent.click(screen.getByRole('button', {name: 'Start round'}));
  for (let player = 0; player < 4; player++) {
    act(() => vi.advanceTimersByTime(700));
    fireEvent.click(screen.getByRole('button', {name: 'Reveal my role'}));
    fireEvent.click(screen.getByRole('button', {name: 'Hide & pass'}));
  }
  fireEvent.click(screen.getByRole('radio', {name: 'Player 1'}));
  fireEvent.click(screen.getByRole('button', {name: 'Reveal undercover'}));
  fireEvent.click(screen.getByRole('button', {name: 'Done'}));
  fireEvent.click(screen.getByRole('button', {name: '← All minigames'}));
  fireEvent.click(screen.getByRole('button', {name: /On Your Frequency/}));
  fireEvent.click(screen.getByRole('button', {name: 'Show secret'}));
  fireEvent.click(screen.getByRole('button', {name: 'Hide & pass'}));
  fireEvent.change(screen.getByRole('slider', {name: 'The group’s guess'}), {target: {value: '42.5'}});
  act(() => vi.advanceTimersByTime(700));
  fireEvent.click(screen.getByRole('button', {name: 'Lock guess'}));
  act(() => vi.advanceTimersByTime(700));
  fireEvent.click(screen.getByRole('button', {name: 'Reveal'}));
  fireEvent.click(screen.getByRole('button', {name: 'Close playtest'}));
  expect(window.localStorage.getItem(storageKey)).toBe(serialized);
  expect(track).not.toHaveBeenCalled();
  expect(screen.getByRole('button', {name: /resume game/i})).toBeVisible();
});

test('Wavelength is testing-only and leaving it discards the private round', () => {
  expect(CardDataList.some(card => /wavelength|frequency/i.test(card.title))).toBe(false);
  render(<Brand />);
  openPlaytest();
  fireEvent.click(screen.getByRole('button', {name: /On Your Frequency/}));
  fireEvent.click(screen.getByRole('button', {name: 'Show secret'}));
  fireEvent.click(screen.getByRole('button', {name: '← All minigames'}));
  expect(screen.queryByText('Secret spot')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name: /On Your Frequency/}));
  expect(screen.getByRole('button', {name: 'Show secret'})).toBeVisible();
  fireEvent(screen.getByRole('dialog'), new Event('cancel', {cancelable: true}));
  expect(screen.getByRole('button', {name: 'Zingg'})).toHaveFocus();
  expect(document.body.style.overflow).toBe('');
});
