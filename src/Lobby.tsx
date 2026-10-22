import React, {useState} from 'react';
import GameOpts, {VirtualMode} from './GameOpts';
import GameHeader from './GameHeader';
import {validatePlayerName} from './PlayerName';

type LobbyProps = {
  handleLobbyToGame: () => void;
  names: string[];
  value: string;
  gameOpts: GameOpts;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleVirtualClick: (virtualMode: VirtualMode) => void;
  handleResetRequest: () => void;
  onSwitchMode: () => void;
  onRenamePlayer: (index: number, name: string) => string;
  onRemovePlayer: (index: number) => void;
  nameError?: string;
  hasSavedGame?: boolean;
};
function Lobby(Props: LobbyProps) {
  console.log('Lobby.render()');
  let start_button: React.ReactNode;
  if (
    Props.names.length > 1 &&
    Props.names.every((name, index) => !validatePlayerName(name, Props.names, index)) &&
    Props.gameOpts.virtualMode !== VirtualMode.UNSET
  ) {
    start_button = (
      <button
        className="pill-button pill-button-primary lobby-btn-start"
        onClick={Props.handleLobbyToGame}
      >
        {Props.hasSavedGame ? 'Resume game' : 'Start game'}
      </button>
    );
  } else {
    start_button = (
      <p className="lobby-cant-start-message">
        {Props.names.some((name, index) => validatePlayerName(name, Props.names, index))
          ? 'Give each player a unique, non-empty name to continue.'
          : 'Add at least two players and choose where you’re playing.'}
      </p>
    );
  }
  return (
    <div className="app-shell">
      <GameHeader onResetRequest={Props.handleResetRequest} onSwitchMode={Props.onSwitchMode} />
      <main className="page-frame lobby-frame">
        <section className="section-intro section-intro-lime">
          <p className="eyebrow">Lobby</p>
          <h1>Build the table.</h1>
          <p>
            Two to twelve people. One host. Everyone else heckles.
          </p>
        </section>

        <section className="lobby-grid">
          <div className="setup-panel">
            <div className="panel-heading">
              <p className="eyebrow">Players</p>
              <h2>{Props.names.length}/12 seats filled</h2>
            </div>
            {Props.hasSavedGame ? <p className="option-copy">Edit the highlighted names to resume your saved game. Reset to start with a different group or format.</p> : <form onSubmit={Props.handleSubmit} className="lobby-form">
              <label htmlFor="player-name">Name</label>
              <div className="input-row">
                <input
                  id="player-name"
                  className="text-input"
                  type="text"
                  value={Props.value}
                  onChange={Props.handleChange}
                  placeholder="Add a player"
                  aria-invalid={!!Props.nameError}
                  aria-describedby={Props.nameError ? 'name-error' : undefined}
                />
                <input
                  type="submit"
                  value="Add"
                  className="pill-button pill-button-secondary lobby-btn-add"
                />
              </div>
              {Props.nameError && <p id="name-error" className="form-error" role="alert">{Props.nameError}</p>}
            </form>}
            <div className="player-roster" aria-label="Players">
              {Props.names.length === 0 && (
                <p className="empty-state">No players yet.</p>
              )}
              {Props.names.map((name, index) => (
                <RosterPlayer key={`${index}-${name}`} name={name} index={index}
                  nameError={validatePlayerName(name, Props.names, index)} canRemove={!Props.hasSavedGame}
                  onRename={Props.onRenamePlayer} onRemove={Props.onRemovePlayer} />
              ))}
            </div>
          </div>

          <aside className="setup-panel setup-panel-accent">
            <div className="panel-heading">
              <p className="eyebrow">Game options</p>
              <h2>Where’s the party?</h2>
            </div>
            <p className="option-copy">
              Choose cards for a video call or for everyone in the same room.
            </p>
            <div
              className="segmented-control"
              role="group"
              aria-label="Game format"
            >
              <button
                disabled={Props.hasSavedGame}
                onClick={() => Props.handleVirtualClick(VirtualMode.VIRTUAL)}
                aria-pressed={Props.gameOpts.virtualMode === VirtualMode.VIRTUAL}
                className={
                  Props.gameOpts.virtualMode === VirtualMode.VIRTUAL
                    ? 'segment-option selected'
                    : 'segment-option'
                }
              >
                Over video
              </button>
              <button
                disabled={Props.hasSavedGame}
                onClick={() => Props.handleVirtualClick(VirtualMode.LIVE)}
                aria-pressed={Props.gameOpts.virtualMode === VirtualMode.LIVE}
                className={
                  Props.gameOpts.virtualMode === VirtualMode.LIVE
                    ? 'segment-option selected'
                    : 'segment-option'
                }
              >
                In person
              </button>
            </div>
            <div className="start-game-holder">
              {start_button}
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

function RosterPlayer(props: {name: string; index: number; nameError: string; canRemove: boolean;
  onRename: (index: number, name: string) => string; onRemove: (index: number) => void}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(props.name);
  const [error, setError] = useState('');
  return <div className="roster-player">
    <span className="roster-number">{props.index + 1}</span>
    {editing ? <form className="roster-edit" onSubmit={event => {
      event.preventDefault();
      const message = props.onRename(props.index, value);
      setError(message);
      if (!message) setEditing(false);
    }}>
      <input autoFocus className="text-input" aria-label={'Rename ' + (props.name || 'player ' + (props.index + 1))}
        aria-invalid={!!error} aria-describedby={error ? 'rename-error-' + props.index : undefined}
        value={value} onChange={event => setValue(event.target.value)} />
      <div className="roster-actions">
        <button type="submit" className="reset-link-button">Save name</button>
        <button type="button" className="reset-link-button" onClick={() => {setEditing(false); setValue(props.name); setError('');}}>Cancel</button>
      </div>
      {error && <p id={'rename-error-' + props.index} className="form-error" role="alert">{error}</p>}
    </form> : <>
      <span className="roster-name">{props.name || 'Unnamed player'}
        {props.nameError && <span className="form-error" style={{display: 'block'}}>{props.nameError}</span>}
      </span>
      <div className="roster-actions">
        <button className="reset-link-button" type="button" aria-label={'Edit ' + (props.name || 'player ' + (props.index + 1))}
          onClick={() => {setValue(props.name); setEditing(true);}}>Edit</button>
        {props.canRemove && <button className="reset-link-button" type="button" aria-label={'Remove ' + (props.name || 'player ' + (props.index + 1))} onClick={() => props.onRemove(props.index)}>Remove</button>}
      </div>
    </>}
  </div>;
}

export default Lobby;
