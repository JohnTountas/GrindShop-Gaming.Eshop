#!/bin/sh
set -e

echo "Applying database migrations..."
npx prisma migrate deploy

if [ "${AUTO_SEED:-false}" = "true" ]; then
  echo "AUTO_SEED is enabled. Checking whether seed data is required..."
  PRODUCT_COUNT=$(node -e 'const { PrismaClient } = require("@prisma/client"); const prisma = new PrismaClient(); prisma.product.count().then((count) => { console.log(count); }).catch(() => { console.log("0"); }).finally(() => prisma.$disconnect());')

  if [ "$PRODUCT_COUNT" = "0" ]; then
    echo "No products found. Running seed script..."
    npm run database
  else
    echo "Seed data already exists (products: $PRODUCT_COUNT). Skipping seed."
  fi
fi

echo "Starting API server..."
exec node dist/server.js
