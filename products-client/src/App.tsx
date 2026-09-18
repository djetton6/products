import { useEffect, useState } from 'react';
import { fetchProducts, createProduct, type Product } from './api';

const MARKUP_FLOOR = 30;

function App() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, []);

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError(null);
    try {
      const created = await createProduct({ name: trimmed, price, cost });
      setProducts((prev) => (prev ? [created, ...prev] : [created]));
      setName('');
      setPrice('');
      setCost('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <h1>Products</h1>
      <div className="product-form">
        <div className="form-field">
          <label htmlFor="name">Product name</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
            }}
          />
        </div>
        <div className="form-field">
          <label htmlFor="price">Product price</label>
          <input
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
            }}
          />
        </div>
        <div className="form-field">
          <label htmlFor="cost">Product cost</label>
          <input
            id="cost"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
            }}
          />
        </div>

        <button onClick={handleCreate} disabled={!name.trim() || submitting}>
          {submitting ? 'Creating…' : 'Create'}
        </button>
      </div>

      {error && <p role="alert">{error}</p>}

      {products === null ? (
        <p>Loading…</p>
      ) : products.length === 0 ? (
        <p>No products yet.</p>
      ) : (
        <ul>
          {products.map((p) => {
            const belowFloor = p.markupPercent < MARKUP_FLOOR;

            return (
              <li key={p.id} style={{ fontWeight: belowFloor ? 700 : 400 }}>
                {p.name} - Price: {p.price} - Markup: {p.markupPercent}%
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

export default App;
