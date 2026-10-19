import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import Wavelength from './Wavelength';
import {createWavelengthScalePicker, WAVELENGTH_SCALES} from './WavelengthScales';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

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
    fireEvent.click(screen.getByRole('button', {name: 'Show secret'}));
    expect(container.querySelector('.wavelength-target-marker')).toHaveStyle({left: `${target}%`});
    expect(container.querySelector('.wavelength-secret')?.closest('[aria-live]')).toBeNull();
    expect(screen.getByRole('heading', {name: 'On Your Frequency'})).toHaveFocus();
    fireEvent.click(screen.getByRole('button', {name: 'Hide & pass'}));
    expect(container.querySelector('.wavelength-secret')).toBeNull();
    expect(container.querySelector('.wavelength-target-marker')).toBeNull();
    expect(container.querySelector('.wavelength-target-zone')).toBeNull();
    expect(screen.queryByText(/Target zone:/)).not.toBeInTheDocument();
    expect(screen.getByRole('slider', {name: 'The group’s guess'})).toHaveValue('50');
    expect(screen.queryByRole('button', {name: 'Reveal'})).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('slider', {name: 'The group’s guess'}), {target: {value: String(guess)}});
    fireEvent.click(screen.getByRole('button', {name: 'Lock guess'}));
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
    expect(container.querySelector('.wavelength-target-marker')).toBeNull();
    expect(container.querySelector('.wavelength-target-zone')).toBeNull();
    expect(screen.queryByText(/Secret spot:/)).not.toBeInTheDocument();
    expect(container.querySelector('.wavelength-guess-marker')).toHaveStyle({left: `${guess}%`});
    fireEvent.click(screen.getByRole('button', {name: 'Reveal'}));
    expect(container.querySelector('.wavelength-target-marker')).toHaveStyle({left: `${target}%`});
    expect(container.querySelector('.wavelength-target-zone')).toBeVisible();
    fireEvent.click(screen.getByRole('button', {name: 'Next clue giver'}));
    expect(container.querySelector('.wavelength-target-marker')).toBeNull();
    expect(container.querySelector('.wavelength-target-zone')).toBeNull();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Show secret'}));
    fireEvent.click(screen.getByRole('button', {name: 'Hide & pass'}));
    expect(screen.getByRole('slider', {name: 'The group’s guess'})).toHaveValue('50');
  });

test('backgrounding hides the secret without changing its position or scale', () => {
  vi.spyOn(Math, 'random').mockReturnValue(0.5);
  const {container} = render(<Wavelength />);
  fireEvent.click(screen.getByRole('button', {name: 'Show secret'}));
  const scale = container.querySelector('.wavelength-scale')!.textContent;
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
  fireEvent(document, new Event('visibilitychange'));
  expect(container.querySelector('.wavelength-secret')).toBeNull();
  expect(container.querySelector('.wavelength-scale')).toBeNull();
  fireEvent.click(screen.getByRole('button', {name: 'Show secret'}));
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
  fireEvent.click(screen.getByRole('button', {name: 'Show secret'}));
  expect(container.querySelector('.wavelength-target-zone')).toHaveStyle({left: `${start}%`, width: `${width}%`});
  fireEvent.click(screen.getByRole('button', {name: 'Hide & pass'}));
  fireEvent.change(screen.getByRole('slider'), {target: {value: String(guess)}});
  fireEvent.click(screen.getByRole('button', {name: 'Lock guess'}));
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name: 'Reveal'}));
  expect(container.querySelector('.wavelength-target-zone')).toHaveStyle({left: `${start}%`, width: `${width}%`});
  expect(screen.getByRole('status')).toHaveTextContent(hit ? 'Hit. Nobody drinks.' :
    'Miss. Everyone drinks, including the clue giver.');
});


test('the centered default is a valid guess without moving the slider', () => {
  render(<Wavelength />);
  fireEvent.click(screen.getByRole('button', {name: 'Show secret'}));
  fireEvent.click(screen.getByRole('button', {name: 'Hide & pass'}));
  expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', 'In the middle');
  fireEvent.click(screen.getByRole('button', {name: 'Lock guess'}));
  expect(screen.getByText('Your guess: In the middle.')).toBeInTheDocument();
  expect(screen.getByRole('button', {name: 'Reveal'})).toBeEnabled();
});
