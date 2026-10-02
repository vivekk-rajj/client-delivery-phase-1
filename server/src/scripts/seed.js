import 'dotenv/config';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import { Product } from '../models/Product.js';

const categories = ['Electronics', 'Apparel', 'Home', 'Beauty', 'Sports', 'Office'];
const total = 50000;
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aura-engine');
await Product.deleteMany({});
const products = Array.from({ length: total }, (_, index) => {
  const cost = faker.number.float({ min: 5, max: 900, fractionDigits: 2 });
  const stockQuantity = faker.number.int({ min: 0, max: 500 });
  return { productName: faker.commerce.productName(), sku: `AURA-${String(index + 1).padStart(6, '0')}`, category: faker.helpers.arrayElement(categories), price: Number((cost * faker.number.float({ min: 1.1, max: 2.2 })).toFixed(2)), cost, stockQuantity, reorderLevel: faker.number.int({ min: 5, max: 50 }), lastUpdated: faker.date.recent({ days: 365 }) };
});
await Product.insertMany(products, { ordered: false });
console.log(`Seeded ${total} products`);
await mongoose.connection.close();
