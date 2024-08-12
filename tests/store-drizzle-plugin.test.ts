import { describe, expect, test } from "bun:test";
import { PGlite } from "@electric-sql/pglite";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { store } from "plugins/store-drizzle";
import { Type, Webhook } from "../src/index";
import { requestTable, responseTable } from "./schema";

const responseOK = new Response("ok", {
	headers: {
		"content-type": "text/plain",
	},
});

// In-memory Postgres
const client = new PGlite();
const db = drizzle(client);

await migrate(db, {
	migrationsFolder: "./drizzle",
});

describe("drizzle store plugin", () => {
	test("Should work", async () => {
		using server = Bun.serve({
			port: 9888,
			fetch: () => responseOK,
		});
		const webhook = new Webhook()
			.extend(store(db, requestTable, responseTable))
			.event("test", (event) =>
				event.body(Type.Object({ body: Type.String() })),
			);
		await webhook.call(server.url.href, "test", { body: "test" });

		const requests = await db
			.select()
			.from(requestTable)
			.leftJoin(responseTable, eq(requestTable.id, responseTable.requestId))
			.where(eq(requestTable.url, server.url.href))
			.limit(1);

		console.log(requests);

		expect(requests.at(0)).not.toBeUndefined();
		expect(requests.at(0)?.requests).not.toBeUndefined();
		expect(requests.at(0)?.responses).not.toBeUndefined();
	});
});
