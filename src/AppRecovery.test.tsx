import {act, cleanup, fireEvent, render, screen} from '@testing-library/react';
import App from './App';
import CardDataList from './CardDataList';
import {CardPosition, DeckState, playableCardIndexes} from './GamePersistence';
import {VirtualMode} from './GameOpts';

const key = 'zingg-game-state-v1';
const recoveryKey = 'zingg-game-state-recovery-v1';

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(console, 'log').mockImplementation(() => {});
  Object.defineProperty(window, 'matchMedia', {configurable: true, value: () => ({matches: false})});
});
afterEach(() => {cleanup(); vi.restoreAllMocks();});

function savedGames() {
  const names = ['Alex', 'Sam'];
  const deck = playableCardIndexes({virtualMode: VirtualMode.LIVE});
  return {version: 3, screen: 'GAME', playMode: 'classic', value: 'Unfinished name', names,
    opts: {virtualMode: VirtualMode.LIVE, removeElephant: true},
    gameState: {deck, deck_idx: 0, deckState: DeckState.BACK, pos: CardPosition.UNSET,
      player_idx: 0, players: names.map((name, idx) => ({name, idx, status: ''}))},
    mobileGameState: {deck: [...deck].reverse(), deck_idx: 1, deckState: DeckState.FRONT, pos: CardPosition.RIGHT},
  };
}

function write(saved: unknown) {localStorage.setItem(key, JSON.stringify(saved));}
function read() {return JSON.parse(localStorage.getItem(key)!);}
function choose(mode: 'classic' | 'mobile') {
  fireEvent.click(screen.getByRole('radio', {name: mode === 'classic' ? /shared screen/i : /pass the phone/i}));
  fireEvent.click(screen.getByRole('button', {name: /^(start|resume) game/i}));
}

test.each(['classic', 'mobile'])('a damaged active %s game preserves the other game, input, and options', mode => {
  const saved = savedGames();
  if (mode === 'classic') saved.gameState.deck_idx = 10000;
  else {
    saved.screen = 'MOBILE_GAME'; saved.playMode = 'mobile'; saved.mobileGameState.deck_idx = 10000;
  }
  const original = JSON.stringify(saved);
  write(saved);
  render(<App />);
  expect(screen.getByText(/Some saved progress could not be restored/)).toHaveAttribute('role', 'status');
  expect(localStorage.getItem(recoveryKey)).toBe(original);
  fireEvent.click(screen.getByRole('button', {name: mode === 'classic' ? 'Zingg home' : 'Choose game mode'}));
  choose(mode === 'classic' ? 'mobile' : 'classic');
  const restored = read();
  const healthyKey = mode === 'classic' ? 'mobileGameState' : 'gameState';
  expect(restored[healthyKey]).toEqual(saved[healthyKey]);
  expect(restored.names).toEqual(saved.names);
  expect(restored.value).toBe(saved.value);
  expect(restored.opts).toEqual(saved.opts);
});

test.each([['   ', 'Sam'], {bad: 'roster'}])('legacy or malformed roster %j cannot erase a healthy mobile save', names => {
  const saved = {...savedGames(), version: 2, screen: 'MOBILE_GAME', playMode: 'mobile', names};
  write(saved);
  render(<App />);
  expect(screen.getByRole('button', {name: /next player/i})).toBeInTheDocument();
  expect(read().mobileGameState).toEqual(saved.mobileGameState);
  expect(read().opts).toEqual(saved.opts);
  expect(localStorage.getItem(recoveryKey)).toBe(JSON.stringify(saved));
});

test('normalizing legacy whitespace preserves the classic deck, player order, and statuses', () => {
  const saved = savedGames();
  saved.names = [' Alex ', ' Sam '];
  saved.gameState.players = saved.names.map((name, idx) => ({name, idx, status: idx === 1 ? 'Legacy status' : ''}));
  saved.gameState.player_idx = 1;
  write(saved);
  render(<App />);
  expect(screen.getByRole('heading', {name: 'Sam’s turn.'})).toBeInTheDocument();
  expect(read().gameState).toEqual({...saved.gameState,
    players: saved.gameState.players.map(player => ({...player, name: player.name.trim()}))});
});

test.each(['', 'alex'])('repairing an invalid restored name %j preserves the saved round', badName => {
  const saved = savedGames();
  saved.names = [' Alex ', badName];
  saved.gameState.players = saved.names.map((name, idx) => ({name, idx, status: ''}));
  saved.gameState.player_idx = 1;
  saved.gameState.deck_idx = 2;
  saved.gameState.deckState = DeckState.FRONT;
  saved.gameState.pos = CardPosition.LEFT;
  write(saved);
  render(<App />);
  expect(screen.getByRole('heading', {name: 'Build the table.'})).toBeInTheDocument();
  expect(screen.queryByRole('button', {name: /^(start|resume) game/i})).not.toBeInTheDocument();
  expect(screen.queryByRole('button', {name: /^remove /i})).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name: badName ? 'Edit alex' : 'Edit player 2'}));
  fireEvent.change(screen.getByRole('textbox', {name: badName ? 'Rename alex' : 'Rename player 2'}), {target: {value: 'Sam'}});
  fireEvent.click(screen.getByRole('button', {name: 'Save name'}));
  fireEvent.click(screen.getByRole('button', {name: 'Resume game'}));
  expect(screen.getByRole('heading', {name: 'Sam’s turn.'})).toBeInTheDocument();
  expect(screen.getByRole('heading', {name: CardDataList[saved.gameState.deck[2]].title})).toBeInTheDocument();
  expect(read().gameState).toEqual({...saved.gameState,
    players: [{name: 'Alex', idx: 0, status: ''}, {name: 'Sam', idx: 1, status: ''}]});
  expect(read().mobileGameState).toEqual(saved.mobileGameState);
});

test('home remembers mobile mode across return, radio changes, and reload', () => {
  const saved = savedGames();
  saved.playMode = 'mobile'; saved.screen = 'MOBILE_GAME';
  write(saved);
  const view = render(<App />);
  fireEvent.click(screen.getByRole('button', {name: 'Zingg home'}));
  expect(screen.getByRole('radio', {name: /pass the phone/i})).toBeChecked();
  expect(screen.getByRole('button', {name: /resume game/i})).toBeInTheDocument();
  fireEvent.click(screen.getByRole('radio', {name: /shared screen/i}));
  expect(read().playMode).toBe('classic');
  fireEvent.click(screen.getByRole('radio', {name: /pass the phone/i}));
  view.unmount();
  render(<App />);
  expect(screen.getByRole('radio', {name: /pass the phone/i})).toBeChecked();
  expect(read().mobileGameState).toEqual(saved.mobileGameState);
});

test('a stale tab cannot resurrect a game reset elsewhere, even before its storage event arrives', () => {
  write(savedGames());
  render(<App />);
  localStorage.removeItem(key);
  fireEvent.click(screen.getByRole('button', {name: 'Flip card A'}));
  expect(localStorage.getItem(key)).toBeNull();
  expect(screen.getByRole('status')).toHaveTextContent(/another tab changed/i);
  fireEvent.click(screen.getByRole('button', {name: /next player/i}));
  expect(localStorage.getItem(key)).toBeNull();
  fireEvent.click(screen.getByRole('button', {name: 'Load saved game'}));
  expect(screen.getByRole('heading', {name: /Drink with your idiot friends/})).toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(localStorage.getItem(key)).toBeNull();
});

test('loading an externally changed save remounts the active game at its new turn', () => {
  const saved = savedGames();
  write(saved);
  render(<App />);
  const changed = {...saved, gameState: {...saved.gameState, player_idx: 1, deck_idx: 2}};
  write(changed);
  act(() => window.dispatchEvent(new StorageEvent('storage', {key, newValue: JSON.stringify(changed)})));
  expect(screen.getByRole('status')).toHaveTextContent(/another tab changed/i);
  fireEvent.click(screen.getByRole('button', {name: 'Load saved game'}));
  expect(screen.getByRole('heading', {name: 'Sam’s turn.'})).toBeInTheDocument();
  expect(read().gameState).toEqual(changed.gameState);
  fireEvent.click(screen.getByRole('button', {name: 'Flip card B'}));
  expect(screen.getByRole('heading', {name: CardDataList[changed.gameState.deck[2]].title})).toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

test('replacing the newer save requires choosing Save this game instead', () => {
  const saved = savedGames();
  write(saved);
  render(<App />);
  localStorage.removeItem(key);
  fireEvent.click(screen.getByRole('button', {name: 'Flip card A'}));
  fireEvent.click(screen.getByRole('button', {name: 'Save this game instead'}));
  expect(read().gameState).toEqual({...saved.gameState, deckState: DeckState.FRONT, pos: CardPosition.LEFT});
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

test('reset in a stale tab leaves another tab’s newer save untouched', () => {
  const saved = savedGames();
  write(saved);
  render(<App />);
  const changed = {...saved, gameState: {...saved.gameState, player_idx: 1, deck_idx: 2}};
  write(changed);
  fireEvent.click(screen.getByRole('button', {name: 'Reset game'}));
  fireEvent.click(screen.getByRole('dialog').querySelectorAll('button')[1]);
  expect(read()).toEqual(changed);
  expect(screen.getByRole('status')).toHaveTextContent(/another tab changed/i);
});

test('initial state and its write baseline come from the same storage read', () => {
  const saved = savedGames();
  const changed = {...saved, gameState: {...saved.gameState, player_idx: 1, deck_idx: 2}};
  write(saved);
  const getItem = window.localStorage.getItem.bind(window.localStorage);
  let firstRead = true;
  vi.spyOn(window.localStorage, 'getItem').mockImplementation(storageKey => {
    const value = getItem(storageKey);
    if (storageKey === key && firstRead) {
      firstRead = false;
      write(changed);
    }
    return value;
  });
  render(<App />);
  expect(screen.getByRole('heading', {name: 'Alex’s turn.'})).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name: 'Flip card A'}));
  expect(read()).toEqual(changed);
  expect(screen.getByText(/Another tab changed/)).toBeInTheDocument();
});

test('a failed explicit reload keeps the current in-memory game and conflict choices', () => {
  write(savedGames());
  render(<App />);
  localStorage.removeItem(key);
  fireEvent.click(screen.getByRole('button', {name: 'Flip card A'}));
  vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {throw new Error('Storage denied');});
  fireEvent.click(screen.getByRole('button', {name: 'Load saved game'}));
  expect(screen.getByText(/Saving is unavailable/)).toBeInTheDocument();
  expect(screen.getByRole('button', {name: 'Save this game instead'})).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name: /next player/i}));
  expect(screen.getByRole('heading', {name: 'Sam’s turn.'})).toBeInTheDocument();
});

test('loading another lobby discards a stale open rename draft', () => {
  const saved = {...savedGames(), screen: 'LOBBY', gameState: undefined};
  write(saved);
  render(<App />);
  fireEvent.click(screen.getByRole('button', {name: 'Edit Alex'}));
  fireEvent.change(screen.getByRole('textbox', {name: 'Rename Alex'}), {target: {value: 'Old draft'}});
  const changed = {...saved, names: ['Jo', 'Sam']};
  write(changed);
  act(() => window.dispatchEvent(new StorageEvent('storage', {key, newValue: JSON.stringify(changed)})));
  fireEvent.click(screen.getByRole('button', {name: 'Load saved game'}));
  expect(screen.queryByRole('button', {name: 'Save name'})).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name: 'Edit Jo'}));
  expect(screen.getByRole('textbox', {name: 'Rename Jo'})).toHaveValue('Jo');
});

test('explicit reset clears the local recovery copy too', () => {
  const saved = savedGames();
  saved.gameState.deck_idx = 10000;
  write(saved);
  render(<App />);
  expect(localStorage.getItem(recoveryKey)).not.toBeNull();
  fireEvent.click(screen.getByRole('button', {name: 'Reset game'}));
  fireEvent.click(screen.getByRole('dialog').querySelectorAll('button')[1]);
  expect(localStorage.getItem(recoveryKey)).toBeNull();
});

test('removing an earlier player cannot assign an open rename draft to another player', () => {
  write({...savedGames(), screen: 'LOBBY', gameState: undefined, names: ['Alex', 'Sam', 'Jo']});
  render(<App />);
  fireEvent.click(screen.getByRole('button', {name: 'Edit Sam'}));
  fireEvent.change(screen.getByRole('textbox', {name: 'Rename Sam'}), {target: {value: 'New Sam'}});
  fireEvent.click(screen.getByRole('button', {name: 'Remove Alex'}));
  expect(screen.queryByRole('button', {name: 'Save name'})).not.toBeInTheDocument();
  expect(read().names).toEqual(['Sam', 'Jo']);
  fireEvent.click(screen.getByRole('button', {name: 'Edit Jo'}));
  expect(screen.getByRole('textbox', {name: 'Rename Jo'})).toHaveValue('Jo');
});
