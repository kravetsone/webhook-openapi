// export type SoftString<T extends string> = T & (string & {});

import type { Webhook } from "./index";

export type HTTPMethods =
	| "GET"
	| "POST"
	| "PUT"
	| "PATCH"
	| "DELETE"
	| "OPTIONS"
	| "HEAD"
	| "TRACE";

export namespace Hooks {
	export type BeforeRequest = (data: {
		request: Request;
		data: any;
		event: string;
		webhook: Webhook;
	}) => any;
	export type AfterResponse = (data: {
		response: Response;
		request: Request;
		data: any;
		event: string;
		webhook: Webhook;
	}) => any;

	export interface Store {
		beforeRequest: BeforeRequest[];
		afterResponse: AfterResponse[];
	}
}
