import React from 'react';
import back from './assets/back.png'
import beer from './assets/beer.png'

enum CardType {
  BACK = "Back",
  ACTION = "Action",
  STATUS = "Status",
  INTERRUPT = "Interrupt",
}

class CardData {
  title: string;
  body: string;
  img: any;
  type: CardType;
  constructor(title: string, body: string, img: any, type: CardType) {
    this.title = title;
    this.body = body;
    this.img = img;
    this.type = type;
  }
}

class PlayerData {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

type PlayerProps = {
  name: string;
  isTurn: boolean;
};
function Player(props: PlayerProps) {
    return (
      <div id="player1" className={props.isTurn ? "red4" : "game-container-color" + " rounded container"}>
      <div id="player2" className="red3 container rounded">
      <div id="player3" className="red2 container rounded">
      <div id="player4" className="red1 container rounded">
        {props.name}
      </div>
      </div>
      </div>
      </div>
      );
}

function PlaceholderPlayer() {
    return (
      <div id="playerPlaceholder" className="container rounded">
      </div>
      );
}

type CardProps = {
  data: CardData
}
function Card(props: CardProps) {
  return (
    <div id="deck1" className="blue4 container rounded">
    <div id="deck2" className="blue3 container rounded">
    <div id="deck3" className="blue2 container rounded">
      <div id="card" className="blue1 card">
        <div className="card-body-holder1 rounded">
        <div className="card-body-holder2 rounded">
          <div className="card-title-holder rounded">
            <h4 className="card-title">{props.data.title}</h4>
          </div>
          <img className="card-img-top" src={props.data.img} alt="Card image"/>
          <div className="card-type-holder rounded">
            <p className="card-type">{props.data.type}</p>
          </div>
          <div className="card-text-holder rounded">
          <p className="card-text">{props.data.body}</p>
          </div>
        </div>
        </div>
      </div>
    </div>
    </div>
    </div>
    );
}


function BackOfCard() {
  return (
    <div id="deck1" className="purple4 container rounded">
    <div id="deck2" className="purple3 container rounded">
    <div id="deck3" className="purple2 container rounded">
      <div id="card" className="purple1 card">
        <div className="card-back-holder1 rounded">
        <div className="card-body-holder2 rounded">
          <h4 className="card-back-title">Zingg</h4>
          <img className="card-img-top back-img-centered" src={back} alt="Card image"/>
        </div>
        </div>
      </div>
    </div>
    </div>
    </div>
    );
}

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
      players.push(new PlayerData(player_name));
    }
    var deck = new Array<CardData>();
    deck.push(new CardData("Title", "Body", beer, CardType.ACTION));
    this.state = {
      deck: deck,
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
        <div id="gameContainer" className="game-container-color container rounded">
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
            <div className="row">
              <div className="col">
                <div id="headerContainer1" className="red3 container rounded">
                <div id="headerContainer2" className="red2 container rounded">
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
                <a onClick={this.handleButtonClick} className="btn">{this.buttonText()}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Game;
