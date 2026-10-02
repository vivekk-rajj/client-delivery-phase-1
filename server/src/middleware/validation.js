import { z } from 'zod';

const productFields = {
  productName: z.string().trim().min(1, 'productName is required'),
  sku: z.string().trim().min(1, 'sku is required'),
  category: z.string().trim().min(1, 'category is required'),
  price: z.coerce.number().nonnegative('price cannot be negative'),
  cost: z.coerce.number().nonnegative('cost cannot be negative'),
  stockQuantity: z.coerce.number().int().nonnegative('stockQuantity cannot be negative'),
  reorderLevel: z.coerce.number().int().nonnegative('reorderLevel cannot be negative')
};

export const productSchema = z.object(productFields).superRefine((value, ctx) => {
  if (value.price < value.cost) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['price'], message: 'price cannot be lower than cost' });
  }
});

export const updateProductSchema = productSchema.partial().superRefine((value, ctx) => {
  if (value.price !== undefined && value.cost !== undefined && value.price < value.cost) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['price'], message: 'price cannot be lower than cost' });
  }
});

export const inventoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  search: z.string().trim().optional().default(''),
  category: z.string().trim().optional().default(''),
  stockMax: z.coerce.number().int().min(0).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.string().regex(/^-?(productName|sku|category|price|cost|stockQuantity|lastUpdated)$/).default('-lastUpdated')
}).refine((value) => value.minPrice === undefined || value.maxPrice === undefined || value.minPrice <= value.maxPrice, {
  message: 'minPrice cannot be greater than maxPrice', path: ['minPrice']
});

export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: 'Validation failed', details: result.error.flatten().fieldErrors });
    req.body = result.data;
    next();
  };
}
