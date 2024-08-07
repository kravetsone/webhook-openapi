import { Type, Webhook } from "../../src";
import { store } from "../../src/plugins/store-drizzle";
import { db, eq, requestTable, responseTable } from "./db";

const responseOK = new Response("ok", {
	headers: {
		"content-type": "text/plain",
	},
	status: 500,
});

using server = Bun.serve({
	port: 9888,
	fetch: () => responseOK,
});

const webhook = new Webhook()
	.extend(store(db, requestTable, responseTable))
	.event("test", (event) => event.body(Type.Object({ body: Type.String() })));

await webhook.call(server.url.href, "test", { body: "test" });

const requests = await db
	.select()
	.from(requestTable)
	.leftJoin(responseTable, eq(requestTable.id, responseTable.requestId));

console.log(requests);
