import {VirtualMode} from './GameOpts';
import React, {useState} from 'react';
import {Tooltip} from 'reactstrap';
import back from './assets/back.png';

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

function TooltipIdForTitle(title: string): string {
  return 'ExampleTooltip-' + title.replace(/[^A-Za-z0-9]/g, '-');
}

type CardProps = {
  data: CardData;
};
function Card(props: CardProps) {
  const color = ColorForCardType(props.data.type);
  const tooltipId = TooltipIdForTitle(props.data.title);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggle = () => setTooltipOpen(!tooltipOpen);
  return (
    <article className={'zingg-card ' + color}>
      <div className="card-topline">
        <span className="card-type">{props.data.type}</span>
        {props.data.tips.length > 0 && (
          <>
            <span id={tooltipId} className="card-tooltip-trigger">
              {tooltipOpen ? 'Hide' : 'Show'} examples
            </span>
            <Tooltip
              trigger="hover"
              placement="right-end"
              isOpen={tooltipOpen}
              target={tooltipId}
              toggle={toggle}
            >
              {props.data.tips.map((text, index) => (
                <div key={index} className="tooltip-content">
                  {text}
                  <br />
                  <br />
                </div>
              ))}
            </Tooltip>
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
      <div className="card-back-topline">
        <span>Zingg</span>
        <span>Pick a side</span>
      </div>
      <div className="card-back-mark">
        <h2>Zingg</h2>
        <img
          className="card-img-top back-img-centered"
          src={back}
          alt="Card back"
        />
      </div>
    </article>
  );
}

export default Card;
