// Static for now. Keep the identity pool separate from the round UI.
export const WHO_AM_I_NAMES: readonly string[] = [
  'Beyoncé', 'Taylor Swift', 'Rihanna', 'Lady Gaga', 'Dolly Parton',
  'Snoop Dogg', 'Eminem', 'Adele', 'Harry Styles', 'Billie Eilish',
  'Elvis Presley', 'Michael Jackson', 'Freddie Mercury', 'Elton John', 'Madonna',
  'Britney Spears', 'Shakira', 'Bad Bunny', 'Sabrina Carpenter', 'Bruno Mars',
  'Tom Hanks', 'Leonardo DiCaprio', 'Dwayne Johnson', 'Keanu Reeves', 'Jack Black',
  'Jennifer Aniston', 'Zendaya', 'Margot Robbie', 'Ryan Reynolds', 'Danny DeVito',
  'Meryl Streep', 'Morgan Freeman', 'Samuel L. Jackson', 'Nicolas Cage', 'Pedro Pascal',
  'Jennifer Coolidge', 'Robin Williams', 'Jim Carrey', 'Denzel Washington', 'Emma Stone',
  'Serena Williams', 'LeBron James', 'Michael Jordan', 'Lionel Messi', 'Cristiano Ronaldo',
  'Simone Biles', 'Usain Bolt', 'Muhammad Ali', 'Tony Hawk', 'Shaquille O’Neal',
  'Albert Einstein', 'Cleopatra', 'Napoleon Bonaparte', 'Abraham Lincoln', 'Adolf Hitler',
  'Barack Obama', 'Marilyn Monroe', 'Princess Diana', 'Frida Kahlo', 'Leonardo da Vinci',
  'Gordon Ramsay', 'Oprah Winfrey', 'Martha Stewart', 'Steve Irwin', 'Bob Ross',
  'Kim Kardashian', 'Paris Hilton', 'Guy Fieri', 'RuPaul', 'Greta Thunberg', 'Elon Musk',
  'Harry Potter', 'Hermione Granger', 'Darth Vader', 'Yoda', 'Chewbacca',
  'Batman', 'Spider-Man', 'Superman', 'Wonder Woman', 'Iron Man',
  'Shrek', 'Donkey (Shrek)', 'Elsa (Frozen)', 'Olaf (Frozen)', 'Mickey Mouse',
  'Bugs Bunny', 'SpongeBob SquarePants', 'Homer Simpson', 'Marge Simpson', 'Scooby-Doo',
  'Mario', 'Pikachu', 'Sonic the Hedgehog', 'Barbie', 'Willy Wonka',
  'Jack Sparrow', 'Forrest Gump', 'Wednesday Addams', 'The Grinch', 'Kermit the Frog',
];

// Draw without replacement for this card visit. A new cycle cannot repeat the last name.
export function createIdentityPicker() {
  let remaining: string[] = [];
  let previous: string | undefined;
  return () => {
    if (remaining.length === 0) remaining = [...WHO_AM_I_NAMES];
    const candidates = remaining.filter(name => name !== previous);
    const name = candidates[Math.floor(Math.random() * candidates.length)];
    remaining.splice(remaining.indexOf(name), 1);
    previous = name;
    return name;
  };
}
