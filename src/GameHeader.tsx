import React from 'react';
import Brand from './Brand';

type GameHeaderProps = {
  onSwitchMode?: () => void;
  onResetRequest?: () => void;
};

function GameHeader(props: GameHeaderProps) {
  return (
    <header className="site-header">
      <Brand onHome={props.onSwitchMode} />
      <span className="header-kicker">Good company required.</span>
      <div className="header-actions">
      {props.onResetRequest && (
        <button
          aria-label="Reset game"
          className="reset-link-button header-reset-button"
          onClick={props.onResetRequest}
          type="button"
        >
          Reset
        </button>
      )}
      </div>
    </header>
  );
}

export default GameHeader;
