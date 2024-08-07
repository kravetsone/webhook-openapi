import { integer, jsonb, pgTable, serial, text } from "drizzle-orm/pg-core";

export const requestTable = pgTable("requests", {
	id: serial("id").primaryKey(),
	data: jsonb("data"),
	headers: jsonb("headers").$type<Record<string, string>>(),
	url: text("url"),
});

export const responseTable = pgTable("responses", {
	id: serial("id").primaryKey(),
	data: jsonb("data"),
	headers: jsonb("headers").$type<Record<string, string>>(),
	status: integer("status"),
	requestId: integer("request_id")
		.notNull()
		.references(() => requestTable.id),
});

type A = (typeof requestTable)["_"]["columns"]["headers"];
