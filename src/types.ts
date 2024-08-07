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
		url: string;
		event: string;
		webhook: Webhook;
		custom: Record<string, any>;
	}) => any;
	export type AfterResponse = (data: {
		response: Response;
		request: RequestOptions;
		body: any;
		data: any;
		event: string;
		webhook: Webhook;
		custom: Record<string, any>;
	}) => any;
	export type SendError = (data: {
		request: RequestOptions;
		data: any;
		event: string;
		webhook: Webhook;
		error: Error;
	}) => any;
	export interface Store {
		beforeRequest: BeforeRequest[];
		afterResponse: AfterResponse[];
		sendError: SendError[];
	}
}
