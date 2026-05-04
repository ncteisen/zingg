import React from 'react';

import CardDataList from './CardDataList';
import Card from './Card';
import GameOpts, {VirtualMode} from './GameOpts';
import GameHeader from './GameHeader';
import {
  CardPosition,
  DeckState,
  SerializedMobileGameState,
  createPlayableDeck,
  isValidSerializedMobileGameState,
} from './GamePersistence';

const mobileGameOpts: GameOpts = {
  virtualMode: VirtualMode.LIVE,
};

type MobileGameProps = {
  initialGameState?: SerializedMobileGameState;
  onGameStateChange: (state: SerializedMobileGameState) => void;
  onResetRequest: () => void;
};

type MobileGameState = {
  deck: number[];
  deck_idx: number;
  deckState: DeckState;
  pos: CardPosition;
};

class MobileGame extends React.Component<MobileGameProps, MobileGameState> {
  constructor(props: MobileGameProps) {
    super(props);

    if (
      props.initialGameState &&
      isValidSerializedMobileGameState(props.initialGameState, mobileGameOpts)
    ) {
      this.state = {
        deck: props.initialGameState.deck,
        deck_idx: props.initialGameState.deck_idx,
        deckState: props.initialGameState.deckState,
        pos: props.initialGameState.pos,
      };
      return;
    }

    this.state = {
      deck: createPlayableDeck(mobileGameOpts),
      deck_idx: 0,
      deckState: DeckState.BACK,
      pos: CardPosition.UNSET,
    };
  }

  componentDidMount() {
    this.props.onGameStateChange(this.serializeState());
  }

  componentDidUpdate(_prevProps: MobileGameProps, prevState: MobileGameState) {
    if (prevState !== this.state) {
      this.props.onGameStateChange(this.serializeState());
    }
  }

  serializeState(): SerializedMobileGameState {
    return {
      deck: this.state.deck,
      deck_idx: this.state.deck_idx,
      deckState: this.state.deckState,
      pos: this.state.pos,
    };
  }

  currentCard() {
    return CardDataList[this.state.deck[this.state.deck_idx]];
  }

  handleCardChoice = (pos: CardPosition) => {
    this.setState({
      deckState: DeckState.FRONT,
      pos: pos,
    });
  };

  handleNextPlayer = () => {
    this.setState({
      deck_idx: (this.state.deck_idx + 1) % this.state.deck.length,
      deckState: DeckState.BACK,
      pos: CardPosition.UNSET,
    });
  };

  renderChoiceButton(label: string, pos: CardPosition) {
    return (
      <button
        aria-label={'Card ' + label}
        className="mobile-choice-button"
        onClick={() => this.handleCardChoice(pos)}
        type="button"
      >
        <span className="mobile-choice-letter">{label}</span>
        <span className="mobile-choice-copy">Tap to reveal</span>
      </button>
    );
  }

  renderChoiceScreen() {
    return (
      <section className="mobile-choice-screen">
        <div className="mobile-turn-copy">
          <p className="eyebrow">Your turn</p>
          <h1>Pick A or B.</h1>
          <p>Tap one side, read it out loud, then do what it says.</p>
        </div>
        <div className="mobile-choice-grid">
          {this.renderChoiceButton('A', CardPosition.LEFT)}
          {this.renderChoiceButton('B', CardPosition.RIGHT)}
        </div>
      </section>
    );
  }

  renderCardScreen() {
    return (
      <section className="mobile-card-screen">
        <div className="mobile-card-holder">
          <Card data={this.currentCard()} />
        </div>
        <div className="mobile-next-bar">
          <button
            className="pill-button pill-button-magenta mobile-next-button"
            onClick={this.handleNextPlayer}
            type="button"
          >
            Next player
          </button>
        </div>
      </section>
    );
  }

  render() {
    console.log('MobileGame.render()');
    return (
      <div className="app-shell mobile-game-shell">
        <GameHeader onResetRequest={this.props.onResetRequest} />
        <div className="mobile-landscape-guard" role="status">
          <h1>Turn your phone upright.</h1>
          <p>Zingg mobile is built for passing the phone in portrait mode.</p>
        </div>
        <main className="mobile-game-frame">
          {this.state.deckState === DeckState.FRONT
            ? this.renderCardScreen()
            : this.renderChoiceScreen()}
        </main>
      </div>
    );
  }
}

export {mobileGameOpts};
export default MobileGame;
