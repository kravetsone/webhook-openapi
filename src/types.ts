// export type SoftString<T extends string> = T & (string & {});

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
		data: unknown;
	}) => any;
	export type AfterResponse = (data: {
		response: Response;
		request: Request;
		data: any;
	}) => any;

	export interface Store {
		beforeRequest: BeforeRequest[];
		afterResponse: AfterResponse[];
	}
}
