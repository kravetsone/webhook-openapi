import type { TObject } from "@sinclair/typebox";
import type { OpenAPIV3 } from "openapi-types";

export function mapProperties(
	to: "header",
	schema: TObject,
): OpenAPIV3.ParameterObject[] {
	return Object.entries(schema.properties ?? []).map(([key, value]) => {
		const { type, description, examples, ...otherProps } = value;

		return {
			in: to,
			name: key,
			schema: { type, ...otherProps },
			required: schema.required?.includes(key) ?? false,
		};
	});
}
