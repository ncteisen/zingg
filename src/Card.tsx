import {VirtualMode} from './GameOpts';
import React, {useId, useRef} from 'react';

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
  constructor(
    title: string,
    body: string,
    img: any,
    type?: CardType,
    tips?: string[],
    mode?: VirtualMode
  ) {
    this.title = title;
    this.body = body;
    this.img = img;
    this.tips = (tips && tips) || [];
    this.mode = (mode && mode) || VirtualMode.UNSET;
    this.type = (type && type) || CardType.ACTION;
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
};
function Card(props: CardProps) {
  const color = ColorForCardType(props.data.type);
  const hintId = useId();
  const closeHint = useRef<HTMLButtonElement>(null);
  return (
    <article className={'zingg-card ' + color}>
      <div className="card-topline">
        <span className="card-type">{props.data.type}</span>
        {props.data.tips.length > 0 && (
          <>
            <button
              aria-controls={hintId}
              aria-haspopup="dialog"
              className="card-hint-trigger"
              popoverTarget={hintId}
              type="button"
            >
              Hint
            </button>
            <div
              key={props.data.title}
              aria-labelledby={hintId + '-title'}
              className="card-hint-popover"
              id={hintId}
              onToggle={event => {
                if (event.newState === 'open') closeHint.current?.focus();
              }}
              popover="auto"
              role="dialog"
            >
              <div className="card-hint-header">
                <h3 id={hintId + '-title'}>Examples</h3>
                <button
                  aria-label="Close hint"
                  className="card-hint-close"
                  popoverTarget={hintId}
                  popoverTargetAction="hide"
                  ref={closeHint}
                  type="button"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              {props.data.tips.map((text, index) => (
                <p key={index} className="card-hint-text">{text}</p>
              ))}
            </div>
          </>
        )}
      </div>
      <h2 className="card-title">{props.data.title}</h2>
      <div className="card-img-holder">
        <img className="card-img-top" src={props.data.img} alt="" />
      </div>
      <p className="card-text">{props.data.body}</p>
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
