import { defineEventHandler, sendError, H3Event } from "h3";
import { setupDatabaseConnection } from "../../database/dbConnection";
import { addNewTableToConfig } from "../../database/dbOperations";

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

  const { table } = event.context.params as { table: string };

  try {
    await addNewTableToConfig(configDb, table, isSqlite);
    return { message: "New table added successfully" };
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        "Error adding new table to config on API side:",
        error.message
      );
      return sendError(event, new Error(error.message));
    } else {
      console.error(
        "Unknown error adding new table to config on API side:",
        error
      );
      return sendError(event, new Error("An unknown error occurred"));
    }
  }
});