import { Product } from '../models/Product.js';
import { inventoryQuerySchema } from '../middleware/validation.js';

function buildFilter(query) {
  const filter = {};
  if (query.search) filter.$or = [{ productName: { $regex: query.search, $options: 'i' } }, { sku: { $regex: query.search, $options: 'i' } }, { category: { $regex: query.search, $options: 'i' } }];
  if (query.category) filter.category = query.category;
  if (query.stockMax !== undefined) filter.stockQuantity = { $lte: query.stockMax };
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.price = {};
    if (query.minPrice !== undefined) filter.price.$gte = query.minPrice;
    if (query.maxPrice !== undefined) filter.price.$lte = query.maxPrice;
  }
  return filter;
}

export async function listInventory(req, res, next) {
  try {
    const query = inventoryQuerySchema.parse(req.query);
    const filter = buildFilter(query);
    const skip = (query.page - 1) * query.limit;
    const sortField = query.sort.replace('-', '');
    const sort = { [sortField]: query.sort.startsWith('-') ? -1 : 1 };
    const [products, totalRecords] = await Promise.all([
      Product.find(filter).select('-__v').sort(sort).skip(skip).limit(query.limit).lean(),
      Product.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(totalRecords / query.limit);
    res.json({ data: products, pagination: { totalRecords, totalPages, currentPage: query.page, hasNextPage: query.page < totalPages } });
  } catch (error) { next(error); }
}

export async function analytics(req, res, next) {
  try {
    const query = inventoryQuerySchema.parse({ ...req.query, page: 1, limit: 1 });
    const filter = buildFilter(query);
    const [result] = await Product.aggregate([
      { $match: filter },
      { $facet: {
        summary: [{ $group: { _id: null, totalSkus: { $sum: 1 }, totalInventoryValue: { $sum: { $multiply: ['$price', '$stockQuantity'] } }, outOfStockItems: { $sum: { $cond: [{ $eq: ['$stockQuantity', 0] }, 1, 0] } } } }, { $project: { _id: 0 } }],
        categoryValuation: [{ $group: { _id: '$category', value: { $sum: { $multiply: ['$price', '$stockQuantity'] } } } }, { $project: { _id: 0, category: '$_id', value: 1 } }, { $sort: { value: -1 } }],
        restockPriorities: [{ $sort: { stockQuantity: 1 } }, { $limit: 10 }, { $project: { _id: 1, productName: 1, sku: 1, stockQuantity: 1, reorderLevel: 1 } }]
      } }
    ]);
    res.json({ summary: result.summary[0] || { totalSkus: 0, totalInventoryValue: 0, outOfStockItems: 0 }, categoryValuation: result.categoryValuation, restockPriorities: result.restockPriorities });
  } catch (error) { next(error); }
}

export async function createProduct(req, res, next) {
  try { const product = await Product.create(req.body); res.status(201).json(product); } catch (error) { next(error); }
}

export async function updateProduct(req, res, next) {
  try {
    const current = await Product.findById(req.params.id);
    if (!current) return res.status(404).json({ error: 'Product not found' });
    const merged = { ...current.toObject(), ...req.body };
    if (merged.price < merged.cost) return res.status(400).json({ error: 'price cannot be lower than cost' });
    if (merged.stockQuantity < 0) return res.status(400).json({ error: 'stockQuantity cannot be negative' });
    const product = await Product.findByIdAndUpdate(req.params.id, { ...req.body, lastUpdated: new Date() }, { new: true, runValidators: true });
    res.json(product);
  } catch (error) { next(error); }
}
