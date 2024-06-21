# webhook-openapi

This library is aimed at helping to implement a Webhook server.

> [!WARNING]
> This project is in the `MVP` state and the API may still change a lot. At the moment, the project fits the
> requirements of the project rather than general purpose

### TODO:

-   Fix shit-code
-   Continue working and thinking about the API

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
