import { describe, expect, test } from "bun:test";
import { Type, Webhook } from "../src/index";

const responseOK = new Response("ok", {
	headers: {
		"content-type": "text/plain",
	},
});
const responseBad = new Response("Something went wrong", {
	status: 500,
	headers: {
		"content-type": "text/plain",
	},
});

describe("webhook", () => {
	test("Should emit onAfterResponse with ok response", async () => {
		let isOk = false;

		using server = Bun.serve({
			port: 9888,
			fetch: () => responseOK,
		});

		const webhook = new Webhook()
			.event("test", (event) =>
				event.body(Type.Object({ body: Type.String() })),
			)
			.onAfterResponse(({ response }) => {
				console.log(response);
				if (response.ok) isOk = true;
			});

		await webhook.call(server.url.href, "test", { body: "test" });

		expect(isOk).toBe(true);
	});
	test("should emit onAfterResponse with no-ok", async () => {
		let isBad = false;

		using server = Bun.serve({
			port: 9888,
			fetch: () => responseBad,
		});

		const webhook = new Webhook()
			.event("test", (event) =>
				event.body(Type.Object({ body: Type.String() })),
			)
			.onAfterResponse(({ response }) => {
				console.log(response);
				if (!response.ok) isBad = true;
			});

		await webhook.call(server.url.href, "test", { body: "test" });

		expect(isBad).toBe(true);
	});
	test("should emit onSendError", async () => {
		let isErr = false;

		const webhook = new Webhook()
			.event("test", (event) =>
				event.body(Type.Object({ body: Type.String() })),
			)
			.onSendError(({ error }) => {
				console.log(error);
				isErr = true;
			});

		await webhook.call("http://localhost:8878", "test", { body: "test" });

		expect(isErr).toBe(true);
	});
});
