import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useCatalog } from '../context/useCatalog';
import { searchProducts } from '../data/search';
import { useCurrency } from '../context/CurrencyContext';

export default function SearchOverlay({ open, onClose }) {
  const { products } = useCatalog();
  const { fmt } = useCurrency();
  const [q, setQ] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQ('');
      const t = setTimeout(() => inputRef.current && inputRef.current.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const term = q.trim();
  const matches = useMemo(() => searchProducts(products, term), [term, products]);
  const PREVIEW = 8;
  const results = matches.slice(0, PREVIEW);

  // Hand the full query to the results page, which shows every match.
  function goToResults(e) {
    if (e) e.preventDefault();
    if (!term) return;
    onClose();
    navigate('/search?q=' + encodeURIComponent(term));
  }

  if (!open) return null;

  return (
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search">
      <div className="search-scrim" onClick={onClose}></div>
      <div className="search-panel">
        <form className="search-bar" onSubmit={goToResults} role="search">
          <Search className="search-ic" size={22} />
          <input
            ref={inputRef}
            className="search-input"
            type="text"
            placeholder="Search brands, bags, watches…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="search-close" type="button" aria-label="Close search" onClick={onClose}><X size={22} /></button>
        </form>
        <div className="search-results">
          {!term && <p className="search-hint">Try “Chanel”, “Birkin”, “watch”…</p>}
          {term && results.length === 0 && <p className="search-empty">No pieces match “{q}”.</p>}
          {results.map(({ product: p, index: i }) => (
            <Link key={p.brand + p.name} className="search-result" to={`/product/${i}`} onClick={onClose}>
              <span className="sr-thumb">
                {p.images && p.images[0] ? <img src={p.images[0]} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : <span className="sr-ph" />}
              </span>
              <span className="sr-meta">
                <span className="sr-brand">{p.brand}</span>
                <span className="sr-name">{p.name}</span>
              </span>
              <span className="sr-price">{fmt ? fmt(p.price) : '$' + p.price.toLocaleString()}</span>
            </Link>
          ))}
          {term && matches.length > 0 && (
            <div className="search-all">
              <p className="search-all-note">
                {matches.length > PREVIEW
                  ? `Showing ${PREVIEW} of ${matches.length} pieces`
                  : `${matches.length} ${matches.length === 1 ? 'piece' : 'pieces'}`}
              </p>
              <Link className="link-u" to={'/search?q=' + encodeURIComponent(term)} onClick={onClose} style={{ color: 'var(--ink-900)' }}>
                View all results
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
