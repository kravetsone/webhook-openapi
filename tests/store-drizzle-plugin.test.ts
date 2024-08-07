import { Database } from "bun:sqlite";
import { describe, expect, test } from "bun:test";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { store } from "plugins/store-drizzle";
import { Type, Webhook } from "../src/index";
const responseOK = new Response("ok", {
	headers: {
		"content-type": "text/plain",
	},
});

describe("drizzle store plugin", () => {
	test("Should work", async () => {
		// const database = new Database(":memory:");
		// const db = drizzle(database);
		// const requestTable = pg
		// migrate(db, { migrationsFolder: "./test" });
		// using server = Bun.serve({
		// 	port: 9888,
		// 	fetch: () => responseOK,
		// });
		// const webhook = new Webhook().extend(store(db, )).event("test", (event) =>
		// 	event.body(Type.Object({ body: Type.String() })),
		// );
		// await webhook.call(server.url.href, "test", { body: "test" });
		// expect(isOk).toBe(true);
	});
});
