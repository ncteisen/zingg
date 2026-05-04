import React from 'react';
import Game from './Game';
import {
  SerializedGameState,
  isValidSerializedGameState,
} from './GamePersistence';
import GameOpts, {VirtualMode} from './GameOpts';
import Lobby from './Lobby';
import './App.css';
import './Colors.css';

const gameDebuggingMode = false;
const STORAGE_KEY = 'zingg-game-state-v1';

type HomeProps = {
  handleHomeToLobby: () => void;
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
          <button
            className="pill-button pill-button-primary"
            onClick={Props.handleHomeToLobby}
          >
            Start game
          </button>
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

enum AppStateEnum {
  HOME,
  LOBBY,
  GAME,
}

type SavedScreen = 'HOME' | 'LOBBY' | 'GAME';
type SavedAppState = {
  version: 1;
  screen: SavedScreen;
  value: string;
  names: string[];
  opts: GameOpts;
  gameState?: SerializedGameState;
};

type AppProps = {};
type AppState = {
  value: string;
  names: string[];
  state: AppStateEnum;
  opts: GameOpts;
  gameState?: SerializedGameState;
  showResetModal: boolean;
};

function createInitialAppState(): AppState {
  return {
    value: '',
    names: gameDebuggingMode ? ['Noah', 'Sarah'] : new Array<string>(),
    state: gameDebuggingMode ? AppStateEnum.GAME : AppStateEnum.HOME,
    opts: {
      virtualMode: gameDebuggingMode ? VirtualMode.LIVE : VirtualMode.UNSET,
    },
    gameState: undefined,
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
  return value === 'HOME' || value === 'LOBBY' || value === 'GAME';
}

function loadInitialAppState(): AppState {
  if (typeof window === 'undefined') {
    return createInitialAppState();
  }

  var rawState = window.localStorage.getItem(STORAGE_KEY);
  if (!rawState) {
    return createInitialAppState();
  }

  try {
    var saved = JSON.parse(rawState);
    if (
      !isRecord(saved) ||
      saved.version !== 1 ||
      !isSavedScreen(saved.screen) ||
      typeof saved.value !== 'string' ||
      !Array.isArray(saved.names) ||
      !saved.names.every(function (name) {
        return typeof name === 'string';
      }) ||
      !isRecord(saved.opts) ||
      !isVirtualMode(saved.opts.virtualMode)
    ) {
      return createInitialAppState();
    }

    var opts = {virtualMode: saved.opts.virtualMode};
    var state = screenToState(saved.screen);
    var gameState = saved.gameState;

    if (
      state === AppStateEnum.GAME &&
      (saved.names.length < 2 ||
        opts.virtualMode === VirtualMode.UNSET ||
        !isValidSerializedGameState(gameState, saved.names, opts))
    ) {
      return createInitialAppState();
    }

    return {
      value: saved.value,
      names: saved.names,
      state: state,
      opts: opts,
      gameState:
        state === AppStateEnum.GAME ? (gameState as SerializedGameState) : undefined,
      showResetModal: false,
    };
  } catch {
    return createInitialAppState();
  }
}

function saveAppState(state: AppState) {
  if (typeof window === 'undefined') {
    return;
  }

  var savedState: SavedAppState = {
    version: 1,
    screen: stateToScreen(state.state),
    value: state.value,
    names: state.names,
    opts: state.opts,
    gameState: state.gameState,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));
}

type ResetModalProps = {
  onCancel: () => void;
  onConfirm: () => void;
};
function ResetModal(props: ResetModalProps) {
  return (
    <div
      aria-labelledby="reset-modal-title"
      aria-modal="true"
      className="modal-backdrop"
      role="dialog"
    >
      <section className="reset-modal">
        <p className="eyebrow">Careful now</p>
        <h2 id="reset-modal-title">Reset game?</h2>
        <p>
          This will clear all players, turns, cards, and statuses. Everyone
          goes back to the beginning.
        </p>
        <div className="modal-actions">
          <button
            className="pill-button pill-button-secondary"
            onClick={props.onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="pill-button pill-button-danger"
            onClick={props.onConfirm}
            type="button"
          >
            Reset game
          </button>
        </div>
      </section>
    </div>
  );
}

class App extends React.Component<AppProps, AppState> {
  private skipNextPersist = false;

  state = loadInitialAppState();

  componentDidUpdate() {
    if (this.skipNextPersist) {
      this.skipNextPersist = false;
      return;
    }
    saveAppState(this.state);
  }

  handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (this.state.names.length >= 12) {
      alert('Twelve players max!!');
      return;
    }
    if (this.state.value.length === 0) {
      alert('Empty name!');
      return;
    }
    if (this.state.names.includes(this.state.value)) {
      alert('Duplicate name!');
      return;
    }
    this.setState({
      names: this.state.names.concat(this.state.value),
      value: '',
    });
  };

  handleHomeToLobby = () => {
    this.setState({state: AppStateEnum.LOBBY});
  };

  handleLobbyToGame = () => {
    this.setState({state: AppStateEnum.GAME, gameState: undefined});
  };

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({value: event.target.value});
  };

  handleVirtualClick = (virtualMode: VirtualMode) => {
    this.setState(prevState => {
      let opts = Object.assign({}, prevState.opts);
      opts.virtualMode = virtualMode;
      return {opts};
    });
  };

  handleGameStateChange = (gameState: SerializedGameState) => {
    this.setState({gameState: gameState});
  };

  handleResetRequest = () => {
    this.setState({showResetModal: true});
  };

  handleResetCancel = () => {
    this.setState({showResetModal: false});
  };

  handleResetConfirm = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    this.skipNextPersist = true;
    this.setState(createInitialAppState());
  };

  renderHome() {
    return <Home handleHomeToLobby={this.handleHomeToLobby} />;
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
      default:
        content = <h1>404 : Not Found</h1>;
    }

    return (
      <>
        {content}
        {this.state.showResetModal && (
          <ResetModal
            onCancel={this.handleResetCancel}
            onConfirm={this.handleResetConfirm}
          />
        )}
      </>
    );
  }
}

export default App;
