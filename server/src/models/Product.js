import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true, trim: true, index: true },
  sku: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
  category: { type: String, required: true, trim: true, index: true },
  price: { type: Number, required: true, min: 0 },
  cost: { type: Number, required: true, min: 0 },
  stockQuantity: { type: Number, required: true, min: 0 },
  reorderLevel: { type: Number, required: true, min: 0 },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

productSchema.index({ productName: 'text', sku: 'text', category: 'text' });

export const Product = mongoose.model('Product', productSchema);
