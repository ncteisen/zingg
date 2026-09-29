import elephant from './assets/deck/elephant-in-the-room.webp';

type SettingsProps = {
  removeElephant: boolean;
  onRemoveElephantChange: (checked: boolean) => void;
};

export default function Settings(props: SettingsProps) {
  return (
    <section className="home-settings" aria-label="Settings">
      <h2 className="eyebrow">Settings</h2>
      <label className="elephant-setting">
        <input
          type="checkbox"
          checked={props.removeElephant}
          onChange={event => props.onRemoveElephantChange(event.target.checked)}
          aria-labelledby="elephant-setting-title"
        />
        <span id="elephant-setting-title" className="elephant-setting-title">remove the elephant</span>
        <span className="elephant-setting-art" aria-hidden="true">
          <img src={elephant} alt="" width="56" height="56" />
          <svg className="elephant-crossed-eyes" viewBox="0 0 640 480" fill="none">
            <circle cx="288" cy="130" r="14" fill="#7eafca" />
            <circle cx="372" cy="130" r="14" fill="#7eafca" />
            <path d="m264 106 48 48m0-48-48 48m84-48 48 48m0-48-48 48"
              stroke="#c1323b" strokeWidth="14" strokeLinecap="round" />
          </svg>
        </span>
      </label>
    </section>
  );
}
