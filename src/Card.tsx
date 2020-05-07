import React from 'react';
import back from './assets/back.png'

export enum CardType {
  ACTION = "Action",
  STATUS = "Status",
  INTERRUPT = "Interrupt",
}
 
export class CardData {
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

function ColorForCardType(type: CardType): string {
  switch (type) {
    case CardType.ACTION:
      return "blue"
    case CardType.STATUS:
      return "green"
    case CardType.INTERRUPT:
      return "red"
  }
}

type CardProps = {
  data: CardData
}
function Card(props: CardProps) {
  const color = ColorForCardType(props.data.type);
  return (
    <div id="deck1" className={color + "4 container rounded"}>
    <div id="deck2" className={color + "3 container rounded"}>
    <div id="deck3" className={color + "2 container rounded"}>
      <div id="card" className={color + "1 card"}>
        <div className="card-body-holder1 rounded">
        <div className="card-body-holder2 rounded">
          <div className="card-title-holder rounded">
            <h4 className="card-title">{props.data.title}</h4>
          </div>
          <div className="card-img-holder rounded">
          <img className="card-img-top" src={props.data.img} alt="Card image"/>
          </div>
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


export function BackOfCard() {
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

export default Card;