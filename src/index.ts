import { type Static, type TSchema, Type } from "@sinclair/typebox";
import type { OpenAPIV3_1 } from "openapi-types";
import { WebhookEvent } from "./webhookEvent";

export class Webhook<
	Events extends Record<
		string,
		{
			body: TSchema;
			response: TSchema;
		}
		// biome-ignore lint/complexity/noBannedTypes: <explanation>
	> = {},
> {
	openapi: Omit<OpenAPIV3_1.Document, "webhooks"> & {
		webhooks: NonNullable<OpenAPIV3_1.Document["webhooks"]>;
	};

	constructor() {
		this.openapi = {
			openapi: "3.1.0",
			info: {
				title: "ok",
				version: "0.0.1",
			},
			webhooks: {},
			paths: {},
		};
	}
	// event<Name extends string, Event extends WebhookEvent>(
	// 	name: Name,
	// 	event: (event: WebhookEvent) => Event,
	// ): Webhook<
	// 	Events & {
	// 		[K in Name]: Event extends WebhookEvent<infer Body, infer Response>
	// 			? { body: Body; response: Response }
	// 			: never;
	// 	}
	// > {
	event<Name extends string, Event extends WebhookEvent>(
		name: Name,
		event: (event: WebhookEvent) => Event,
	): Webhook<
		Events & {
			[K in Name]: Event extends WebhookEvent<infer Body, infer Response>
				? { body: Body; response: Response }
				: never;
		}
	> {
		const webhookEvent = event(new WebhookEvent());

		this.openapi.webhooks[name] = {
			[webhookEvent._.method]: {
				requestBody: {
					content: {
						"application/json": {
							schema: webhookEvent._.body,
						},
					},
				},
				responses: {
					"200": {
						headers: {
							schema: Type.Literal("okk"),
						},
						description: "",
						content: {
							"application/json": { schema: webhookEvent._.response },
						},
					},
				},
			} as OpenAPIV3_1.OperationObject,
		};

		return this as any;
	}

	async call<Event extends keyof Events>(
		url: string,
		event: Event,
		params: Static<Events[Event]["body"]>,
	) {
		const response = await fetch(url);

		const data = (await response.json()) as Static<Events[Event]["response"]>;

		return data;
	}
}
