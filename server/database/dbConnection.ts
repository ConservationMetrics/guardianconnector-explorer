import { Client } from "pg";
import { verbose, Database, OPEN_READWRITE, OPEN_CREATE } from "sqlite3";

type DatabaseConnection = Client | Database | null;

let db: DatabaseConnection = null;

export const setupDatabaseConnection = (
  isSQLite: boolean,
  sqliteDbPath: string | undefined,
  database: string | undefined,
  host: string | undefined,
  user: string | undefined,
  password: string | undefined,
  port: string,
  ssl: string | undefined,
): DatabaseConnection => {
  console.log("Setting up database connection...");

  if (isSQLite) {
    if (sqliteDbPath === undefined) {
      throw new Error("sqliteDbPath is undefined");
    }
    const sqlite = verbose();
    db = new sqlite.Database(
      sqliteDbPath,
      OPEN_READWRITE | OPEN_CREATE,
      (err: Error | null) => {
        if (err) {
          console.error("Error connecting to SQLite database:", err.message);
          db = null;
        } else {
          console.log("Connected to the SQLite database");
        }
      },
    );
  } else {
    const dbConnection = {
      database: database,
      user: user,
      host: host,
      password: password,
      port: parseInt(port, 10),
      ssl: ssl === "true" ? { rejectUnauthorized: false } : false,
    };
    db = new Client(dbConnection);

    db.connect()
      .then(() => {
        console.log(`Connected to the PostgreSQL database: "${database}"`);
      })
      .catch((error: Error) => {
        db = null;
        if (error.message.includes("self signed certificate")) {
          console.error(
            "Error connecting to the PostgreSQL database: Self-signed certificate issue.",
          );
        } else {
          console.error("Error connecting to the PostgreSQL database:", error);
        }
      });
  }

  return db;
};

export const createDatabaseIfNotExists = async (
  dbName: string,
  defaultDb: string | undefined,
  host: string | undefined,
  user: string | undefined,
  password: string | undefined,
  port: string,
  ssl: string | undefined,
): Promise<boolean> => {
  if (!dbName) {
    throw new Error("Database name is required");
  }

  const client = new Client({
    user: user,
    host: host,
    password: password,
    port: parseInt(port, 10),
    ssl: ssl === "true" ? { rejectUnauthorized: false } : false,
    database: defaultDb,
  });

  try {
    await client.connect();
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName],
    );
    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database ${dbName} created successfully.`);

      // Grant privileges to the user
      await client.query(
        `GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${user};`,
      );
    } else {
      console.log(`Database ${dbName} already exists.`);
    }
    return true;
  } catch (error) {
    console.error(`Error creating database ${dbName}:`, error);
    return false;
  } finally {
    await client.end();
  }
};
