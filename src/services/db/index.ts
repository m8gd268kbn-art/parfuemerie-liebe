import "server-only";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/config/env";
import * as schema from "./schema";

export type Database = PostgresJsDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { __liebeSql?: postgres.Sql; __liebeDb?: Database };

function create(): Database {
  const url = env().DATABASE_URL;
  // Supabase-Transaction-Pooler (Port 6543) unterstützt keine Prepared Statements.
  const usesPooler = /:6543\//.test(url);
  const sql = postgres(url, {
    max: env().NODE_ENV === "production" ? 10 : 5,
    prepare: !usesPooler,
    idle_timeout: 20,
    onnotice: () => {},
  });
  globalForDb.__liebeSql = sql;
  return drizzle(sql, { schema, casing: "snake_case" });
}

function instance(): Database {
  return globalForDb.__liebeDb ?? (globalForDb.__liebeDb = create());
}

/**
 * Geteilte DB-Instanz, erst beim ersten Zugriff verbunden (kein DB-Zugriff beim Import,
 * damit Builds ohne Datenbank funktionieren). In der Entwicklung über HMR hinweg wiederverwendet.
 */
export const db: Database = new Proxy({} as Database, {
  get(_target, prop) {
    const real = instance();
    const value = Reflect.get(real, prop, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});

export { schema };
