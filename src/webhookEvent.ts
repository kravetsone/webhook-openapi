import type { TObject, TSchema } from "@sinclair/typebox";
import type { OpenAPIV3_1 } from "openapi-types";
import type { HTTPMethods } from "./types";

export class WebhookEvent<
	Body extends TSchema | null = null,
	Response extends TSchema | null = null,
> {
	openapi: OpenAPIV3_1.PathItemObject | OpenAPIV3_1.ReferenceObject = {};

	_ = {
		method: "post" as Lowercase<HTTPMethods>,
		body: null as TSchema | null,
		bodyHeaders: null as TObject | null,
		response: {} as TSchema | null,
		//OpenAPIV3_1.ResponsesObject,
	};

	// method<Method extends HTTPMethods>(method: Method) {
	// 	this._.method = method.toLocaleLowerCase() as Lowercase<typeof method>;

	// 	return this;
	// }
	bodyHeaders<Schema extends TObject>(schema: Schema) {
		this._.bodyHeaders = schema;

		return this;
	}
	body<Schema extends TSchema>(schema: Schema): WebhookEvent<Schema>;
	body<Schema extends TSchema>(
		contentType: string,
		schema: Schema,
	): WebhookEvent<Schema, Response>;
	body<Schema extends TSchema>(
		contentTypeOrSchema: string | Schema,
		schema?: Schema,
	): WebhookEvent<Schema, Response> {
		this._.body =
			typeof contentTypeOrSchema === "object" ? contentTypeOrSchema : schema!;

		return this;
	}

	response<Schema extends TSchema>(
		schema: Schema,
		options?: OpenAPIV3_1.ResponseObject,
	): WebhookEvent<Body, Schema> {
		this._.response = schema;

		return this;
	}
}
