/**
 * Loads, validates, and exposes environment variables used by the backend.
 */
import dotenv from "dotenv";

dotenv.config();

// Ignores placeholder connection strings copied from docs or dashboards.
function isPlaceholderDatabaseUrl(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  const normalizedValue = value.trim();
  return (
    normalizedValue === "postgres://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require" ||
    normalizedValue === "postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require"
  );
}

// Resolves the runtime database URL, preferring the pooled app connection.
function resolveRuntimeDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const directUrl = process.env.DIRECT_URL?.trim();

  if (databaseUrl && !isPlaceholderDatabaseUrl(databaseUrl)) {
    return databaseUrl;
  }

  if (directUrl && !isPlaceholderDatabaseUrl(directUrl)) {
    return directUrl;
  }

  return "";
}

// Exposes normalized environment configuration for the backend runtime.
export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: resolveRuntimeDatabaseUrl(),

  jwt: {
    secret: process.env.JWT_SECRET || "grindspot-dev-access-token-secret",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "grindspot-dev-refresh-token-secret",
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },

  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880", 10),
    uploadDir: process.env.UPLOAD_DIR || "uploads",
  },
};
