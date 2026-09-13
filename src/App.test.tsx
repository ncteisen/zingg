import {cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import App from './App';
import CardDataList from './CardDataList';
import {CardType} from './Card';
import {VirtualMode} from './GameOpts';
import {CardPosition, DeckState} from './GamePersistence';

const STORAGE_KEY = 'zingg-game-state-v1';
const desktopWidth = 1024;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  delete window.umami;
  window.localStorage.clear();
  window.history.pushState({}, '', '/');
  setViewportWidth(desktopWidth);
});

function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: width,
    writable: true,
  });
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: function (query: string) {
      return {
        matches: query === '(max-width: 767px)' ? width <= 767 : false,
        media: query,
        onchange: null,
        addEventListener: function () {},
        removeEventListener: function () {},
        addListener: function () {},
        removeListener: function () {},
        dispatchEvent: function () {
          return false;
        },
      } as MediaQueryList;
    },
    writable: true,
  });
}

function openLobby() {
  render(<App />);
  fireEvent.click(screen.getByRole('button', {name: /classic game/i}));
}

function addPlayer(name: string) {
  fireEvent.change(screen.getByLabelText(/name/i), {
    target: {value: name},
  });
  fireEvent.click(screen.getByDisplayValue('Add'));
}

function playableDeck(virtualMode: VirtualMode) {
  return CardDataList.map(function (_card, idx) {
    return idx;
  }).filter(function (idx) {
    var card = CardDataList[idx];
    return card.mode === VirtualMode.UNSET || card.mode === virtualMode;
  });
}

function saveState(state: object) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function trackedEvents(track: ReturnType<typeof vi.fn>) {
  return track.mock.calls.map(function (call) {
    return {
      name: call[0],
      data: call[1],
    };
  });
}

test('renders the home screen with empty storage', () => {
  render(<App />);

  expect(screen.getByText(/Welcome to Web Zingg!/i)).toBeInTheDocument();
  expect(screen.getByRole('button', {name: /classic game/i})).toBeInTheDocument();
  expect(
    screen.getByRole('button', {name: /pass-the-phone game/i})
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('button', {name: /reset game/i})
  ).not.toBeInTheDocument();
});

test('tracks the classic gameplay funnel without player names', () => {
  var track = vi.fn();
  window.umami = {track};

  openLobby();
  addPlayer('Noah');
  addPlayer('Sarah');
  fireEvent.click(screen.getByRole('button', {name: 'In person'}));
  fireEvent.click(screen.getByRole('button', {name: /start game/i}));
  fireEvent.click(screen.getByRole('button', {name: /flip card a/i}));
  fireEvent.click(screen.getByRole('button', {name: /next player/i}));
  fireEvent.click(screen.getByRole('button', {name: /reset game/i}));
  fireEvent.click(
    screen.getByRole('dialog').querySelectorAll('button')[1]
  );

  var events = trackedEvents(track);
  expect(events.map(function (event) {
    return event.name;
  })).toEqual([
    'classic_mode_selected',
    'player_added',
    'player_added',
    'game_format_selected',
    'classic_game_started',
    'card_revealed',
    'next_player',
    'game_reset_confirmed',
  ]);
  expect(events[1].data).toEqual({player_count: 1});
  expect(events[2].data).toEqual({player_count: 2});
  expect(events[3].data).toEqual({virtual_mode: 'live'});
  expect(events[4].data).toEqual({player_count: 2, virtual_mode: 'live'});
  expect(events[5].data).toMatchObject({
    play_mode: 'classic',
    position: 'left',
  });
  expect(events[6].data).toEqual({play_mode: 'classic'});
  expect(JSON.stringify(events)).not.toContain('Noah');
  expect(JSON.stringify(events)).not.toContain('Sarah');
});

test('phone viewport opens the mobile landing instead of classic home', () => {
  setViewportWidth(390);

  render(<App />);

  expect(screen.getByText(/Mobile mode/i)).toBeInTheDocument();
  expect(
    screen.getByRole('button', {name: /start mobile game/i})
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('button', {name: /classic game/i})
  ).not.toBeInTheDocument();
});

test('mobile game can reveal a card, advance, and resume progress', async () => {
  setViewportWidth(390);
  render(<App />);

  fireEvent.click(screen.getByRole('button', {name: /start mobile game/i}));
  expect(screen.getByText(/Pick A or B/i)).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', {name: /card a/i}));

  await waitFor(function () {
    var saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    expect(saved.playMode).toBe('mobile');
    expect(saved.screen).toBe('MOBILE_GAME');
    expect(saved.mobileGameState.deckState).toBe(DeckState.FRONT);
    expect(saved.mobileGameState.pos).toBe(CardPosition.LEFT);
  });

  var savedBefore = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
  var currentCard = CardDataList[savedBefore.mobileGameState.deck[0]];
  expect(screen.getByText(currentCard.title)).toBeInTheDocument();

  cleanup();
  render(<App />);

  expect(screen.getByText(currentCard.title)).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', {name: /next player/i}));

  await waitFor(function () {
    var saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    expect(saved.mobileGameState.deck_idx).toBe(1);
    expect(saved.mobileGameState.deckState).toBe(DeckState.BACK);
  });
  expect(screen.getByText(/Pick A or B/i)).toBeInTheDocument();
});

test('persists and restores unfinished lobby setup', async () => {
  openLobby();
  fireEvent.change(screen.getByLabelText(/name/i), {
    target: {value: 'Noah'},
  });

  await waitFor(function () {
    expect(window.localStorage.getItem(STORAGE_KEY)).toContain('Noah');
  });

  cleanup();
  render(<App />);

  expect(screen.getByText(/Build the table/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/name/i)).toHaveValue('Noah');
  expect(screen.getByRole('button', {name: /reset game/i})).toBeInTheDocument();
});

test('persists and restores started game progress', async () => {
  openLobby();
  addPlayer('Noah');
  addPlayer('Sarah');
  fireEvent.click(screen.getByRole('button', {name: 'In person'}));
  fireEvent.click(screen.getByRole('button', {name: /start game/i}));
  fireEvent.click(screen.getByRole('button', {name: /flip card a/i}));

  await waitFor(function () {
    var saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    expect(saved.gameState.deckState).toBe(DeckState.FRONT);
    expect(saved.gameState.pos).toBe(CardPosition.LEFT);
  });

  var savedBefore = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
  var currentCard = CardDataList[savedBefore.gameState.deck[0]];

  cleanup();
  render(<App />);

  expect(screen.getByText(currentCard.title)).toBeInTheDocument();
  await waitFor(function () {
    var savedAfter = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    expect(savedAfter.gameState).toEqual(savedBefore.gameState);
  });
});

test('development debugCard query opens requested card face-up in mobile mode', async () => {
  saveState({
    version: 1,
    screen: 'HOME',
    value: '',
    names: [],
    opts: {virtualMode: VirtualMode.UNSET},
  });
  window.history.pushState({}, '', '/?debugCard=Compliment%20Sandwich');

  render(<App />);

  expect(screen.getByText('Compliment Sandwich')).toBeInTheDocument();
  expect(
    screen.getByText(/Give them a compliment, an insult, and another/i)
  ).toBeInTheDocument();
  expect(screen.getByRole('button', {name: /next player/i})).toBeInTheDocument();
  expect(screen.queryByText(/Pick A or B/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/Current turn/i)).not.toBeInTheDocument();

  await waitFor(function () {
    var saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    expect(saved.playMode).toBe('mobile');
    expect(saved.screen).toBe('MOBILE_GAME');
    expect(saved.mobileGameState.deckState).toBe(DeckState.FRONT);
  });
});

test('restores player statuses from saved game state', () => {
  var deck = playableDeck(VirtualMode.LIVE);
  var savedStatus = 'Keeper of questionable decisions';

  saveState({
    version: 1,
    screen: 'GAME',
    value: '',
    names: ['Noah', 'Sarah'],
    opts: {virtualMode: VirtualMode.LIVE},
    gameState: {
      deck: deck,
      deck_idx: 0,
      deckState: DeckState.BACK,
      players: [
        {name: 'Noah', status: '', idx: 0},
        {name: 'Sarah', status: savedStatus, idx: 1},
      ],
      player_idx: 0,
      pos: CardPosition.UNSET,
    },
  });

  render(<App />);

  expect(screen.getByLabelText('Status: ' + savedStatus)).toBeInTheDocument();
});

test('status cards advance without assigning player status', async () => {
  var deck = playableDeck(VirtualMode.LIVE);
  var statusIdx =
    deck.find(function (idx) {
      return CardDataList[idx].type === CardType.STATUS;
    }) || deck[0];
  var orderedDeck = [statusIdx].concat(
    deck.filter(function (idx) {
      return idx !== statusIdx;
    })
  );
  saveState({
    version: 1,
    screen: 'GAME',
    value: '',
    names: ['Noah', 'Sarah'],
    opts: {virtualMode: VirtualMode.LIVE},
    gameState: {
      deck: orderedDeck,
      deck_idx: 0,
      deckState: DeckState.FRONT,
      players: [
        {name: 'Noah', status: '', idx: 0},
        {name: 'Sarah', status: '', idx: 1},
      ],
      player_idx: 0,
      pos: CardPosition.LEFT,
    },
  });

  render(<App />);
  expect(
    screen.getByRole('button', {name: /next player/i})
  ).toBeInTheDocument();
  expect(
    screen.getByText(/keep track of this status, then press 'Next Player'/i)
  ).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', {name: /next player/i}));

  await waitFor(function () {
    var saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    expect(saved.gameState.players[0].status).toBe('');
    expect(saved.gameState.players[1].status).toBe('');
    expect(saved.gameState.deck_idx).toBe(1);
  });
});

test('reset modal can cancel or clear saved state', async () => {
  openLobby();
  addPlayer('Noah');

  fireEvent.click(screen.getByRole('button', {name: /reset game/i}));
  expect(screen.getByRole('dialog')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', {name: /cancel/i}));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByText('Noah')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', {name: /reset game/i}));
  fireEvent.click(
    screen.getAllByRole('button', {name: /reset game/i})[
      screen.getAllByRole('button', {name: /reset game/i}).length - 1
    ]
  );

  await waitFor(function () {
    expect(screen.getByText(/Welcome to Web Zingg!/i)).toBeInTheDocument();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

test('ignores malformed saved state without crashing', () => {
  window.localStorage.setItem(STORAGE_KEY, '{not-json');

  render(<App />);

  expect(screen.getByText(/Welcome to Web Zingg!/i)).toBeInTheDocument();
});

test('ignores incompatible saved game state without crashing', () => {
  saveState({
    version: 1,
    screen: 'GAME',
    value: '',
    names: ['Noah', 'Sarah'],
    opts: {virtualMode: VirtualMode.VIRTUAL},
    gameState: {
      deck: [9999],
      deck_idx: 0,
      deckState: DeckState.BACK,
      players: [
        {name: 'Noah', status: '', idx: 0},
        {name: 'Sarah', status: '', idx: 1},
      ],
      player_idx: 0,
      pos: CardPosition.UNSET,
    },
  });

  render(<App />);

  expect(screen.getByText(/Welcome to Web Zingg!/i)).toBeInTheDocument();
});

test('ignores incompatible saved mobile game state without crashing', () => {
  saveState({
    version: 2,
    playMode: 'mobile',
    screen: 'MOBILE_GAME',
    value: '',
    names: [],
    opts: {virtualMode: VirtualMode.LIVE},
    mobileGameState: {
      deck: [9999],
      deck_idx: 0,
      deckState: DeckState.BACK,
      pos: CardPosition.UNSET,
    },
  });

  render(<App />);

  expect(screen.getByText(/Welcome to Web Zingg!/i)).toBeInTheDocument();
});

test('phone viewport restores classic saved state', () => {
  setViewportWidth(390);
  saveState({
    version: 1,
    screen: 'GAME',
    value: '',
    names: ['Noah', 'Sarah'],
    opts: {virtualMode: VirtualMode.LIVE},
    gameState: {
      deck: playableDeck(VirtualMode.LIVE),
      deck_idx: 0,
      deckState: DeckState.BACK,
      players: [
        {name: 'Noah', status: '', idx: 0},
        {name: 'Sarah', status: '', idx: 1},
      ],
      player_idx: 0,
      pos: CardPosition.UNSET,
    },
  });

  render(<App />);

  expect(screen.getByText(/It's Noah's turn/i)).toBeInTheDocument();
  expect(screen.getByRole('button', {name: /flip card a/i})).toBeInTheDocument();
});

function classicSave(mode = VirtualMode.LIVE) {
  return {version: 3, playMode: 'classic', screen: 'GAME', value: '', names: ['Alex', 'Sam'],
    opts: {virtualMode: mode}, gameState: {
      deck: playableDeck(mode), deck_idx: 0, deckState: DeckState.BACK,
      players: [{name: 'Alex', status: '', idx: 0}, {name: 'Sam', status: '', idx: 1}],
      player_idx: 0, pos: CardPosition.UNSET,
    }};
}

function mobileSave() {
  return {version: 3, playMode: 'mobile', screen: 'MOBILE_GAME', value: '', names: [],
    opts: {virtualMode: VirtualMode.UNSET}, mobileGameState: {
      deck: playableDeck(VirtualMode.LIVE), deck_idx: 0, deckState: DeckState.BACK,
      pos: CardPosition.UNSET,
    }};
}

test.each(['classic live', 'classic virtual', 'mobile'])('%s pauses at deck exhaustion, resumes, and reshuffles', mode => {
  const saved = mode === 'mobile' ? mobileSave() : classicSave(mode === 'classic virtual' ? VirtualMode.VIRTUAL : VirtualMode.LIVE);
  const key = 'gameState' in saved ? 'gameState' : 'mobileGameState';
  const state = 'gameState' in saved ? saved.gameState : saved.mobileGameState;
  state.deck_idx = state.deck.length - 1;
  state.deckState = DeckState.FRONT;
  state.pos = CardPosition.LEFT;
  saveState(saved);
  render(<App />);
  expect(screen.getByText(CardDataList[state.deck[state.deck_idx]].title)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name: /next player/i}));
  expect(screen.getByRole('heading', {name: /deck exhausted/i})).toBeInTheDocument();
  expect(screen.queryByRole('button', {name: /next player/i})).not.toBeInTheDocument();
  cleanup();
  render(<App />);
  expect(screen.getByRole('heading', {name: /deck exhausted/i})).toBeInTheDocument();
  vi.spyOn(Math, 'random').mockReturnValue(0);
  fireEvent.click(screen.getByRole('button', {name: /reshuffle and continue/i}));
  const restarted = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!)[key];
  expect(restarted.deckState).toBe(DeckState.BACK);
  expect(restarted.deck_idx).toBe(0);
  expect(restarted.deck).not.toEqual(state.deck);
  expect([...restarted.deck].sort()).toEqual([...state.deck].sort());
  if (mode !== 'mobile') {
    expect(restarted.player_idx).toBe(1);
    expect(screen.getByText(/It's Sam's turn/i)).toBeInTheDocument();
  }
});

test.each(['classic', 'mobile'])('%s A and B reveal the same predetermined card', mode => {
  const saved = mode === 'classic' ? classicSave() : mobileSave();
  const state = 'gameState' in saved ? saved.gameState : saved.mobileGameState;
  const title = CardDataList[state.deck[0]].title;
  for (const side of ['A', 'B']) {
    saveState(saved);
    render(<App />);
    fireEvent.click(screen.getByRole('button', {name: mode === 'classic' ? 'Flip card ' + side : 'Card ' + side}));
    expect(screen.getByText(title)).toBeInTheDocument();
    cleanup();
  }
});

test('switching modes and widths preserves both games and classic options', () => {
  saveState(classicSave(VirtualMode.VIRTUAL));
  render(<App />);
  fireEvent.click(screen.getByRole('button', {name: /flip card a/i}));
  const classic = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!).gameState;
  fireEvent.click(screen.getByRole('button', {name: /switch mode/i}));
  fireEvent.click(screen.getByRole('button', {name: /pass-the-phone game/i}));
  fireEvent.click(screen.getByRole('button', {name: /start mobile game/i}));
  fireEvent.click(screen.getByRole('button', {name: 'Card B'}));
  const mobile = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!).mobileGameState;
  cleanup();
  setViewportWidth(390);
  render(<App />);
  fireEvent.click(screen.getByRole('button', {name: /switch mode/i}));
  fireEvent.click(screen.getByRole('button', {name: /resume classic game/i}));
  let saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
  expect(saved.gameState).toEqual(classic);
  expect(saved.opts.virtualMode).toBe(VirtualMode.VIRTUAL);
  expect(saved.mobileGameState).toEqual(mobile);
  cleanup();
  setViewportWidth(desktopWidth);
  render(<App />);
  fireEvent.click(screen.getByRole('button', {name: /switch mode/i}));
  fireEvent.click(screen.getByRole('button', {name: /resume pass-the-phone/i}));
  saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
  expect(saved.mobileGameState).toEqual(mobile);
  expect(saved.gameState).toEqual(classic);
});

test('switching modes preserves unfinished lobby setup', () => {
  openLobby();
  addPlayer('Alex');
  fireEvent.change(screen.getByLabelText(/^name$/i), {target: {value: 'Sam'}});
  fireEvent.click(screen.getByRole('button', {name: /switch mode/i}));
  fireEvent.click(screen.getByRole('button', {name: /pass-the-phone game/i}));
  fireEvent.click(screen.getByRole('button', {name: /start mobile game/i}));
  cleanup();
  render(<App />);
  fireEvent.click(screen.getByRole('button', {name: /switch mode/i}));
  fireEvent.click(screen.getByRole('button', {name: /classic game/i}));
  expect(screen.getByLabelText(/^name$/i)).toHaveValue('Sam');
  expect(screen.getByText('Alex')).toBeInTheDocument();
});

test('denied storage reads allow an in-memory game', () => {
  vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {throw new Error('denied');});
  openLobby();
  addPlayer('Alex');
  addPlayer('Sam');
  fireEvent.click(screen.getByRole('button', {name: 'In person'}));
  fireEvent.click(screen.getByRole('button', {name: /start game/i}));
  fireEvent.click(screen.getByRole('button', {name: /flip card a/i}));
  expect(screen.getByRole('button', {name: /next player/i})).toBeInTheDocument();
});

test('failed saves show a notice, keep gameplay working, and recover', () => {
  const failure = vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {throw new Error('full');});
  openLobby();
  expect(screen.getByRole('status')).toHaveTextContent(/saving is unavailable/i);
  addPlayer('Alex');
  addPlayer('Sam');
  fireEvent.click(screen.getByRole('button', {name: 'In person'}));
  fireEvent.click(screen.getByRole('button', {name: /start game/i}));
  fireEvent.click(screen.getByRole('button', {name: /flip card a/i}));
  failure.mockRestore();
  fireEvent.click(screen.getByRole('button', {name: /next player/i}));
  expect(screen.queryByText(/saving is unavailable/i)).not.toBeInTheDocument();
  expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!).gameState.player_idx).toBe(1);
});

test('failed storage deletion still resets the in-memory game', () => {
  openLobby();
  addPlayer('Alex');
  vi.spyOn(window.localStorage, 'removeItem').mockImplementation(() => {throw new Error('denied');});
  fireEvent.click(screen.getByRole('button', {name: /reset game/i}));
  fireEvent.click(screen.getByRole('dialog').querySelectorAll('button')[1]);
  expect(screen.getByText(/Welcome to Web Zingg/i)).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent(/saving is unavailable/i);
});

test('reset dialog contains focus, supports Escape, and restores focus', () => {
  openLobby();
  const trigger = screen.getByRole('button', {name: /reset game/i});
  trigger.focus();
  fireEvent.click(trigger);
  const cancel = screen.getByRole('button', {name: /cancel/i});
  const confirm = screen.getByRole('dialog').querySelectorAll('button')[1];
  expect(cancel).toHaveFocus();
  expect(trigger.closest('[inert]')).not.toBeNull();
  fireEvent.keyDown(cancel, {key: 'Tab', shiftKey: true});
  expect(confirm).toHaveFocus();
  fireEvent.keyDown(confirm, {key: 'Tab'});
  expect(cancel).toHaveFocus();
  trigger.focus();
  expect(cancel).toHaveFocus();
  fireEvent.keyDown(cancel, {key: 'Escape'});
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
  expect(trigger.closest('[inert]')).toBeNull();
});

test('lobby trims, validates, edits, removes names and keeps the player limit', () => {
  openLobby();
  addPlayer('   ');
  expect(screen.getByRole('alert')).toHaveTextContent(/enter a player name/i);
  addPlayer(' Alex ');
  addPlayer('alex');
  expect(screen.getByRole('alert')).toHaveTextContent(/already taken/i);
  for (let i = 2; i <= 12; i++) addPlayer('Player ' + i);
  addPlayer('Extra');
  expect(screen.getByRole('alert')).toHaveTextContent(/twelve players/i);
  fireEvent.click(screen.getByRole('button', {name: 'Edit Alex'}));
  fireEvent.change(screen.getByRole('textbox', {name: 'Rename Alex'}), {target: {value: ' New Alex '}});
  fireEvent.click(screen.getByRole('button', {name: 'Save name'}));
  expect(screen.getByText('New Alex')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name: 'Remove Player 2'}));
  addPlayer('Replacement');
  expect(screen.getByText('Replacement')).toBeInTheDocument();
  expect(screen.getByText('12/12 seats filled')).toBeInTheDocument();
  cleanup();
  render(<App />);
  expect(screen.getByText('New Alex')).toBeInTheDocument();
  expect(screen.queryByText('Player 2')).not.toBeInTheDocument();
});
