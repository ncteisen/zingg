import React from 'react';

import CardDataList from "./CardDataList";
import Card, { CardType, CardData, BackOfCard } from "./Card";
import Player, { PlaceholderPlayer, PlayerData } from "./Player";

enum DeckState {
  START,
  BACK,
  FRONT,
}

type GameProps = {
  player_names: string[];
};
type GameState = {
  deck: CardData[];
  deck_idx: number;
  deckState: DeckState;
  players: PlayerData[];
  player_idx: number;
};
class Game extends React.Component<GameProps, GameState> {
  constructor(props: GameProps){
    super(props);
    var players = new Array<PlayerData>();
    for (var player_name of props.player_names) {
      players.push(new PlayerData(player_name, ""));
    }
    this.state = {
      deck: CardDataList,
      deck_idx: 0,
      deckState: DeckState.START,
      players: players,
      player_idx: 0,
    }
  }

  renderPlayer(idx: number) {
    if (idx < this.state.players.length) {
      return <Player isTurn={idx == this.state.player_idx}
                     name={this.state.players[idx].name} />;
    } else {
      return <PlaceholderPlayer />;
    }
  }

  renderCard() {
    switch (this.state.deckState) {
      case DeckState.START:
        return <BackOfCard />
        break;

      case DeckState.BACK:
        return <BackOfCard />
        break;

      case DeckState.FRONT:
        return <Card data={this.state.deck[this.state.deck_idx]} />
        break;
      
      default:
        return <BackOfCard />
        break;
    }
  }

  handleButtonClick = () => {
    switch (this.state.deckState) {
      case DeckState.START:
        this.setState({deckState: DeckState.FRONT})
        break;

      case DeckState.BACK:
        this.setState({deckState: DeckState.FRONT})
        break;

      case DeckState.FRONT:
        this.setState({
          deckState: DeckState.BACK,
          player_idx: (this.state.player_idx + 1) % this.state.players.length,
          deck_idx: (this.state.deck_idx + 1) % this.state.deck.length
        })
        break;
      
      default:
        break;
    }
  }

  buttonText() {
    switch (this.state.deckState) {
      case DeckState.START:
        return "Start Game!"

      case DeckState.BACK:
        return "Flip card"

      case DeckState.FRONT:
        return "Next player"
      
      default:
        break;
    } 
  }


  render() {
    console.log("Game.render()");
    var current_player = this.state.players[this.state.player_idx];
    return (
      <div className="App">
        <div className="App-header">
          <h2>Welcome to the game!</h2>
        </div>
        <div id="mainContainer" className="game-container-color container rounded">
          <div id="gameBoard" className="container">
            <div className="row">
              <div className="col-3">
                {this.renderPlayer(0)}
              </div>
              <div className="col-3">
                {this.renderPlayer(1)}
              </div>
              <div className="col-3">
                {this.renderPlayer(2)}
              </div>
              <div className="col-3">
                {this.renderPlayer(3)}
              </div>
            </div>
            {this.state.players.length > 4 &&
              <div className="row">
                <div className="col-3">
                  {this.renderPlayer(4)}
                </div>
                <div className="col-3">
                  {this.renderPlayer(5)}
                </div>
                <div className="col-3">
                  {this.renderPlayer(6)}
                </div>
                <div className="col-3">
                  {this.renderPlayer(7)}
                </div>
              </div>
            }
            <div className="row">
              <div className="col">
                <div id="headerContainer1" className="orange3 container rounded">
                <div id="headerContainer2" className="orange2 container rounded">
                  It's {current_player.name}'s Turn!
                </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col">
        				<div id="cardContainer" className="container">
                  {this.renderCard()}
        				</div>
                <a onClick={this.handleButtonClick} className="btn game-btn">{this.buttonText()}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Game;
