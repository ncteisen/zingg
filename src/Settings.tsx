import elephant from './assets/elephant-setting.svg';

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
          <svg className="elephant-crossed-eyes" viewBox="0 0 80 80" fill="none">
            <circle cx="29" cy="35" r="3.5" fill="#c7b7d8" />
            <circle cx="51" cy="35" r="3.5" fill="#c7b7d8" />
            <path d="m25 31 8 8m0-8-8 8m22-8 8 8m0-8-8 8"
              stroke="#c1323b" strokeWidth="3.2" strokeLinecap="round" />
          </svg>
        </span>
      </label>
    </section>
  );
}
