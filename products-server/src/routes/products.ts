import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db.js';
import type { ProductRow, ProductDto } from '../types.js';

export const productsRouter = Router();

const CreateProduct = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  price: z.coerce.number().finite().min(0, 'Price must be non-negative'),
  cost: z.coerce.number().finite().min(0, 'Cost must be non-negative'),
});

function calculateMarkupPercent(price: string | number, cost: string | number): number {
  const numericPrice = Number(price);
  const numericCost = Number(cost);

  if (numericCost === 0) return 0;
  return Number((((numericPrice - numericCost) / numericCost) * 100).toFixed(2));
}

function toDto(row: ProductRow): ProductDto {
  return {
    ...row,
    markupPercent: calculateMarkupPercent(row.price, row.cost),
  };
}

productsRouter.get('/', async (_req, res) => {
  const { rows } = await pool.query<ProductRow>(
    'SELECT id, name, price, cost FROM products ORDER BY id DESC'
  );

  res.json(rows.map(toDto));
});

productsRouter.post('/', async (req, res) => {
  const parsed = CreateProduct.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_body', details: parsed.error.flatten() });
    return;
  }

  const { rows } = await pool.query<ProductRow>(
    'INSERT INTO products (name, price, cost) VALUES ($1, $2, $3) RETURNING id, name, price, cost',
    [parsed.data.name, parsed.data.price, parsed.data.cost]
  );

  res.status(201).json(toDto(rows[0]));
});
