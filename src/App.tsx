import React from 'react';
import Game from './Game';
import Lobby from './Lobby';
import './App.css';
import './Colors.css';

type HomeProps = {
  handleHomeToLobby: () => void
};
function Home(Props: HomeProps) {
  console.log("Home.render()");
  return (
     <div className="App">
        <div className="App-header">
          <h2>Welcome to the Zingg Web!</h2>
        </div>
        <div id="mainContainer" className="game-container-color container rounded">
          <div id="gameBoard" className="container">
            <div className="row">
              <div className="col">
                <div id="appHeaderContainer" className="magenta2 container rounded">
                <div id="headerContainer2" className="magenta1 container rounded">
                <p className="app-text">
                  Welcome! This site allows playing Zingg on the web.
                  It is optimized for using Zoom, Hangouts, or Meet to
                  video conference and play. One person should load this site
                  and then present it to everyone else.
                </p>
                <p className="app-text">
                  Lorem ipsem Lorem ipsem Lorem ipsem Lorem ipsem Lorem 
                  ipsem Lorem ipsem Lorem ipsem Lorem ipsem Lorem ipsem 
                  Lorem ipsem Lorem ipsem Lorem ipsem Lorem ipsem 
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
}

type AppProps = {};
type AppState = {
  value: string;
  names: string[];
  state: AppStateEnum;
};
class App extends React.Component<AppProps, AppState> {
    state = {
        value: '',
        // names: new Array<string>(),
        names: ["Noah", "Sarah", "Caela"],
        state: AppStateEnum.GAME
    }

  handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (this.state.names.length >= 8) {
      alert("Eight players max!!")
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

  renderHome() {
    return <Home handleHomeToLobby={this.handleHomeToLobby}/>;
  }

  renderLobby() {
    return (
      <Lobby names={this.state.names}
           value={this.state.value}
           handleSubmit={this.handleSubmit}
           handleChange={this.handleChange}
           handleLobbyToGame={this.handleLobbyToGame} />
    );
  }

  renderGame() {
    return <Game player_names={this.state.names} />
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
