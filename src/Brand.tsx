import {useCallback, useRef, useState} from 'react';
import MinigamePlaytest from './MinigamePlaytest';

export default function Brand({onHome}: {onHome?: () => void}) {
  const [playtesting, setPlaytesting] = useState(false);
  const taps = useRef({count: 0, startedAt: 0});
  const logo = useRef<HTMLButtonElement>(null);
  const closePlaytest = useCallback(() => {
    setPlaytesting(false);
    logo.current?.focus();
  }, []);

  function handleTap() {
    if (onHome) { onHome(); return; }
    const now = Date.now();
    if (now - taps.current.startedAt > 2000 || taps.current.count === 0) {
      taps.current = {count: 1, startedAt: now};
    } else taps.current.count++;
    if (taps.current.count === 5) {
      taps.current.count = 0;
      setPlaytesting(true);
    }
  }

  return <>
    <button className="brand-mark" ref={logo} type="button" onClick={handleTap} aria-label={onHome ? 'Zingg home' : 'Zingg'}>
      zingg<span>.</span>
    </button>
    {playtesting && <MinigamePlaytest onClose={closePlaytest} />}
  </>;
}
