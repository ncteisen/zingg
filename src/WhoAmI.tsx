import {useCallback, useEffect, useId, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {createIdentityPicker} from './WhoAmINames';

export default function WhoAmI() {
  const [identity, setIdentity] = useState<string | null>(null);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [pickIdentity] = useState(createIdentityPicker);
  const startButton = useRef<HTMLButtonElement>(null);
  const startId = useId();
  const closeRound = useCallback(() => {
    setIdentity(null);
    startButton.current?.focus();
  }, []);

  return <>
    <button className="pill-button who-am-i-start" ref={startButton}
      aria-labelledby={startId} aria-describedby={startId + '-description'}
      onClick={() => { setIdentity(pickIdentity()); setHasPlayed(true); }} type="button">
      <span id={startId}>{hasPlayed ? 'Play again' : 'Start'}</span>
      <small id={startId + '-description'}>3 seconds to get ready.</small>
    </button>
    {identity !== null && createPortal(
      <IdentityRound identity={identity} onClose={closeRound} />, document.body)}
  </>;
}

function IdentityRound({identity, onClose}: {identity: string; onClose: () => void}) {
  const [seconds, setSeconds] = useState(3);
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const closeDialog = useCallback(() => {
    // Remove modal inertness before returning focus to the card's button.
    dialog.current?.close();
    onClose();
  }, [onClose]);

  useEffect(() => {
    const element = dialog.current!;
    element.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Use elapsed time so a delayed timer does not extend each countdown step.
    const revealAt = Date.now() + 3000;
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((revealAt - Date.now()) / 1000));
      setSeconds(remaining);
      if (remaining === 0) window.clearInterval(timer);
    }, 100);
    // Returning from another app should never unexpectedly expose the answer.
    const hideRound = () => { if (document.hidden) closeDialog(); };
    document.addEventListener('visibilitychange', hideRound);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', hideRound);
      element.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [closeDialog]);

  return <dialog className="who-am-i-round" ref={dialog} aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); closeDialog(); }}>
    <div className="who-am-i-stage">
      <h2 className="eyebrow" id={titleId}>Identity Crisis</h2>
      {seconds > 0 ? <div className="who-am-i-display">
        <p className="who-am-i-instruction">Phone to your forehead.<br />Screen facing your friends.</p>
        <p className="who-am-i-countdown" role="status" aria-live="polite" aria-atomic="true">{seconds}</p>
      </div> : <div className="who-am-i-display">
        {/* Deliberately not a live region: never read the secret aloud automatically. */}
        <p className="who-am-i-name">{identity}</p>
        <p className="who-am-i-instruction">Yes-or-no question. Drink. Take a guess.</p>
      </div>}
      <button className="pill-button pill-button-secondary" onClick={closeDialog} type="button">
        {seconds > 0 ? 'Cancel' : 'Done'}
      </button>
    </div>
  </dialog>;
}
