import express from 'express';

import setupDatabaseConnection from './utils/dbConnection';
import fetchData from './utils/dbOperations';
import { filterData, filterGeoData, filterDataByExtension, transformData } from './utils/dataProcessing';

const app = express();
const db = setupDatabaseConnection();

const table = process.env.TABLE!;
const isSQLite = process.env.SQLITE!;
const unwantedColumns = process.env.UNWANTED_COLUMNS!;
const unwantedSubstrings = process.env.UNWANTED_SUBSTRINGS!;

// Media extensions
const imageExtensions = ['jpg', 'jpeg', 'png', 'webp'];
const audioExtensions = ['mp3', 'ogg', 'wav'];
const videoExtensions = ['mov', 'mp4', 'avi', 'mkv'];
const allExtensions = [...imageExtensions, ...audioExtensions, ...videoExtensions];

// Endpoint for raw data
app.get('/data', async (req: express.Request, res: express.Response) => {  try {
    // Fetch data
    const { mainData, columnsData } = await fetchData(db, table, isSQLite);

    res.json({ data: mainData, columns: columnsData });

  } catch (error) {
    console.error('Error fetching data on API side:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint for the map view
app.get('/map', async (req: express.Request, res: express.Response) => {  try {
    // Fetch data
    const { mainData, columnsData } = await fetchData(db, table, isSQLite);
    // Filter data
    const filteredData = filterData(mainData, columnsData, unwantedColumns, unwantedSubstrings); 
    // Filter only data with valid geofields
    const filteredGeoData = filterGeoData(filteredData); 
        // Transform data
    const transformedData = transformData(filteredGeoData)

    res.json({ data: transformedData, imageExtensions: imageExtensions, audioExtensions: audioExtensions, videoExtensions: videoExtensions });

  } catch (error) {
    console.error('Error fetching data on API side:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint for the gallery view
app.get('/gallery', async (req: express.Request, res: express.Response) => {  try {
    // Fetch data
    const { mainData, columnsData } = await fetchData(db, table, isSQLite);
    // Filter data
    const filteredData = filterData(mainData, columnsData, unwantedColumns, unwantedSubstrings); 
    // Filter only data with media attachments
    const dataWithFilesOnly = filterDataByExtension(filteredData, allExtensions);
    // Transform data
    const transformedData = transformData(dataWithFilesOnly)

    res.json({ data: transformedData, imageExtensions: imageExtensions, audioExtensions: audioExtensions, videoExtensions: videoExtensions });

  } catch (error) {
    console.error('Error fetching data on API side:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default {
  path: '/api',
  handler: app
};
