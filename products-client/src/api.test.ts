import { afterEach, describe, expect, it, vi } from 'vitest';
import { createProduct, fetchProducts } from './api';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('product API', () => {
  it('fetches products including markup percentage', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify([{ id: '1', name: 'P1', price: '10', cost: '5', markupPercent: 100 }]), { status: 200 })
    ));

    await expect(fetchProducts()).resolves.toEqual([{ id: '1', name: 'P1', price: '10', cost: '5', markupPercent: 100 }]);
    expect(fetch).toHaveBeenCalledWith('http://localhost:4000/api/products');
  });

  it('creates a product', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: '2', name: 'P2', price: '10.00', cost: '6.00', markupPercent: 66.67 }), { status: 201 })
    ));

    const product = { name: 'P2', price: '10.00', cost: '6.00' };

    await expect(createProduct(product)).resolves.toEqual({
      id: '2',
      ...product,
      markupPercent: 66.67,
    });
    expect(fetch).toHaveBeenCalledWith('http://localhost:4000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
  });

  it('uses the API error returned by the server', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: 'invalid_body' }), { status: 400 })
    ));

    await expect(createProduct({ name: '', price: '', cost: '' })).rejects.toThrow('invalid_body');
  });
});