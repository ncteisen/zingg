export default function Brand({onHome}: {onHome?: () => void}) {
  return onHome ? <button className="brand-mark" type="button" onClick={onHome} aria-label="Zingg home">zingg<span>.</span></button> : <span className="brand-mark" aria-label="Zingg">zingg<span>.</span></span>;
}
