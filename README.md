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

### Retries on timers

This simple plugin is just retries when request failed (sendError or non-ok response). First argument is timeout ms (default to `30 * 1000`).

```ts
import { retryOnTimers } from "webhook-openapi/plugins/timers-retries";

const webhook = new Webhook()
    .extend(retryOnTimers(60 * 1000))
    .event("test", (event) => event.body(Type.Object({ body: Type.String() })));
```

### Store Drizzle

This plugin writes requests and responses to the database using drizzle

> [!WARNING]
> It is important to remember that when used together with the retries plugin, only the Response with the same RequestId is duplicated

```ts
import { store } from "webhook-openapi/plugins/store-drizzle";

export type HTTPMethods =
    | "GET"
    | "POST"
    | "PUT"
    | "PATCH"
    | "DELETE"
    | "OPTIONS"
    | "HEAD"
    | "TRACE";

export const requestTable = pgTable("requests", {
    id: serial("id").primaryKey(),
    data: jsonb("data"),
    method: text("method").$type<HTTPMethods>(),
    headers: jsonb("headers").$type<Record<string, string>>(),
    url: text("url"),
});

export const responseTable = pgTable("responses", {
    id: serial("id").primaryKey(),
    data: jsonb("data"),
    headers: jsonb("headers").$type<Record<string, string>>(),
    status: integer("status"),
    requestId: integer("request_id")
        .notNull()
        .references(() => requestTable.id),
    responseTime: real("response_time"),
});

const client = postgres(process.env.DATABASE_URL as string);
const db = drizzle(client);

const webhook = new Webhook()
    .extend(store(db, requestTable, responseTable))
    .event("test", (event) => event.body(Type.Object({ body: Type.String() })));
```

### You own plugin

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

### mimeType

it so boring to talk about it... Please read this test

```ts
import { unpack, pack } from "msgpackr";

let answer = {};
const shouldBe = { some: { values: true } };
const mimeType = "application/x-msgpack";

using server = Bun.serve({
    port: 9888,
    fetch: () =>
        new Response(pack(shouldBe), {
            headers: {
                "content-type": mimeType,
            },
        }),
});

const webhook = new Webhook()
    .mimeType(mimeType, {
        serialization: (data) => pack(data),
        deserialization: async (response) =>
            unpack(Buffer.from(await response.arrayBuffer())),
    })
    .event("test", (event) => event.body(Type.Object({ body: Type.String() })))
    .onAfterResponse(({ response, data }) => {
        console.log(data, response);
        answer = data;
    });

await webhook.call(server.url.href, "test", { body: "test" });

expect(answer).toEqual(shouldBe);
```
