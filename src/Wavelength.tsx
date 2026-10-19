import {useEffect, useId, useLayoutEffect, useRef, useState} from 'react';
import wavelengthArt from './assets/deck/wavelength.webp';
import {createWavelengthScalePicker, type WavelengthScale} from './WavelengthScales';

type Phase = 'handoff' | 'secret' | 'guess' | 'locked' | 'result';
type Round = {scale: WavelengthScale; target: number};

function targetZone(target: number) {
  // Work in slider steps so a guess exactly on either edge counts as a hit.
  const center = Math.round(target * 10);
  return {start: Math.max(0, center - 100) / 10, end: Math.min(1000, center + 100) / 10};
}

// This prototype is mounted only by MinigamePlaytest, never by the card deck.
export default function Wavelength() {
  const [pickScale] = useState(createWavelengthScalePicker);
  const [phase, setPhase] = useState<Phase>('handoff');
  const [round, setRound] = useState<Round | null>(null);
  const [guess, setGuess] = useState(50);
  const heading = useRef<HTMLHeadingElement>(null);
  const id = useId();

  useLayoutEffect(() => { heading.current?.focus(); }, [phase]);

  useEffect(() => {
    const hideSecret = () => {
      if (document.hidden) setPhase(current => current === 'secret' ? 'handoff' : current);
    };
    document.addEventListener('visibilitychange', hideSecret);
    return () => document.removeEventListener('visibilitychange', hideSecret);
  }, []);

  function showSecret() {
    if (!round) setRound({scale: pickScale(), target: Math.round(Math.random() * 1000) / 10});
    setPhase('secret');
  }

  function nextRound() {
    setRound(null);
    setGuess(50);
    setPhase('handoff');
  }

  const zone = round ? targetZone(round.target) : null;
  const hit = zone !== null && guess >= zone.start && guess <= zone.end;

  return <article className="zingg-card card-accent-lilac wavelength" aria-labelledby={id + '-title'}>
    <div className="card-topline"><span className="card-type">Action</span></div>
    <h2 className="card-title" ref={heading} tabIndex={-1} id={id + '-title'}>On Your Frequency</h2>
    <div className="card-content wavelength-content">
      {phase === 'handoff' ? <>
        <div className="card-img-holder"><img className="card-img-top" src={wavelengthArt} alt="" /></div>
        <p className="card-text">Privately check the spot and give a clue. Everyone else agrees on a guess. Hit the zone: nobody drinks. Miss: everyone drinks, including you.</p>
        <button className="pill-button" type="button" onClick={showSecret}>Show secret</button>
      </> : <>
        <div className="wavelength-play-area">
          <div className="wavelength-scale" aria-label="The scale">
            <div><strong>{round!.scale[0]}</strong></div>
            <div><strong>{round!.scale[1]}</strong></div>
          </div>
          {phase === 'secret' ? <>
            {/* Never auto-announce the secret or put it into a public control label. */}
            <div className="wavelength-secret">
              <p className="eyebrow">Secret spot</p>
              <Spectrum target={round!.target} />
            </div>
          </> : phase === 'guess' ? <div className="wavelength-guess">
            <label className="eyebrow" htmlFor={id + '-slider'}>The group’s guess</label>
            <Spectrum guess={guess} onGuess={setGuess} sliderId={id + '-slider'} />
          </div> : phase === 'locked' ? <>
            <p className="eyebrow">Guess locked</p>
            <Spectrum guess={guess} />
          </> : <>
            <Spectrum guess={guess} target={round!.target} />
            <div className="wavelength-legend" aria-hidden="true">
              <span><i className="wavelength-guess-key" /> Your guess</span>
              <span><i className="wavelength-zone-key" /> Target zone</span>
            </div>
          </>}
        </div>
        {phase === 'secret' ? <>
          <p className="card-text">Hide the spot before giving your clue.</p>
          <button className="pill-button" type="button" onClick={() => setPhase('guess')}>Hide & pass</button>
        </> : phase === 'guess' ?
          <button className="pill-button" type="button" onClick={() => setPhase('locked')}>Lock guess</button> :
          phase === 'locked' ?
            <button className="pill-button" type="button" onClick={() => setPhase('result')}>Reveal</button> :
            <>
              <p className="card-text wavelength-outcome" role="status">{hit ?
                'Hit. Nobody drinks.' : 'Miss. Everyone drinks, including the clue giver.'}</p>
              <button className="pill-button" type="button" onClick={nextRound}>Next clue giver</button>
            </>}
      </>}
    </div>
  </article>;
}

function positionText(position: number) {
  return position === 50 ? 'In the middle' : position === 0 ? 'At the left end' :
    position === 100 ? 'At the right end' : `${position} percent of the way from left to right`;
}

function Spectrum({guess, target, onGuess, sliderId}: {
  guess?: number;
  target?: number;
  onGuess?: (value: number) => void;
  sliderId?: string;
}) {
  const zone = target !== undefined ? targetZone(target) : null;
  return <div className="wavelength-spectrum">
    <div className="wavelength-rail" aria-hidden="true">
      <div className="wavelength-track">
        {zone && <span className="wavelength-target-zone" style={{left: `${zone.start}%`, width: `${zone.end - zone.start}%`}} />}
      </div>
      {target !== undefined && <span className="wavelength-target-marker" style={{left: `${target}%`}} />}
      {guess !== undefined && <span className="wavelength-guess-marker" style={{left: `${guess}%`}} />}
    </div>
    {onGuess ? <input id={sliderId} className="wavelength-slider" type="range" min="0" max="100" step="0.1"
      value={guess} aria-valuetext={positionText(guess!)} onChange={event => onGuess(Number(event.target.value))} /> :
      <span className="wavelength-sr-only">
        {guess !== undefined && `Your guess: ${positionText(guess)}. `}
        {target !== undefined && `Secret spot: ${positionText(target)}. `}
        {zone && `Target zone: ${positionText(zone.start)} to ${positionText(zone.end)}.`}
      </span>}
  </div>;
}
