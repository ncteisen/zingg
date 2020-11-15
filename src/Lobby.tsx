import React from 'react';
import GameOpts, { VirtualMode } from "./GameOpts";
import GameHeader from './GameHeader'

type LobbyProps = {
  handleLobbyToGame: () => void
  names: string[];
  value: string;
  gameOpts: GameOpts;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleVirtualClick: (virtualMode: VirtualMode) => void
};
function Lobby(Props: LobbyProps) {
  console.log("Lobby.render()");
  let start_button;
  if (Props.names.length > 1 && Props.gameOpts.virtualMode != VirtualMode.UNSET) {
    start_button = <a className="btn lobby-btn-start green2" onClick={Props.handleLobbyToGame}>Start game</a>;
  } else {
    start_button = <p className="lobby-cant-start-message green2">Please enter at least two players and select all game options!!</p>
  }
  return (
      <div className="app-container">
        <GameHeader />
        <div id="mainContainer" className="game-container-color container rounded">
          <div id="gameBoard" className="container">
            <div className="row">
              <div className="col">
                <div id="headerContainer1" className="orange3 container rounded">
                <div id="headerContainer2" className="orange2 container rounded">
                Enter up to twelve players!
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
              <h4 className="lobby-box-title">Players:</h4>
              <div>
                {Props.names.map((name, index) => (
                  <div id="player2" className="lobby-player red3 container rounded">
                  <div id="player3" className="red2 container rounded">
                  <div id="player4" className="red1 container rounded">
                    {name.length < 12 ? name : name.slice(0, 9) + "..."}
                  </div>
                  </div>
                  </div>
                ))}
              </div>
              </div>
              <div className="col start-game-holder">
                <div className="row">
                  <div className="col game-opts-holder purple1">
                    <h4 className="lobby-box-title">Game Options:</h4>
                    <div className="row">
                      <div className="col-6">
                      Are you playing virtually (over Zoom, Meet, etc etc etc)?
                      </div>
                      <div className="col-3">
                        <div id="btn1" onClick={() => Props.handleVirtualClick(VirtualMode.VIRTUAL)} className="blue2 container rounded btn">
                          <a id="btn2" className={Props.gameOpts.virtualMode == VirtualMode.VIRTUAL ? "blue1" : "blue2" + " btn"}>Yes</a>
                        </div>
                      </div>
                      <div className="col-3">
                        <div id="btn1" onClick={() => Props.handleVirtualClick(VirtualMode.LIVE)} className="blue2 container rounded btn">
                          <a id="btn2"  className={Props.gameOpts.virtualMode == VirtualMode.LIVE ? "blue1" : "blue2" + " btn"}>No</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row">
                {start_button}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default Lobby;