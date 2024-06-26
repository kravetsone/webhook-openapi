import type { Static, TSchema } from "@sinclair/typebox";
import type { OpenAPIV3_1 } from "openapi-types";
import type { Hooks } from "./types";
import { WebhookEvent } from "./webhookEvent";

export * from "@sinclair/typebox";
export * from "./webhookEvent";

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

	private hooks: Hooks.Store = {
		beforeRequest: [],
		afterResponse: [],
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

	private async runMutationHooks<Name extends keyof Hooks.Store>(
		name: Name,
		args: Parameters<Hooks.Store[Name][0]>[0],
	) {
		let data = args;

		for await (const hook of this.hooks[name]) {
			// @ts-expect-error
			data = await hook(args);
		}

		return data as ReturnType<Hooks.Store[Name][0]>;
	}

	event<Name extends string, Event extends WebhookEvent>(
		name: Name,
		event: (event: WebhookEvent) => Event,
		params?: Omit<OpenAPIV3_1.PathItemObject, OpenAPIV3_1.HttpMethods>,
	) {
		const webhookEvent = event(new WebhookEvent());

		this.openapi.webhooks[name] = {
			...params,
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
						description: "",
						content: {
							"application/json": { schema: webhookEvent._.response },
						},
					},
				},
			} as OpenAPIV3_1.OperationObject,
		};

		return this as unknown as Webhook<
			Events & {
				[K in Name]: Event extends WebhookEvent<infer Body, infer Response>
					? { body: Body; response: Response }
					: never;
			}
		>;
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
