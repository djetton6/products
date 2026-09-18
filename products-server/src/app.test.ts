import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

const query = vi.fn();

vi.mock('./db.js', () => ({
  pool: { query },
}));

const { app } = await import('./app.js');

afterEach(() => {
  query.mockReset();
});

describe('application routes', () => {
  it('reports health without using the database', async () => {
    await request(app).get('/healthz').expect(200, { ok: true });
    expect(query).not.toHaveBeenCalled();
  });

  it('reports database readiness', async () => {
    query.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] });

    await request(app).get('/readyz').expect(200, { ok: true, db: 'up' });
    expect(query).toHaveBeenCalledWith('SELECT 1');
  });

  it('lists products newest first with markup percentage', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: '1', name: 'P1', price: '10.00', cost: '6.00' }] });

    await request(app)
      .get('/api/products')
      .expect(200, [{ id: '1', name: 'P1', price: '10.00', cost: '6.00', markupPercent: 66.67 }]);
    expect(query).toHaveBeenCalledWith(
      'SELECT id, name, price, cost FROM products ORDER BY id DESC'
    );
  });

  it('rejects an invalid product body', async () => {
    await request(app)
      .post('/api/products')
      .send({ name: '   ', price: '10.00', cost: '6.00' })
      .expect(400)
      .expect(({ body }) => expect(body.error).toBe('invalid_body'));
    expect(query).not.toHaveBeenCalled();
  });

  it('creates a product with the trimmed name', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: '2', name: 'P2', price: '10.00', cost: '6.00' }] });

    await request(app)
      .post('/api/products')
      .send({ name: '  P2  ', price: '10.00', cost: '6.00' })
      .expect(201, { id: '2', name: 'P2', price: '10.00', cost: '6.00', markupPercent: 66.67 });
    expect(query).toHaveBeenCalledWith(
      'INSERT INTO products (name, price, cost) VALUES ($1, $2, $3) RETURNING id, name, price, cost',
      ['P2', 10, 6]
    );
  });
});