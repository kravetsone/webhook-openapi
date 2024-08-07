import { OptionalKind, type Static, type TSchema } from "@sinclair/typebox";
import type { OpenAPIV3_1 } from "openapi-types";
import type { Hooks, MimeTypeHelpers, RequestOptions } from "./types";
import { mapProperties, mapTypeContents } from "./utils";
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

	private mimeTypes: MimeTypeHelpers = {
		"application/json": {
			serialization: JSON.stringify,
			deserialization: (response) => response.json(),
		},
		"text/plain": {
			serialization: (data) => data,
			deserialization: (response) => response.text(),
		},
	};

	private hooks: Hooks.Store = {
		beforeRequest: [],
		afterResponse: [],
		sendError: [],
	};

	constructor() {
		this.openapi = {
			openapi: "3.1.0",
			info: {
				title: "Webhook-openapi",
				version: "0.0.1",
			},
			webhooks: {},
			paths: {},
		};
	}

	extend<WebhookPlugin extends Webhook<any>>(
		webhook: WebhookPlugin,
	): Webhook<Events & (WebhookPlugin extends Webhook<infer E> ? E : never)> {
		this.hooks.afterResponse.push(...webhook.hooks.afterResponse);
		this.hooks.beforeRequest.push(...webhook.hooks.beforeRequest);
		this.hooks.sendError.push(...webhook.hooks.sendError);

		return this;
	}

	private async runHooks<Name extends keyof Hooks.Store>(
		name: Name,
		args: Parameters<Hooks.Store[Name][0]>[0],
	) {
		for (const hook of this.hooks[name]) {
			// @ts-expect-error
			hook(args);
		}
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

	onBeforeRequest(hook: Hooks.BeforeRequest) {
		this.hooks.beforeRequest.push(hook);

		return this;
	}

	onAfterResponse(hook: Hooks.AfterResponse) {
		this.hooks.afterResponse.push(hook);

		return this;
	}

	onSendError(hook: Hooks.SendError) {
		this.hooks.sendError.push(hook);

		return this;
	}

	mimeType(mimeType: string, options: MimeTypeHelpers[string]) {
		this.mimeTypes[mimeType] = options;

		return this;
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
				parameters: webhookEvent._.bodyHeaders
					? mapProperties("header", webhookEvent._.bodyHeaders)
					: undefined,
				requestBody: {
					content: mapTypeContents(
						Object.keys(this.mimeTypes),
						webhookEvent._.body ?? undefined,
					),
					required: !(OptionalKind in (webhookEvent?._?.body ?? {})),
					description: webhookEvent._.body?.description,
				},
				responses: {
					"200": {
						description: webhookEvent._.response?.description ?? "",
						content: mapTypeContents(
							Object.keys(this.mimeTypes),
							webhookEvent._.response ?? undefined,
						),
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

	async call<Event extends keyof Events & string>(
		url: string,
		event: Event,
		params: Static<Events[Event]["body"]>,
		requestOptions?: Partial<RequestOptions> & {
			custom?: Record<string, any>;
			mimeType?: string;
		},
	) {
		const custom = requestOptions?.custom ?? {};
		const requestInit: RequestOptions = {
			method: "POST",
			headers: new Headers({
				"Content-Type": requestOptions?.mimeType ?? "application/json",
			}),

			...requestOptions,
		};

		await this.runMutationHooks("beforeRequest", {
			request: requestInit,
			data: params,
			event,
			url,
			custom,
			webhook: this,
		});

		// ! TODO: more thing about serialization and deserialization for general usage
		if (!requestInit.body)
			requestInit.body =
				await this.mimeTypes[
					requestOptions?.mimeType ?? "application/json"
				].serialization(params);

		try {
			const response = await fetch(url, requestInit);
			const mimeType = response.headers
				.get("content-type")
				?.split(";")[0]
				.trim();
			let data: BodyInit | undefined;

			if (mimeType)
				data =
					await this.mimeTypes[mimeType ?? "application/text"]?.deserialization(
						response,
					); // as Static<Events[Event]["response"]>;

			this.runHooks("afterResponse", {
				response,
				request: requestInit,
				url,
				body: params,
				data,
				event,
				custom,
				webhook: this,
			});
		} catch (error) {
			if (error instanceof Error)
				await this.runHooks("sendError", {
					request: requestInit,
					data: params,
					url,
					event,
					webhook: this,
					error,
				});
		}

		return null;
	}
}
