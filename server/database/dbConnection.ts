import pg from "pg";
import sqlite3 from "sqlite3";

type DatabaseConnection = pg.Client | sqlite3.Database | null;

let db: DatabaseConnection = null;

export const setupDatabaseConnection = (
  isConfigDb: boolean,
  isSqlite: boolean,
  sqliteDbPath: string | undefined,
  database: string | undefined,
  defaultDb: string | undefined,
  host: string | undefined,
  user: string | undefined,
  password: string | undefined,
  port: string,
  ssl: boolean | string | undefined
): DatabaseConnection => {
  console.log("Setting up database connection...");

  if (isConfigDb && !isSqlite) {
    // create the database if it doesn't exist
    createDatabaseIfNotExists(
      database as string,
      defaultDb as string,
      host,
      user,
      password,
      port,
      ssl as string
    );
  }

  if (isSqlite) {
    if (sqliteDbPath === undefined) {
      throw new Error("sqliteDbPath is undefined");
    }
    const sqlite = sqlite3.verbose();
    db = new sqlite.Database(
      sqliteDbPath,
      sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      (err: Error | null) => {
        if (err) {
          console.error("Error connecting to SQLite database:", err.message);
          db = null;
        } else {
          console.log("Connected to the SQLite database");
        }
      }
    );
  } else {
    const dbConnection = {
      database: database,
      user: user,
      host: host,
      password: password,
      port: parseInt(port, 10),
      ssl: ssl === true ? { rejectUnauthorized: false } : false,
    };
    db = new pg.Client(dbConnection);

    db.connect()
      .then(() => {
        console.log(`Connected to the PostgreSQL database: "${database}"`);
      })
      .catch((error: Error) => {
        db = null;
        if (error.message.includes("self signed certificate")) {
          console.error(
            "Error connecting to the PostgreSQL database: Self-signed certificate issue."
          );
        } else {
          console.error("Error connecting to the PostgreSQL database:", error);
        }
      });
  }

  return db;
};

const createDatabaseIfNotExists = async (
  database: string,
  defaultDb: string | undefined,
  host: string | undefined,
  user: string | undefined,
  password: string | undefined,
  port: string,
  ssl: boolean | string | undefined
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
      [database]
    );
    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE ${database}`);
      console.log(`Database ${database} created successfully.`);

      // Grant privileges to the user
      await client.query(
        `GRANT ALL PRIVILEGES ON DATABASE ${database} TO ${user};`
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
