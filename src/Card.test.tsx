import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import Card from './Card';
import CardDataList from './CardDataList';

afterEach(cleanup);

const rankAndTell = CardDataList.find(card => card.title === 'Rank & Tell')!;
const mindMeld = CardDataList.find(card => card.title === 'Mind Meld')!;

test('examples replace the front and Back restores the rules', () => {
  render(<Card data={rankAndTell} />);
  const hint = screen.getByRole('button', {name: 'Hint'});
  hint.focus();
  expect(screen.queryByRole('region', {name: 'Examples'})).not.toBeInTheDocument();
  fireEvent.click(hint);
  expect(screen.getByRole('heading', {name: rankAndTell.title})).toBeVisible();
  expect(screen.getByText(rankAndTell.body.replace(/\s+/g, ' ').trim())).not.toBeVisible();
  expect(screen.getByRole('region', {name: 'Examples'})).toBeVisible();
  expect(screen.getByRole('button', {name: 'Back'})).toHaveFocus();
  expect(hint).toHaveAttribute('aria-expanded', 'true');
  fireEvent.click(hint);
  expect(screen.getByText(rankAndTell.body.replace(/\s+/g, ' ').trim())).toBeVisible();
  expect(screen.queryByRole('region', {name: 'Examples'})).not.toBeInTheDocument();
  expect(hint).toHaveAttribute('aria-expanded', 'false');
});

test('Escape from the scrollable examples returns focus to Hint', () => {
  render(<Card data={rankAndTell} />);
  fireEvent.click(screen.getByRole('button', {name: 'Hint'}));
  const examples = screen.getByRole('region', {name: 'Examples'});
  examples.focus();
  fireEvent.keyDown(examples, {key: 'Escape'});
  expect(screen.getByRole('button', {name: 'Hint'})).toHaveFocus();
  expect(screen.getByText(rankAndTell.body.replace(/\s+/g, ' ').trim())).toBeVisible();
});

test('a different card starts on its front, including cards without hints', () => {
  const {rerender} = render(<Card data={rankAndTell} />);
  fireEvent.click(screen.getByRole('button', {name: 'Hint'}));
  rerender(<Card data={mindMeld} />);
  expect(screen.getByText(mindMeld.body.replace(/\s+/g, ' ').trim())).toBeVisible();
  expect(screen.getByRole('button', {name: 'Hint'})).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(screen.getByRole('button', {name: 'Hint'}));
  const noHints = CardDataList.find(card => card.tips.length === 0)!;
  rerender(<Card data={noHints} />);
  expect(screen.getByText(noHints.body.replace(/\s+/g, ' ').trim())).toBeVisible();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});
