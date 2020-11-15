import React from 'react';
import Game from './Game';
import GameOpts, { VirtualMode } from "./GameOpts";
import Lobby from './Lobby';
import './App.css';
import './Colors.css';

const gameDebuggingMode = false;

type HomeProps = {
  handleHomeToLobby: () => void
};
function Home(Props: HomeProps) {
  console.log("Home.render()");
  return (
     <div className="app-container">
        <div className="app-header">
        <div className="app-header2">
        <div className="app-header3">
          <h2 className="app-header-text">Welcome to the Zingg Web!</h2>
        </div>
        </div>
        </div>
        <div id="mainContainer" className="game-container-color container rounded">
          <div id="gameBoard" className="container">
            <div className="row">
              <div className="col">
                <div id="appHeaderContainer" className="magenta2 container rounded">
                <div id="headerContainer2" className="magenta1 container rounded">
                <p className="app-text">
                  Welcome! This site allows playing <i>Zingg</i> on the web.
                  It is optimized for using Zoom, Hangouts, or Meet to
                  video conference and play. Only <b>one</b> person should load
                  this site and then present it to everyone else. They will
                  do all of the clicking for everyone. For certain cards that
                  involve everyone, it is nice to stop presenting so everyone 
                  can see each other well.
                </p>
                <p className="app-text">
                  Never heard of Zingg?? What the hell, how did you hear about
                  this site... Anyway, check out a summary and the original
                  rules at <a href="http://www.getzingg.com" target="_">getzingg.com</a>.
                </p>
                <p className="app-text">
                  This version of <i>Zingg</i> is a little simpler than the paper
                  version. There are no hands, you simply draw cards and carry
                  out the actions! Some actions apply only to the player who
                  drew it. Others apply to everyone.
                </p>
                <p className="app-text">
                  This site was created quickly and it is full of dirty hacks,
                  so please <b>don't refresh or you will lose all of the game
                  state</b>!
                </p>
                </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col">
                  <a className="btn start-button green2" onClick={Props.handleHomeToLobby}>Start!</a>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

enum AppStateEnum {
  HOME,
  LOBBY,
  GAME
};

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
        names: gameDebuggingMode ? ["Noah", "Sarah"] : new Array<string>(),
        state: gameDebuggingMode ? AppStateEnum.GAME : AppStateEnum.HOME,
        opts: { virtualMode: VirtualMode.UNSET }
    }

  handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (this.state.names.length >= 12) {
      alert("Twelve players max!!")
      return;
    }
    if (this.state.value.length == 0) {
      alert("Empty name!")
      return;
    }
    if (this.state.names.includes(this.state.value)) {
      alert("Duplicate name!")
      return;
    }
    this.setState({
      names: this.state.names.concat(this.state.value),
      value: ''
    })

  }

  handleHomeToLobby = () => {
    this.setState({state: AppStateEnum.LOBBY});
  }

  handleLobbyToGame = () => {
    this.setState({state: AppStateEnum.GAME});
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({value: event.target.value});
  }

  handleVirtualClick = (virtualMode: VirtualMode) => {
    this.setState(prevState => {
      let opts = Object.assign({}, prevState.opts);  
      opts.virtualMode = virtualMode;                
      return { opts };
    })
  }

  renderHome() {
    return <Home handleHomeToLobby={this.handleHomeToLobby}/>;
  }

  renderLobby() {
    return (
      <Lobby names={this.state.names}
             value={this.state.value}
             gameOpts={this.state.opts}
             handleSubmit={this.handleSubmit}
             handleChange={this.handleChange}
             handleVirtualClick={this.handleVirtualClick}
             handleLobbyToGame={this.handleLobbyToGame} />
    );
  }

  renderGame() {
    return <Game player_names={this.state.names}
                 gameOpts={this.state.opts} />
  }

  render() {
    console.log("App.render()");
    switch (this.state.state) {
      case AppStateEnum.HOME:
        return this.renderHome();
      case AppStateEnum.LOBBY:
        return this.renderLobby();
      case AppStateEnum.GAME:
        return this.renderGame();
      default:
        return <h1>404 : Not Found</h1>
    }
  }
}

export default App;
