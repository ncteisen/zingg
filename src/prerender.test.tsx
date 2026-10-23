import {act, fireEvent, within} from '@testing-library/react';
import {createRoot} from 'react-dom/client';
import App from './App';
import {renderLanding} from './prerender';

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

it('renders public landing copy without reading saved player data', () => {
  const read = vi.spyOn(window.localStorage, 'getItem');
  const html = renderLanding();
  expect(read).not.toHaveBeenCalled();
  expect(html).toContain('A drinking game for good company.');
  expect(html).toContain('Shared screen');
  expect(html).toContain('Pass the phone');
  expect(html).toContain('Start mobile game');
  const shell = document.createElement('div');
  shell.innerHTML = html;
  const ids = Array.from(shell.querySelectorAll('[id]'), element => element.id);
  expect(new Set(ids).size).toBe(ids.length);
});

it.each([1024, 390])('replaces the static shell with a working app at width %i', async width => {
  vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(width);
  const container = document.createElement('div');
  container.innerHTML = renderLanding();
  document.body.append(container);
  const root = createRoot(container);
  try {
    await act(async () => root.render(<App />));
    expect(container.querySelector('[data-prerender]')).toBeNull();
    const ui = within(container);
    expect(ui.getByRole('link', {name: 'How to play'})).toHaveAttribute('href', '/how-to-play/');
    if (width <= 767) {
      fireEvent.click(ui.getByRole('button', {name: /start mobile game/i}));
      expect(ui.getByRole('button', {name: 'Card A'})).toBeInTheDocument();
      await act(async () => root.render(<App key="reload" />));
      expect(ui.getByRole('button', {name: 'Card A'})).toBeInTheDocument();
    } else {
      fireEvent.click(ui.getByRole('button', {name: /^start game/i}));
      expect(ui.getByLabelText(/name/i)).toBeInTheDocument();
    }
    expect(ui.queryByRole('link', {name: 'How to play'})).not.toBeInTheDocument();
  } finally {
    await act(async () => root.unmount());
    container.remove();
  }
});
