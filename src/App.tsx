import React from 'react';
import Brand from './Brand';
import SiteFooter from './SiteFooter';
import vikingArt from './assets/deck/viking-master.webp';
import ResetModal from './ResetModal';
import Settings from './Settings';
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
const RECOVERY_STORAGE_KEY = 'zingg-game-state-recovery-v1';

type HomeProps = {
  mode: PlayMode;
  onModeChange: (mode: PlayMode) => void;
  removeElephant: boolean;
  onRemoveElephantChange: (checked: boolean) => void;
  handleHomeToLobby: () => void;
  handleHomeToMobile: () => void;
  hasClassicGame: boolean;
  hasMobileGame: boolean;
};
export function Home(Props: HomeProps) {
  const mode = Props.mode;
  const hasGame = mode === 'classic' ? Props.hasClassicGame : Props.hasMobileGame;
  return (
    <div className="app-shell home-shell">
      <header className="site-header site-header-home">
        <Brand />
      </header>
      <main className="home-hero">
        <section className="home-copy-panel">
          <p className="eyebrow">A drinking game for good company.</p>
          <h1>Drink with your <br />idiot friends.</h1>
          <p className="hero-subhead">A deck of strange little challenges, unfortunate rules, and things you’ll insist never happened.</p>
          <fieldset className="home-modes">
            <legend>How are you playing?</legend>
            <label>
              <input type="radio" name="play-mode" checked={mode === 'classic'} onChange={() => Props.onModeChange('classic')} />
              <span><strong>Shared screen</strong><small>{Props.hasClassicGame ? 'Your game is ready to resume.' : 'One host. Everyone else heckles.'}</small></span>
            </label>
            <label>
              <input type="radio" name="play-mode" checked={mode === 'mobile'} onChange={() => Props.onModeChange('mobile')} />
              <span><strong>Pass the phone</strong><small>{Props.hasMobileGame ? 'Your game is ready to resume.' : 'One phone. Around the table.'}</small></span>
            </label>
          </fieldset>
          <button className="pill-button pill-button-primary home-start-button" onClick={mode === 'classic' ? Props.handleHomeToLobby : Props.handleHomeToMobile}>
            {hasGame ? 'Resume game' : 'Start game'} <span aria-hidden="true">↗</span>
          </button>
          <Settings removeElephant={Props.removeElephant} onRemoveElephantChange={Props.onRemoveElephantChange} />
        </section>
        <figure className="home-art">
          <img src={vikingArt} alt="A deadpan Viking with one drooping helmet horn" width="640" height="480" />
          <figcaption>Everyone knows someone like this.</figcaption>
        </figure>
      </main>
      <SiteFooter showHowToPlay />
    </div>
  );
}

type MobileLandingProps = {
  removeElephant: boolean;
  onRemoveElephantChange: (checked: boolean) => void;
  handleMobileToGame: () => void;
  onSwitchMode: () => void;
};
export function MobileLanding(Props: MobileLandingProps) {
  return (
    <div className="app-shell mobile-landing-shell">
      <header className="site-header site-header-home">
        <Brand />
      </header>
      <div className="mobile-landscape-guard" role="status">
        <h1>Turn your phone upright.</h1>
        <p>Zingg mobile is built for passing the phone in portrait mode.</p>
      </div>
      <main className="mobile-landing-frame">
        <section className="mobile-landing-panel">
          <h1>Drink with your <br />idiot friends.</h1>
          <img className="mobile-landing-art" src={vikingArt} alt="A deadpan Viking with one drooping helmet horn" width="640" height="480" />
          <button className="pill-button pill-button-primary mobile-start-button" onClick={Props.handleMobileToGame}>Start mobile game <span aria-hidden="true">↗</span></button>
          <button className="pill-button pill-button-secondary mobile-start-button" onClick={Props.onSwitchMode}>Choose game mode</button>
          <Settings removeElephant={Props.removeElephant} onRemoveElephantChange={Props.onRemoveElephantChange} />
        </section>
      </main>
      <SiteFooter showHowToPlay />
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
  storageConflict?: boolean;
  recoveryNotice?: string;
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

function savedNamesHaveValidShape(value: unknown): value is string[] {
  return Array.isArray(value) && value.length <= 12 && value.every(name => typeof name === 'string');
}

function rosterNeedsRepair(names: string[]) {
  return names.some((name, index) => !!validatePlayerName(name, names, index));
}

function keepRecoveryCopy(raw: string) {
  try {
    // Keep the original locally before a recovered envelope replaces it.
    window.localStorage.setItem(RECOVERY_STORAGE_KEY, raw);
  } catch {
    // Recovery must still work when storage is unavailable.
  }
}

function loadInitialAppState(rawState: string | null | undefined): AppState {
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

  if (rawState === undefined) {
    return {...createInitialAppState(), storageError: true};
  }
  if (!rawState) {
    return createInitialAppState();
  }

  try {
    const saved: unknown = JSON.parse(rawState);
    if (!isRecord(saved) || (saved.version !== 1 && saved.version !== 2 && saved.version !== 3)) {
      keepRecoveryCopy(rawState);
      return {...createInitialAppState(), recoveryNotice: 'Saved progress could not be restored. You can start a new game.'};
    }

    const namesHaveShape = savedNamesHaveValidShape(saved.names);
    const originalNames = namesHaveShape ? saved.names as string[] : [];
    const names = originalNames.map(name => name.trim());
    const savedOpts = isRecord(saved.opts) ? saved.opts : {};
    const opts: GameOpts = {
      virtualMode: isVirtualMode(savedOpts.virtualMode) ? savedOpts.virtualMode : VirtualMode.UNSET,
      removeElephant: savedOpts.removeElephant === true,
    };
    const mobileGameState = isValidSerializedMobileGameState(saved.mobileGameState, mobileGameOpts)
      ? saved.mobileGameState : undefined;
    const classicIsValid = namesHaveShape && names.length >= 2 && opts.virtualMode !== VirtualMode.UNSET &&
      isValidSerializedGameState(saved.gameState, originalNames, opts);
    const gameState = classicIsValid ? {
      ...saved.gameState as SerializedGameState,
      players: (saved.gameState as SerializedGameState).players.map((player, index) => ({...player, name: names[index]})),
    } : undefined;
    const needsNameRepair = rosterNeedsRepair(names);
    const screen = isSavedScreen(saved.screen) ? saved.screen : 'HOME';
    let state = screenToState(screen);
    const playMode = isPlayMode(saved.playMode) ? saved.playMode :
      screen === 'MOBILE_HOME' || screen === 'MOBILE_GAME' ? 'mobile' : 'classic';
    if (state === AppStateEnum.GAME && (!gameState || needsNameRepair)) state = AppStateEnum.LOBBY;
    if (state === AppStateEnum.MOBILE_GAME && !mobileGameState) state = AppStateEnum.MOBILE_HOME;
    const recovered = !namesHaveShape || !isRecord(saved.opts) || !isVirtualMode(savedOpts.virtualMode) ||
      !isSavedScreen(saved.screen) || typeof saved.value !== 'string' ||
      (saved.version !== 1 && !isPlayMode(saved.playMode)) ||
      (saved.gameState !== undefined && !gameState) || (saved.mobileGameState !== undefined && !mobileGameState) ||
      (screen === 'GAME' && !gameState) || (screen === 'MOBILE_GAME' && !mobileGameState) || needsNameRepair;
    if (recovered) keepRecoveryCopy(rawState);
    return {
      value: typeof saved.value === 'string' ? saved.value : '', names, state, playMode, opts,
      gameState, mobileGameState, showResetModal: false,
      recoveryNotice: recovered ? (needsNameRepair
        ? 'Some saved player names need attention. Edit the highlighted names in the lobby to resume. Available progress has been kept.'
        : 'Some saved progress could not be restored. Available progress and settings have been kept.') : undefined,
    };
  } catch {
    keepRecoveryCopy(rawState);
    return {...createInitialAppState(), recoveryNotice: 'Saved progress could not be restored. You can start a new game.'};
  }
}

function readStoredState(): string | null | undefined {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return undefined;
  }
}

function serializeAppState(state: AppState) {
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
  return JSON.stringify(savedState);
}

class App extends React.Component<AppProps, AppState> {
  private skipNextPersist = false;
  private resetTrigger: HTMLElement | null = null;
  private gameInstance = 0;

  private lastStoredState = readStoredState();
  state = loadInitialAppState(this.lastStoredState);

  componentDidMount() {
    window.addEventListener('storage', this.handleStorageChange);
  }

  componentWillUnmount() {
    window.removeEventListener('storage', this.handleStorageChange);
  }

  handleStorageChange = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    if (event.storageArea && event.storageArea !== window.localStorage) return;
    const latest = readStoredState();
    if (latest !== undefined && latest !== this.lastStoredState) this.setState({storageConflict: true});
  };

  persistState(state: AppState, clear = false, replace = false) {
    if (this.state.storageConflict && !replace) return 'conflict';
    const latest = readStoredState();
    if (latest === undefined) return 'unavailable';
    if (!replace && latest !== (this.lastStoredState ?? null)) return 'conflict';
    const serialized = clear ? null : serializeAppState(state);
    try {
      if (serialized === null) window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, serialized);
      this.lastStoredState = serialized;
      return 'saved';
    } catch {
      return 'unavailable';
    }
  }

  handleLoadSavedGame = () => {
    const raw = readStoredState();
    if (raw === undefined) {
      this.setState({storageError: true});
      return;
    }
    const nextState = loadInitialAppState(raw);
    this.lastStoredState = raw;
    this.gameInstance++;
    this.skipNextPersist = true;
    this.setState({...nextState, storageConflict: false, nameError: undefined,
      storageError: nextState.storageError, recoveryNotice: nextState.recoveryNotice});
  };

  handleKeepThisGame = () => {
    const result = this.persistState(this.state, false, true);
    this.setState({storageConflict: result !== 'saved', storageError: result === 'unavailable'});
  };

  componentDidUpdate(_prevProps: AppProps, prevState: AppState) {
    if (this.skipNextPersist) {
      this.skipNextPersist = false;
      return;
    }
    if (prevState.value === this.state.value && prevState.names === this.state.names &&
        prevState.opts === this.state.opts && prevState.state === this.state.state && prevState.playMode === this.state.playMode &&
        prevState.gameState === this.state.gameState &&
        prevState.mobileGameState === this.state.mobileGameState) {
      return;
    }
    const result = this.persistState(this.state);
    const storageError = result === 'unavailable';
    const storageConflict = result === 'conflict';
    if (storageError !== !!this.state.storageError || storageConflict !== !!this.state.storageConflict) {
      this.setState({storageError, storageConflict});
    }
  }

  handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (this.state.gameState) return;
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
    this.setState({state: this.state.gameState && !rosterNeedsRepair(this.state.names) ? AppStateEnum.GAME : AppStateEnum.LOBBY, playMode: 'classic'});
  };

  handleHomeToMobile = () => {
    trackEvent('mobile_mode_selected');
    this.setState({
      state: this.state.mobileGameState ? AppStateEnum.MOBILE_GAME : AppStateEnum.MOBILE_HOME,
      playMode: 'mobile',
    });
  };

  handleLobbyToGame = () => {
    if (this.state.names.length < 2 || rosterNeedsRepair(this.state.names) || this.state.opts.virtualMode === VirtualMode.UNSET) return;
    trackEvent('classic_game_started', {
      player_count: this.state.names.length,
      virtual_mode: virtualModeToAnalyticsValue(this.state.opts.virtualMode),
    });
    this.setState({
      state: AppStateEnum.GAME,
      playMode: 'classic',
      recoveryNotice: undefined,
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

  handleModeChange = (playMode: PlayMode) => {
    this.setState({playMode});
  };

  handleRemoveElephantChange = (removeElephant: boolean) => {
    this.setState(state => ({opts: {...state.opts, removeElephant}}));
  };

  handleRenamePlayer = (index: number, value: string) => {
    const name = value.trim();
    const error = validatePlayerName(name, this.state.names, index);
    if (!error) this.setState(state => ({
      names: state.names.map((oldName, idx) => idx === index ? name : oldName),
      gameState: state.gameState ? {...state.gameState,
        players: state.gameState.players.map((player, idx) => idx === index ? {...player, name} : player)} : undefined,
    }));
    return error;
  };

  handleRemovePlayer = (index: number) => {
    if (this.state.gameState) return;
    this.setState({names: this.state.names.filter((_name, idx) => idx !== index), nameError: undefined});
  };

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({value: event.target.value, nameError: undefined});
  };

  handleVirtualClick = (virtualMode: VirtualMode) => {
    if (this.state.gameState) return;
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
    const initialState = createInitialAppState();
    initialState.opts.removeElephant = !!this.state.opts.removeElephant;
    let result = this.persistState(initialState, !initialState.opts.removeElephant);
    if (result === 'saved') {
      try { window.localStorage.removeItem(RECOVERY_STORAGE_KEY); }
      catch { result = 'unavailable'; }
    }
    this.skipNextPersist = true;
    this.setState({...initialState, storageError: result === 'unavailable', storageConflict: result === 'conflict',
      nameError: undefined, recoveryNotice: undefined});
  };

  renderHome() {
    return (
      <Home
        mode={this.state.playMode}
        onModeChange={this.handleModeChange}
        removeElephant={!!this.state.opts.removeElephant}
        onRemoveElephantChange={this.handleRemoveElephantChange}
        handleHomeToLobby={this.handleHomeToLobby}
        handleHomeToMobile={this.handleHomeToMobile}
        hasClassicGame={!!this.state.gameState}
        hasMobileGame={!!this.state.mobileGameState}
      />
    );
  }

  renderMobileLanding() {
    return <MobileLanding handleMobileToGame={this.handleMobileToGame} onSwitchMode={this.handleSwitchMode}
      removeElephant={!!this.state.opts.removeElephant} onRemoveElephantChange={this.handleRemoveElephantChange} />;
  }

  renderLobby() {
    return (
      <Lobby
        key={this.gameInstance}
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
        hasSavedGame={!!this.state.gameState}
      />
    );
  }

  renderGame() {
    return (
      <Game
        key={this.gameInstance}
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
        key={this.gameInstance}
        removeElephant={this.state.opts.removeElephant}
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
          {this.state.storageConflict && <section className="storage-notice" role="status">
            <p>Another tab changed the saved game. This tab’s progress is only in memory. Load the saved game, or replace it with this game.</p>
            <div className="header-actions">
              <button className="reset-link-button" type="button" onClick={this.handleLoadSavedGame}>Load saved game</button>
              <button className="reset-link-button" type="button" onClick={this.handleKeepThisGame}>Save this game instead</button>
            </div>
          </section>}
          {this.state.storageError && <p className="storage-notice" role="status">Saving is unavailable. You can keep playing, but changes may be lost when you reload or close this tab.</p>}
          {this.state.recoveryNotice && <p className="storage-notice" role="status">{this.state.recoveryNotice}</p>}
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
