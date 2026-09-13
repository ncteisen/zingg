import React from 'react';
import ResetModal from './ResetModal';
import {validatePlayerName} from './PlayerName';
import Game from './Game';
import CardDataList from './CardDataList';
import {
  CardPosition,
  DeckState,
  SerializedGameState,
  SerializedMobileGameState,
  isValidSerializedGameState,
  isValidSerializedMobileGameState,
  playableCardIndexes,
} from './GamePersistence';
import GameOpts, {VirtualMode} from './GameOpts';
import Lobby from './Lobby';
import MobileGame, {mobileGameOpts} from './MobileGame';
import {trackEvent} from './analytics';
import './App.css';
import './Colors.css';

const gameDebuggingMode = false;
const STORAGE_KEY = 'zingg-game-state-v1';

type HomeProps = {
  handleHomeToLobby: () => void;
  handleHomeToMobile: () => void;
  hasClassicGame: boolean;
  hasMobileGame: boolean;
};
function Home(Props: HomeProps) {
  console.log('Home.render()');
  return (
    <div className="app-shell home-shell">
      <header className="site-header site-header-home">
        <a className="brand-mark" href="http://www.getzingg.com" target="_">
          Zingg
        </a>
        <span className="header-kicker">Living-room chaos, online</span>
      </header>
      <main className="home-hero">
        <section className="home-copy-panel">
          <p className="eyebrow">Play from the couch or the call</p>
          <h1>Welcome to Web Zingg!</h1>
          <p className="hero-subhead">
          A drinking game for the daring.
          </p>
          <div className="home-action-row">
            <button
              className="pill-button pill-button-primary"
              onClick={Props.handleHomeToLobby}
            >
              {Props.hasClassicGame ? 'Resume classic game' : 'Classic game'}
            </button>
            <button
              className="pill-button pill-button-secondary"
              onClick={Props.handleHomeToMobile}
            >
              {Props.hasMobileGame ? 'Resume pass-the-phone game' : 'Pass-the-phone game'}
            </button>
          </div>
        </section>
        <section className="home-notes-panel" aria-label="How Zingg Web works">
          <div className="note-block note-block-lilac">
            <span className="note-number">01</span>
            <p>
              One host leads and shares the tab. Everyone else drinks and laughs.
            </p>
          </div>
          <div className="note-block note-block-lime">
            <span className="note-number">02</span>
            <p>
              Flip cards, do the thing. Take a drink.
            </p>
          </div>
          <div className="note-block note-block-cream">
            <span className="note-number">03</span>
            <p>
              New here? The original paper game is at{' '}
              <a href="http://www.getzingg.com" target="_">
                getzingg.com
              </a>
              .
            </p>
          </div>
          <div className="note-block note-block-pink">
            <span className="note-number">04</span>
            <p>Refresh, close, wander off. The game will still remember.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

type MobileLandingProps = {
  handleMobileToGame: () => void;
  onSwitchMode: () => void;
};
function MobileLanding(Props: MobileLandingProps) {
  console.log('MobileLanding.render()');
  return (
    <div className="app-shell mobile-landing-shell">
      <header className="site-header site-header-home">
        <a className="brand-mark" href="http://www.getzingg.com" target="_">
          Zingg
        </a>
        <span className="header-kicker">Pass the phone</span>
      </header>
      <div className="mobile-landscape-guard" role="status">
        <h1>Turn your phone upright.</h1>
        <p>Zingg mobile is built for passing the phone in portrait mode.</p>
      </div>
      <main className="mobile-landing-frame">
        <section className="mobile-landing-panel">
          <p className="eyebrow">Mobile mode</p>
          <h1>Pass the phone then pick a card.</h1>
          <p>
            When the phone reaches you, tap A or B, read the 
            card out loud, do the thing, then tap next player
            and hand it off. Don't forget to take a drink.
          </p>
          <button
            className="pill-button pill-button-primary mobile-start-button"
            onClick={Props.handleMobileToGame}
          >
            Start mobile game
          </button>
          <button className="pill-button pill-button-secondary mobile-start-button" onClick={Props.onSwitchMode}>
            Choose game mode
          </button>
        </section>
      </main>
    </div>
  );
}

enum AppStateEnum {
  HOME,
  LOBBY,
  GAME,
  MOBILE_HOME,
  MOBILE_GAME,
}

type PlayMode = 'classic' | 'mobile';
type SavedScreen = 'HOME' | 'LOBBY' | 'GAME' | 'MOBILE_HOME' | 'MOBILE_GAME';
type SavedAppState = {
  version: 3;
  playMode: PlayMode;
  screen: SavedScreen;
  value: string;
  names: string[];
  opts: GameOpts;
  gameState?: SerializedGameState;
  mobileGameState?: SerializedMobileGameState;
};

type AppProps = {};
type AppState = {
  value: string;
  names: string[];
  state: AppStateEnum;
  playMode: PlayMode;
  opts: GameOpts;
  gameState?: SerializedGameState;
  mobileGameState?: SerializedMobileGameState;
  showResetModal: boolean;
  storageError?: boolean;
  nameError?: string;
};

function createInitialAppState(): AppState {
  if (isPhoneViewport() && !gameDebuggingMode) {
    return {
      value: '',
      names: new Array<string>(),
      state: AppStateEnum.MOBILE_HOME,
      playMode: 'mobile',
      opts: {
        virtualMode: VirtualMode.UNSET,
      },
      gameState: undefined,
      mobileGameState: undefined,
      showResetModal: false,
    };
  }

  return {
    value: '',
    names: gameDebuggingMode ? ['Noah', 'Sarah'] : new Array<string>(),
    state: gameDebuggingMode ? AppStateEnum.GAME : AppStateEnum.HOME,
    playMode: 'classic',
    opts: {
      virtualMode: gameDebuggingMode ? VirtualMode.LIVE : VirtualMode.UNSET,
    },
    gameState: undefined,
    mobileGameState: undefined,
    showResetModal: false,
  };
}

function stateToScreen(state: AppStateEnum): SavedScreen {
  switch (state) {
    case AppStateEnum.HOME:
      return 'HOME';
    case AppStateEnum.LOBBY:
      return 'LOBBY';
    case AppStateEnum.GAME:
      return 'GAME';
    case AppStateEnum.MOBILE_HOME:
      return 'MOBILE_HOME';
    case AppStateEnum.MOBILE_GAME:
      return 'MOBILE_GAME';
  }
}

function screenToState(screen: SavedScreen): AppStateEnum {
  switch (screen) {
    case 'HOME':
      return AppStateEnum.HOME;
    case 'LOBBY':
      return AppStateEnum.LOBBY;
    case 'GAME':
      return AppStateEnum.GAME;
    case 'MOBILE_HOME':
      return AppStateEnum.MOBILE_HOME;
    case 'MOBILE_GAME':
      return AppStateEnum.MOBILE_GAME;
  }
}

function isRecord(value: unknown): value is {[key: string]: unknown} {
  return typeof value === 'object' && value !== null;
}

function isVirtualMode(value: unknown): value is VirtualMode {
  return (
    value === VirtualMode.UNSET ||
    value === VirtualMode.VIRTUAL ||
    value === VirtualMode.LIVE
  );
}

function isSavedScreen(value: unknown): value is SavedScreen {
  return (
    value === 'HOME' ||
    value === 'LOBBY' ||
    value === 'GAME' ||
    value === 'MOBILE_HOME' ||
    value === 'MOBILE_GAME'
  );
}

function isPlayMode(value: unknown): value is PlayMode {
  return value === 'classic' || value === 'mobile';
}

function isPhoneViewport() {
  if (typeof window === 'undefined') {
    return false;
  }
  if (typeof window.matchMedia === 'function') {
    return window.matchMedia('(max-width: 767px)').matches;
  }
  return window.innerWidth <= 767;
}

function virtualModeToAnalyticsValue(virtualMode: VirtualMode) {
  switch (virtualMode) {
    case VirtualMode.VIRTUAL:
      return 'virtual';
    case VirtualMode.LIVE:
      return 'live';
    case VirtualMode.UNSET:
      return 'unset';
  }
}

function getDebugCardTitle() {
  if (!import.meta.env.DEV || typeof window === 'undefined') {
    return null;
  }
  return new URLSearchParams(window.location.search).get('debugCard');
}

function buildDebugCardAppState(cardTitle: string): AppState | null {
  var playableIndexes = playableCardIndexes(mobileGameOpts);
  var debugCardIndex = playableIndexes.find(function (idx) {
    return CardDataList[idx].title.toLowerCase() === cardTitle.toLowerCase();
  });

  if (debugCardIndex === undefined) {
    return null;
  }

  var deck = [debugCardIndex].concat(
    playableIndexes.filter(function (idx) {
      return idx !== debugCardIndex;
    })
  );

  return {
    value: '',
    names: new Array<string>(),
    state: AppStateEnum.MOBILE_GAME,
    playMode: 'mobile',
    opts: mobileGameOpts,
    gameState: undefined,
    mobileGameState: {
      deck: deck,
      deck_idx: 0,
      deckState: DeckState.FRONT,
      pos: CardPosition.RIGHT,
    },
    showResetModal: false,
  };
}

function savedNamesAreValid(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length <= 12 &&
    value.every(function (name) {
      return typeof name === 'string' && name.trim().length > 0;
    })
  );
}

function buildClassicAppState(
  screen: SavedScreen,
  value: string,
  names: string[],
  opts: GameOpts,
  gameState: unknown,
  mobileGameState?: SerializedMobileGameState
): AppState {
  var state = screenToState(screen);
  var validGameState = names.length >= 2 && opts.virtualMode !== VirtualMode.UNSET &&
    isValidSerializedGameState(gameState, names, opts) ? gameState : undefined;

  if (
    state === AppStateEnum.GAME &&
    (names.length < 2 ||
      opts.virtualMode === VirtualMode.UNSET ||
      !isValidSerializedGameState(gameState, names, opts))
  ) {
    return createInitialAppState();
  }

  return {
    value: value,
    names: names,
    state: state,
    playMode:
      state === AppStateEnum.MOBILE_HOME || state === AppStateEnum.MOBILE_GAME
        ? 'mobile'
        : 'classic',
    opts: opts,
    gameState: validGameState,
    mobileGameState: mobileGameState,
    showResetModal: false,
  };
}

function loadInitialAppState(): AppState {
  if (typeof window === 'undefined') {
    return createInitialAppState();
  }

  var debugCardTitle = getDebugCardTitle();
  if (debugCardTitle) {
    var debugCardState = buildDebugCardAppState(debugCardTitle);
    if (debugCardState) {
      return debugCardState;
    }
  }

  var rawState: string | null;
  try {
    rawState = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return {...createInitialAppState(), storageError: true};
  }
  if (!rawState) {
    return createInitialAppState();
  }

  try {
    var saved = JSON.parse(rawState);

    if (
      !isRecord(saved) ||
      (saved.version !== 1 && saved.version !== 2 && saved.version !== 3) ||
      !isSavedScreen(saved.screen) ||
      typeof saved.value !== 'string' ||
      !savedNamesAreValid(saved.names) ||
      !isRecord(saved.opts) ||
      !isVirtualMode(saved.opts.virtualMode)
    ) {
      return createInitialAppState();
    }

    var mobileGameState =
      isValidSerializedMobileGameState(saved.mobileGameState, mobileGameOpts)
        ? (saved.mobileGameState as SerializedMobileGameState)
        : undefined;

    if (saved.version !== 1 && !isPlayMode(saved.playMode)) {
      return createInitialAppState();
    }

    var opts = {virtualMode: saved.opts.virtualMode};
    var state = screenToState(saved.screen);
    var gameState = saved.gameState;

    if (
      state === AppStateEnum.MOBILE_GAME &&
      !isValidSerializedMobileGameState(mobileGameState, mobileGameOpts)
    ) {
      return createInitialAppState();
    }

    return buildClassicAppState(
      saved.screen,
      saved.value,
      saved.names,
      opts,
      gameState,
      mobileGameState
    );
  } catch {
    return createInitialAppState();
  }
}

function saveAppState(state: AppState) {
  if (typeof window === 'undefined') {
    return;
  }

  var savedState: SavedAppState = {
    version: 3,
    playMode: state.playMode,
    screen: stateToScreen(state.state),
    value: state.value,
    names: state.names,
    opts: state.opts,
    gameState: state.gameState,
    mobileGameState: state.mobileGameState,
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));
    return true;
  } catch {
    return false;
  }
}

class App extends React.Component<AppProps, AppState> {
  private skipNextPersist = false;
  private resetTrigger: HTMLElement | null = null;

  state = loadInitialAppState();

  componentDidUpdate(_prevProps: AppProps, prevState: AppState) {
    if (this.skipNextPersist) {
      this.skipNextPersist = false;
      return;
    }
    if (prevState.value === this.state.value && prevState.names === this.state.names &&
        prevState.opts === this.state.opts && prevState.state === this.state.state &&
        prevState.gameState === this.state.gameState &&
        prevState.mobileGameState === this.state.mobileGameState) {
      return;
    }
    const storageError = !saveAppState(this.state);
    if (storageError !== !!this.state.storageError) this.setState({storageError});
  }

  handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = this.state.value.trim();
    const error = this.state.names.length >= 12 ? 'Twelve players max!' :
      validatePlayerName(name, this.state.names);
    if (error) {
      this.setState({nameError: error});
      return;
    }
    trackEvent('player_added', {
      player_count: this.state.names.length + 1,
    });
    this.setState({
      names: this.state.names.concat(name),
      nameError: undefined,
      value: '',
    });
  };

  handleHomeToLobby = () => {
    trackEvent('classic_mode_selected');
    this.setState({state: this.state.gameState ? AppStateEnum.GAME : AppStateEnum.LOBBY, playMode: 'classic'});
  };

  handleHomeToMobile = () => {
    trackEvent('mobile_mode_selected');
    this.setState({
      state: this.state.mobileGameState ? AppStateEnum.MOBILE_GAME : AppStateEnum.MOBILE_HOME,
      playMode: 'mobile',
    });
  };

  handleLobbyToGame = () => {
    trackEvent('classic_game_started', {
      player_count: this.state.names.length,
      virtual_mode: virtualModeToAnalyticsValue(this.state.opts.virtualMode),
    });
    this.setState({
      state: AppStateEnum.GAME,
      playMode: 'classic',
      gameState: undefined,
    });
  };

  handleMobileToGame = () => {
    trackEvent('mobile_game_started');
    this.setState({
      state: AppStateEnum.MOBILE_GAME,
      playMode: 'mobile',
      mobileGameState: undefined,
    });
  };

  handleSwitchMode = () => {
    this.setState({state: AppStateEnum.HOME});
  };

  handleRenamePlayer = (index: number, value: string) => {
    const name = value.trim();
    const error = validatePlayerName(name, this.state.names, index);
    if (!error) this.setState({names: this.state.names.map((oldName, idx) => idx === index ? name : oldName)});
    return error;
  };

  handleRemovePlayer = (index: number) => {
    this.setState({names: this.state.names.filter((_name, idx) => idx !== index), nameError: undefined});
  };

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({value: event.target.value, nameError: undefined});
  };

  handleVirtualClick = (virtualMode: VirtualMode) => {
    trackEvent('game_format_selected', {
      virtual_mode: virtualModeToAnalyticsValue(virtualMode),
    });
    this.setState(prevState => {
      let opts = Object.assign({}, prevState.opts);
      opts.virtualMode = virtualMode;
      return {opts};
    });
  };

  handleGameStateChange = (gameState: SerializedGameState) => {
    this.setState({gameState: gameState});
  };

  handleMobileGameStateChange = (mobileGameState: SerializedMobileGameState) => {
    this.setState({mobileGameState: mobileGameState});
  };

  handleResetRequest = () => {
    this.resetTrigger = document.activeElement as HTMLElement | null;
    this.setState({showResetModal: true});
  };

  handleResetCancel = () => {
    this.setState({showResetModal: false});
  };

  handleResetConfirm = () => {
    trackEvent('game_reset_confirmed');
    let storageError = false;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      storageError = true;
    }
    this.skipNextPersist = true;
    this.setState({...createInitialAppState(), storageError, nameError: undefined});
  };

  renderHome() {
    return (
      <Home
        handleHomeToLobby={this.handleHomeToLobby}
        handleHomeToMobile={this.handleHomeToMobile}
        hasClassicGame={!!this.state.gameState}
        hasMobileGame={!!this.state.mobileGameState}
      />
    );
  }

  renderMobileLanding() {
    return <MobileLanding handleMobileToGame={this.handleMobileToGame} onSwitchMode={this.handleSwitchMode} />;
  }

  renderLobby() {
    return (
      <Lobby
        names={this.state.names}
        value={this.state.value}
        gameOpts={this.state.opts}
        handleSubmit={this.handleSubmit}
        handleChange={this.handleChange}
        handleVirtualClick={this.handleVirtualClick}
        handleLobbyToGame={this.handleLobbyToGame}
        handleResetRequest={this.handleResetRequest}
        onSwitchMode={this.handleSwitchMode}
        onRenamePlayer={this.handleRenamePlayer}
        onRemovePlayer={this.handleRemovePlayer}
        nameError={this.state.nameError}
      />
    );
  }

  renderGame() {
    return (
      <Game
        player_names={this.state.names}
        gameOpts={this.state.opts}
        initialGameState={this.state.gameState}
        onGameStateChange={this.handleGameStateChange}
        onResetRequest={this.handleResetRequest}
        onSwitchMode={this.handleSwitchMode}
      />
    );
  }

  renderMobileGame() {
    return (
      <MobileGame
        initialGameState={this.state.mobileGameState}
        onGameStateChange={this.handleMobileGameStateChange}
        onResetRequest={this.handleResetRequest}
        onSwitchMode={this.handleSwitchMode}
      />
    );
  }

  render() {
    console.log('App.render()');
    let content: React.ReactNode;
    switch (this.state.state) {
      case AppStateEnum.HOME:
        content = this.renderHome();
        break;
      case AppStateEnum.LOBBY:
        content = this.renderLobby();
        break;
      case AppStateEnum.GAME:
        content = this.renderGame();
        break;
      case AppStateEnum.MOBILE_HOME:
        content = this.renderMobileLanding();
        break;
      case AppStateEnum.MOBILE_GAME:
        content = this.renderMobileGame();
        break;
      default:
        content = <h1>404 : Not Found</h1>;
    }

    return (
      <>
        <div inert={this.state.showResetModal}>
          {this.state.storageError && <p className="storage-notice" role="status">Saving is unavailable. You can keep playing, but changes may be lost when you reload or close this tab.</p>}
          {content}
        </div>
        {this.state.showResetModal && (
          <ResetModal
            returnFocus={this.resetTrigger}
            onCancel={this.handleResetCancel}
            onConfirm={this.handleResetConfirm}
          />
        )}
      </>
    );
  }
}

export default App;
