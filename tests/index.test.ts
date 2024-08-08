import { describe, expect, test } from "bun:test";
import { pack, unpack } from "msgpackr";
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

const responseJSON = Response.json({
	some: {
		values: true,
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
	test("should extend from another Webhook instance", async () => {
		let isErr = false;

		const webhook = new Webhook()
			.extend(
				new Webhook().onSendError(({ error }) => {
					console.log(error);
					isErr = true;
				}),
			)
			.event("test", (event) =>
				event.body(Type.Object({ body: Type.String() })),
			);

		await webhook.call("http://localhost:8878", "test", { body: "test" });

		expect(isErr).toBe(true);
		// @ts-expect-error
		expect(webhook.hooks.sendError.length).toBe(1);
	});
	test("should work with json default mimeType", async () => {
		let answer = {};

		using server = Bun.serve({
			port: 9888,
			fetch: () => responseJSON,
		});

		const webhook = new Webhook()

			.event("test", (event) =>
				event.body(Type.Object({ body: Type.String() })),
			)
			.onAfterResponse(({ response, data }) => {
				console.log(data);
				answer = data;
			});

		await webhook.call(server.url.href, "test", { body: "test" });

		expect(answer).toEqual({
			some: {
				values: true,
			},
		});
	});
	test("should work with json default mimeType", async () => {
		let answer = {};
		const shouldBe = { some: { values: true } };
		const mimeType = "application/x-msgpack";

		using server = Bun.serve({
			port: 9888,
			fetch: () =>
				new Response(pack(shouldBe), {
					headers: {
						"content-type": mimeType,
					},
				}),
		});

		const webhook = new Webhook()
			.mimeType(mimeType, {
				serialization: (data) => pack(data),
				deserialization: async (response) =>
					unpack(Buffer.from(await response.arrayBuffer())),
			})
			.event("test", (event) =>
				event.body(Type.Object({ body: Type.String() })),
			)
			.onAfterResponse(({ response, data }) => {
				console.log(data, response);
				answer = data;
			});

		await webhook.call(server.url.href, "test", { body: "test" });

		expect(answer).toEqual(shouldBe);
		expect(
			// @ts-expect-error
			webhook.openapi.webhooks.test.post.requestBody.content[
				"application/x-msgpack"
			],
		).not.toBeUndefined();
	});
});
