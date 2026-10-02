# AI transparency record

## Debounced search

I used AI assistance to reason about a 500ms debounce hook. The important design decision was to debounce the query value rather than the entire request function: the inventory page owns request lifecycle, abort/error state, and pagination reset, while the hook only delays the value and cleans up its timer on unmount or change.

## MongoDB analytics

I used AI assistance to outline the analytics aggregation. The pipeline keeps filtering in MongoDB, computes `price * stockQuantity` with `$multiply`, and uses separate `$facet` branches for summary KPIs, category valuation, and the ten lowest-stock products. This avoids transferring all products into Node.js and keeps the response shaped for the dashboard.

All generated code was reviewed and adapted to the repository's API contracts, validation rules, and export behavior.
