export const WAVELENGTH_SCALES = [
  ['Minor inconvenience', 'Life-ruining disaster'],
  ['Terrible first date', 'Perfect first date'],
  ['Totally normal', 'Deeply weird'],
  ['Cheap thrill', 'Worth every penny'],
  ['Little white lie', 'Unforgivable betrayal'],
  ['Forgettable', 'Absolutely iconic'],
  ['Harmless habit', 'Massive red flag'],
  ['Easy to hide', 'Impossible to hide'],
  ['Boring party guest', 'Life of the party'],
  ['Underrated', 'Overrated'],
  ['Tiny flex', 'Outrageous brag'],
  ['Low maintenance', 'High maintenance'],
  ['Terrible gift', 'Perfect gift'],
  ['Instant regret', 'Best decision ever'],
  ['Innocent question', 'Way too personal'],
  ['Mildly awkward', 'I need to leave the country'],
  ['Easy to forgive', 'Holding that grudge forever'],
  ['Everyday luxury', 'Obscene extravagance'],
  ['Comforting sound', 'Unbearable noise'],
  ['Bad excuse', 'Completely believable excuse'],
  ['A little competitive', 'Would ruin a friendship to win'],
  ['Forgettable meal', 'Last-meal material'],
  ['Reasonable request', 'Absolutely taking the piss'],
  ['A quiet night in', 'A story you’ll tell forever'],
] as const;

export type WavelengthScale = typeof WAVELENGTH_SCALES[number];

export function createWavelengthScalePicker() {
  let remaining: WavelengthScale[] = [];
  let previous: WavelengthScale | undefined;
  return () => {
    if (remaining.length === 0) remaining = [...WAVELENGTH_SCALES];
    const candidates = remaining.filter(scale => scale !== previous);
    const scale = candidates[Math.floor(Math.random() * candidates.length)];
    remaining.splice(remaining.indexOf(scale), 1);
    previous = scale;
    return scale;
  };
}
