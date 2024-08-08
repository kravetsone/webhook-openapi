import { Type, Webhook } from "../../src";
import { store } from "../../src/plugins/store-drizzle";
import { retryOnTimers } from "../../src/plugins/timers-retries";
import { db, eq, requestTable, responseTable } from "./db";

const responseOK = new Response("ok", {
	headers: {
		"content-type": "text/plain",
	},
	status: 200,
});
const responseBad = new Response("Something went wrong", {
	status: 500,
	headers: {
		"content-type": "text/plain",
	},
});

let index = 0;

const server = Bun.serve({
	port: 9888,
	fetch: () => {
		index++;
		if (index > 2) return responseOK;

		return responseBad;
	},
});

const webhook = new Webhook()
	.extend(retryOnTimers(8 * 1000))
	.extend(store(db, requestTable, responseTable))
	.onAfterResponse(({ response }) => {
		console.log(response);
	})
	.event("test", (event) => event.body(Type.Object({ body: Type.String() })));

await webhook.call(
	server.url.href,
	"test",
	{ body: "test" },
	{ custom: { id: 1 } },
);

// const requests = await db
// 	.select()
// 	.from(requestTable)
// 	.leftJoin(responseTable, eq(requestTable.id, responseTable.requestId));

// console.log(requests);
