import React from 'react';

type GameHeaderProps = {
  onSwitchMode?: () => void;
  onResetRequest?: () => void;
};

function GameHeader(props: GameHeaderProps) {
  return (
    <header className="site-header">
      <a className="brand-mark" href="http://www.getzingg.com" target="_">
        Zingg
      </a>
      <span className="header-kicker">Living-room chaos, online</span>
      <div className="header-actions">
      {props.onSwitchMode && <button className="reset-link-button" onClick={props.onSwitchMode} type="button">Switch mode</button>}
      {props.onResetRequest && (
        <button
          className="reset-link-button"
          onClick={props.onResetRequest}
          type="button"
        >
          Reset game
        </button>
      )}
      </div>
    </header>
  );
}

export default GameHeader;
