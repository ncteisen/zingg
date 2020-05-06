import React from 'react';
import back from './assets/back.png'
import beer from './assets/beer.png'

enum CardType {
  BACK,
  ACTION,
  STATUS,
  INTERRUPT
}

class CardData {
    title: string;
    body: string;
    type: CardType;
    constructor(title: string, body: string, type: CardType) {
        this.title = title;
        this.body = body;
        this.type = type;
    }
}

class ActionCardData extends CardData {
  constructor(title: string, body: string) { super(title, body, CardType.ACTION); }
}

type PlayerProps = {
  name: string;
  idx: number;
};
function Player(Props: PlayerProps) {
    let name = "Player " + (Props.idx + 1);
    if (Props.name) {
      name = Props.name
    }
    return (
      <div id="player1" className="container rounded">
      <div id="player2" className="container rounded">
      <div id="player3" className="container rounded">
        {name}
      </div>
      </div>
      </div>
      );
}

type CardProps = {

}
function Card(props: CardProps) {
  return (
    <div id="deck1" className="action container rounded">
    <div id="deck2" className="action container rounded">
    <div id="deck3" className="action container rounded">
      <div id="card" className="action card">
        <div className="card-body-holder1 rounded">
        <div className="card-body-holder2 rounded">
          <div className="card-title-holder rounded">
            <h4 className="card-title">Drink</h4>
          </div>
          <img className="card-img-top" src={beer} alt="Card image"/>
          <div className="card-type-holder rounded">
            <p className="card-type">Action</p>
          </div>
          <div className="card-text-holder rounded">
          <p className="card-text">Ask another player a relatively easy question (e.g. name a movie with Brad Pitt). They must immediately start drinking. They may only stop once they can answer the question.</p>
          </div>
        </div>
        </div>
      </div>
    </div>
    </div>
    </div>
    );
}


type BackOfDeckProps = {
  fullBack: boolean
}
function BackOfDeck(props: BackOfDeckProps) {
  return (
    <div id="deck1" className="back container rounded">
    <div id="deck2" className="back container rounded">
    <div id="deck3" className="back container rounded">
      <div id="card" className="back card">
        <div className="card-back-holder1 rounded">
        <div className="card-body-holder2 rounded">
          {props.fullBack ?
            <>
            <h4 className="card-back-title">Zingg</h4>
            <p className="card-back-text">A drinking game</p>
            <img className="card-img-top back" src={back} alt="Card image"/>
            </>
            :
            <>
            <img className="card-img-top back-upside" src={back} alt="Card image"/>
            <div>
            <a href="#" className="btn back btn-primary">Flip card!</a>
            </div>
            </>
          }
        </div>
        </div>
      </div>
    </div>
    </div>
    </div>
    );
}


type GameProps = {
  names: string[];
};
type GameState = {};
class Game extends React.Component<GameProps, GameState> {

  renderPlayer(idx: number) {
    return <Player idx={idx} name={this.props.names[idx]} />;
  }

  renderBackOfDeck() {
    return <BackOfDeck fullBack={true} />
  }

  renderUpsideDownCard() {
    return <BackOfDeck fullBack={false} />
  }

  renderCard() {
    return <Card />
  }


  render() {
    console.log("Game.render()");
    return (
      <div className="App">
        <div className="App-header">
          <h2>Welcome to the game!</h2>
        </div>
        <div id="gameContainer" className="container rounded">
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
        				<div id="cardContainer" className="container">
                  {this.renderCard()}
        				</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Game;
