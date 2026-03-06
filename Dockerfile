# -----------------------------------------------------------------------------
# Fly.io production image
# Builds frontend + backend, then runs the backend API which also serves the SPA
# via FRONTEND_DIST_PATH.
# -----------------------------------------------------------------------------

FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/. .

ARG VITE_API_URL=/api
ARG VITE_STRIPE_PUBLIC_KEY=pk_test_replace_me
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_STRIPE_PUBLIC_KEY=${VITE_STRIPE_PUBLIC_KEY}

RUN npm run build


FROM node:20 AS backend-builder

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci

COPY backend/. .

RUN npx prisma generate
RUN npm run build


FROM node:20-slim AS runtime

WORKDIR /app

COPY --from=backend-builder /app/backend/package*.json ./
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/prisma ./prisma
COPY --from=backend-builder /app/backend/docker-entrypoint.sh ./docker-entrypoint.sh
COPY --from=frontend-builder /app/frontend/dist ./frontend-dist

RUN chmod +x ./docker-entrypoint.sh && mkdir -p ./uploads

ENV NODE_ENV=production
ENV PORT=8080
ENV FRONTEND_DIST_PATH=/app/frontend-dist

EXPOSE 8080

CMD ["sh", "./docker-entrypoint.sh"]
