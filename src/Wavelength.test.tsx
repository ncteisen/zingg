import {act, cleanup, fireEvent, render, screen} from '@testing-library/react';
import Wavelength from './Wavelength';
import {createWavelengthScalePicker, WAVELENGTH_SCALES} from './WavelengthScales';

beforeEach(() => vi.useFakeTimers());
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

function clickAction(name: string) {
  act(() => vi.advanceTimersByTime(700));
  fireEvent.click(screen.getByRole('button', {name}));
}

test('scales cycle without repeats, including at the cycle boundary', () => {
  const pick = createWavelengthScalePicker();
  const cycle = Array.from({length: WAVELENGTH_SCALES.length}, pick);
  expect(new Set(cycle).size).toBe(WAVELENGTH_SCALES.length);
  expect(pick()).not.toBe(cycle[cycle.length - 1]);
});

test.each([[0, 0, 0], [0.5, 50, 42.5], [0.9999, 100, 10]])(
  'keeps target private until the guess is locked and revealed (random %f)', (random, target, guess) => {
    vi.spyOn(Math, 'random').mockReturnValue(random);
    const {container} = render(<Wavelength />);
    expect(container.querySelector('.wavelength-secret')).toBeNull();
    clickAction('Show secret');
    expect(container.querySelector('.wavelength-target-marker')).toHaveStyle({left: `${target}%`});
    expect(container.querySelector('.wavelength-secret')?.closest('[aria-live]')).toBeNull();
    expect(screen.getByRole('heading', {name: 'On Your Frequency'})).toHaveFocus();
    clickAction('Hide & pass');
    expect(container.querySelector('.wavelength-secret')).toBeNull();
    expect(container.querySelector('.wavelength-target-marker')).toBeNull();
    expect(container.querySelector('.wavelength-target-zone')).toBeNull();
    expect(screen.queryByText(/Target zone:/)).not.toBeInTheDocument();
    expect(screen.getByRole('slider', {name: 'The group’s guess'})).toHaveValue('50');
    expect(screen.queryByRole('button', {name: 'Reveal'})).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('slider', {name: 'The group’s guess'}), {target: {value: String(guess)}});
    clickAction('Lock guess');
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
    expect(container.querySelector('.wavelength-target-marker')).toBeNull();
    expect(container.querySelector('.wavelength-target-zone')).toBeNull();
    expect(screen.queryByText(/Secret spot:/)).not.toBeInTheDocument();
    expect(container.querySelector('.wavelength-guess-marker')).toHaveStyle({left: `${guess}%`});
    clickAction('Reveal');
    expect(container.querySelector('.wavelength-target-marker')).toHaveStyle({left: `${target}%`});
    expect(container.querySelector('.wavelength-target-zone')).toBeVisible();
    clickAction('Next clue giver');
    expect(container.querySelector('.wavelength-target-marker')).toBeNull();
    expect(container.querySelector('.wavelength-target-zone')).toBeNull();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    clickAction('Show secret');
    clickAction('Hide & pass');
    expect(screen.getByRole('slider', {name: 'The group’s guess'})).toHaveValue('50');
  });

test('backgrounding hides the secret without changing its position or scale', () => {
  vi.spyOn(Math, 'random').mockReturnValue(0.5);
  const {container} = render(<Wavelength />);
  clickAction('Show secret');
  const scale = container.querySelector('.wavelength-scale')!.textContent;
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
  fireEvent(document, new Event('visibilitychange'));
  expect(container.querySelector('.wavelength-secret')).toBeNull();
  expect(container.querySelector('.wavelength-scale')).toBeNull();
  clickAction('Show secret');
  expect(container.querySelector('.wavelength-target-marker')).toHaveStyle({left: '50%'});
  expect(container.querySelector('.wavelength-scale')!.textContent).toBe(scale);
});

test.each([
  [0.503, 40.3, true, 40.3, 20],
  [0.503, 60.3, true, 40.3, 20],
  [0.503, 40.2, false, 40.3, 20],
  [0.503, 60.4, false, 40.3, 20],
  [0, 0, true, 0, 10],
  [0, 10.1, false, 0, 10],
  [0.9999, 100, true, 90, 10],
  [0.9999, 89.9, false, 90, 10],
])('scores target %f and guess %f with inclusive, clipped bounds', (random, guess, hit, start, width) => {
  vi.spyOn(Math, 'random').mockReturnValue(random);
  const {container} = render(<Wavelength />);
  clickAction('Show secret');
  expect(container.querySelector('.wavelength-target-zone')).toHaveStyle({left: `${start}%`, width: `${width}%`});
  clickAction('Hide & pass');
  fireEvent.change(screen.getByRole('slider'), {target: {value: String(guess)}});
  clickAction('Lock guess');
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  clickAction('Reveal');
  expect(container.querySelector('.wavelength-target-zone')).toHaveStyle({left: `${start}%`, width: `${width}%`});
  expect(screen.getByRole('status')).toHaveTextContent(hit ? 'Hit. Nobody drinks.' :
    'Miss. Everyone drinks, including the clue giver.');
});


test('the centered default is a valid guess without moving the slider', () => {
  render(<Wavelength />);
  clickAction('Show secret');
  clickAction('Hide & pass');
  expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', 'In the middle');
  clickAction('Lock guess');
  expect(screen.getByText('Your guess: In the middle.')).toBeInTheDocument();
  expect(screen.getByRole('button', {name: 'Reveal'})).toBeDisabled();
  act(() => vi.advanceTimersByTime(700));
  expect(screen.getByRole('button', {name: 'Reveal'})).toBeEnabled();
});

test('rapid repeated input cannot lock a handoff or reveal a newly locked guess', () => {
  const {container} = render(<Wavelength />);
  fireEvent.click(screen.getByRole('button', {name: 'Show secret'}));
  // Never delay the action that hides a private answer.
  expect(screen.getByRole('button', {name: 'Hide & pass'})).toBeEnabled();
  fireEvent.click(screen.getByRole('button', {name: 'Hide & pass'}));
  const lock = screen.getByRole('button', {name: 'Lock guess'});
  expect(lock).toBeDisabled();
  fireEvent.click(lock);
  expect(screen.getByRole('slider')).toHaveValue('50');
  expect(container.querySelector('.wavelength-target-marker')).toBeNull();
  act(() => vi.advanceTimersByTime(699));
  expect(lock).toBeDisabled();
  act(() => vi.advanceTimersByTime(1));
  expect(lock).toBeEnabled();
  fireEvent.change(screen.getByRole('slider'), {target: {value: '63.2'}});
  fireEvent.click(lock);
  const reveal = screen.getByRole('button', {name: 'Reveal'});
  expect(reveal).not.toBe(lock);
  expect(reveal).toBeDisabled();
  fireEvent.click(reveal);
  expect(screen.getByText('Guess locked')).toBeInTheDocument();
  expect(container.querySelector('.wavelength-target-marker')).toBeNull();
  act(() => vi.advanceTimersByTime(700));
  fireEvent.click(reveal);
  expect(container.querySelector('.wavelength-target-marker')).toBeInTheDocument();
  expect(container.querySelector('.wavelength-guess-marker')).toHaveStyle({left: '63.2%'});
});

test('the next clue giver cannot expose a new secret through a repeated click', () => {
  render(<Wavelength />);
  for (const action of ['Show secret', 'Hide & pass', 'Lock guess', 'Reveal', 'Next clue giver']) {
    clickAction(action);
  }
  const show = screen.getByRole('button', {name: 'Show secret'});
  expect(show).toBeDisabled();
  fireEvent.click(show);
  expect(screen.queryByText('Secret spot')).toBeNull();
  act(() => vi.advanceTimersByTime(700));
  fireEvent.click(show);
  expect(screen.getByText('Secret spot')).toBeVisible();
});

test('leaving a guarded phase clears its timer', () => {
  const setTimer = vi.spyOn(window, 'setTimeout');
  const clearTimer = vi.spyOn(window, 'clearTimeout');
  const {unmount} = render(<Wavelength />);
  fireEvent.click(screen.getByRole('button', {name: 'Show secret'}));
  fireEvent.click(screen.getByRole('button', {name: 'Hide & pass'}));
  const guardTimer = setTimer.mock.calls.findIndex(([, delay]) => delay === 700);
  expect(guardTimer).toBeGreaterThanOrEqual(0);
  unmount();
  expect(clearTimer).toHaveBeenCalledWith(setTimer.mock.results[guardTimer].value);
});
