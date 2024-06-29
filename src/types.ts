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

export type RequestOptions = Omit<RequestInit, "headers"> & {
	headers: Headers;
};

export namespace Hooks {
	export type BeforeRequest = (data: {
		request: RequestOptions;
		data: any;
		event: string;
		webhook: Webhook;
	}) => any;
	export type AfterResponse = (data: {
		response: Response;
		request: RequestOptions;
		body: any;
		data: any;
		event: string;
		webhook: Webhook;
	}) => any;

	export interface Store {
		beforeRequest: BeforeRequest[];
		afterResponse: AfterResponse[];
	}
}
