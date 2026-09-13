export function validatePlayerName(name: string, names: string[], ignoreIndex?: number) {
  if (!name.trim()) return 'Enter a player name.';
  if (names.some((existing, index) => index !== ignoreIndex && existing.trim().toLowerCase() === name.trim().toLowerCase())) {
    return 'That player name is already taken.';
  }
  return '';
}
