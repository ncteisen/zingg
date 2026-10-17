import {useCallback, useEffect, useId, useLayoutEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {createUndercoverWordPicker} from './UndercoverWords';
import {useTrackEvent} from './analytics';

type Phase = 'setup' | 'handoff' | 'secret' | 'vote' | 'result';
type Round = {word: string; undercover: number; firstSpeaker: number; count: number};

export default function Undercover() {
  const [open, setOpen] = useState(false);
  const [playerCount, setPlayerCount] = useState(4);
  const [pickWord] = useState(createUndercoverWordPicker);
  const button = useRef<HTMLButtonElement>(null);
  const onClose = useCallback(() => {
    setOpen(false);
    button.current?.focus();
  }, []);

  return <>
    <button className="pill-button undercover-start" ref={button} type="button"
      onClick={() => setOpen(true)}>
      Deal roles
    </button>
    {open && createPortal(<UndercoverRound playerCount={playerCount} setPlayerCount={setPlayerCount}
      pickWord={pickWord} onClose={onClose} />, document.body)}
  </>;
}

function UndercoverRound({playerCount, setPlayerCount, pickWord, onClose}: {
  playerCount: number;
  setPlayerCount: (count: number) => void;
  pickWord: () => string;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('setup');
  const trackEvent = useTrackEvent();
  const [round, setRound] = useState<Round | null>(null);
  const [player, setPlayer] = useState(0);
  const [suspect, setSuspect] = useState<number | null>(null);
  const [confirmExit, setConfirmExit] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const titleId = useId();
  const countId = useId();

  const closeDialog = useCallback(() => {
    dialog.current?.close();
    onClose();
  }, [onClose]);

  useEffect(() => {
    const element = dialog.current!;
    element.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const hideSecret = () => {
      if (document.hidden) setPhase(current => current === 'secret' ? 'handoff' : current);
    };
    document.addEventListener('visibilitychange', hideSecret);
    return () => {
      document.removeEventListener('visibilitychange', hideSecret);
      element.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useLayoutEffect(() => {
    // Focus only the public heading. Never automatically read a secret aloud.
    heading.current?.focus();
  }, [phase, player, confirmExit]);

  function deal() {
    setRound({word: pickWord(), undercover: Math.floor(Math.random() * playerCount),
      firstSpeaker: Math.floor(Math.random() * playerCount), count: playerCount});
    setPlayer(0);
    setSuspect(null);
    setPhase('handoff');
    trackEvent('interactive_round_started', {card_title: 'Undercover', player_count: playerCount});
  }

  function requestClose() {
    if (phase === 'setup' || phase === 'result') closeDialog();
    else {
      if (phase === 'secret') setPhase('handoff');
      setConfirmExit(true);
    }
  }

  function hideAndPass() {
    if (player === round!.count - 1) setPhase('vote');
    else { setPlayer(player + 1); setPhase('handoff'); }
  }

  function revealResult() {
    if (suspect === null || !round) return;
    setPhase('result');
    trackEvent('interactive_round_finished', {card_title: 'Undercover', player_count: round.count,
      caught: suspect === round.undercover});
  }

  const publicHeading = confirmExit ? 'End this round?' : phase === 'setup' ? 'How many are playing?' :
    phase === 'handoff' || phase === 'secret' ? `Player ${player + 1} of ${round!.count}` :
    phase === 'vote' ? 'Who’s bluffing?' : suspect === round!.undercover ? 'Caught!' : 'They got away.';

  return <dialog className="undercover-round" ref={dialog} aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); requestClose(); }}>
    <div className="undercover-stage">
      <header className="undercover-header">
        <h2 className="eyebrow" id={titleId}>Undercover</h2>
        {!confirmExit && <button className="reset-link-button" type="button" onClick={requestClose}>
          {phase === 'setup' || phase === 'result' ? 'Close' : 'End round'}
        </button>}
      </header>
      <section className="undercover-content">
        <h3 ref={heading} tabIndex={-1}>{publicHeading}</h3>
        {confirmExit ? <>
          <p>Your roles will be discarded. You can deal a new round from the card.</p>
          <div className="undercover-actions">
            <button className="pill-button pill-button-secondary" type="button" onClick={() => setConfirmExit(false)}>Keep playing</button>
            <button className="pill-button pill-button-danger" type="button" onClick={() => {
              trackEvent('interactive_round_abandoned', {card_title: 'Undercover', player_count: round!.count});
              closeDialog();
            }}>End round</button>
          </div>
        </> : phase === 'setup' ? <>
          <p>Use one phone. Start with whoever’s holding it and pass clockwise. Remember your player number.</p>
          <label className="undercover-count" htmlFor={countId}>Players
            <select id={countId} value={playerCount} onChange={event => setPlayerCount(Number(event.target.value))}>
              {Array.from({length: 10}, (_, i) => i + 3).map(count => <option key={count} value={count}>{count}</option>)}
            </select>
          </label>
          <button className="pill-button undercover-start" type="button" onClick={deal}>Start round</button>
        </> : phase === 'handoff' ? <>
          <p className="undercover-handoff">{player === 0 ? 'You’re up first.' : `Pass to Player ${player + 1}.`}</p>
          <p>Only you should look at the screen.</p>
          <RevealButton key={player} onReveal={() => setPhase('secret')} />
        </> : phase === 'secret' ? <>
          <div className="undercover-secret">
            <p className="eyebrow">Your secret</p>
            <p className="undercover-word">{player === round!.undercover ? 'You’re undercover.' : round!.word}</p>
            <p>{player === round!.undercover ? 'You don’t know the word. Listen to the clues and bluff your way through.' :
              'Remember the word. Give a clue that proves you know it without giving it away.'}</p>
          </div>
          <button className="pill-button undercover-start" type="button" onClick={hideAndPass}>Hide & pass</button>
        </> : phase === 'vote' ? <>
          <p><strong>Player {round!.firstSpeaker + 1} starts.</strong> Give one clue each, clockwise. Don’t say the word.</p>
          <p>Discuss, then on three, point to your suspect. Select whoever gets the most votes. A tie? Vote again.</p>
          <fieldset className="undercover-votes">
            <legend>The group’s suspect</legend>
            {Array.from({length: round!.count}, (_, i) => <label key={i}>
              <input type="radio" name={titleId + '-suspect'} value={i} checked={suspect === i} onChange={() => setSuspect(i)} />
              <span>Player {i + 1}</span>
            </label>)}
          </fieldset>
          <button className="pill-button undercover-start" type="button" disabled={suspect === null} onClick={revealResult}>Reveal undercover</button>
        </> : <>
          <p className="undercover-word">Player {round!.undercover + 1} was undercover.</p>
          <p>The word was <strong>{round!.word}</strong>.</p>
          <p>{suspect === round!.undercover ? `Player ${round!.undercover + 1} drinks.` :
            `Everyone except Player ${round!.undercover + 1} drinks.`}</p>
          <div className="undercover-actions">
            <button className="pill-button undercover-start" type="button" onClick={deal}>Play again</button>
            <button className="pill-button pill-button-secondary" type="button" onClick={closeDialog}>Done</button>
          </div>
        </>}
      </section>
    </div>
  </dialog>;
}

function RevealButton({onReveal}: {onReveal: () => void}) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // A double-tap on Hide & pass must not reveal the next person's secret.
    const timer = window.setTimeout(() => setReady(true), 700);
    return () => window.clearTimeout(timer);
  }, []);
  return <button className="pill-button undercover-start" type="button" disabled={!ready} onClick={onReveal}>Reveal my role</button>;
}
