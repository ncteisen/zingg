// Static for now. Keep the identity pool separate from the round UI.
export const WHO_AM_I_NAMES: readonly string[] = [
  'Beyoncé', 'Taylor Swift', 'Rihanna', 'Lady Gaga', 'Dolly Parton',
  'Snoop Dogg', 'Eminem', 'Adele', 'Harry Styles', 'Billie Eilish',
  'Elvis Presley', 'Michael Jackson', 'Freddie Mercury', 'Elton John', 'Madonna',
  'Britney Spears', 'Shakira', 'Bad Bunny', 'Sabrina Carpenter', 'Bruno Mars',
  'Cher', 'Prince', 'David Bowie', 'Whitney Houston', 'Mariah Carey',
  'Celine Dion', 'Miley Cyrus', 'Justin Bieber', 'Ed Sheeran', 'Dua Lipa',
  'Post Malone', 'Drake', 'Kendrick Lamar', 'Nicki Minaj', 'Cardi B',
  'Tom Hanks', 'Leonardo DiCaprio', 'Dwayne Johnson', 'Keanu Reeves', 'Jack Black',
  'Jennifer Aniston', 'Zendaya', 'Margot Robbie', 'Ryan Reynolds', 'Danny DeVito',
  'Meryl Streep', 'Morgan Freeman', 'Samuel L. Jackson', 'Nicolas Cage', 'Pedro Pascal',
  'Jennifer Coolidge', 'Robin Williams', 'Jim Carrey', 'Denzel Washington', 'Emma Stone',
  'Serena Williams', 'LeBron James', 'Michael Jordan', 'Lionel Messi', 'Cristiano Ronaldo',
  'Simone Biles', 'Usain Bolt', 'Muhammad Ali', 'Tony Hawk', 'Shaquille O’Neal',
  'Albert Einstein', 'Cleopatra', 'Napoleon Bonaparte', 'Abraham Lincoln', 'Adolf Hitler',
  'Barack Obama', 'Marilyn Monroe', 'Princess Diana', 'Frida Kahlo', 'Leonardo da Vinci',
  'Gordon Ramsay', 'Oprah Winfrey', 'Martha Stewart', 'Steve Irwin', 'Bob Ross',
  'Kim Kardashian', 'Paris Hilton', 'Guy Fieri', 'Greta Thunberg', 'Elon Musk',
  'Harry Potter', 'Hermione Granger', 'Darth Vader', 'Yoda', 'Chewbacca',
  'Batman', 'Spider-Man', 'Superman', 'Wonder Woman', 'Iron Man',
  'Shrek', 'Donkey (Shrek)', 'Elsa (Frozen)', 'Olaf (Frozen)', 'Mickey Mouse',
  'Bugs Bunny', 'SpongeBob SquarePants', 'Homer Simpson', 'Marge Simpson', 'Scooby-Doo',
  'Mario', 'Pikachu', 'Sonic the Hedgehog', 'Barbie', 'Willy Wonka',
  'Jack Sparrow', 'Forrest Gump', 'Wednesday Addams', 'The Grinch', 'Kermit the Frog',
  'Tom Cruise', 'Brad Pitt', 'Angelina Jolie', 'Will Smith', 'Adam Sandler',
  'Reese Witherspoon', 'Julia Roberts', 'Sandra Bullock', 'Robert Downey Jr.', 'Arnold Schwarzenegger',
  'Tiger Woods', 'Tom Brady', 'Michael Phelps', 'Mike Tyson', 'David Beckham',
  'Queen Elizabeth II', 'Julius Caesar', 'Vincent van Gogh', 'Isaac Newton', 'Amelia Earhart',
  'Gandalf', 'Frodo Baggins', 'Gollum', 'Dumbledore', 'Voldemort',
  'Buzz Lightyear', 'Woody (Toy Story)', 'Winnie the Pooh', 'Tigger', 'Stitch',
  'Deadpool', 'The Joker', 'Indiana Jones', 'James Bond', 'Mr. Bean',
  'Alexander the Great', 'Socrates', 'Plato', 'Aristotle', 'Confucius',
  'Genghis Khan', 'Joan of Arc', 'Henry VIII', 'Queen Elizabeth I', 'Marco Polo',
  'William Shakespeare', 'Galileo Galilei', 'Marie Curie', 'Charles Darwin', 'Nikola Tesla',
  'George Washington', 'Benjamin Franklin', 'Harriet Tubman', 'Frederick Douglass', 'Florence Nightingale',
  'Mahatma Gandhi', 'Nelson Mandela', 'Martin Luther King Jr.', 'Rosa Parks', 'Anne Frank',
  'Catherine the Great', 'Queen Victoria', 'Tutankhamun', 'Mansa Musa', 'Sun Tzu',
  'Sherlock Holmes', 'Dracula', 'Frankenstein’s monster', 'Tarzan', 'Peter Pan',
  'Captain Hook', 'Tinker Bell', 'Alice (Alice in Wonderland)', 'The Mad Hatter', 'Mary Poppins',
  'Dorothy (The Wizard of Oz)', 'The Wicked Witch of the West', 'Pinocchio', 'Cinderella', 'Snow White',
  'Mulan', 'Moana', 'Ariel (The Little Mermaid)', 'Aladdin', 'The Genie (Aladdin)',
  'Luke Skywalker', 'Princess Leia', 'R2-D2', 'C-3PO', 'E.T.',
  'Garfield', 'Snoopy', 'Charlie Brown', 'Bart Simpson', 'Fred Flintstone',
];

export const IDENTITY_HISTORY_KEY = 'zingg-identity-history-v1';

type IdentityHistory = {seen: string[]; previous?: string};
let sessionHistory: IdentityHistory = {seen: []};
let storageUnavailable = false;

function readHistory(): IdentityHistory {
  if (storageUnavailable) return sessionHistory;
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(IDENTITY_HISTORY_KEY);
  } catch {
    storageUnavailable = true;
    return sessionHistory;
  }
  try {
    const saved: unknown = JSON.parse(raw ?? 'null');
    if (saved && typeof saved === 'object' && 'seen' in saved && Array.isArray(saved.seen)) {
      return {
        seen: saved.seen.filter((name): name is string =>
          typeof name === 'string' && WHO_AM_I_NAMES.includes(name)),
        previous: 'previous' in saved && typeof saved.previous === 'string'
          ? saved.previous : undefined,
      };
    }
  } catch {
    // Invalid saved history should never prevent starting a round.
  }
  return {seen: []};
}

// Share draws across card visits and modes, and persist across browser sessions.
// Reserve on Start, including cancelled rounds, so a selected identity cannot repeat.
export function createIdentityPicker() {
  return () => {
    const history = readHistory();
    let remaining = WHO_AM_I_NAMES.filter(name => !history.seen.includes(name));
    if (remaining.length === 0) {
      history.seen = [];
      remaining = [...WHO_AM_I_NAMES];
    }
    const withoutPrevious = remaining.filter(name => name !== history.previous);
    const candidates = withoutPrevious.length > 0 ? withoutPrevious : remaining;
    const name = candidates[Math.floor(Math.random() * candidates.length)];
    sessionHistory = {seen: [...history.seen, name], previous: name};
    if (!storageUnavailable) {
      try {
        window.localStorage.setItem(IDENTITY_HISTORY_KEY, JSON.stringify(sessionHistory));
      } catch {
        // Keep sharing in-memory history even when storage is blocked or full.
        storageUnavailable = true;
      }
    }
    return name;
  };
}
