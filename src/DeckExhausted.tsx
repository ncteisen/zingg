import {useEffect, useRef} from 'react';

export default function DeckExhausted(props: {onRestart: () => void}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {heading.current?.focus();}, []);
  return (
    <section className="deck-exhausted">
      <p className="eyebrow">Every card played</p>
      <h1 tabIndex={-1} ref={heading}>Deck exhausted!</h1>
      <p>You’ve played every card. Shuffle the deck to keep the game going.</p>
      <button className="pill-button pill-button-primary" onClick={props.onRestart} type="button">
        Reshuffle and continue
      </button>
    </section>
  );
}
