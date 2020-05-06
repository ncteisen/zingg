import React from 'react';

type LobbyProps = {
  handleLobbyToGame: () => void
  names: string[];
  value: string;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void
};
function Lobby(Props: LobbyProps) {
  console.log("Lobby.render()");
  return (
      <div className="App">
        <div className="App-header">
          <h2>Welcome to the lobby!</h2>
        </div>
        <div id="mainContainer" className="game-container-color container rounded">
          <div id="gameBoard" className="container">
            <div className="row">
              <div className="col">
                <div id="headerContainer1" className="orange3 container rounded">
                <div id="headerContainer2" className="orange2 container rounded">
                Enter up to eight players!
                </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col">
                <div id="headerContainer1" className="blue3 container rounded">
                <div id="headerContainer2" className="blue2 container rounded">
                <form onSubmit={Props.handleSubmit} className="lobby-form">
                  <label>
                    Name:&nbsp;
                    <input className="blue1" type="text" value={Props.value} onChange={Props.handleChange} />
                  </label>
                  <input type="submit" value="Add player" className="blue3 btn lobby-btn-add"/>
                </form>
                </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col player-holder purple1">
              <h4 className="players-title">Players:</h4>
              <div>
                {Props.names.map((name, index) => (
                  <div id="player2" className="lobby-player red3 container rounded">
                  <div id="player3" className="red2 container rounded">
                  <div id="player4" className="red1 container rounded">
                    {name}
                  </div>
                  </div>
                  </div>
                ))}
              </div>
              </div>
              <div className="col start-game-holder">
                <a className="btn lobby-btn-start green2" onClick={Props.handleLobbyToGame}>Start game</a>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default Lobby;