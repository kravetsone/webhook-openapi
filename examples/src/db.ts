import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export * from "./schema.js";
export * from "drizzle-orm";

const client = postgres(process.env.DATABASE_URL as string);
export const db = drizzle(client);