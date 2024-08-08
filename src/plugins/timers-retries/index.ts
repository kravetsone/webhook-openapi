import { Webhook } from "../../index";

// TODO: add bullmq based retries

export function retriesOnTimers(ms: number = 30 * 1000) {
	return new Webhook()
		.onSendError(({ webhook, request, url, data, event }) => {
			setTimeout(
				// @ts-expect-error
				async () => webhook.call(url, event, data, request),
				ms,
			);
		})
		.onAfterResponse(({ webhook, response, url, request, event, body }) => {
			if (!response.ok) {
				// @ts-expect-error
				setTimeout(async () => webhook.call(url, event, body, request), ms);
			}
		});
}
