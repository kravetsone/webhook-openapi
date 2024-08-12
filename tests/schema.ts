import {
	integer,
	jsonb,
	pgTable,
	real,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export type HTTPMethods =
	| "GET"
	| "POST"
	| "PUT"
	| "PATCH"
	| "DELETE"
	| "OPTIONS"
	| "HEAD"
	| "TRACE";

export const requestTable = pgTable("requests", {
	id: serial("id").primaryKey(),
	data: jsonb("data"),
	method: text("method").$type<HTTPMethods>().notNull(),
	headers: jsonb("headers").$type<Record<string, string>>().notNull(),
	url: text("url").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const responseTable = pgTable("responses", {
	id: serial("id").primaryKey(),
	data: jsonb("data"),
	headers: jsonb("headers").$type<Record<string, string>>().notNull(),
	status: integer("status").notNull(),
	requestId: integer("request_id")
		.notNull()
		.references(() => requestTable.id),
	responseTime: real("response_time").notNull(),
});
