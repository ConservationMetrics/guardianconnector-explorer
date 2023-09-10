import { Client } from "pg";
import { verbose, Database, OPEN_READONLY } from "sqlite3";

type DatabaseConnection = Client | Database | null;

let db: DatabaseConnection = null;

const setupDatabaseConnection = (): DatabaseConnection => {
  console.log("Setting up database connection...");

  if (process.env.SQLITE === "YES") {
    const sqlite = verbose();
    db = new sqlite.Database(
      process.env.SQLITE_DB_PATH!,
      OPEN_READONLY,
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
      database: process.env.DATABASE,
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT!, 10),
      ssl: process.env.DB_SSL === 'true',
    };
    db = new Client(dbConnection);

    db.connect()
      .then(() => {
        console.log("Connected to the PostgreSQL database");
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

export default setupDatabaseConnection;
