import {VirtualMode} from './GameOpts';
import React, {useId, useRef, useState} from 'react';
import WhoAmI from './WhoAmI';
import Undercover from './Undercover';

type CardInteraction = 'who-am-i' | 'undercover';

export enum CardType {
  ACTION = 'Action',
  STATUS = 'Status',
  INTERRUPT = 'Everyone',
}

export class CardData {
  title: string;
  body: string;
  img: any;
  tips: string[];
  mode: VirtualMode;
  type: CardType;
  interaction?: CardInteraction;
  minPlayers?: number;
  constructor(
    title: string,
    body: string,
    img: any,
    type?: CardType,
    tips?: string[],
    mode?: VirtualMode,
    interaction?: CardInteraction,
    minPlayers?: number
  ) {
    this.title = title;
    this.body = body;
    this.img = img;
    this.tips = (tips && tips) || [];
    this.mode = (mode && mode) || VirtualMode.UNSET;
    this.type = (type && type) || CardType.ACTION;
    this.interaction = interaction;
    this.minPlayers = minPlayers;
  }
}

function ColorForCardType(type: CardType): string {
  switch (type) {
    case CardType.ACTION:
      return 'card-accent-lilac';
    case CardType.STATUS:
      return 'card-accent-mint';
    case CardType.INTERRUPT:
      return 'card-accent-coral';
  }
}

type CardProps = {
  data: CardData;
  headingRef?: React.Ref<HTMLHeadingElement>;
};
function Card(props: CardProps) {
  return <CardFace key={props.data.title} {...props} />;
}

function CardFace({data, headingRef}: CardProps) {
  const color = ColorForCardType(data.type);
  const hintId = useId();
  const hintButton = useRef<HTMLButtonElement>(null);
  const [showHints, setShowHints] = useState(false);
  return (
    <article
      className={'zingg-card ' + color}
      onKeyDown={event => {
        if (showHints && event.key === 'Escape') {
          event.preventDefault();
          setShowHints(false);
          hintButton.current?.focus();
        }
      }}
    >
      <div className="card-topline">
        <span className="card-type">{data.type}</span>
        {data.tips.length > 0 && (
          <button
            aria-controls={hintId}
            aria-expanded={showHints}
            className="card-hint-trigger"
            onClick={() => setShowHints(!showHints)}
            ref={hintButton}
            type="button"
          >
            {showHints ? 'Back' : 'Hint'}
          </button>
        )}
      </div>
      <h2 className="card-title" ref={headingRef} tabIndex={-1}>{data.title}</h2>
      <div className="card-content">
        <div
          className="card-front-content"
          aria-hidden={showHints}
          inert={showHints}
          style={{visibility: showHints ? 'hidden' : undefined}}
        >
          <div className="card-img-holder">
            <img className="card-img-top" src={data.img} alt="" />
          </div>
          <p className="card-text">{data.body}</p>
          {data.interaction === 'who-am-i' && <WhoAmI />}
          {data.interaction === 'undercover' && <Undercover />}
        </div>
        {data.tips.length > 0 && (
          <section
            aria-labelledby={hintId + '-title'}
            className="card-hint-content"
            hidden={!showHints}
            id={hintId}
            tabIndex={0}
          >
            <h3 id={hintId + '-title'}>Examples</h3>
            {data.tips.map((text, index) => (
              <p key={index} className="card-hint-text">{text}</p>
            ))}
          </section>
        )}
      </div>
    </article>
  );
}

export function BackOfCard() {
  return (
    <article className="zingg-card zingg-card-back">
      <div className="card-back-topline"><span>Good company required.</span></div>
      <div className="card-back-mark">
        <h2>zingg<span>.</span></h2>
        <p>A little out of line.</p>
      </div>
      <span className="card-back-bottom">Pick a side.</span>
    </article>
  );
}

export default Card;
