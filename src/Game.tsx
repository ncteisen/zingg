import React from 'react';

import DeckExhausted from './DeckExhausted';
import CardDataList from './CardDataList';
import Card, {CardType, BackOfCard} from './Card';
import GameOpts from './GameOpts';
import Player, {PlayerData} from './Player';
import GameHeader from './GameHeader';
import {trackEvent} from './analytics';
import {
  CardPosition,
  DeckState,
  SerializedGameState,
  createPlayableDeck,
  isValidSerializedGameState,
  playableCardIndexes,
  skipElephant,
} from './GamePersistence';

const cardDebuggingMode = false;

type GameProps = {
  player_names: string[];
  gameOpts: GameOpts;
  initialGameState?: SerializedGameState;
  onGameStateChange: (state: SerializedGameState) => void;
  onResetRequest: () => void;
  onSwitchMode?: () => void;
};
type GameState = {
  deck: number[];
  deck_idx: number;
  deckState: DeckState;
  players: PlayerData[];
  player_idx: number;
  pos: CardPosition;
};
class Game extends React.Component<GameProps, GameState> {
  constructor(props: GameProps) {
    super(props);

    if (
      props.initialGameState &&
      isValidSerializedGameState(
        props.initialGameState,
        props.player_names,
        props.gameOpts
      )
    ) {
      this.state = skipElephant({
        deck: props.initialGameState.deck,
        deck_idx: props.initialGameState.deck_idx,
        deckState: props.initialGameState.deckState,
        players: props.initialGameState.players.map(function (player) {
          return new PlayerData(player.name, player.status, player.idx);
        }),
        player_idx: props.initialGameState.player_idx,
        pos: props.initialGameState.pos,
      }, props.gameOpts.removeElephant);
      return;
    }

    var players = new Array<PlayerData>();
    props.player_names.forEach(function (name, i) {
      players.push(new PlayerData(name, '', i));
    });
    var deck = playableCardIndexes(props.gameOpts);
    this.state = skipElephant({
      deck: cardDebuggingMode ? deck : createPlayableDeck(props.gameOpts),
      deck_idx: 0,
      deckState: cardDebuggingMode ? DeckState.FRONT : DeckState.BACK,
      players: players,
      player_idx: 0,
      pos: cardDebuggingMode ? CardPosition.RIGHT : CardPosition.UNSET,
    }, props.gameOpts.removeElephant);
  }

  componentDidMount() {
    this.props.onGameStateChange(this.serializeState());
  }

  componentDidUpdate(_prevProps: GameProps, prevState: GameState) {
    if (prevState !== this.state) {
      this.props.onGameStateChange(this.serializeState());
    }
  }

  serializeState(): SerializedGameState {
    return {
      deck: this.state.deck,
      deck_idx: this.state.deck_idx,
      deckState: this.state.deckState,
      players: this.state.players.map(function (player) {
        return {
          name: player.name,
          status: player.status,
          idx: player.idx,
        };
      }),
      player_idx: this.state.player_idx,
      pos: this.state.pos,
    };
  }

  currentCard() {
    return CardDataList[this.state.deck[this.state.deck_idx]];
  }

  cardPositionToAnalyticsValue(pos: CardPosition) {
    switch (pos) {
      case CardPosition.LEFT:
        return 'left';
      case CardPosition.RIGHT:
        return 'right';
      case CardPosition.UNSET:
        return 'unset';
    }
  }

  renderPlayer(idx: number) {
    if (idx < this.state.players.length) {
      return (
        <Player
          isTurn={idx === this.state.player_idx}
          data={this.state.players[idx]}
        />
      );
    }
    return null;
  }

  renderCard(pos: CardPosition) {
    switch (this.state.deckState) {
      case DeckState.BACK:
        return <BackOfCard />;

      case DeckState.FRONT:
        if (pos === this.state.pos) {
          return <Card data={this.currentCard()} />;
        } else {
          return <BackOfCard />;
        }

      default:
        return <BackOfCard />;
    }
  }

  advanceToNextPlayer() {
    this.setState(state => skipElephant({
      ...state,
      deckState: state.deck_idx === state.deck.length - 1 ? DeckState.EXHAUSTED :
        cardDebuggingMode ? DeckState.FRONT : DeckState.BACK,
      player_idx: (state.player_idx + 1) % state.players.length,
      deck_idx: Math.min(state.deck_idx + 1, state.deck.length - 1),
    }, this.props.gameOpts.removeElephant));
  }

  handleRestart = () => {
    this.setState(skipElephant({deck: createPlayableDeck(this.props.gameOpts), deck_idx: 0,
      deckState: DeckState.BACK, pos: CardPosition.UNSET}, this.props.gameOpts.removeElephant));
  };

  handleButtonClick = (pos: CardPosition) => {
    switch (this.state.deckState) {
      case DeckState.BACK:
        trackEvent('card_revealed', {
          play_mode: 'classic',
          position: this.cardPositionToAnalyticsValue(pos),
          card_type: this.currentCard().type,
          card_title: this.currentCard().title,
        });
        this.setState({deckState: DeckState.FRONT});
        break;

      case DeckState.FRONT:
        trackEvent('next_player', {
          play_mode: 'classic',
        });
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
        var current_card = this.currentCard();
        switch (current_card.type) {
          case CardType.ACTION:
            return (
              current_player.name +
              ", carry out the action, then press 'Next Player'."
            );
          case CardType.INTERRUPT:
            return "All players! Follow the directions, then press 'Next Player'.";
          case CardType.STATUS:
            return (
              current_player.name +
              ", keep track of this status, then press 'Next Player'."
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
    return this.state.deckState === DeckState.FRONT;
  }

  render() {
    console.log('Game.render()');
    return (
      <div className="app-shell">
        <GameHeader onResetRequest={this.props.onResetRequest} onSwitchMode={this.props.onSwitchMode} />
        <main className="page-frame game-frame">
          <section className="game-dashboard">
            <div className="player-grid" aria-label="Players">
              {this.state.players.map((_player, idx) => (
                <div className="player-grid-cell" key={idx}>
                  {this.renderPlayer(idx)}
                </div>
              ))}
            </div>

            {this.state.deckState === DeckState.EXHAUSTED ? <DeckExhausted onRestart={this.handleRestart} /> : <>
            <div className="turn-banner">
              <p className="eyebrow">Current turn</p>
              <h1>{this.state.players[this.state.player_idx].name}’s turn.</h1>
              <p>{this.state.deckState === DeckState.BACK ? 'Pick A or B. Trust your instincts.' : this.getBannerText()}</p>
            </div>

            <div className={'card-table' + (this.state.deckState === DeckState.FRONT ? ' card-table-revealed' : '')}>
              <section className={'card-choice' + (this.state.deckState === DeckState.FRONT && this.state.pos !== CardPosition.LEFT ? ' card-choice-hidden' : '')} aria-label="Card A">
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
              <section className={'card-choice' + (this.state.deckState === DeckState.FRONT && this.state.pos !== CardPosition.RIGHT ? ' card-choice-hidden' : '')} aria-label="Card B">
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
            </>}
          </section>
        </main>
      </div>
    );
  }
}

export default Game;
