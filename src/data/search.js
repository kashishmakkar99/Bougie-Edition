/* ============================================================
   BOUGIE EDITION — catalog search
   One matcher shared by the header overlay and the results page,
   so the "view all" count always agrees with what the page shows.
   ============================================================ */

// What a term can match, and how strongly. Brand outranks everything
// else: searching "Chanel" should lead with Chanel pieces, not a bag
// whose description happens to mention the word.
const FIELD_SCORES = {
  brandExact: 100,
  brandStarts: 80,
  brandContains: 60,
  nameStarts: 50,
  nameContains: 40,
  category: 30,
  tag: 20,
  description: 10
};

function lc(v){ return (v || '').toString().toLowerCase(); }

export function normalizeQuery(q){
  return lc(q).trim().replace(/\s+/g, ' ');
}

// Best score this product earns for a single term, or 0 if it misses.
function scoreTerm(product, term){
  const brand = lc(product.brand);
  if(brand === term) return FIELD_SCORES.brandExact;
  if(brand.startsWith(term)) return FIELD_SCORES.brandStarts;
  if(brand.includes(term)) return FIELD_SCORES.brandContains;

  const name = lc(product.name);
  if(name.startsWith(term)) return FIELD_SCORES.nameStarts;
  if(name.includes(term)) return FIELD_SCORES.nameContains;

  if(lc(product.category).includes(term)) return FIELD_SCORES.category;
  if((product.tags || []).some((t) => lc(t).includes(term))) return FIELD_SCORES.tag;
  if(lc(product.description).includes(term)) return FIELD_SCORES.description;

  return 0;
}

/**
 * Search the catalog.
 *
 * Every term must match somewhere (AND), so "chanel flap" narrows rather
 * than widens. Results are ranked by summed term scores, strongest first.
 *
 * Returns [{ product, index, score }] where `index` is the position in the
 * ORIGINAL products array — that is what /product/:id resolves against, so
 * never build a link from the position within this result.
 */
export function searchProducts(products, query){
  const q = normalizeQuery(query);
  if(!Array.isArray(products) || !q) return [];
  const terms = q.split(' ').filter(Boolean);

  const out = [];
  products.forEach((product, index) => {
    let total = 0;
    for(const term of terms){
      const s = scoreTerm(product, term);
      if(!s) return;           // a term missed — product is out
      total += s;
    }
    out.push({ product, index, score: total });
  });

  // Sold pieces still match, but sink below available stock of equal rank.
  return out.sort((a, b) =>
    (b.score - a.score) ||
    ((a.product.soldOut ? 1 : 0) - (b.product.soldOut ? 1 : 0)) ||
    (a.index - b.index)
  );
}

/**
 * The brand a query names outright, if any — lets the results page say
 * "All Chanel pieces" instead of a generic results header.
 */
export function matchedBrand(products, query){
  const q = normalizeQuery(query);
  if(!q) return '';
  const hit = (products || []).find((p) => lc(p.brand) === q);
  return hit ? hit.brand : '';
}
