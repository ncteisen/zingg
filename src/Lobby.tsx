import React from 'react';

type LobbyProps = {
  handleLobbyToGame: () => void
  names: string[];
  value: string;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void
};
function Lobby(Props: LobbyProps) {
  console.log("Lobby.render()");
  return (
    <div className="App">
      <div className="App-header">
        <h2>Welcome to the lobby!</h2>
      </div>
      <p className="App-intro">
        Enter the player names.
      </p>
      <form onSubmit={Props.handleSubmit} className="form">
        <label>
          Name:&nbsp;
          <input type="text" value={Props.value} onChange={Props.handleChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>
      <h4>Players:</h4>
      <div>
        {Props.names.map((name, index) => (
          <div key={index}>{name}</div>
        ))}
      </div>
      <br/>
      <br/>
      {Props.names.length > 0 &&
        <button onClick={Props.handleLobbyToGame}>
          start
        </button>
      }
    </div>
  );
}

export default Lobby;