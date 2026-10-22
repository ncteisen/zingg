import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {PlaytestContext, trackEvent, useTrackEvent} from './analytics';
import Game from './Game';
import MobileGame from './MobileGame';
import {VirtualMode} from './GameOpts';
import {CardPosition, DeckState, playableCardIndexes} from './GamePersistence';

afterEach(() => { cleanup(); delete window.umami; vi.restoreAllMocks(); });

test('missing analytics is harmless and available analytics receives unchanged metadata', () => {
  expect(() => trackEvent('card_revealed', {play_mode: 'mobile'})).not.toThrow();
  const track = vi.fn();
  window.umami = {track};
  const metadata = {play_mode: 'mobile', card_title: 'Mind Meld'};
  trackEvent('card_revealed', metadata);
  expect(track).toHaveBeenCalledExactlyOnceWith('card_revealed', metadata);
});

test.each(['classic', 'mobile'] as const)('%s play continues when analytics throws synchronously', mode => {
  window.umami = {track: vi.fn(() => { throw new Error('Provider unavailable'); })};
  const onChange = renderGame(mode);
  fireEvent.click(screen.getByRole('button', {name: /^(flip )?card a$/i}));
  expect(onChange.mock.lastCall![0]).toMatchObject({deck_idx: 0, deckState: DeckState.FRONT});
  fireEvent.click(screen.getByRole('button', {name: /next player/i}));
  expect(onChange.mock.lastCall![0]).toMatchObject({deck_idx: 1, deckState: DeckState.BACK});
});

test.each(['classic', 'mobile'] as const)('%s play continues and rejected analytics requests are handled', async mode => {
  const track = vi.fn(() => Promise.reject(new Error('Request failed')));
  window.umami = {track};
  const onChange = renderGame(mode);
  fireEvent.click(screen.getByRole('button', {name: /^(flip )?card a$/i}));
  expect(onChange.mock.lastCall![0]).toMatchObject({deck_idx: 0, deckState: DeckState.FRONT});
  fireEvent.click(screen.getByRole('button', {name: /next player/i}));
  expect(onChange.mock.lastCall![0]).toMatchObject({deck_idx: 1, deckState: DeckState.BACK});
  expect(track).toHaveBeenCalledTimes(2);
  // Flush the promise handlers. An unhandled rejection fails the Vitest run.
  await Promise.resolve();
  await Promise.resolve();
});

test('playtest lifecycle tracking remains suppressed', () => {
  const track = vi.fn(() => { throw new Error('Must not be called'); });
  window.umami = {track};
  function LifecycleButton() {
    const trackLifecycle = useTrackEvent();
    return <button onClick={() => trackLifecycle('interactive_round_started', {card_title: 'Undercover'})}>Start</button>;
  }
  render(<PlaytestContext.Provider value={true}><LifecycleButton /></PlaytestContext.Provider>);
  fireEvent.click(screen.getByRole('button', {name: 'Start'}));
  expect(track).not.toHaveBeenCalled();
});

function renderGame(mode: 'classic' | 'mobile') {
  const opts = {virtualMode: VirtualMode.LIVE};
  const state = {deck: playableCardIndexes(opts), deck_idx: 0, deckState: DeckState.BACK, pos: CardPosition.UNSET};
  const onChange = vi.fn();
  if (mode === 'classic') {
    const names = ['Alex', 'Sam'];
    render(<Game player_names={names} gameOpts={opts}
      initialGameState={{...state, players: names.map((name, idx) => ({name, idx, status: ''})), player_idx: 0}}
      onGameStateChange={onChange} onResetRequest={() => {}} />);
  } else {
    render(<MobileGame initialGameState={state} onGameStateChange={onChange} onResetRequest={() => {}} />);
  }
  return onChange;
}
