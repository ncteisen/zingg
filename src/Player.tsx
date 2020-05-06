import React from 'react';

export class PlayerData {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

type PlayerProps = {
  name: string;
  isTurn: boolean;
};
function Player(props: PlayerProps) {
    return (
      <div id="player1" className={props.isTurn ? "red4" : "game-container-color" + " rounded container"}>
      <div id="player2" className="red3 container rounded">
      <div id="player3" className="red2 container rounded">
      <div id="player4" className="red1 container rounded">
        {props.name}
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