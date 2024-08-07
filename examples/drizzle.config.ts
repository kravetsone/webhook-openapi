import type { Config } from "drizzle-kit";

console.log("http://localhost:4983");

export default {
	schema: "./src/schema.ts",
	out: "./drizzle",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL as string,
	},
} satisfies Config;
