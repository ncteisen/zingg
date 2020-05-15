import React from 'react';

import CardDataList from "./CardDataList";
import Card, { CardType, CardData, BackOfCard } from "./Card";
import Player, { PlaceholderPlayer, PlayerData } from "./Player";
import GameHeader from './GameHeader'

const cardDebuggingMode = false;

enum CardPosition {
  UNSET,
  LEFT,
  RIGHT,
}

enum DeckState {
  // Back of a card.
  BACK,
  // Front of a card.
  FRONT
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
    props.player_names.forEach(function (name, i) {
      players.push(new PlayerData(name, "", i));
    });
    this.state = {
      deck: cardDebuggingMode ? CardDataList : shuffle(CardDataList),
      deck_idx: 0,
      deckState: cardDebuggingMode ? DeckState.FRONT : DeckState.BACK,
      players: players,
      player_idx: 0,
      pos: cardDebuggingMode ? CardPosition.RIGHT : CardPosition.UNSET,
    }
  }

  renderPlayer(idx: number) {
    if (idx < this.state.players.length) {
      return <Player isTurn={idx == this.state.player_idx}
                     data={this.state.players[idx]}
                     onClick={() => this.handlePlayerClicked(idx)} />;
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

  advanceToNextPlayer() {
    this.setState({
      deckState: cardDebuggingMode ? DeckState.FRONT : DeckState.BACK,
      player_idx: (this.state.player_idx + 1) % this.state.players.length,
      deck_idx: (this.state.deck_idx + 1) % this.state.deck.length
    })
  }

  handlePlayerClicked = (idx: number) => {
    var current_card = this.state.deck[this.state.deck_idx];
    if (this.state.deckState == DeckState.BACK ||
        current_card.type != CardType.STATUS) {
      return;
    }
    let players = [...this.state.players];
    let player = {...players[idx]};
    player.status = current_card.body;
    players[idx] = player;
    this.setState({players: players});
    this.advanceToNextPlayer();
  }

  handleButtonClick = (pos: CardPosition) => {
    switch (this.state.deckState) {
      case DeckState.BACK:
        this.setState({deckState: DeckState.FRONT})
        break;

      case DeckState.FRONT:
        this.advanceToNextPlayer();
        break;
      
      default:
        break;
    }

    this.setState({
      pos: cardDebuggingMode ? CardPosition.RIGHT : pos,
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

      case DeckState.FRONT: {
        var current_card = this.state.deck[this.state.deck_idx];
        switch (current_card.type) {
          case CardType.ACTION:
            return current_player.name + ", carry out the action on the card, then press the 'Next Player' button."
          case CardType.INTERRUPT:
            return "All players! Everyone follow the directions on the card, then press the 'Next Player' button."
          case CardType.STATUS:
            return "Status card! " + current_player.name + ", click on a player to place this status on"
        }
      }
      
      default:
        break;
    } 
  }

  showNextPlayerButton() {
    var current_card = this.state.deck[this.state.deck_idx];
    return this.state.deckState == DeckState.FRONT && current_card.type != CardType.STATUS;
  }


  render() {
    console.log("Game.render()");
    var current_player = this.state.players[this.state.player_idx];
    return (
      <div className="app-container">
        <GameHeader />
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
            {this.state.players.length > 8 &&
              <div className="row">
                <div className="col-3">
                  {this.renderPlayer(8)}
                </div>
                <div className="col-3">
                  {this.renderPlayer(9)}
                </div>
                <div className="col-3">
                  {this.renderPlayer(10)}
                </div>
                <div className="col-3">
                  {this.renderPlayer(11)}
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
                {this.showNextPlayerButton() &&
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
