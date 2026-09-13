import {useEffect, useRef} from 'react';

export default function ResetModal(props: {onCancel: () => void; onConfirm: () => void; returnFocus: HTMLElement | null}) {
  const {onCancel, returnFocus} = props;
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previousFocus = returnFocus;
    const buttons = dialog.current!.querySelectorAll<HTMLButtonElement>('button');
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    first.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
      } else if (event.key === 'Tab') {
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    const containFocus = (event: FocusEvent) => {
      if (!dialog.current?.contains(event.target as Node)) first.focus();
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('focusin', containFocus);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('focusin', containFocus);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [onCancel, returnFocus]);

  return (
    <div ref={dialog} aria-labelledby="reset-modal-title" aria-describedby="reset-modal-description"
      aria-modal="true" className="modal-backdrop" role="dialog">
      <section className="reset-modal">
        <p className="eyebrow">Careful now</p>
        <h2 id="reset-modal-title">Reset game?</h2>
        <p id="reset-modal-description">This will clear all players, turns, cards, statuses, and mobile progress. Everyone goes back to the beginning.</p>
        <div className="modal-actions">
          <button className="pill-button pill-button-secondary" onClick={props.onCancel} type="button">Cancel</button>
          <button className="pill-button pill-button-danger" onClick={props.onConfirm} type="button">Reset game</button>
        </div>
      </section>
    </div>
  );
}
