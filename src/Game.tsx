import React from 'react';

import CardDataList from './CardDataList';
import Card, {CardType, CardData, BackOfCard} from './Card';
import GameOpts, {VirtualMode} from './GameOpts';
import Player, {PlaceholderPlayer, PlayerData} from './Player';
import GameHeader from './GameHeader';

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
  FRONT,
}

function shuffle(arr: CardData[]) {
  var i, j, temp;
  for (i = arr.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

type GameProps = {
  player_names: string[];
  gameOpts: GameOpts;
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
  constructor(props: GameProps) {
    super(props);
    var players = new Array<PlayerData>();
    props.player_names.forEach(function (name, i) {
      players.push(new PlayerData(name, '', i));
    });
    var cards = CardDataList.filter(function (card) {
      return (
        card.mode === VirtualMode.UNSET ||
        card.mode === props.gameOpts.virtualMode
      );
    });
    this.state = {
      deck: cardDebuggingMode ? cards : shuffle(cards),
      deck_idx: 0,
      deckState: cardDebuggingMode ? DeckState.FRONT : DeckState.BACK,
      players: players,
      player_idx: 0,
      pos: cardDebuggingMode ? CardPosition.RIGHT : CardPosition.UNSET,
    };
  }

  renderPlayer(idx: number) {
    if (idx < this.state.players.length) {
      return (
        <Player
          isTurn={idx === this.state.player_idx}
          data={this.state.players[idx]}
          onClick={() => this.handlePlayerClicked(idx)}
        />
      );
    } else {
      return <PlaceholderPlayer />;
    }
  }

  renderCard(pos: CardPosition) {
    switch (this.state.deckState) {
      case DeckState.BACK:
        return <BackOfCard />;

      case DeckState.FRONT:
        if (pos === this.state.pos) {
          return <Card data={this.state.deck[this.state.deck_idx]} />;
        } else {
          return <BackOfCard />;
        }

      default:
        return <BackOfCard />;
    }
  }

  advanceToNextPlayer() {
    this.setState({
      deckState: cardDebuggingMode ? DeckState.FRONT : DeckState.BACK,
      player_idx: (this.state.player_idx + 1) % this.state.players.length,
      deck_idx: (this.state.deck_idx + 1) % this.state.deck.length,
    });
  }

  handlePlayerClicked = (idx: number) => {
    var current_card = this.state.deck[this.state.deck_idx];
    if (
      this.state.deckState === DeckState.BACK ||
      current_card.type !== CardType.STATUS
    ) {
      return;
    }
    let players = [...this.state.players];
    let player = {...players[idx]};
    player.status = current_card.body;
    players[idx] = player;
    this.setState({players: players});
    this.advanceToNextPlayer();
  };

  handleButtonClick = (pos: CardPosition) => {
    switch (this.state.deckState) {
      case DeckState.BACK:
        this.setState({deckState: DeckState.FRONT});
        break;

      case DeckState.FRONT:
        this.advanceToNextPlayer();
        break;

      default:
        break;
    }

    this.setState({
      pos: cardDebuggingMode ? CardPosition.RIGHT : pos,
    });
  };

  buttonText() {
    switch (this.state.deckState) {
      case DeckState.BACK:
        return 'Flip card';

      case DeckState.FRONT:
        return 'Next player';

      default:
        break;
    }
  }

  getBannerText() {
    var current_player = this.state.players[this.state.player_idx];
    switch (this.state.deckState) {
      case DeckState.BACK:
        return (
          "It's " + current_player.name + "'s turn, pick which card to flip!"
        );

      case DeckState.FRONT: {
        var current_card = this.state.deck[this.state.deck_idx];
        switch (current_card.type) {
          case CardType.ACTION:
            return (
              current_player.name +
              ", carry out the action on the card, then press the 'Next Player' button."
            );
          case CardType.INTERRUPT:
            return "All players! Everyone follow the directions on the card, then press the 'Next Player' button.";
          case CardType.STATUS:
            return (
              'Status card! ' +
              current_player.name +
              ', click on a player to place this status on'
            );
          default:
            break;
        }
        break;
      }

      default:
        break;
    }
  }

  showNextPlayerButton() {
    var current_card = this.state.deck[this.state.deck_idx];
    return (
      this.state.deckState === DeckState.FRONT &&
      current_card.type !== CardType.STATUS
    );
  }

  render() {
    console.log('Game.render()');
    var playerSlots =
      this.state.players.length > 8
        ? 12
        : this.state.players.length > 4
        ? 8
        : 4;
    return (
      <div className="app-shell">
        <GameHeader />
        <main className="page-frame game-frame">
          <section className="game-dashboard">
            <div className="player-grid" aria-label="Players">
              {Array.from(Array(playerSlots).keys()).map(idx => (
                <div className="player-grid-cell" key={idx}>
                  {this.renderPlayer(idx)}
                </div>
              ))}
            </div>

            <div className="turn-banner">
              <p className="eyebrow">Current turn</p>
              <h1>{this.getBannerText()}</h1>
            </div>

            <div className="card-table">
              <section className="card-choice" aria-label="Card A">
                <div className="card-choice-inner">
                  {this.renderCard(CardPosition.LEFT)}
                </div>
                {this.state.deckState !== DeckState.FRONT && (
                  <button
                    onClick={() => this.handleButtonClick(CardPosition.LEFT)}
                    className="pill-button pill-button-primary game-btn"
                  >
                    Flip card A
                  </button>
                )}
              </section>
              <section className="card-choice" aria-label="Card B">
                <div className="card-choice-inner">
                  {this.renderCard(CardPosition.RIGHT)}
                </div>
                {this.state.deckState !== DeckState.FRONT && (
                  <button
                    onClick={() => this.handleButtonClick(CardPosition.RIGHT)}
                    className="pill-button pill-button-primary game-btn"
                  >
                    Flip card B
                  </button>
                )}
              </section>
            </div>

            {this.showNextPlayerButton() && (
              <div className="next-player-panel">
                <button
                  onClick={() => this.handleButtonClick(CardPosition.UNSET)}
                  className="pill-button pill-button-magenta next-player-btn"
                >
                  Next Player
                </button>
              </div>
            )}
          </section>
        </main>
      </div>
    );
  }
}

export default Game;
