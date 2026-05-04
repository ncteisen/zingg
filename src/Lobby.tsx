import React from 'react';
import GameOpts, {VirtualMode} from './GameOpts';
import GameHeader from './GameHeader';

type LobbyProps = {
  handleLobbyToGame: () => void;
  names: string[];
  value: string;
  gameOpts: GameOpts;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleVirtualClick: (virtualMode: VirtualMode) => void;
};
function Lobby(Props: LobbyProps) {
  console.log('Lobby.render()');
  let start_button: React.ReactNode;
  if (
    Props.names.length > 1 &&
    Props.gameOpts.virtualMode !== VirtualMode.UNSET
  ) {
    start_button = (
      <button
        className="pill-button pill-button-primary lobby-btn-start"
        onClick={Props.handleLobbyToGame}
      >
        Start game
      </button>
    );
  } else {
    start_button = (
      <p className="lobby-cant-start-message">
        Add at least two friends and choose your chaos format.
      </p>
    );
  }
  return (
    <div className="app-shell">
      <GameHeader />
      <main className="page-frame lobby-frame">
        <section className="section-intro section-intro-lime">
          <p className="eyebrow">Lobby</p>
          <h1>Build the table.</h1>
          <p>
            Add the people in the room, the people in the little Zoom boxes, and
            anyone else willing to make questionable choices.
          </p>
        </section>

        <section className="lobby-grid">
          <div className="setup-panel">
            <div className="panel-heading">
              <p className="eyebrow">Players</p>
              <h2>{Props.names.length}/12 seats filled</h2>
            </div>
            <form onSubmit={Props.handleSubmit} className="lobby-form">
              <label htmlFor="player-name">Name</label>
              <div className="input-row">
                <input
                  id="player-name"
                  className="text-input"
                  type="text"
                  value={Props.value}
                  onChange={Props.handleChange}
                  placeholder="Add a player"
                />
                <input
                  type="submit"
                  value="Add"
                  className="pill-button pill-button-secondary lobby-btn-add"
                />
              </div>
            </form>
            <div className="player-roster" aria-label="Players">
              {Props.names.length === 0 && (
                <p className="empty-state">No players yet.</p>
              )}
              {Props.names.map((name, index) => (
                <div className="roster-player" key={index}>
                  <span className="roster-number">{index + 1}</span>
                  <span>
                    {name.length < 12 ? name : name.slice(0, 9) + '...'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <aside className="setup-panel setup-panel-accent">
            <div className="panel-heading">
              <p className="eyebrow">Game options</p>
              <h2>Choose your chaos format</h2>
            </div>
            <p className="option-copy">
              Is this happening through a screen, or are you all wedged onto the
              same suspicious couch?
            </p>
            <div
              className="segmented-control"
              role="group"
              aria-label="Virtual game mode"
            >
              <button
                onClick={() => Props.handleVirtualClick(VirtualMode.VIRTUAL)}
                className={
                  Props.gameOpts.virtualMode === VirtualMode.VIRTUAL
                    ? 'segment-option selected'
                    : 'segment-option'
                }
              >
                Yes
              </button>
              <button
                onClick={() => Props.handleVirtualClick(VirtualMode.LIVE)}
                className={
                  Props.gameOpts.virtualMode === VirtualMode.LIVE
                    ? 'segment-option selected'
                    : 'segment-option'
                }
              >
                No
              </button>
            </div>
            <div className="start-game-holder">
              <div className="readiness-card">
                <span className="readiness-label">Ready check</span>
                <strong>
                  {Props.names.length > 1 &&
                  Props.gameOpts.virtualMode !== VirtualMode.UNSET
                    ? 'Locked in'
                    : 'Needs setup'}
                </strong>
              </div>
              {start_button}
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default Lobby;
