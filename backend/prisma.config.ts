/**
 * Prisma CLI configuration that declares the schema location and datasource URL.
 */
import "dotenv/config";
import { defineConfig } from "prisma/config";

// Converts a Fly MPG pooled hostname into the direct hostname required for migrations.
function normalizeFlyManagedDirectUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const pooledPrefix = "pgbouncer.";
    const flyManagedSuffix = ".flympg.net";

    if (parsed.hostname.startsWith(pooledPrefix) && parsed.hostname.endsWith(flyManagedSuffix)) {
      parsed.hostname = `direct.${parsed.hostname.slice(pooledPrefix.length)}`;
      return parsed.toString();
    }
  } catch {
    return url;
  }

  return url;
}

/**
 * Builds the Prisma config used by generate/migrate commands.
 */
const directUrl = process.env.DIRECT_URL?.trim() || "";
const datasourceUrl =
  normalizeFlyManagedDirectUrl(directUrl) || process.env.DATABASE_URL?.trim() || "";

if (!datasourceUrl) {
  throw new Error(
    "DATABASE_URL or DIRECT_URL must be set for Prisma. Configure Fly secrets or a local .env."
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: datasourceUrl,
  },
});
