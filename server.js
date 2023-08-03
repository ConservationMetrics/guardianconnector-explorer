require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection setup
const { Client } = require('pg'); // For PostgreSQL
const sqlite3 = require('sqlite3').verbose(); // For SQLite

let db;

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
    user: process.env.USER,
    host: process.env.HOST,
    password: process.env.PASSWORD,
    port: process.env.DB_PORT
  };
  db = new Client(db_connection);

  db.connect()
    .then(() => {
      console.log('Connected to the PostgreSQL database');
    })
    .catch((error) => {
      console.error('Error connecting to the PostgreSQL database:', error);
    });
}


app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Pass dotenv values to Mapbox
app.get('/', (req, res) => {
  const mapboxAccessToken = process.env.MAPBOX_ACCESS_TOKEN;
  const mapboxStyle = process.env.MAPBOX_STYLE;
  const mapboxProjection = process.env.MAPBOX_PROJECTION;
  const mapboxCenterLatitude = process.env.MAPBOX_CENTER_LATITUDE;
  const mapboxCenterLongitude = process.env.MAPBOX_CENTER_LONGITUDE;
  const mapboxZoom = process.env.MAPBOX_ZOOM;
  const mapboxPitch = process.env.MAPBOX_PITCH;
  const mapboxBearing = process.env.MAPBOX_BEARING;

  res.render('index', { mapboxAccessToken, mapboxStyle, mapboxProjection, mapboxCenterLatitude, mapboxCenterLongitude, mapboxZoom, mapboxPitch, mapboxBearing });
});

app.use(express.static('.'));

// Scrape data from db source
app.get('/data', async (req, res) => {
  try {
    query = `SELECT * FROM ${process.env.SQLITE_TABLE}`;

    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('Error fetching data:', err.message);
        res.status(500).json({ error: 'Error fetching data' });
        return;
      }
      res.json(rows);
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
});

app.listen(PORT, () => {
  console.log(`The GuardianConnector map is running on port ${PORT}`);
});