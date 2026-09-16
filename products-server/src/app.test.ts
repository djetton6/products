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

  it('lists products newest first', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: '1', name: 'P1' }] });

    await request(app)
      .get('/api/products')
      .expect(200, [{ id: '1', name: 'P1' }]);
    expect(query).toHaveBeenCalledWith(
      'SELECT id, name FROM products ORDER BY id DESC'
    );
  });

  it('rejects an invalid product body', async () => {
    await request(app)
      .post('/api/products')
      .send({ name: '   ' })
      .expect(400)
      .expect(({ body }) => expect(body.error).toBe('invalid_body'));
    expect(query).not.toHaveBeenCalled();
  });

  it('creates a product with the trimmed name', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: '2', name: 'P2' }] });

    await request(app)
      .post('/api/products')
      .send({ name: '  P2  ' })
      .expect(201, { id: '2', name: 'P2' });
    expect(query).toHaveBeenCalledWith(
      'INSERT INTO products (name) VALUES ($1) RETURNING id, name',
      ['P2']
    );
  });
});