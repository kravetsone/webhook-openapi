import { jsonb, pgTable, serial, text } from "drizzle-orm/pg-core";

export const requestTable = pgTable("requests", {
	id: serial("id").primaryKey(),
	data: jsonb("data"),
	headers: jsonb("headers").$type<Record<string, string>>(),
	url: text("url"),
});
