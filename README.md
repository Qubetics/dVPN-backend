# dVPN-backend

Backend API service for the Qubetics dVPN. Built with Node.js, Express and TypeScript,
using Sequelize over PostgreSQL (separate read/write endpoints) and Redis.

## Requirements

- **Node.js 20+**
- **npm** (this repo is npm-based; `package-lock.json` is the lock file)
- **PostgreSQL**
- **Redis**

A `docker-compose.yml` is provided to run PostgreSQL, pgAdmin and Redis locally.
**Its credentials are for local development only — do not use them in production.**

## Setup

```bash
# 1. Install dependencies
npm install

# 2. (optional) Start local Postgres / Redis / pgAdmin
docker compose up -d

# 3. Create your environment file
cp .env.example .env
#    then edit .env and fill in real values (see .env.example for the full list)

# 4. Run migrations
npm run migrate:table
```

## Running

```bash
npm run dev          # development, with hot reload (nodemon)
npm run build        # compile TypeScript to dist/
npm run start:node   # run the compiled build
```

## Testing

```bash
npm test             # run the Jest test suite
npm run test:coverage
```

## Environment variables

All configuration is supplied through environment variables. See
[`.env.example`](./.env.example) for the complete, documented list.

## Notes

- Deployment CI workflows were removed from the public repository; they referenced private
  infrastructure. Add your own deployment pipeline as needed.
