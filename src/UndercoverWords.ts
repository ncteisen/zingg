// Familiar subjects with enough associations for different, indirect clues.
export const UNDERCOVER_WORDS: readonly string[] = [
  'Airport', 'Wedding', 'Karaoke', 'Camping', 'Casino',
  'Roller coaster', 'Road trip', 'First date', 'Gym', 'Supermarket',
  'Dentist', 'Library', 'Zoo', 'Museum', 'Beach',
  'Elevator', 'Subway', 'Hotel', 'Nightclub', 'Office',
  'Pizza', 'Sushi', 'Tacos', 'Popcorn', 'Ice cream',
  'Coffee', 'Birthday cake', 'Barbecue', 'Hot sauce', 'Pancakes',
  'Sunglasses', 'Umbrella', 'Toothbrush', 'Headphones', 'Suitcase',
  'Couch', 'Mirror', 'Alarm clock', 'Candle', 'Toilet paper',
  'Penguin', 'Shark', 'Pigeon', 'Cat', 'Snake',
  'Dinosaur', 'Octopus', 'Giraffe', 'Mosquito', 'Peacock',
  'Pirate', 'Vampire', 'Astronaut', 'Magician', 'Detective',
  'Clown', 'Mermaid', 'Zombie', 'Superhero', 'Cowboy',
  'Halloween', 'New Year’s Eve', 'Valentine’s Day', 'Prom', 'Graduation',
  'Job interview', 'Family reunion', 'Music festival', 'House party', 'Blind date',
  'Yoga', 'Bowling', 'Fishing', 'Skiing', 'Chess',
  'Hide-and-seek', 'Reality TV', 'Magic trick', 'Escape room', 'Speed dating',
];

export function createUndercoverWordPicker() {
  let remaining: string[] = [];
  let previous: string | undefined;
  return () => {
    if (remaining.length === 0) remaining = [...UNDERCOVER_WORDS];
    const candidates = remaining.filter(word => word !== previous);
    const word = candidates[Math.floor(Math.random() * candidates.length)];
    remaining.splice(remaining.indexOf(word), 1);
    previous = word;
    return word;
  };
}
