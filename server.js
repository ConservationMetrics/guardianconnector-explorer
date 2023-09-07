require('dotenv').config();

const express = require('express');
const path = require('path');

const setupDatabaseConnection = require('./utils/dbConnection');
const { fetchDataFromTable, checkTableExists } = require('./utils/dbOperations');
const fetchDataAndFilter = require('./utils/dataProcessing');

const app = express();
const PORT = process.env.PORT || 3000;

const db = setupDatabaseConnection();

// Get data from db source
app.get('/data', async (req, res) => {
  try {
    const table = process.env.TABLE;
    const isSQLite = process.env.SQLITE === "YES";

    const mainDataExists = await checkTableExists(db, table, isSQLite);
    if (!mainDataExists) {
      throw new Error("Main table does not exist");
    }

    const mainData = await fetchDataFromTable(db, table, isSQLite);
    
    const columnsTableExists = await checkTableExists(db, `${table}__columns`, isSQLite);
    let columnsData = null;
    if (columnsTableExists) {
      columnsData = await fetchDataFromTable(db, `${table}__columns`, isSQLite);
    }

    res.json({ data: mainData, columns: columnsData });
    
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Set up middleware to fetch data from db source
app.use(async (req, res, next) => {
  try {
      req.filteredData = await fetchDataAndFilter(
        process.env.UNWANTED_COLUMNS, 
        process.env.UNWANTED_SUBSTRINGS
      );
      next();
  } catch (error) {
      next(error);
  }
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/dist', express.static(path.join(__dirname, 'dist')));

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

  const { data, filteredSqlColumns } = req.filteredData;

  res.render('index', { data: JSON.stringify(data), filteredSqlColumns: JSON.stringify(Array.from(filteredSqlColumns)), mapboxAccessToken, mapboxStyle, mapboxProjection, mapboxCenterLatitude, mapboxCenterLongitude, mapboxZoom, mapboxPitch, mapboxBearing, embedMedia, mediaPath });
});

// Set up gallery view
app.get('/gallery', (req, res) => {
  const embedMedia = process.env.EMBED_MEDIA;
  const mediaPath = process.env.MEDIA_PATH;
  
  const { data, filteredSqlColumns } = req.filteredData;

  // Render the gallery view and pass the environment variables
  res.render('gallery', { data: JSON.stringify(data), filteredSqlColumns: JSON.stringify(Array.from(filteredSqlColumns)), embedMedia, mediaPath });
});

app.listen(PORT, () => {
  console.log(`GuardianConnector Views is running on port ${PORT}`);
});