require('dotenv').config();

const express = require('express');
const path = require('path');

const setupDatabaseConnection = require('./utils/dbConnection');

const app = express();
const PORT = process.env.PORT || 3000;

const db = setupDatabaseConnection();

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set up map view
app.get('/', (req, res) => {
  const mapboxAccessToken = process.env.MAPBOX_ACCESS_TOKEN;
  const mapboxStyle = process.env.MAPBOX_STYLE;
  const mapboxProjection = process.env.MAPBOX_PROJECTION;
  const mapboxCenterLatitude = process.env.MAPBOX_CENTER_LATITUDE;
  const mapboxCenterLongitude = process.env.MAPBOX_CENTER_LONGITUDE;
  const mapboxZoom = process.env.MAPBOX_ZOOM;
  const mapboxPitch = process.env.MAPBOX_PITCH;
  const mapboxBearing = process.env.MAPBOX_BEARING;
  const embedMedia = process.env.EMBED_MEDIA;
  const mediaPath = process.env.MEDIA_PATH;
  const unwantedColumns = process.env.UNWANTED_COLUMNS;
  const unwantedSubstrings = process.env.UNWANTED_SUBSTRINGS;

  res.render('index', { mapboxAccessToken, mapboxStyle, mapboxProjection, mapboxCenterLatitude, mapboxCenterLongitude, mapboxZoom, mapboxPitch, mapboxBearing, embedMedia, mediaPath, unwantedColumns, unwantedSubstrings });
});

// Get data from db source
app.get('/data', async (req, res) => {
  try {
    let query;
    let queryArgs = []; // Query arguments (if needed)
    
    const handleResults = (data, columns) => {
      res.json({ data, columns });
    };

    const fetchDataFromTable = (table, callback) => {
      if (process.env.SQLITE === "YES") {
        // SQLite configuration
        query = `SELECT * FROM ${table}`;
        db.all(query, queryArgs, (err, rows) => {
          if (err) {
            console.error('Error fetching data from table:', table, err.message);
            callback(err, null);
            return;
          }

          // Remove the first row if it's considered headers
          if (rows.length > 0 && Object.keys(rows[0]).some(key => isNaN(key))) {
            rows.shift();
          }
          callback(null, rows);
        });
      } else {
        // PostgreSQL configuration
        query = `SELECT * FROM ${table}`;
        db.query(query, queryArgs, (err, result) => {
          if (err) {
            console.error('Error fetching data from table:', table, err);
            callback(err, null);
            return;
          }
          callback(null, result.rows);
        });
      }
    };

    // Function to ensure a table exists before downloading data
    const checkTableExists = (table, callback) => {
      if (process.env.SQLITE === "YES") {
        //SQLite configuration
        query = `SELECT name FROM sqlite_master WHERE type='table' AND name='${table}'`;
        db.all(query, [], (err, rows) => {
          if (err) {
            callback(err, false);
            return;
          }
          callback(null, rows.length > 0);
        });
      } else {
        // PostgreSQL configuration
        query = `SELECT to_regclass('${table}')`;
        db.query(query, [], (err, result) => {
          if (err) {
            callback(err, false);
            return;
          }
          callback(null, result.rows[0].to_regclass !== null);
        });
      }
    };

    // Check if __columns table exists
    checkTableExists(`${process.env.TABLE}__columns`, (errCheck, exists) => {
      if (errCheck) {
        res.status(500).json({ error: 'Error checking columns table existence' });
        return;
      }

      // Fetch main table data
      fetchDataFromTable(process.env.TABLE, (errData, dataResult) => {
        if (errData) {
          res.status(500).json({ error: 'Error fetching main data' });
          return;
        }

        if (exists) {
          // Fetch columns table data if it exists
          fetchDataFromTable(`${process.env.TABLE}__columns`, (errColumns, columnsResult) => {
            if (errColumns) {
              res.status(500).json({ error: 'Error fetching columns data' });
              return;
            }

            handleResults(dataResult, columnsResult);
          });
        } else {
          // If columns table does not exist, send only the main table data
          handleResults(dataResult, null);
        }
      });
    });

  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
});

app.listen(PORT, () => {
  console.log(`The GuardianConnector map is running on port ${PORT}`);
});