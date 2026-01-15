# Mikro1

MikroORM Test Project. TS + MikroORM + PostgreSQL

## Development

```bash
# Install dependencies
npm install
# Start Postgres (Linux/MacOS)
sudo docker-compose -f docker-compose.yml up -d postgres
# Start Postgres (Windows)
docker compose -f docker-compose.yml up -d postgres
# Wait until Postgres is ready
# Create migration
npx mikro-orm-esm migration:create --initial
# Run migrations
npx mikro-orm-esm migration:up
# Start development server
npm start
```


## Handlers

GET http://localhost:3001/article/ - All articles and count
POST http://localhost:3001/article/ - Add article
PATCH http://localhost:3001/article/:id - Patch article
DELETE http://localhost:3001/article/:id - Delete article
GET http://localhost:3001/article/:slug - Article by slug
POST http://localhost:3001/article/:slug/comment - Add comment to article

POST http://localhost:3001/user/sign-up - user registration
POST http://localhost:3001/user/sign-in - user login
GET http://localhost:3001/user/profile - get user profile
PATCH http://localhost:3001/user/profile - patch user profile


