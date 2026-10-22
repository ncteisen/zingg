import React from 'react';

import DeckExhausted from './DeckExhausted';
import CardDataList from './CardDataList';
import Card from './Card';
import GameOpts, {VirtualMode} from './GameOpts';
import GameHeader from './GameHeader';
import {trackEvent} from './analytics';
import {
  CardPosition,
  DeckState,
  SerializedMobileGameState,
  createPlayableDeck,
  isValidSerializedMobileGameState,
  skipUnavailableCards,
} from './GamePersistence';

const mobileGameOpts: GameOpts = {
  virtualMode: VirtualMode.LIVE,
};

type MobileGameProps = {
  removeElephant?: boolean;
  initialGameState?: SerializedMobileGameState;
  onGameStateChange: (state: SerializedMobileGameState) => void;
  onResetRequest: () => void;
  onSwitchMode?: () => void;
};

type MobileGameState = {
  deck: number[];
  deck_idx: number;
  deckState: DeckState;
  pos: CardPosition;
};

class MobileGame extends React.Component<MobileGameProps, MobileGameState> {
  private publicHeading = React.createRef<HTMLHeadingElement>();

  constructor(props: MobileGameProps) {
    super(props);

    if (
      props.initialGameState &&
      isValidSerializedMobileGameState(props.initialGameState, mobileGameOpts)
    ) {
      this.state = skipUnavailableCards({
        deck: props.initialGameState.deck,
        deck_idx: props.initialGameState.deck_idx,
        deckState: props.initialGameState.deckState,
        pos: props.initialGameState.pos,
      }, {removeElephant: props.removeElephant});
      return;
    }

    this.state = skipUnavailableCards({
      deck: createPlayableDeck(mobileGameOpts),
      deck_idx: 0,
      deckState: DeckState.BACK,
      pos: CardPosition.UNSET,
    }, {removeElephant: props.removeElephant});
  }

  componentDidMount() {
    this.props.onGameStateChange(this.serializeState());
  }

  componentDidUpdate(_prevProps: MobileGameProps, prevState: MobileGameState) {
    if (prevState !== this.state) {
      this.props.onGameStateChange(this.serializeState());
    }
    if (prevState.deckState !== this.state.deckState || prevState.deck_idx !== this.state.deck_idx) {
      this.publicHeading.current?.focus();
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

  handleCardChoice = (pos: CardPosition) => {
    if (this.state.deckState !== DeckState.BACK) return;
    trackEvent('card_revealed', {
      play_mode: 'mobile',
      position: this.cardPositionToAnalyticsValue(pos),
      card_type: this.currentCard().type,
      card_title: this.currentCard().title,
    });
    this.setState({
      deckState: DeckState.FRONT,
      pos: pos,
    });
  };

  handleNextPlayer = () => {
    if (this.state.deckState !== DeckState.FRONT) return;
    trackEvent('next_player', {
      play_mode: 'mobile',
    });
    this.setState(state => skipUnavailableCards({
      ...state,
      deck_idx: Math.min(state.deck_idx + 1, state.deck.length - 1),
      deckState: state.deck_idx === state.deck.length - 1 ? DeckState.EXHAUSTED : DeckState.BACK,
      pos: CardPosition.UNSET,
    }, {removeElephant: this.props.removeElephant}));
  };

  handleRestart = () => {
    this.setState(skipUnavailableCards({deck: createPlayableDeck(mobileGameOpts), deck_idx: 0,
      deckState: DeckState.BACK, pos: CardPosition.UNSET}, {removeElephant: this.props.removeElephant}));
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
          <h1 ref={this.publicHeading} tabIndex={-1}>Pick A or B.</h1>
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
          <Card data={this.currentCard()} headingRef={this.publicHeading} />
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
        <GameHeader onResetRequest={this.props.onResetRequest} onSwitchMode={this.props.onSwitchMode} />
        <div className="mobile-landscape-guard" role="status">
          <h1>Turn your phone upright.</h1>
          <p>Zingg mobile is built for passing the phone in portrait mode.</p>
        </div>
        <main className="mobile-game-frame">
          {this.state.deckState === DeckState.EXHAUSTED ? <DeckExhausted onRestart={this.handleRestart} /> : this.state.deckState === DeckState.FRONT
            ? this.renderCardScreen()
            : this.renderChoiceScreen()}
        </main>
      </div>
    );
  }
}

export {mobileGameOpts};
export default MobileGame;
