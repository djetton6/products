// Row and DTO are the same shape here on purpose. In a larger service these
// diverge (see the row/domain/DTO/input split) but for a two-column table
// that split would be pure ceremony — over-building is exactly what the
// brief says not to do.

export type ProductRow = {
  id: string;   // BIGSERIAL comes back as a STRING from node-postgres.
                // pg does this deliberately: JS numbers lose precision above
                // 2^53 and a BIGSERIAL can exceed that. Treating IDs as
                // strings (identifiers, not quantities) sidesteps it.
  name: string;
};

export type ProductDto = ProductRow;

export type CreateProductInput = {
  name: string;
};
