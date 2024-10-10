import pg from "pg";
import sqlite3 from "sqlite3";
import { type DatabaseConnection } from "../types";

export const setupDatabaseConnection = async (
  isConfigDb: boolean,
  isSqlite: boolean,
  sqliteDbPath: string | undefined,
  database: string | undefined,
  defaultDb: string | undefined,
  host: string | undefined,
  user: string | undefined,
  password: string | undefined,
  port: string,
  ssl: boolean | string | undefined,
): Promise<DatabaseConnection> => {
  console.log(`Setting up database connection to ${database}...`);

  if (isConfigDb && !isSqlite) {
    // Ensure the database is created before connecting
    const created = await createDatabaseIfNotExists(
      database as string,
      defaultDb as string,
      host,
      user,
      password,
      port,
      ssl as string,
    );
    if (!created) {
      console.error(
        `Failed to create or verify the existence of database ${database}`,
      );
      return null;
    }
  }

  if (isSqlite) {
    if (sqliteDbPath === undefined) {
      throw new Error("sqliteDbPath is undefined");
    }
    const sqlite = sqlite3.verbose();
    const sqliteDb = new sqlite.Database(
      sqliteDbPath,
      sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      (err: Error | null) => {
        if (err) {
          console.error("Error connecting to SQLite database:", err.message);
        } else {
          console.log("Connected to the SQLite database");
        }
      },
    );
    return sqliteDb;
  } else {
    const dbConnection = {
      database: database,
      user: user,
      host: host,
      password: password,
      port: parseInt(port, 10),
      ssl: ssl === true ? { rejectUnauthorized: false } : false,
    };
    const client = new pg.Client(dbConnection);

    try {
      await client.connect();
      console.log(`Connected to the PostgreSQL database: "${database}"`);
      return client;
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.message.includes("self signed certificate")
      ) {
        console.error(
          "Error connecting to the PostgreSQL database: Self-signed certificate issue.",
        );
      } else {
        console.error("Error connecting to the PostgreSQL database:", error);
      }
      return null;
    }
  }
};

const checkDatabaseExists = async (
  database: string,
  defaultDb: string | undefined,
  host: string | undefined,
  user: string | undefined,
  password: string | undefined,
  port: string,
  ssl: boolean | string | undefined,
): Promise<boolean> => {
  const client = new pg.Client({
    user: user,
    host: host,
    password: password,
    port: parseInt(port, 10),
    ssl: ssl === true ? { rejectUnauthorized: false } : false,
    database: defaultDb,
  });

  try {
    await client.connect();
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [database],
    );
    return (res.rowCount ?? 0) > 0;
  } catch (error) {
    console.error(`Error checking if database ${database} exists:`, error);
    return false;
  } finally {
    await client.end();
  }
};

const createDatabaseIfNotExists = async (
  database: string,
  defaultDb: string | undefined,
  host: string | undefined,
  user: string | undefined,
  password: string | undefined,
  port: string,
  ssl: boolean | string | undefined,
): Promise<boolean> => {
  const exists = await checkDatabaseExists(
    database,
    defaultDb,
    host,
    user,
    password,
    port,
    ssl,
  );
  if (exists) {
    return true;
  }
  console.log(`Creating database ${database}...`);

  const client = new pg.Client({
    user: user,
    host: host,
    password: password,
    port: parseInt(port, 10),
    ssl: ssl === true ? { rejectUnauthorized: false } : false,
    database: defaultDb,
  });

  try {
    await client.connect();
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [database],
    );
    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE ${database}`);
      console.log(`Database ${database} created successfully.`);

      // Grant privileges to the user
      await client.query(
        `GRANT ALL PRIVILEGES ON DATABASE ${database} TO ${user};`,
      );
    } else {
      console.log(`Database ${database} already exists.`);
    }
    return true;
  } catch (error) {
    console.error(`Error creating database ${database}:`, error);
    return false;
  } finally {
    await client.end();
  }
};
