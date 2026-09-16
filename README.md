# Products

A small products app with a React and TypeScript frontend, an Express 5 and
TypeScript API, and PostgreSQL.

## Run with Docker

### Prerequisites

- Docker Desktop with Docker Compose

The stack uses host ports `3000`, `4000`, and `5433`. If Docker reports that
one is already allocated, stop the older project containers that own that
port, then run the command below again.

From the repository root, build and start the database, API, and web app:

    docker compose up --build -d

Open the app at http://localhost:3000. The API is available at
http://localhost:4000.

The first start creates the `products` table from `db/init.sql`. The database
is persisted in a Docker volume, so later starts do not delete existing data.

Useful commands:

    docker compose ps
    docker compose logs -f
    docker compose exec db psql -U app -d products -c 'SELECT * FROM products ORDER BY id DESC;'
    docker compose down

To remove the containers and reset the database completely:

    docker compose down -v

After the first build, `docker compose up -d` starts the existing images
without rebuilding them. Run `docker compose up --build -d` after changing
application code or dependencies.

### Environment files

The Docker Compose setup provides the API and frontend environment values
itself, so no `.env` files are needed when running the full stack with Docker.

For local development, create the sample environment files before starting
the services:

    cp products-server/.env.example products-server/.env
    cp products-client/.env.example products-client/.env

The backend sample contains:

    DATABASE_URL=postgres://app:app@localhost:5433/products
    PORT=4000

The frontend sample contains:

    VITE_API_URL=http://localhost:4000

The backend uses port `5433` because PostgreSQL is published from its
container port `5432` to host port `5433` by `docker-compose.yml`.

## Run locally for development

Docker can run just PostgreSQL while the frontend and API run with Node.js.
This requires Node 20 or newer.

Start PostgreSQL from the repository root:

    docker compose up -d db

In one terminal:

    cd products-server
    npm ci
    npm run dev

The API runs on http://localhost:4000.

In another terminal:

    cd products-client
    npm ci
    npm run dev

The frontend runs on http://localhost:3000.

## Project layout

- `products-client/` - React frontend
- `products-server/` - Express API
- `db/init.sql` - PostgreSQL schema
- `docker-compose.yml` - full-stack Docker setup

## Tests

Run the API tests from `products-server/` and the frontend tests from
`products-client/`:

    npm test
