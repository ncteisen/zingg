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
  fireEvent.click(screen.getByRole('button', {name: 'No'}));
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

test('phone viewport ignores classic saved state and falls back to mobile landing', () => {
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

  expect(screen.getByText(/Mobile mode/i)).toBeInTheDocument();
  expect(screen.queryByText(/Noah/i)).not.toBeInTheDocument();
});
