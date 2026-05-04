import React from 'react';
import Game from './Game';
import GameOpts, {VirtualMode} from './GameOpts';
import Lobby from './Lobby';
import './App.css';
import './Colors.css';

const gameDebuggingMode = false;

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
          <h1>Welcome to the Zingg Web!</h1>
          <p className="hero-subhead">
            A warm little trouble machine for friends, drinks, bad ideas, and
            the sacred art of laughing at each other.
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
              One host drives the tab. Everyone else heckles, negotiates, and
              acts innocent.
            </p>
          </div>
          <div className="note-block note-block-lime">
            <span className="note-number">02</span>
            <p>
              No hands, no setup sermon. Flip cards, do the thing, blame the
              deck.
            </p>
          </div>
          <div className="note-block note-block-cream">
            <span className="note-number">03</span>
            <p>
              New here? The original paper-game lore lives at{' '}
              <a href="http://www.getzingg.com" target="_">
                getzingg.com
              </a>
              .
            </p>
          </div>
          <div className="note-block note-block-pink">
            <span className="note-number">04</span>
            <p>No refreshing. The tab is holding the brain cell.</p>
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

type AppProps = {};
type AppState = {
  value: string;
  names: string[];
  state: AppStateEnum;
  opts: GameOpts;
};
class App extends React.Component<AppProps, AppState> {
  state = {
    value: '',
    names: gameDebuggingMode ? ['Noah', 'Sarah'] : new Array<string>(),
    state: gameDebuggingMode ? AppStateEnum.GAME : AppStateEnum.HOME,
    opts: {
      virtualMode: gameDebuggingMode ? VirtualMode.LIVE : VirtualMode.UNSET,
    },
  };

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
    this.setState({state: AppStateEnum.GAME});
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
      />
    );
  }

  renderGame() {
    return <Game player_names={this.state.names} gameOpts={this.state.opts} />;
  }

  render() {
    console.log('App.render()');
    switch (this.state.state) {
      case AppStateEnum.HOME:
        return this.renderHome();
      case AppStateEnum.LOBBY:
        return this.renderLobby();
      case AppStateEnum.GAME:
        return this.renderGame();
      default:
        return <h1>404 : Not Found</h1>;
    }
  }
}

export default App;
