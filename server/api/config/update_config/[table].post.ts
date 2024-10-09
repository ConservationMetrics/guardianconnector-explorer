import { defineEventHandler, sendError, readBody, H3Event } from "h3";
import { setupDatabaseConnection } from "../../../database/dbConnection";
import { updateConfig } from "../../../database/dbOperations";

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

  const configDb = await setupDatabaseConnection(
    /* isConfigDb */ true,
    isSqlite,
    sqliteDbPath,
    configDatabase,
    database,
    dbHost,
    dbUser,
    dbPassword,
    dbPort,
    dbSsl,
  );

  if (!configDb) {
    throw new Error("Failed to connect to configDb");
  }

  const table = event.context?.params?.table as string;
  const config = await readBody(event);

  try {
    await updateConfig(configDb, table, config, isSqlite);
    return { message: "Configuration updated successfully" };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating config on API side:", error.message);
      return sendError(event, new Error(error.message));
    } else {
      console.error("Unknown error updating config on API side:", error);
      return sendError(event, new Error("An unknown error occurred"));
    }
  }
});
