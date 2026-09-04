# Kisan Carbon — Farmer Carbon Credit Hub

A full-stack Next.js platform where farmers can:
- Register / log in
- Draw their actual land area on a **satellite map** (Leaflet + Esri imagery)
- Find locations by **latitude/longitude** or live GPS
- Pick a **tree type** and auto-calculate carbon credits & value in Rupees (₹)
- Register land, upload tree photos with GPS
- **Sell carbon credits** on a marketplace
- Receive payments via **UPI QR code** or bank transfer

## Tech Stack
- **Next.js 14** (App Router, API routes) + TypeScript
- **Tailwind CSS** + **lucide-react**
- **Leaflet / react-leaflet** for satellite mapping & polygon drawing
- **Prisma 5** + **SQLite** for the database
- **JWT** auth (bcrypt password hashing)

## Getting Started

```bash
npm install
npm run dev
```

Open **[http://localhost:8080](http://localhost:8080)**.

### Demo account
- Email: `ramesh@farm.com`
- Password: `hello123`
- Or click **"Login with Demo Farmer"** on the login screen.

## Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on port **8080** |
| `npm run build` | Production build |
| `npm run start` | Run production build on port **8080** (after `build`) |
| `npm run gen` | Prisma generate + migrate deploy |
| `npm run db:reset` | Reset the SQLite database |

## Features
- **Farmer Hub** (`/carbon-farmer`) — Dashboard, Carbon Calculator, My Lands, My Trees, Marketplace, Payment & Wallet
- **Drawing**: draw a polygon on the satellite map to measure your land area (ha/acres); carbon value scales with the drawn area and selected tree type
- **Live location**: blue-dot GPS locator + "Find by Coordinates"
- **Sell & Pay**: list credits, buy with a UPI QR payment modal, save bank/UPI payment details

## API Routes
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET/POST /api/lands`, `DELETE /api/lands/[id]`
- `GET/POST /api/trees`
- `GET/POST /api/marketplace`
- `GET/PUT /api/payment`
- `GET /api/stats`

## Project Structure
```
app/            Pages + API routes
components/     Reusable UI
lib/            prisma client, auth, carbon rates
prisma/         schema + SQLite db
```
