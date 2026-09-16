import { afterEach, describe, expect, it, vi } from 'vitest';
import { createProduct, fetchProducts } from './api';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('product API', () => {
  it('fetches products', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify([{ id: '1', name: 'P1' }]), { status: 200 })
    ));

    await expect(fetchProducts()).resolves.toEqual([{ id: '1', name: 'P1' }]);
    expect(fetch).toHaveBeenCalledWith('http://localhost:4000/api/products');
  });

  it('creates a product', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: '2', name: 'P2' }), { status: 201 })
    ));

    await expect(createProduct('P2')).resolves.toEqual({ id: '2', name: 'P2' });
    expect(fetch).toHaveBeenCalledWith('http://localhost:4000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'P2' }),
    });
  });

  it('uses the API error returned by the server', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: 'invalid_body' }), { status: 400 })
    ));

    await expect(createProduct('')).rejects.toThrow('invalid_body');
  });
});