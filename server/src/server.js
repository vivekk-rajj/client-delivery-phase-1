import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { inventoryRouter, analyticsRouter } from './routes/inventoryRoutes.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || true }));
app.use(express.json());
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'aura-engine-api' }));
app.use('/api/inventory', inventoryRouter);
app.use('/api/analytics', analyticsRouter);
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.code === 11000) return res.status(409).json({ error: 'SKU must be unique' });
  if (error.name === 'CastError') return res.status(400).json({ error: 'Invalid product id' });
  res.status(error.status || 500).json({ error: error.message || 'Internal server error' });
});

const port = process.env.PORT || 4000;
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aura-engine');
const server = app.listen(port, () => console.log(`Aura Engine API listening on ${port}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, async () => { await mongoose.connection.close(); server.close(() => process.exit(0)); });
