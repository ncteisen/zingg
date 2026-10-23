export default function SiteFooter({showHowToPlay = false}: {showHowToPlay?: boolean}) {
  return <footer className="site-footer">
    <a href="https://www.thegamecrafter.com/games/zingg" target="_blank" rel="noreferrer">The original paper game ↗</a>
    {showHowToPlay && <a className="how-to-play-link" href="/how-to-play/">How to play</a>}
  </footer>;
}
