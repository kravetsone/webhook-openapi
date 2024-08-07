# webhook-openapi

<div align="center">

[![npm](https://img.shields.io/npm/v/webhook-openapi?logo=npm&style=flat&labelColor=000&color=3b82f6)](https://www.npmjs.org/package/webhook-openapi)
[![JSR](https://jsr.io/badges/webhook-openapi)](https://jsr.io/webhook-openapi)
[![JSR Score](https://jsr.io/badges/webhook-openapi/score)](https://jsr.io/webhook-openapi)

</div>

This library is aimed at helping to implement a Webhook server.

> [!WARNING]
> This project is in the `MVP` state and the API may still change a lot. At the moment, the project fits the
> requirements of the project rather than general purpose

### TODO:

-   Fix shit-code
-   Continue working and thinking about the API
-   Rewrite to general-purpose usage

# Usage

```ts
import { Webhook } from "webhook-openapi";
import { Type } from "@sinclair/typebox";

const WEBHOOK_URL = "http://localhost:8943";

const webhook = new Webhook()
    .event(
        "some",
        (event) =>
            event
                .body(
                    Type.Object({
                        some: Type.String(),
                    })
                )
                .response(
                    Type.Object({
                        status: Type.Literal("ok"),
                    })
                ),
        {
            description: "Some description",
        }
    )
    .event("some2", (event) =>
        event
            .body(
                Type.Object({
                    some: Type.String(),
                })
            )
            .response(Type.Object({}))
    );

console.log(webhook.openapi); // get OpenAPI document with `webhooks` object

const response = await webhook.call(WEBHOOK_URL, "some", { some: "string" });
//      ^? const response: { status: "ok" }
```

### Plugins

You can write your own plugin:

```ts
const retriesPlugin = new Webhook().onSendError(
    ({ data, request, event, webhook }) => {
        setTimeout(
            // @ts-expect-error
            async () => webhook.call(request.url, event, data),
            10 * 1000
        );
    }
);

const webhook = new Webhook().extend(retriesPlugin);
```

### Hooks

-   sendError

```ts
const webhook = new Webhook().onSendError(
    ({ data, request, event, webhook }) => {
        setTimeout(
            // @ts-expect-error
            async () => webhook.call(request.url, event, data),
            10 * 1000
        );
    }
);
```

-   afterResponse

```ts
const webhook = new Webhook().onAfterResponse(
    ({ response, data, request, event, webhook }) => {
        console.log(response);
        if (!response.ok)
            setTimeout(
                // @ts-expect-error
                async () => webhook.call(request.url, event, data),
                10 * 1000
            );
    }
);
```

-   beforeRequest

```ts
const webhook = new Webhook().onBeforeRequest(({ request, data }) => {
    request.headers.append("x-length", JSON.stringify(data).length.toString());
    request.body = JSON.stringify(data);
});
```
