import { Client } from "pg";
import { verbose, Database, OPEN_READWRITE, OPEN_CREATE } from "sqlite3";

type DatabaseConnection = Client | Database | null;

let db: DatabaseConnection = null;

export const setupDatabaseConnection = (
  isSQLite: string,
  sqliteDbPath: string | undefined,
  database: string | undefined,
  host: string | undefined,
  user: string | undefined,
  password: string | undefined,
  port: string,
  ssl: string | undefined,
): DatabaseConnection => {
  console.log("Setting up database connection...");

  if (isSQLite === "YES") {
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

export default setupDatabaseConnection;
