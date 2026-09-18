export type Product = {
  id: string;
  name: string;
  price: string;
  cost: string;
  markupPercent: number;
};

export type CreateProductInput = {
  name: string;
  price: string;
  cost: string;
};

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(`${API_URL}/api/products`);
  if (!response.ok) throw new Error(`Failed to load products (${response.status})`);
  return response.json();
}

export async function createProduct(product: CreateProductInput): Promise<Product> {
  const response = await fetch(`${API_URL}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}) as { error?: string });
    throw new Error(body.error ?? `Failed to create product (${response.status})`);
  }
  return response.json();
}
