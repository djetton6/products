import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db.js';
import type { ProductRow, ProductDto } from '../types.js';

export const productsRouter = Router();

const CreateProduct = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
});

function toDto(row: ProductRow): ProductDto {
  return row;
}

productsRouter.get('/', async (_req, res) => {
  const { rows } = await pool.query<ProductRow>(
    'SELECT id, name FROM products ORDER BY id DESC'
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
    'INSERT INTO products (name) VALUES ($1) RETURNING id, name',
    [parsed.data.name]
  );
  res.status(201).json(toDto(rows[0]));
});
