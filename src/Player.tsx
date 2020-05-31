import React, { useState } from 'react';
import { Tooltip } from 'reactstrap';

export class PlayerData {
  name: string;
  status: string;
  idx: number;
  constructor(name: string, status: string, idx: number) {
    this.name = name;
    this.status = status;
    this.idx = idx;
  }
}

type PlayerProps = {
  data: PlayerData
  isTurn: boolean;
  onClick: () => void;
};
function Player(props: PlayerProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggle = () => setTooltipOpen(!tooltipOpen);

  let name = props.data.name
  if (name.length > 9) {
    name = name.slice(0, 9) + "...";
  }

  return (
    <div id="player1" className={props.isTurn ? "red4" : "game-container-color" + " rounded container"}>
    <div id="player2" className="red3 container rounded" onClick={props.onClick}>
    <div id="player3" className="red2 container rounded">
    <div id="player4" className="red1 container rounded">
      <text>{name}</text>
      {props.data.status.length > 0 &&
        <>
        <span id={"StatusTooltip" + props.data.idx} className={"green" + "2 btn status-tooltip"}><b>S</b></span>
        <Tooltip  trigger="hover"
                placement="right-end"
                isOpen={tooltipOpen}
                target={"StatusTooltip" + props.data.idx}
                toggle={toggle}>
                {props.data.status}
      </Tooltip>
      </>
    }
    </div>
    </div>
    </div>
    </div>
    );
}

export function PlaceholderPlayer() {
    return (
      <div id="playerPlaceholder" className="container rounded">
      </div>
      );
}

export default Player;