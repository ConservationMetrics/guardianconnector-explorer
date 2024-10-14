import { setupDatabaseConnection } from "./database/dbConnection";
import { type DatabaseConnection } from "./types";

let configDb: DatabaseConnection;
let db: DatabaseConnection;

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
  // eslint-disable-next-line no-undef
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

export default async () => {
  try {
    configDb = await setupDatabaseConnection(
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
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to connect to ${configDatabase}:`, error);
    } else {
      console.error("Unknown error connecting to database:", error);
    }
  }
  try {
    db = await setupDatabaseConnection(
      /* isConfigDb */ false,
      isSqlite,
      sqliteDbPath,
      database,
      database,
      dbHost,
      dbUser,
      dbPassword,
      dbPort,
      dbSsl,
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to connect to ${database}:`, error);
    } else {
      console.error("Unknown error connecting to database:", error);
    }
  }
};

export { configDb, db };
