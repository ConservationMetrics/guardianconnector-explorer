import { defineEventHandler, sendError, H3Event } from "h3";
import { setupDatabaseConnection } from "../../database/dbConnection";
import { fetchConfig } from "../../database/dbOperations";
import { getFilteredTableNames } from "./utils";

export default defineEventHandler(async (event: H3Event) => {
  const {
    configDatabase,
    database,
    dbHost,
    dbUser,
    dbPassword,
    dbPort,
    dbSsl,
    isSqlite,
    sqliteDbPath,
  } = useRuntimeConfig() as unknown as {
    configDatabase: string;
    database: string;
    dbHost: string;
    dbUser: string;
    dbPassword: string;
    dbPort: string;
    dbSsl: boolean;
    isSqlite: boolean;
    sqliteDbPath: string;
  };

  const configDb = setupDatabaseConnection(
    /* isConfigDb */ true,
    isSqlite,
    sqliteDbPath,
    configDatabase,
    database,
    dbHost,
    dbUser,
    dbPassword,
    dbPort,
    dbSsl
  );
  try {
    const viewsConfig = await fetchConfig(configDb, isSqlite);
    const tableNames = await getFilteredTableNames(database, isSqlite);

    // Filter out any tables that are already in viewsConfig
    const filteredTableNames = tableNames.filter(
      (name) => !Object.keys(viewsConfig).includes(name)
    );

    return { viewsConfig, tableNames: filteredTableNames };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching config on API side:", error.message);
      return sendError(event, new Error(error.message));
    } else {
      console.error("Unknown error fetching config on API side:", error);
      return sendError(event, new Error("An unknown error occurred"));
    }
  }
});

// ... existing code ...
