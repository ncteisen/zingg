import {renderToStaticMarkup} from 'react-dom/server';
import {Home, MobileLanding} from './App';

const noop = () => {};

// Render the actual landing components, so crawler HTML cannot drift from the UI.
// createRoot replaces this fresh-session shell and restores local progress as usual.
export function renderLanding() {
  const desktop = renderToStaticMarkup(<Home
    mode="classic" onModeChange={noop}
    removeElephant={false} onRemoveElephantChange={noop}
    handleHomeToLobby={noop} handleHomeToMobile={noop}
    hasClassicGame={false} hasMobileGame={false}
  />);
  const mobile = renderToStaticMarkup(<MobileLanding
    removeElephant={false} onRemoveElephantChange={noop}
    handleMobileToGame={noop} onSwitchMode={noop}
  />).replace(/elephant-setting-title/g, 'mobile-elephant-setting-title');

  return `<style>
    [data-prerender="mobile"] { display: none; }
    @media (max-width: 767px) {
      [data-prerender="desktop"] { display: none; }
      [data-prerender="mobile"] { display: block; }
    }
  </style><div data-prerender="desktop">${desktop}</div><div data-prerender="mobile">${mobile}</div>`;
}
