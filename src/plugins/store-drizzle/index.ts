import type {
	PgColumn,
	PgDatabase,
	PgTableWithColumns,
} from "drizzle-orm/pg-core";
import { Webhook } from "../../index";

// export interface StoreOptions {
// 	db: PgDatabase<any, any, any>;
// 	requestTable: PGRequestTable;
// }

export function store(
	db: PgDatabase<any, any, any>,
	requestTable: PGRequestTable,
	responseTable: PGResponseTable,
) {
	return new Webhook()
		.onBeforeRequest(async ({ request, url, custom, data }) => {
			const [{ id }] = await db
				.insert(requestTable)
				.values({
					headers: request.headers.toJSON(),
					data,
					url,
				})
				.returning({
					id: requestTable.id,
				});

			custom.requestId = id;
			custom.responseStart = performance.now();
		})
		.onAfterResponse(async ({ custom, response, data }) => {
			if ("requestId" in custom) {
				await db.insert(responseTable).values({
					requestId: custom.requestId,
					headers: response.headers.toJSON(),
					data,
					status: response.status,
					responseTime:
						typeof custom.responseStart === "number"
							? performance.now() - custom.responseStart
							: 0,
				});
			}
		});
}

export type PGRequestTable = PgTableWithColumns<{
	dialect: "pg";
	columns: {
		id: PgColumn<{
			name: any;
			tableName: any;
			dataType: any;
			columnType: any;
			data: any;
			driverParam: any;
			notNull: true;
			hasDefault: boolean; // must be boolean instead of any to allow default values
			enumValues: any;
			baseColumn: any;
			isPrimaryKey: any;
			isAutoincrement: any;
			hasRuntimeDefault: any;
			generated: any;
		}>;
		data: PgColumn<{
			name: any;
			tableName: any;
			dataType: "json";
			columnType: "PgJsonb";
			data: unknown;
			driverParam: unknown;
			notNull: boolean;
			hasDefault: boolean;
			enumValues: undefined;
			baseColumn: never;
			isPrimaryKey: any;
			isAutoincrement: any;
			hasRuntimeDefault: any;
			generated: any;
		}>;
		url: PgColumn<{
			dataType: any;
			notNull: boolean;
			enumValues: any;
			tableName: any;
			columnType: any;
			data: string;
			driverParam: any;
			hasDefault: false;
			name: any;
			isPrimaryKey: any;
			isAutoincrement: any;
			hasRuntimeDefault: any;
			generated: any;
		}>;
		headers: PgColumn<{
			name: any;
			tableName: any;
			dataType: "json";
			columnType: "PgJsonb";
			data: Record<string, string>;
			driverParam: unknown;
			notNull: boolean;
			hasDefault: boolean;
			enumValues: undefined;
			baseColumn: never;
			isPrimaryKey: any;
			isAutoincrement: any;
			hasRuntimeDefault: any;
			generated: any;
		}>;
	};

	schema: any;
	name: any;
}>;

export type PGResponseTable = PgTableWithColumns<{
	dialect: "pg";
	columns: {
		id: PgColumn<{
			name: any;
			tableName: any;
			dataType: any;
			columnType: any;
			data: any;
			driverParam: any;
			notNull: true;
			hasDefault: boolean; // must be boolean instead of any to allow default values
			enumValues: any;
			baseColumn: any;
			isPrimaryKey: any;
			isAutoincrement: any;
			hasRuntimeDefault: any;
			generated: any;
		}>;
		data: PgColumn<{
			name: any;
			tableName: any;
			dataType: "json";
			columnType: "PgJsonb";
			data: unknown;
			driverParam: unknown;
			notNull: boolean;
			hasDefault: boolean;
			enumValues: undefined;
			baseColumn: never;
			isPrimaryKey: any;
			isAutoincrement: any;
			hasRuntimeDefault: any;
			generated: any;
		}>;
		status: PgColumn<{
			dataType: any;
			notNull: boolean;
			enumValues: any;
			tableName: any;
			columnType: any;
			data: number;
			driverParam: any;
			hasDefault: false;
			name: any;
			isPrimaryKey: any;
			isAutoincrement: any;
			hasRuntimeDefault: any;
			generated: any;
		}>;
		headers: PgColumn<{
			name: any;
			tableName: any;
			dataType: "json";
			columnType: "PgJsonb";
			data: Record<string, string>;
			driverParam: unknown;
			notNull: boolean;
			hasDefault: boolean;
			enumValues: undefined;
			baseColumn: never;
			isPrimaryKey: any;
			isAutoincrement: any;
			hasRuntimeDefault: any;
			generated: any;
		}>;
		requestId: PgColumn<{
			dataType: any;
			notNull: true;
			enumValues: any;
			tableName: any;
			columnType: any;
			data: any;
			driverParam: any;
			hasDefault: false;
			name: any;
			isPrimaryKey: any;
			isAutoincrement: any;
			hasRuntimeDefault: any;
			generated: any;
		}>;
		responseTime?: PgColumn<{
			dataType: any;
			notNull: boolean;
			enumValues: any;
			tableName: any;
			columnType: any;
			data: any;
			driverParam: any;
			hasDefault: boolean;
			name: any;
			isPrimaryKey: any;
			isAutoincrement: any;
			hasRuntimeDefault: any;
			generated: any;
		}>;
	};

	schema: any;
	name: any;
}>;
