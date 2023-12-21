import express from 'express';
import { NextFunction } from 'express';

import jwt from 'jsonwebtoken';

import setupDatabaseConnection from './utils/dbConnection';
import fetchData from './utils/dbOperations';
import { filterData, filterGeoData, filterDataByExtension, transformData, processGeoData, prepareChangeDetectionData, transformToGeojson } from './utils/dataProcessing';

interface EnvVars {
  DATABASE: string;
  DB_HOST: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_PORT: string;
  DB_SSL: string;
  IS_SQLITE: string;
  MAPBOX_ACCESS_TOKEN: string;
  NUXT_ENV_AUTH_STRATEGY: string;
  NUXT_ENV_VIEWS_CONFIG: string;
  SQLITE_DB_PATH: string;
  PORT: string,
  PASSWORD: string;
  SECRET_JWT_KEY: string;
  VUE_APP_API_KEY: string;
}

interface ViewConfig {
  VIEWS: string;
  EMBED_MEDIA: string;
  MEDIA_BASE_PATH: string;
  FRONT_END_FILTERING: string;
  FRONT_END_FILTER_FIELD: string;
  MAPBOX_STYLE: string;
  MAPBOX_PROJECTION: string;
  MAPBOX_CENTER_LATITUDE: string;
  MAPBOX_CENTER_LONGITUDE: string;
  MAPBOX_ZOOM: string;
  MAPBOX_PITCH: string;
  MAPBOX_BEARING: string;
  MAPBOX_3D: string;
  LINK_TO_GCCD_RESOURCES: string;
  UNWANTED_COLUMNS?: string;
  UNWANTED_SUBSTRINGS?: string;
}

interface Views {
  [key: string]: ViewConfig;
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

const AUTH_STRATEGY = getEnvVar('NUXT_ENV_AUTH_STRATEGY', 'none');
const DATABASE = getEnvVar('DATABASE');
const DB_HOST = getEnvVar('DB_HOST');
const DB_USER = getEnvVar('DB_USER');
const DB_PASSWORD = getEnvVar('DB_PASSWORD');
const DB_PORT = getEnvVar('DB_PORT', '5432') as string;
const DB_SSL = getEnvVar('DB_SSL', 'YES') as string;
const IS_SQLITE = getEnvVar('IS_SQLITE', 'NO', val => val.toUpperCase() === 'YES' ? 'YES' : 'NO') as string;
const SQLITE_DB_PATH = getEnvVar('SQLITE_DB_PATH');
const PASSWORD = getEnvVar('PASSWORD');
const MAPBOX_ACCESS_TOKEN = getEnvVar('MAPBOX_ACCESS_TOKEN', 'pk.ey') as string;
const SECRET_JWT_KEY = getEnvVar('SECRET_JWT_KEY', 'secret-jwt-key') as string;
const API_KEY = getEnvVar('VUE_APP_API_KEY');
const VIEWS_CONFIG = process.env.NUXT_ENV_VIEWS_CONFIG;

const app = express();

app.use(express.json());

// Middleware for checking the auth strategy and JWT token
const checkAuthStrategy = (req: express.Request, res: express.Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== API_KEY) {
    res.status(403).send('Forbidden');
    return;
  }

  // const authStrategy = req.headers['x-auth-strategy'];

  // Only check for the JWT token if the authentication strategy is 'local'
  if (AUTH_STRATEGY === 'password') {
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
    return;
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
app.use(checkAuthStrategy);

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
if (!VIEWS_CONFIG) {
  throw new Error('The NUXT_ENV_VIEWS_CONFIG environment variable is not defined or is empty.');
} else {
  let VIEWS: Views;
  try {
    // Remove single quotes from stringified JSON
    VIEWS = JSON.parse(VIEWS_CONFIG.replace(/'/g, ''));
  } catch (error: any) {
    throw new Error('Error parsing NUXT_ENV_VIEWS_CONFIG: ' + error.message);
  }
  
  const tableNames = Object.keys(VIEWS);

  // Media extensions
  const imageExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  const audioExtensions = ['mp3', 'ogg', 'wav'];
  const videoExtensions = ['mov', 'mp4', 'avi', 'mkv'];
  const allExtensions = [...imageExtensions, ...audioExtensions, ...videoExtensions];

  tableNames.forEach((table) => {

    // Check if VIEWS[table].VIEWS is not set
    if (!VIEWS[table].VIEWS) {
      console.log(`Views not defined for ${table}, skipping...`);
      return;
    }
    
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

    if (VIEWS[table].VIEWS.includes("map")) {
      // Endpoint for the map view
      app.get(`/${table}/map`, async (req: express.Request, res: express.Response) => {  try {
          // Fetch data
          const { mainData, columnsData } = await fetchData(db, table, IS_SQLITE);
          // Filter data
          const filteredData = filterData(mainData, columnsData, VIEWS[table].UNWANTED_COLUMNS, VIEWS[table].UNWANTED_SUBSTRINGS); 
          // Filter only data with valid geofields
          const filteredGeoData = filterGeoData(filteredData); 
          // Transform data
          const transformedData = transformData(filteredGeoData);
          // Process geodata
          const processedGeoData = processGeoData(transformedData, VIEWS[table].FRONT_END_FILTER_FIELD);

          const response = {
            data: processedGeoData, 
            table: table,
            filterData: VIEWS[table].FRONT_END_FILTERING === "YES",
            filterField: VIEWS[table].FRONT_END_FILTER_FIELD,
            imageExtensions: imageExtensions, 
            audioExtensions: audioExtensions, 
            videoExtensions: videoExtensions, 
            embedMedia: VIEWS[table].EMBED_MEDIA === "YES",
            mediaBasePath: VIEWS[table].MEDIA_BASE_PATH, 
            mapboxAccessToken: MAPBOX_ACCESS_TOKEN, 
            mapboxStyle: VIEWS[table].MAPBOX_STYLE, 
            mapboxProjection: VIEWS[table].MAPBOX_PROJECTION, 
            mapboxLatitude: VIEWS[table].MAPBOX_CENTER_LATITUDE, 
            mapboxLongitude: VIEWS[table].MAPBOX_CENTER_LONGITUDE, 
            mapboxZoom: VIEWS[table].MAPBOX_ZOOM, 
            mapboxPitch: VIEWS[table].MAPBOX_PITCH, 
            mapboxBearing: VIEWS[table].MAPBOX_BEARING,
            mapbox3d: VIEWS[table].MAPBOX_3D === "YES"
          };

          res.json(response);

        } catch (error:any) {
          console.error('Error fetching data on API side:', error.message);
          res.status(500).json({ error: error.message });
        }
      });
    }

    if (VIEWS[table].VIEWS.includes("alerts")) {
      // Endpoint for the gallery view
      app.get(`/${table}/alerts`, async (req: express.Request, res: express.Response) => {  try {
          // Fetch data
          const { mainData, columnsData } = await fetchData(db, table, IS_SQLITE);

          // Prepare change detection data for the alerts view
          const changeDetectionData = prepareChangeDetectionData(mainData, VIEWS[table].EMBED_MEDIA === "YES", VIEWS[table].LINK_TO_GCCD_RESOURCES === "YES");
          
          // Convert data to GeoJSON format
          const geojsonData = transformToGeojson(changeDetectionData);

          const response = {
            data: geojsonData, 
            table: table,
            embedMedia: VIEWS[table].EMBED_MEDIA === "YES",
            imageExtensions: imageExtensions, 
            mediaBasePath: VIEWS[table].MEDIA_BASE_PATH,
            mapboxAccessToken: MAPBOX_ACCESS_TOKEN, 
            mapboxStyle: VIEWS[table].MAPBOX_STYLE, 
            mapboxProjection: VIEWS[table].MAPBOX_PROJECTION, 
            mapboxLatitude: VIEWS[table].MAPBOX_CENTER_LATITUDE, 
            mapboxLongitude: VIEWS[table].MAPBOX_CENTER_LONGITUDE, 
            mapboxZoom: VIEWS[table].MAPBOX_ZOOM, 
            mapboxPitch: VIEWS[table].MAPBOX_PITCH, 
            mapboxBearing: VIEWS[table].MAPBOX_BEARING,
            mapbox3d: VIEWS[table].MAPBOX_3D === "YES"
          };

          res.json(response);
          
        } catch (error:any) {
          console.error('Error fetching data on API side:', error.message);
          res.status(500).json({ error: error.message });
        }
      });
    }

    if (VIEWS[table].VIEWS.includes("gallery")) {
      // Endpoint for the gallery view
      app.get(`/${table}/gallery`, async (req: express.Request, res: express.Response) => {  try {
          // Fetch data
          const { mainData, columnsData } = await fetchData(db, table, IS_SQLITE);
          // Filter data
          const filteredData = filterData(mainData, columnsData, VIEWS[table].UNWANTED_COLUMNS, VIEWS[table].UNWANTED_SUBSTRINGS); 
          // Filter only data with media attachments
          const dataWithFilesOnly = filterDataByExtension(filteredData, allExtensions);
          // Transform data
          const transformedData = transformData(dataWithFilesOnly)

          const response = {
            data: transformedData, 
            table: table,
            filterData: VIEWS[table].FRONT_END_FILTERING === "YES",
            filterField: VIEWS[table].FRONT_END_FILTER_FIELD,
            imageExtensions: imageExtensions, 
            audioExtensions: audioExtensions, 
            videoExtensions: videoExtensions, 
            embedMedia: VIEWS[table].EMBED_MEDIA === "YES",
            mediaBasePath: VIEWS[table].MEDIA_BASE_PATH
          };

          res.json(response);
          
        } catch (error:any) {
          console.error('Error fetching data on API side:', error.message);
          res.status(500).json({ error: error.message });
        }
      });
    }

  });
}

export default {
  path: '/api',
  handler: app
};
