import React from 'react';

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
  data: PlayerData;
  isTurn: boolean;
  onClick: () => void;
};
function Player(props: PlayerProps) {
  let name = props.data.name;
  if (name.length > 12) {
    name = name.slice(0, 9) + '...';
  }

  return (
    <button
      className={
        props.isTurn ? 'player-token player-token-current' : 'player-token'
      }
      onClick={props.onClick}
    >
      <span className="player-token-index">{props.data.idx + 1}</span>
      <span className="player-token-name">{name}</span>
      {props.data.status.length > 0 && (
        <span
          aria-label={'Status: ' + props.data.status}
          className="status-badge"
          title={props.data.status}
        >
          S
        </span>
      )}
    </button>
  );
}

export function PlaceholderPlayer() {
  return <div className="player-token player-token-placeholder" />;
}

export default Player;
