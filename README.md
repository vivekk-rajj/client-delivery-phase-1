# Aura Engine

Full-stack inventory intelligence MVP for high-volume catalog operations.

## Structure

- `client/` React + Vite dashboard with server-side pagination, debounced search, charts, and CSV export.
- `server/` Express + MongoDB API with indexed inventory queries, aggregation analytics, validation, and a 50,000-record seeder.

## Local setup

1. Install Node.js 20+ and MongoDB.
2. Copy `server/.env.example` to `server/.env` and set `MONGODB_URI`.
3. Copy `client/.env.example` to `client/.env` if the API is not running at the default URL.
4. Install dependencies and run both applications:

```bash
npm install
npm install --prefix server
npm install --prefix client
npm run seed --prefix server
npm run dev
```

The dashboard runs on `http://localhost:5173`; the API runs on `http://localhost:4000`.

## Useful commands

```bash
npm run dev                 # run client and server together
npm run build               # build the client
npm run start --prefix server
npm run seed --prefix server # generate 50,000 products
```

## API examples

- `GET /api/inventory?page=1&limit=50&search=audio&category=Electronics&stockMax=20&minPrice=10&maxPrice=500&sort=-price`
- `GET /api/analytics?category=Electronics`
- `POST /api/inventory`
- `PUT /api/inventory/:id`

The API returns only the requested page (maximum 100 records). The CSV button exports the currently loaded filtered page and labels that behavior in the interface; this avoids silently downloading a potentially huge dataset.

See `Prompts.md` for the required AI transparency notes.
