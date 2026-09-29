import {useState} from 'react';
import Card, {type CardData} from '../src/Card';

export default function BrandPreview({cards}: {cards: CardData[]}) {
  const [scene, setScene] = useState<'home' | 'round'>('home');
  const [mode, setMode] = useState<'classic' | 'phone'>('classic');
  const [turn, setTurn] = useState(0);
  const names = ['Alex', 'Sam', 'Jordan', 'Charlie'];
  return <div className="brand-concept brand-preview">
    <header className="brand-preview-header">
      <button className="concept-wordmark" onClick={() => setScene('home')} type="button" aria-label="Zingg home">zingg<span>.</span></button>
      {scene === 'round' ? <button className="concept-quiet-button" onClick={() => setScene('home')} type="button">Back to home</button> : <span className="eyebrow">Bring your own friends.</span>}
    </header>
    {scene === 'home' ? <div className="concept-home">
      <div className="concept-home-copy">
        <p className="eyebrow">A drinking game for good company.</p>
        <h2>Questionable<br />decisions.<br /><em>Excellent company.</em></h2>
        <p>A deck of strange little challenges, unfortunate rules, and things you’ll insist never happened.</p>
        <fieldset className="concept-modes">
          <legend>How are you playing?</legend>
          <label><input type="radio" name="concept-mode" checked={mode === 'classic'} onChange={() => setMode('classic')} /><span><strong>Shared screen</strong><small>One host. Everyone else heckles.</small></span></label>
          <label><input type="radio" name="concept-mode" checked={mode === 'phone'} onChange={() => setMode('phone')} /><span><strong>Pass the phone</strong><small>One phone. Around the table.</small></span></label>
        </fieldset>
        <button className="concept-primary" onClick={() => {setTurn(0); setScene('round');}} type="button">Start game <span aria-hidden="true">↗</span></button>
      </div>
      <div className="concept-home-art"><img src={cards[2].img} alt="Viking Master card illustration" /><p>Everyone knows someone like this.</p></div>
    </div> : <div className="concept-round">
      <div className="concept-round-heading">
        <p className="eyebrow">{mode === 'classic' ? 'Around the table' : 'Pass the phone'}</p>
        <h2>{mode === 'classic' ? `${names[turn % names.length]}’s turn.` : 'Your turn.'}</h2>
        <p>Read it out. Commit to the bit.</p>
        {mode === 'classic' && <ol className="concept-roster" aria-label="Players">{names.map((name, index) => <li key={name} aria-current={turn % names.length === index ? 'step' : undefined}>{name}</li>)}</ol>}
      </div>
      <div className="concept-round-card">
        <Card data={cards[turn % cards.length]} />
        <button className="concept-primary" type="button" onClick={() => setTurn(turn + 1)}>{mode === 'classic' ? 'Next player' : 'Next card'} <span aria-hidden="true">→</span></button>
      </div>
    </div>}
    <footer className="concept-footer"><span>A little out of line.</span><span>zingg / good company required</span></footer>
  </div>;
}
