import express from 'express';
import { NextFunction } from 'express';

import jwt from 'jsonwebtoken';

import setupDatabaseConnection from './utils/dbConnection';
import fetchData from './utils/dbOperations';
import { filterData, filterGeoData, filterDataByExtension, transformData, processGeoData } from './utils/dataProcessing';

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
  NUXT_ENV_TABLES: string;
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
  MAPBOX_3D: string;
  USE_PASSWORD: string;
  PASSWORD: string;
  SECRET_JWT_KEY: string;
  FRONT_END_FILTERING: string;
  FRONT_END_FILTER_FIELD: string;
}

const env = process.env as unknown as EnvVars;

// Remove quotations from all vars if they exist.
// This is important as the presence of quotation marks can lead to issues when trying to connect to the database or any other operation requiring these variables.
// Replace with default values in some cases.
const getEnvVar = (key: keyof EnvVars, defaultValue?: string, transform?: (val: string) => any) => {
  const value = env[key];
  let result = value !== undefined ? value.replace(/['"]+/g, '') : defaultValue;
  if (transform && result) {
    result = transform(result);
  }
  return result;
};

const API_KEY = getEnvVar('VUE_APP_API_KEY');
const DATABASE = getEnvVar('DATABASE');
const DB_HOST = getEnvVar('DB_HOST');
const DB_USER = getEnvVar('DB_USER');
const DB_PASSWORD = getEnvVar('DB_PASSWORD');
const DB_PORT = getEnvVar('DB_PORT', '5432') as string;
const DB_SSL = getEnvVar('DB_SSL', 'YES') as string;
const IS_SQLITE = getEnvVar('IS_SQLITE', 'NO', val => val.toUpperCase() === 'YES' ? 'YES' : 'NO') as string;
const SQLITE_DB_PATH = getEnvVar('SQLITE_DB_PATH');
const TABLES = getEnvVar('NUXT_ENV_TABLES');
const UNWANTED_COLUMNS = getEnvVar('UNWANTED_COLUMNS');
const UNWANTED_SUBSTRINGS = getEnvVar('UNWANTED_SUBSTRINGS');
const FRONT_END_FILTERING = getEnvVar('FRONT_END_FILTERING', 'NO') as string;
const FRONT_END_FILTER_FIELD = getEnvVar('FRONT_END_FILTER_FIELD');
const EMBED_MEDIA = getEnvVar('EMBED_MEDIA', 'NO', val => val.toUpperCase() === 'YES' ? 'YES' : 'NO') as string;
const USE_PASSWORD = getEnvVar('USE_PASSWORD', 'NO');
const PASSWORD = getEnvVar('PASSWORD');
const MEDIA_BASE_PATH = getEnvVar('MEDIA_BASE_PATH');
const MAPBOX_ACCESS_TOKEN = getEnvVar('MAPBOX_ACCESS_TOKEN', 'pk.ey') as string;
const MAPBOX_STYLE = getEnvVar('MAPBOX_STYLE', 'mapbox://styles/mapbox/streets-v12') as string;
const MAPBOX_PROJECTION = getEnvVar('MAPBOX_PROJECTION', 'globe') as string;
const MAPBOX_CENTER_LATITUDE = getEnvVar('MAPBOX_CENTER_LATITUDE', '-15') as string;
const MAPBOX_CENTER_LONGITUDE = getEnvVar('MAPBOX_CENTER_LONGITUDE', '0') as string;
const MAPBOX_ZOOM = getEnvVar('MAPBOX_ZOOM', '2.5') as string;
const MAPBOX_PITCH = getEnvVar('MAPBOX_PITCH', '0') as string;
const MAPBOX_BEARING = getEnvVar('MAPBOX_BEARING', '0') as string;
const MAPBOX_3D = getEnvVar('MAPBOX_3D', 'NO', val => val.toUpperCase() === 'YES' ? 'YES' : 'NO') as string;
const SECRET_JWT_KEY = getEnvVar('SECRET_JWT_KEY', 'secret-jwt-key') as string;

const app = express();

app.use(express.json());

// Middleware for checking the JWT in each request
const checkApiAndJwt = (req: express.Request, res: express.Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== API_KEY) {
    res.status(403).send('Forbidden');
    return;
  }
  
  if (USE_PASSWORD === 'NO') {
    next();
    return;
  }

  const authStrategy = req.headers['x-auth-strategy'];

  // Only check for the JWT token if the authentication strategy is 'local'
  if (authStrategy === 'local') {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
      res.status(401).send('Unauthorized');
      return;
    }

    jwt.verify(token, SECRET_JWT_KEY, (err) => {
      if (err) {
        res.status(403).send('Forbidden');
        return;
      }

      next();
    });
  } else {
    next();
  }
};

// Endpoints for login
app.get('/login', (req: express.Request, res: express.Response) => {
  const secret_key = req.query.secret_key;

  if (secret_key !== SECRET_JWT_KEY) {
    res.status(403).send('Forbidden');
    return;
  }
  // If authentication is successful, generate and return a JWT
  const token = jwt.sign({}, SECRET_JWT_KEY);
  res.status(200).json({ token: token });
});

app.post('/login', (req: express.Request, res: express.Response) => {
  const providedPassword = req.body.password;

  if (providedPassword !== PASSWORD) {
    res.status(403).send('Forbidden');
    return;
  }
  // If authentication is successful, generate and return a JWT
  const token = jwt.sign({}, SECRET_JWT_KEY);
  res.status(200).json({ token: token });
});

// Apply middleware to Views routes
app.use(checkApiAndJwt);


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

// If TABLES is undefined or empty, throw an error before proceeding
if (!TABLES) {
  throw new Error('The TABLES environment variable is not defined or is empty.');
} else {
  const tableNames = TABLES.split(','); 

  // Media extensions
  const imageExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  const audioExtensions = ['mp3', 'ogg', 'wav'];
  const videoExtensions = ['mov', 'mp4', 'avi', 'mkv'];
  const allExtensions = [...imageExtensions, ...audioExtensions, ...videoExtensions];

  tableNames.forEach((table) => {
    console.log(`Setting up API and views for database table: ${table}`);

    // Endpoint for raw data
    app.get(`/${table}/data`, async (req: express.Request, res: express.Response) => {  try {
        // Fetch data
        const { mainData, columnsData } = await fetchData(db, table, IS_SQLITE);

        res.json({ data: mainData, columns: columnsData });

      } catch (error:any) {
        console.error('Error fetching data on API side:', error.message);
        res.status(500).json({ error: error.message });
      }
    });

    // Endpoint for the map view
    app.get(`/${table}/map`, async (req: express.Request, res: express.Response) => {  try {
        // Fetch data
        const { mainData, columnsData } = await fetchData(db, table, IS_SQLITE);
        // Filter data
        const filteredData = filterData(mainData, columnsData, UNWANTED_COLUMNS, UNWANTED_SUBSTRINGS); 
        // Filter only data with valid geofields
        const filteredGeoData = filterGeoData(filteredData); 
        // Transform data
        const transformedData = transformData(filteredGeoData);
        // Process geodata
        const processedGeoData = processGeoData(transformedData, FRONT_END_FILTER_FIELD);

        const response = {
          data: processedGeoData, 
          table: table,
          filterData: FRONT_END_FILTERING === "YES",
          filterField: FRONT_END_FILTER_FIELD,
          imageExtensions: imageExtensions, 
          audioExtensions: audioExtensions, 
          videoExtensions: videoExtensions, 
          embedMedia: EMBED_MEDIA === "YES",
          mediaBasePath: MEDIA_BASE_PATH, 
          mapboxAccessToken: MAPBOX_ACCESS_TOKEN, 
          mapboxStyle: MAPBOX_STYLE, 
          mapboxProjection: MAPBOX_PROJECTION, 
          mapboxLatitude: MAPBOX_CENTER_LATITUDE, 
          mapboxLongitude: MAPBOX_CENTER_LONGITUDE, 
          mapboxZoom: MAPBOX_ZOOM, 
          mapboxPitch: MAPBOX_PITCH, 
          mapboxBearing: MAPBOX_BEARING,
          mapbox3d: MAPBOX_3D === "YES"
        };

        res.json(response);

      } catch (error:any) {
        console.error('Error fetching data on API side:', error.message);
        res.status(500).json({ error: error.message });
      }
    });

    // Endpoint for the gallery view
    app.get(`/${table}/gallery`, async (req: express.Request, res: express.Response) => {  try {
        // Fetch data
        const { mainData, columnsData } = await fetchData(db, table, IS_SQLITE);
        // Filter data
        const filteredData = filterData(mainData, columnsData, UNWANTED_COLUMNS, UNWANTED_SUBSTRINGS); 
        // Filter only data with media attachments
        const dataWithFilesOnly = filterDataByExtension(filteredData, allExtensions);
        // Transform data
        const transformedData = transformData(dataWithFilesOnly)

        const response = {
          data: transformedData, 
          table: table,
          filterData: FRONT_END_FILTERING === "YES",
          filterField: FRONT_END_FILTER_FIELD,
          imageExtensions: imageExtensions, 
          audioExtensions: audioExtensions, 
          videoExtensions: videoExtensions, 
          embedMedia: EMBED_MEDIA === "YES",
          mediaBasePath: MEDIA_BASE_PATH
        };

        res.json(response);
        
      } catch (error:any) {
        console.error('Error fetching data on API side:', error.message);
        res.status(500).json({ error: error.message });
      }
    });
  });
}

export default {
  path: '/api',
  handler: app
};
