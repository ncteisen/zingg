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
          <h2>Welcome to the Zingg!</h2>
        </div>
        <div id="mainContainer" className="game-container-color container rounded">
          <div id="gameBoard" className="container">
            <div className="row">
              <div className="col app-para">
              <p>Testing</p>
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
        names: new Array<string>(),
        state: AppStateEnum.HOME
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
