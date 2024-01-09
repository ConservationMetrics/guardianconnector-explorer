import express from 'express';

import setupDatabaseConnection from './database/dbConnection';
import fetchData from './database/dbOperations';
import { filterUnwantedKeys, filterGeoData, filterDataByExtension } from './dataProcessing/filterData';
import { transformSurveyData, prepareMapData, prepareAlertData, prepareAlertStatistics, transformToGeojson } from './dataProcessing/transformData';
import { checkAuthStrategy } from './middleware';
import { getLogin, postLogin } from './loginController';

import { DATABASE, DB_HOST, DB_USER, DB_PASSWORD, DB_PORT, DB_SSL, IS_SQLITE, SQLITE_DB_PATH, MAPBOX_ACCESS_TOKEN, VIEWS_CONFIG, Views } from './config';

const app = express();

app.use(express.json());

app.get('/login', getLogin);
app.post('/login', postLogin);

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
    app.get(`/${table}/data`, async (res: express.Response) => {  try {
        // Fetch data
        const { mainData, columnsData } = await fetchData(db, table, IS_SQLITE);

        res.json({ data: mainData, columns: columnsData });

      } catch (error:any) {
        console.error('Error fetching data on API side:', error.message);
        res.status(500).json({ error: error.message });
      }
    });

    // Endpoint for the map view
    if (VIEWS[table].VIEWS.includes("map")) {
      app.get(`/${table}/map`, async (_req: express.Request, res: express.Response) => {  try {
          // Fetch data
          const { mainData, columnsData } = await fetchData(db, table, IS_SQLITE);
          // Filter data to remove unwanted columns and substrings
          const filteredData = filterUnwantedKeys(mainData, columnsData, VIEWS[table].UNWANTED_COLUMNS, VIEWS[table].UNWANTED_SUBSTRINGS); 
          // Filter only data with valid geofields
          const filteredGeoData = filterGeoData(filteredData); 
          // Transform data that was collected using survey apps (e.g. KoBoToolbox, Mapeo)
          const transformedData = transformSurveyData(filteredGeoData);
          // Process geodata
          const processedGeoData = prepareMapData(transformedData, VIEWS[table].FRONT_END_FILTER_FIELD);

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
            mapbox3d: VIEWS[table].MAPBOX_3D === "YES",
            mapLegendLayerIds: VIEWS[table].MAP_LEGEND_LAYER_IDS
          };

          res.json(response);

        } catch (error:any) {
          console.error('Error fetching data on API side:', error.message);
          res.status(500).json({ error: error.message });
        }
      });
    }
    
    // Endpoint for the alert dashboard view
    if (VIEWS[table].VIEWS.includes("alerts")) {
      app.get(`/${table}/alerts`, async (_req: express.Request, res: express.Response) => {  try {
          // Fetch data
          const { mainData } = await fetchData(db, table, IS_SQLITE);

          // Prepare alerts data for the alerts view
          const changeDetectionData = prepareAlertData(mainData, VIEWS[table].EMBED_MEDIA === "YES", VIEWS[table].LINK_TO_GCCD_RESOURCES === "YES");
          
          // Prepare statistics data for the alerts view
          const statistics = prepareAlertStatistics(mainData);

          // Convert alert data to GeoJSON format
          const geojsonData = {
            mostRecentAlerts: transformToGeojson(changeDetectionData.mostRecentAlerts), 
            otherAlerts: transformToGeojson(changeDetectionData.otherAlerts)
          };

          const response = {
            data: geojsonData, 
            statistics: statistics,
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
            mapbox3d: VIEWS[table].MAPBOX_3D === "YES",
            mapLegendLayerIds: VIEWS[table].MAP_LEGEND_LAYER_IDS
          };

          res.json(response);
          
        } catch (error:any) {
          console.error('Error fetching data on API side:', error.message);
          res.status(500).json({ error: error.message });
        }
      });
    }

    // Endpoint for the gallery view
    if (VIEWS[table].VIEWS.includes("gallery")) {
      app.get(`/${table}/gallery`, async (_req: express.Request, res: express.Response) => {  try {
          // Fetch data
          const { mainData, columnsData } = await fetchData(db, table, IS_SQLITE);
          // Filter data to remove unwanted columns and substrings
          const filteredData = filterUnwantedKeys(mainData, columnsData, VIEWS[table].UNWANTED_COLUMNS, VIEWS[table].UNWANTED_SUBSTRINGS); 
          // Filter only data with media attachments
          const dataWithFilesOnly = filterDataByExtension(filteredData, allExtensions);
          // Transform data that was collected using survey apps (e.g. KoBoToolbox, Mapeo)
          const transformedData = transformSurveyData(dataWithFilesOnly)

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
