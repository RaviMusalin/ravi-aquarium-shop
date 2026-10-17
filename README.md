# Ravi's Aquarium Shop

A small full-stack e-commerce app for aquarium supplies, built for a technical interview. It has a Node.js/Express API, a SQLite database, and a React frontend.

## The problem it solves

Buying live fish online is risky. Freshwater and saltwater fish can't share a tank, some fish need a lot of water, and aggressive fish hurt their tank mates. This shop checks the cart for those problems and warns the customer before checkout.

## Features

- Browse products and filter by search text, category, water type, and availability
- Cart with quantity limits based on current stock
- Compatibility warnings on the cart page: water type, tank size, and temperament (advisory only, they never block checkout)
- Guest checkout that saves the order and subtracts stock in a single database transaction
- Order confirmation page loaded from the server

## Tech stack

- **Backend:** Node.js, Express 5, TypeScript, better-sqlite3, Zod
- **Frontend:** React, TypeScript, Vite, React Router
- **Tests:** Node's built-in test runner, covering the compatibility rules

## Running it locally

Requires Node 22 or newer.

**1. Start the API**

```
cd server
npm install
npm run seed
npm run dev
```

The API runs at http://localhost:3001. `npm run seed` creates the SQLite database file and loads the sample products. Running it again resets all products and deletes all orders.

**2. Start the frontend** (in a second terminal)

```
cd client
npm install
npm run dev
```

Open http://localhost:5173. Vite forwards requests starting with `/api` to the API.

**3. Run the tests** (optional)

```
cd server
npm test
```

## API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/products` | List products. Optional filters: `category`, `waterType`, `q`, `maxPriceCents`, `inStock` |
| GET | `/api/products/:id` | One product |
| POST | `/api/compatibility` | Body: `{ "productIds": [1, 2] }`. Returns warnings. Read-only |
| POST | `/api/orders` | Place an order. Body: customer name, email, and items (product id and quantity) |
| GET | `/api/orders/:id` | One order with its line items |

Errors use one format everywhere: `{ "error": { "code", "message", "details" } }`.

## Database

Three tables:

- `products`: the catalog, including stock and the fish and tank attributes used by the compatibility rules
- `orders`: one row per checkout (guest customer details and total)
- `order_items`: the line items of each order

Decisions worth noting:

- Money is stored as integer cents to avoid floating-point rounding errors.
- `order_items.unit_price_cents` copies the price at purchase time, so old orders keep what the customer paid even if prices change later.
- CHECK constraints let the database itself reject bad data, for example only tanks can have `tank_gallons`.
- Foreign keys are enabled explicitly, because SQLite ignores them by default.

## Design decisions

- **Server-side prices and stock.** The client sends only product ids and quantities. The server looks up the real prices and computes the total.
- **Safe stock handling.** Checkout runs in one transaction. Each line subtracts stock with `UPDATE ... WHERE stock >= ?`, and if any line fails, the whole order rolls back.
- **Compatibility rules are a pure function.** They take products and return warnings, with no database or HTTP involved, which makes them easy to test and change.
- **Layers.** Routes handle HTTP and validation (Zod), repo files hold all SQL, and one error handler formats every error.
- **SQLite.** Chosen to keep the project self-contained and easy to run. For production traffic I would move to PostgreSQL. All SQL lives in the repo files, which keeps that migration contained.
- **No login.** Guest checkout keeps the scope focused. Adding accounts would mean a users table, password hashing, and protected routes.
- **Frontend state.** The cart uses `useReducer` with React context. Server data is fetched through small custom hooks.

## Known limitations and next steps

- The cart is lost on page refresh. I would persist it in localStorage.
- Compatibility checks use product ids only, so quantities are ignored (two Oscars look like one).
- The search box sends a request on every keystroke. I would debounce it.
- There are tests for the compatibility rules only. I would add API tests for checkout, especially the oversell case.
- SQLite allows one writer at a time, so a real deployment would need PostgreSQL.

## Project structure

```
server/
  src/
    index.ts             Express app and route registration
    db.ts                SQLite connection and schema
    seed.ts              Sample data
    errors.ts            ApiError and the central error handler
    productsRepo.ts      SQL for products
    ordersRepo.ts        SQL for orders (the checkout transaction)
    compatibility.ts     Compatibility rules (pure functions)
    routes/              HTTP handlers
client/
  src/
    api.ts               All fetch calls
    context/             Cart state (useReducer + context)
    hooks/               useProducts, useCompatibility
    components/          FilterBar, ProductCard, CompatibilityBanner, CheckoutForm
    pages/               CatalogPage, CartPage, OrderPage
```