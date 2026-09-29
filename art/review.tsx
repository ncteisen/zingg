import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import Card from '../src/Card';
import CardDataList from '../src/CardDataList';
import BrandPreview from './BrandPreview';
import './legacy-app.css';
import './review.css';
import './brand.css';
import mindMeld from './pilots/mind-meld-v1.png';
import sandwich from './pilots/compliment-sandwich-v1.png';
import viking from './pilots/viking-master-v1.png';
import mindMeldV2 from './pilots/mind-meld-v2.png';
import sandwichV2 from './pilots/compliment-sandwich-v2.png';
import vikingV2 from './pilots/viking-master-v2-clean.png';
import mindMeldV3 from './pilots/mind-meld-v3.png';
import sandwichV3 from './pilots/compliment-sandwich-v3.png';
import vikingV3 from './pilots/viking-master-v3-clean.png';
import elephantV3 from './pilots/elephant-in-the-room-v3.png';
import originalMindMeld from '../src/assets/mind-meld.svg';
import originalSandwich from '../src/assets/sandwich.png';
import originalViking from '../src/assets/viking.png';
import originalElephant from '../src/assets/elephant.png';
import promptV1 from './prompts/base-v1.txt?raw';
import promptV2 from './prompts/base-v2.txt?raw';
import promptV3 from './prompts/base-v3.txt?raw';

type Version = 'original' | 'v1' | 'v2' | 'v3';
const pilots = [
  {title: 'Mind Meld', original: originalMindMeld, images: {v1: mindMeld, v2: mindMeldV2, v3: mindMeldV3}, test: '01 / The misunderstanding'},
  {title: 'Compliment Sandwich', original: originalSandwich, images: {v1: sandwich, v2: sandwichV2, v3: sandwichV3}, test: '02 / The rude surprise'},
  {title: 'Viking Master', original: originalViking, images: {v1: viking, v2: vikingV2, v3: vikingV3}, test: '03 / The double meaning'},
  {title: 'Elephant in the Room', original: originalElephant, images: {v1: undefined, v2: undefined, v3: elephantV3}, test: '04 / The morning after'},
];
const versions: {id: Version; label: string}[] = [
  {id: 'original', label: 'Original'},
  {id: 'v1', label: '01 · Warm ink'},
  {id: 'v2', label: '02 · More mischief'},
  {id: 'v3', label: '03 · Dry jokes'},
];

function ArtReview() {
  const [version, setVersion] = useState<Version>('v3');
  const [brand, setBrand] = useState(true);
  const [view, setView] = useState<'art' | 'site'>('art');
  const cards = pilots.map(pilot => {
    const original = CardDataList.find(card => card.title === pilot.title)!;
    return {...original, img: version === 'original' ? pilot.original : pilot.images[version] ?? pilot.original};
  });
  return (
    <main className="art-review">
      <header className="art-review-header">
        <p className="eyebrow">Zingg / Art & brand study 03</p>
        <h1>Warm ink, dry jokes.</h1>
        <p>The approved direction. <a href="/">Play the redesigned game ↗</a> · <a href="/art/deck.html">Browse the full deck ↗</a></p>
        <div className="art-review-toggle" role="group" aria-label="Study view">
          <button aria-pressed={view === 'art'} onClick={() => setView('art')} type="button">Card artwork</button>
          <button aria-pressed={view === 'site'} onClick={() => setView('site')} type="button">Site concept ↗</button>
        </div>
      </header>
      <div className="art-review-controls">
        <div>
          <p className="eyebrow">Artwork</p>
          <div className="art-review-toggle" role="group" aria-label="Artwork version">
            {versions.map(option => <button key={option.id} aria-pressed={version === option.id} onClick={() => setVersion(option.id)} type="button">{option.label}</button>)}
          </div>
        </div>
        {view === 'art' && <div>
          <p className="eyebrow">Card styling</p>
          <div className="art-review-toggle" role="group" aria-label="Card styling">
            <button aria-pressed={!brand} onClick={() => setBrand(false)} type="button">Original UI</button>
            <button aria-pressed={brand} onClick={() => setBrand(true)} type="button">Brand concept</button>
          </div>
        </div>}
      </div>
      {view === 'art' ? <div className={'art-review-grid' + (brand ? ' brand-concept' : '')}>
        {cards.map((card, index) => <section className="art-review-pilot" key={card.title}>
          <p className="eyebrow">{pilots[index].test}</p>
          <Card data={card} />
          <div className="art-review-caption">
            <a href={card.img} target="_blank" rel="noreferrer">View artwork ↗</a>
            {index === 3 && version !== 'v3' && <span>Original · first explored in pass 3</span>}
          </div>
        </section>)}
      </div> : <>
        <p className="art-review-footnote">Interactive layout sample · four cards and example players · no saved-game changes.</p>
        <BrandPreview cards={cards} />
      </>}
      <section className="art-review-direction">
        <p><strong>The direction:</strong> warm brown ink, calm expressions, one visual punchline. Let the picture earn the laugh.</p>
        <p><strong>The UI:</strong> quieter paper, bigger unboxed art, a brick-red primary action, and the same ink throughout. The site concept includes a home screen and a sample round.</p>
        <details>
          <summary>Read the reusable art prompt</summary>
          {version === 'original' ? <p>The original assets predate this art study.</p> : <pre>{version === 'v1' ? promptV1 : version === 'v2' ? promptV2 : promptV3}</pre>}
        </details>
        <p className="art-review-footnote">Approved art and brand direction. This page preserves the earlier comparisons; the actual app now uses the complete redesign.</p>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<ArtReview />);
