const { Client } = require('pg'); // For PostgreSQL
const sqlite3 = require('sqlite3').verbose(); // For SQLite

let db;

const setupDatabaseConnection = () => {
  if (process.env.SQLITE === "YES") {
    // SQLite configuration
    db = new sqlite3.Database(process.env.SQLITE_DB_PATH, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        console.error('Error connecting to SQLite database:', err.message);
      } else {
        console.log('Connected to the SQLite database');
      }
    });
  } else {
    // PostgreSQL configuration
    const db_connection = {
      database: process.env.DATABASE,
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      ssl: process.env.DB_SSL
    };
    db = new Client(db_connection);

    db.connect()
      .then(() => {
        console.log('Connected to the PostgreSQL database');
      })
      .catch((error) => {
        if (error.message.includes('self signed certificate')) {
          console.error('Error connecting to the PostgreSQL database: Self-signed certificate issue.');
        } else {
          console.error('Error connecting to the PostgreSQL database:', error);
        }
      });
  }

  return db;
}

module.exports = setupDatabaseConnection;
