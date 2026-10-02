import { Router } from 'express';
import { analytics, createProduct, listInventory, updateProduct } from '../controllers/inventoryController.js';
import { productSchema, updateProductSchema, validateBody } from '../middleware/validation.js';

export const inventoryRouter = Router();
inventoryRouter.get('/', listInventory);
inventoryRouter.post('/', validateBody(productSchema), createProduct);
inventoryRouter.put('/:id', validateBody(updateProductSchema), updateProduct);
export const analyticsRouter = Router();
analyticsRouter.get('/', analytics);
