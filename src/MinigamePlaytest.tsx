import {useEffect, useId, useLayoutEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import Card from './Card';
import CardDataList from './CardDataList';
import {PlaytestContext} from './analytics';
import Wavelength from './Wavelength';
import wavelengthArt from './assets/deck/wavelength.webp';

// Shipped interactive cards appear automatically. Prototypes stay outside the deck.
const minigames = CardDataList.filter(card => card.interaction);
const wavelengthTitle = 'On Your Frequency';

export default function MinigamePlaytest({onClose}: {onClose: () => void}) {
  const [selected, setSelected] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const titleId = useId();
  const card = minigames.find(card => card.title === selected);

  useEffect(() => {
    const element = dialog.current!;
    element.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useLayoutEffect(() => { heading.current?.focus(); }, [selected]);

  function close() {
    dialog.current?.close();
    onClose();
  }

  return createPortal(<PlaytestContext.Provider value={true}><dialog className="minigame-playtest" ref={dialog} aria-labelledby={titleId}
    onCancel={event => {
      // A minigame's nested dialog owns its own Escape behavior.
      if (event.target !== event.currentTarget) return;
      event.preventDefault();
      close();
    }}>
    <div className="playtest-frame">
      <header className="playtest-header">
        <h1 ref={heading} tabIndex={-1} id={titleId}>Minigames</h1>
        <button className="reset-link-button" type="button" onClick={close}>Close playtest</button>
      </header>
      {selected ? <>
        <button className="reset-link-button playtest-back" type="button" onClick={() => setSelected(null)}>← All minigames</button>
        {selected === wavelengthTitle ? <Wavelength /> : card && <div className="playtest-card"><Card key={card.title} data={card} /></div>}
      </> : <>
        <p className="playtest-description">Pick a minigame to try. Your saved game stays where you left it.</p>
        <div className="playtest-list">
          <button className="playtest-choice" type="button" onClick={() => setSelected(wavelengthTitle)}>
            <img src={wavelengthArt} alt="" />
            <span>{wavelengthTitle}<small>Playtest only</small></span>
            <span aria-hidden="true">↗</span>
          </button>
          {minigames.map(game => <button key={game.title} className="playtest-choice" type="button" onClick={() => setSelected(game.title)}>
            <img src={game.img} alt="" />
            <span>{game.title}</span>
            <span aria-hidden="true">↗</span>
          </button>)}
        </div>
      </>}
    </div>
  </dialog></PlaytestContext.Provider>, document.body);
}
