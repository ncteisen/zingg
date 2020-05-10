import React from 'react';

import CardDataList from "./CardDataList";
import Card, { CardType, CardData, BackOfCard } from "./Card";
import Player, { PlaceholderPlayer, PlayerData } from "./Player";

enum CardPosition {
  UNSET,
  LEFT,
  RIGHT,
}

enum DeckState {
  BACK,
  FRONT,
}

function shuffle(arr: CardData[]) {
    var i,
        j,
        temp;
    for (i = arr.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;    
};

type GameProps = {
  player_names: string[];
};
type GameState = {
  deck: CardData[];
  deck_idx: number;
  deckState: DeckState;
  players: PlayerData[];
  player_idx: number;
  pos: CardPosition;
};
class Game extends React.Component<GameProps, GameState> {
  constructor(props: GameProps){
    super(props);
    var players = new Array<PlayerData>();
    for (var player_name of props.player_names) {
      players.push(new PlayerData(player_name, ""));
    }
    this.state = {
      deck: shuffle(CardDataList),
      deck_idx: 0,
      deckState: DeckState.BACK, // TODO, make a mode for this.
      players: players,
      player_idx: 0,
      pos: CardPosition.UNSET, // TODO, make a mode for this.
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

  renderCard(pos: CardPosition) {
    switch (this.state.deckState) {
      case DeckState.BACK:
        return <BackOfCard />
        break;

      case DeckState.FRONT:
        if (pos == this.state.pos) {
          return <Card data={this.state.deck[this.state.deck_idx]} />
        } else {
          return <BackOfCard />
        }
        break;
      
      default:
        return <BackOfCard />
        break;
    }
  }

  handleButtonClick = (pos: CardPosition) => {
    switch (this.state.deckState) {
      case DeckState.BACK:
        this.setState({deckState: DeckState.FRONT})
        break;

      case DeckState.FRONT:
        this.setState({
          deckState: DeckState.BACK,  // TODO, make a mode for this.
          player_idx: (this.state.player_idx + 1) % this.state.players.length,
          deck_idx: (this.state.deck_idx + 1) % this.state.deck.length
        })
        break;
      
      default:
        break;
    }

    this.setState({
      pos: pos // TODO, make a mode for this.
    })
  }

  buttonText() {
    switch (this.state.deckState) {
      case DeckState.BACK:
        return "Flip card"

      case DeckState.FRONT:
        return "Next player"
      
      default:
        break;
    } 
  }

  getBannerText() {
    var current_player = this.state.players[this.state.player_idx];
    switch (this.state.deckState) {
      case DeckState.BACK:
        return "It's " + current_player.name + "'s turn, pick which card to flip!"

      case DeckState.FRONT:
        return "It's " + current_player.name + "'s turn, carry out the action on the card, then press the 'Next Player' button."
      
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
          <h2>Zingg Web</h2>
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
                  {this.getBannerText()}
                </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col">
        				<div id="cardContainer" className="container">
                  {this.renderCard(CardPosition.LEFT)}
        				</div>
                {this.state.deckState != DeckState.FRONT &&
                  <a onClick={() => this.handleButtonClick(CardPosition.LEFT)}
                     className="btn game-btn">Flip card A</a>
                }
              </div>
              <div className="col">
                <div id="cardContainer" className="container">
                  {this.renderCard(CardPosition.RIGHT)}
                </div>
                {this.state.deckState != DeckState.FRONT &&
                  <a onClick={() => this.handleButtonClick(CardPosition.RIGHT)}
                     className="btn game-btn">Flip card B</a>
                }
              </div>
            </div>
            <div className="row">
              <div className="col">
                {this.state.deckState == DeckState.FRONT &&
                  <a onClick={() => this.handleButtonClick(CardPosition.UNSET)}
                     className="btn next-player-btn">Next Player</a>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Game;
