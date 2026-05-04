import React from 'react';

type GameHeaderProps = {
  onResetRequest?: () => void;
};

function GameHeader(props: GameHeaderProps) {
  return (
    <header className="site-header">
      <a className="brand-mark" href="http://www.getzingg.com" target="_">
        Zingg
      </a>
      <span className="header-kicker">Living-room chaos, online</span>
      {props.onResetRequest && (
        <button
          className="reset-link-button"
          onClick={props.onResetRequest}
          type="button"
        >
          Reset game
        </button>
      )}
    </header>
  );
}

export default GameHeader;
