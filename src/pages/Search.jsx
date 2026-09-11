import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, X } from 'lucide-react';
import Reveal from '../components/Reveal';
import ProductCard from '../components/ProductCard';
import { useCatalog } from '../context/useCatalog';
import { searchProducts, matchedBrand } from '../data/search';
import './search.extra.css';

export default function Search() {
  const { products, loading } = useCatalog();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const [draft, setDraft] = useState(q);

  // Keep the field in step when the query changes from outside the page
  // (a suggested brand, the header overlay, the back button).
  useEffect(() => { setDraft(q); }, [q]);

  const results = useMemo(() => searchProducts(products, q), [products, q]);
  const brand = useMemo(() => matchedBrand(products, q), [products, q]);

  useEffect(() => {
    document.title = q ? `“${q}” — Bougie Edition` : 'Search — Bougie Edition';
  }, [q]);

  // Brands to offer when a search comes back empty — real stock, not a guess.
  const brandSuggestions = useMemo(() => {
    const seen = [];
    products.forEach((p) => { if (p.brand && !seen.includes(p.brand)) seen.push(p.brand); });
    return seen.sort().slice(0, 8);
  }, [products]);

  function submit(e) {
    e.preventDefault();
    const next = draft.trim();
    setParams(next ? { q: next } : {}, { replace: false });
  }

  const count = results.length;
  const heading = brand
    ? <>All <span className="serif-italic">{brand}</span><span className="dot">.</span></>
    : <>Results for <span className="serif-italic">{q}</span><span className="dot">.</span></>;

  return (
    <>
      <section className="page-hero container">
        <Reveal as="p" className="eyebrow">
          {q ? (loading ? 'Searching' : `${count} ${count === 1 ? 'piece' : 'pieces'}`) : 'Search the collection'}
        </Reveal>
        <Reveal as="h1" className="page-title reveal-d1">
          {q ? heading : <>What are you <span className="serif-italic">looking for</span>?</>}
        </Reveal>

        {/* Once a search has been run the field centres under the heading;
            while idle it stays left, in line with the rest of the hero. */}
        <Reveal as="form" className={'search-page-form reveal-d2' + (q ? ' is-centered' : '')} onSubmit={submit} role="search">
          <label className="visually-hidden" htmlFor="search-page-input">Search the collection</label>
          <input
            id="search-page-input"
            className="spf-input"
            type="search"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Search brands, bags, watches…"
            autoComplete="off"
          />
          {draft && (
            <button type="button" className="spf-clear" aria-label="Clear search" onClick={() => { setDraft(''); setParams({}); }}>
              <X size={18} />
            </button>
          )}
          <button type="submit" className="spf-go" aria-label="Search">
            <SearchIcon size={18} aria-hidden="true" />
          </button>
        </Reveal>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          {!q && (
            <div className="search-idle">
              <p className="search-idle-lead">Search by maison, silhouette or category — or start from a house we carry.</p>
              <div className="brand-pills">
                {brandSuggestions.map((b) => (
                  <Link key={b} className="brand-pill" to={`/search?q=${encodeURIComponent(b)}`}>{b}</Link>
                ))}
              </div>
            </div>
          )}

          {q && !loading && count === 0 && (
            <div className="search-idle">
              <p className="search-none">Nothing in the current edit matches “{q}”.</p>
              <p className="search-idle-lead">Try a house we carry, or let us source the piece for you.</p>
              <div className="brand-pills">
                {brandSuggestions.map((b) => (
                  <Link key={b} className="brand-pill" to={`/search?q=${encodeURIComponent(b)}`}>{b}</Link>
                ))}
              </div>
              <p style={{ marginTop: '28px' }}>
                <Link className="btn btn-ghost" to="/sourcing"><span>Request a sourcing search</span></Link>
              </p>
            </div>
          )}

          {q && count > 0 && (
            <div className="prod-grid">
              {results.map(({ product, index }, i) => (
                <ProductCard
                  key={index}
                  product={product}
                  /* index into the full catalog — what /product/:id resolves
                     against, not this card's position in the results. */
                  index={index}
                  delayClass={'reveal-d' + Math.min(i, 3)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
