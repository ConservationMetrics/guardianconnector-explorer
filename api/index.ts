import express from 'express';

import setupDatabaseConnection from './utils/dbConnection';
import fetchData from './utils/dbOperations';
import { filterData, filterGeoData, filterDataByExtension, transformData } from './utils/dataProcessing';

interface EnvVars {
  VUE_APP_API_KEY: string;
  DATABASE: string;
  DB_HOST: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_PORT: string;
  DB_SSL: string;
  IS_SQLITE: string;
  SQLITE_DB_PATH: string;
  TABLE: string;
  UNWANTED_COLUMNS: string;
  UNWANTED_SUBSTRINGS: string;
  EMBED_MEDIA: string;
  MEDIA_BASE_PATH: string;
  MAPBOX_ACCESS_TOKEN: string;
  MAPBOX_STYLE: string;
  MAPBOX_PROJECTION: string;
  MAPBOX_CENTER_LATITUDE: string;
  MAPBOX_CENTER_LONGITUDE: string;
  MAPBOX_ZOOM: string;
  MAPBOX_PITCH: string;
  MAPBOX_BEARING: string;
}

const env = process.env as unknown as EnvVars;

// Remove quotations from all vars if they exist.
// This is important as the presence of quotation marks can lead to issues when trying to connect to the database or any other operation requiring these variables.
const API_KEY = env.VUE_APP_API_KEY ? env.VUE_APP_API_KEY.replace(/['"]+/g, '') : undefined;
const DATABASE = env.DATABASE ? env.DATABASE.replace(/['"]+/g, '') : undefined;
const DB_HOST= env.DB_HOST ? env.DB_HOST.replace(/['"]+/g, '') : undefined;
const DB_USER = env.DB_USER ? env.DB_USER.replace(/['"]+/g, '') : undefined;
const DB_PASSWORD = env.DB_PASSWORD ? env.DB_PASSWORD.replace(/['"]+/g, '') : undefined;
const DB_PORT = env.DB_PORT ? env.DB_PORT.replace(/['"]+/g, '') : '5432';
const DB_SSL = env.DB_SSL ? env.DB_SSL.replace(/['"]+/g, '') : "YES";
const IS_SQLITE = env.IS_SQLITE?.replace(/['"]+/g, '').toUpperCase() === 'YES' ? 'YES' : 'NO';
const SQLITE_DB_PATH = env.SQLITE_DB_PATH ? env.SQLITE_DB_PATH.replace(/['"]+/g, '') : undefined;
const TABLE = env.TABLE ? env.TABLE.replace(/['"]+/g, '') : undefined;
const UNWANTED_COLUMNS = env.UNWANTED_COLUMNS ? env.UNWANTED_COLUMNS.replace(/['"]+/g, '') : undefined;
const UNWANTED_SUBSTRINGS = env.UNWANTED_SUBSTRINGS ? env.UNWANTED_SUBSTRINGS.replace(/['"]+/g, '') : undefined;
const EMBED_MEDIA = env.EMBED_MEDIA.replace(/['"]+/g, '').toUpperCase() === 'YES' ? 'YES' : 'NO';
const MEDIA_BASE_PATH = env.MEDIA_BASE_PATH ? env.MEDIA_BASE_PATH.replace(/['"]+/g, '') : undefined;
const MAPBOX_ACCESS_TOKEN = env.MAPBOX_ACCESS_TOKEN ? env.MAPBOX_ACCESS_TOKEN.replace(/['"]+/g, '') : 'pk.ey';
const MAPBOX_STYLE = env.MAPBOX_STYLE ? env.MAPBOX_STYLE.replace(/['"]+/g, '') : 'mapbox://styles/mapbox/streets-v12';
const MAPBOX_PROJECTION = env.MAPBOX_PROJECTION ? env.MAPBOX_PROJECTION.replace(/['"]+/g, '') : 'globe';
const MAPBOX_CENTER_LATITUDE = env.MAPBOX_CENTER_LATITUDE ? env.MAPBOX_CENTER_LATITUDE.replace(/['"]+/g, '') : '-15';
const MAPBOX_CENTER_LONGITUDE = env.MAPBOX_CENTER_LONGITUDE ? env.MAPBOX_CENTER_LONGITUDE.replace(/['"]+/g, '') : '0';
const MAPBOX_ZOOM = env.MAPBOX_ZOOM ? env.MAPBOX_ZOOM.replace(/['"]+/g, '') : '2.5';
const MAPBOX_PITCH = env.MAPBOX_PITCH ? env.MAPBOX_PITCH.replace(/['"]+/g, '') : '0';
const MAPBOX_BEARING = env.MAPBOX_BEARING ? env.MAPBOX_BEARING.replace(/['"]+/g, '') : '0';

const app = express();

app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== API_KEY) {
    res.status(403).send('Forbidden');
    return;
  }
  next();
});

const db = setupDatabaseConnection(
  IS_SQLITE, 
  SQLITE_DB_PATH, 
  DATABASE, 
  DB_HOST, 
  DB_USER, 
  DB_PASSWORD, 
  DB_PORT, 
  DB_SSL
);

// Media extensions
const imageExtensions = ['jpg', 'jpeg', 'png', 'webp'];
const audioExtensions = ['mp3', 'ogg', 'wav'];
const videoExtensions = ['mov', 'mp4', 'avi', 'mkv'];
const allExtensions = [...imageExtensions, ...audioExtensions, ...videoExtensions];

// Endpoint for raw data
app.get('/data', async (req: express.Request, res: express.Response) => {  try {
    // Fetch data
    const { mainData, columnsData } = await fetchData(db, TABLE, IS_SQLITE);

    res.json({ data: mainData, columns: columnsData });

  } catch (error:any) {
    console.error('Error fetching data on API side:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint for the map view
app.get('/map', async (req: express.Request, res: express.Response) => {  try {
    // Fetch data
    const { mainData, columnsData } = await fetchData(db, TABLE, IS_SQLITE);
    // Filter data
    const filteredData = filterData(mainData, columnsData, UNWANTED_COLUMNS, UNWANTED_SUBSTRINGS); 
    // Filter only data with valid geofields
    const filteredGeoData = filterGeoData(filteredData); 
        // Transform data
    const transformedData = transformData(filteredGeoData)

    res.json({ data: transformedData, imageExtensions: imageExtensions, audioExtensions: audioExtensions, videoExtensions: videoExtensions, embedMedia: EMBED_MEDIA, mediaBasePath: MEDIA_BASE_PATH, mapboxAccessToken: MAPBOX_ACCESS_TOKEN, mapboxStyle: MAPBOX_STYLE, mapboxProjection: MAPBOX_PROJECTION, mapboxLatitude: MAPBOX_CENTER_LATITUDE, mapboxLongitude: MAPBOX_CENTER_LONGITUDE, mapboxZoom: MAPBOX_ZOOM, mapboxPitch: MAPBOX_PITCH, mapboxBearing: MAPBOX_BEARING });
    
  } catch (error:any) {
    console.error('Error fetching data on API side:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint for the gallery view
app.get('/gallery', async (req: express.Request, res: express.Response) => {  try {
    // Fetch data
    const { mainData, columnsData } = await fetchData(db, TABLE, IS_SQLITE);
    // Filter data
    const filteredData = filterData(mainData, columnsData, UNWANTED_COLUMNS, UNWANTED_SUBSTRINGS); 
    // Filter only data with media attachments
    const dataWithFilesOnly = filterDataByExtension(filteredData, allExtensions);
    // Transform data
    const transformedData = transformData(dataWithFilesOnly)

    res.json({ data: transformedData, imageExtensions: imageExtensions, audioExtensions: audioExtensions, videoExtensions: videoExtensions, embedMedia: EMBED_MEDIA, mediaBasePath: MEDIA_BASE_PATH });

  } catch (error:any) {
    console.error('Error fetching data on API side:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default {
  path: '/api',
  handler: app
};
