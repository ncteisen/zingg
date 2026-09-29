import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import Card, {CardType} from '../src/Card';
import CardDataList from '../src/CardDataList';
import Brand from '../src/Brand';
import '../src/index.css';
import '../src/App.css';
import './deck.css';

const cards = CardDataList.filter((card, index, all) => all.findIndex(other => other.title === card.title) === index);
function DeckGallery() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const filtered = cards.filter(card => card.title.toLowerCase().includes(query.toLowerCase()) && (type === 'all' || card.type === type));
  return <div className="app-shell">
    <header className="site-header"><Brand /><a href="/">Play the game ↗</a></header>
    <main className="deck-gallery">
      <section className="section-intro"><p className="eyebrow">The complete art pass</p><h1>Good company. Bad ideas.</h1><p>Warm ink, quiet jokes, and a little questionable behavior. {cards.length} illustrations across all {CardDataList.length} cards.</p></section>
      <div className="deck-filters">
        <label>Find a card<input className="text-input" type="search" placeholder="Search card names" value={query} onChange={event=>setQuery(event.target.value)} /></label>
        <label>Card type<select value={type} onChange={event=>setType(event.target.value)}><option value="all">All types</option>{Object.values(CardType).map(value=><option key={value}>{value}</option>)}</select></label>
        <p role="status">{filtered.length} {filtered.length === 1 ? 'card' : 'cards'}</p>
      </div>
      <div className="deck-gallery-grid">{filtered.map(card=><div key={card.title}><Card data={card}/><a className="deck-art-link" href={card.img} target="_blank" rel="noreferrer">Open artwork ↗</a></div>)}</div>
      {filtered.length===0 && <p>No cards match that search.</p>}
    </main>
  </div>;
}
createRoot(document.getElementById('root')!).render(<DeckGallery/>);
