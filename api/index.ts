import express from "express";

import {
  setupDatabaseConnection,
  createDatabaseIfNotExists,
} from "./database/dbConnection";
import {
  fetchData,
  fetchConfig,
  updateConfig,
  removeTableFromConfig,
} from "./database/dbOperations";
import {
  filterUnwantedKeys,
  filterOutUnwantedValues,
  filterGeoData,
  filterDataByExtension,
} from "./dataProcessing/filterData";
import {
  transformSurveyData,
  prepareMapData,
  prepareAlertData,
  prepareAlertStatistics,
  transformToGeojson,
} from "./dataProcessing/transformData";
import { checkAuthStrategy } from "./middleware";
import { getLogin, postLogin } from "./loginController";

import {
  DATABASE,
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_PORT,
  DB_SSL,
  IS_SQLITE,
  SQLITE_DB_PATH,
} from "./config";

let configDb: any;
let db: any;

const app = express();

app.use(express.json());

app.get("/login", getLogin);
app.post("/login", postLogin);

// Apply middleware to views routes
app.use(checkAuthStrategy);

let viewsConfig: any = {};

// Fetch views config
const getViewsConfig = async () => {
  viewsConfig = await fetchConfig(configDb, IS_SQLITE);
  return viewsConfig;
};

// Initialize views using config
const initializeViewsConfig = async () => {
  // Define allowed file extensions
  const imageExtensions = ["jpg", "jpeg", "png", "webp"];
  const audioExtensions = ["mp3", "ogg", "wav"];
  const videoExtensions = ["mov", "mp4", "avi", "mkv"];
  const allExtensions = [
    ...imageExtensions,
    ...audioExtensions,
    ...videoExtensions,
  ];

  await getViewsConfig();

  const tableNames = Object.keys(viewsConfig);

  tableNames.forEach((table) => {
    // Check if viewsConfig[table].viewsConfig is not set
    if (!viewsConfig[table].VIEWS) {
      console.log(`viewsConfig not defined for ${table}, skipping...`);
      return;
    }

    console.log(`Setting up API and views for database table: ${table}`);

    // Endpoint for raw data
    app.get(`/${table}/data`, async (res: express.Response) => {
      try {
        // Fetch data
        const { mainData, columnsData } = await fetchData(db, table, IS_SQLITE);

        res.json({ data: mainData, columns: columnsData });
      } catch (error: any) {
        console.error("Error fetching data on API side:", error.message);
        res.status(500).json({ error: error.message });
      }
    });

    // Endpoint for the alert dashboard view
    if (viewsConfig[table].VIEWS.includes("alerts")) {
      app.get(
        `/${table}/alerts`,
        async (_req: express.Request, res: express.Response) => {
          try {
            // Fetch the latest viewsConfig
            const viewsConfig = await getViewsConfig();
            // Fetch data
            const { mainData, metadata } = await fetchData(
              db,
              table,
              IS_SQLITE,
            );

            // Prepare alerts data for the alerts view
            const changeDetectionData = prepareAlertData(mainData);

            const mapeoTable = viewsConfig[table].MAPEO_TABLE;
            const mapeoCategoryIds = viewsConfig[table].MAPEO_CATEGORY_IDS;

            let mapeoData = null;

            if (mapeoTable && mapeoCategoryIds) {
              // Fetch Mapeo data
              const rawMapeoData = await fetchData(db, mapeoTable, IS_SQLITE);

              // Filter data to remove unwanted columns and substrings
              const filteredMapeoData = filterUnwantedKeys(
                rawMapeoData.mainData,
                rawMapeoData.columnsData,
                viewsConfig[table].UNWANTED_COLUMNS,
                viewsConfig[table].UNWANTED_SUBSTRINGS,
              );

              // Filter Mapeo data to only show data where category matches any values in mapeoCategoryIds (a comma-separated string of values)
              const filteredMapeoDataByCategory = filteredMapeoData.filter(
                (row: any) => {
                  return Object.keys(row).some(
                    (key) =>
                      key.includes("category") &&
                      mapeoCategoryIds.split(",").includes(row[key]),
                  );
                },
              );

              // Filter only data with valid geofields
              const filteredMapeoGeoData = filterGeoData(
                filteredMapeoDataByCategory,
              );
              // Transform data that was collected using survey apps (e.g. KoBoToolbox, Mapeo)
              const transformedMapeoData =
                transformSurveyData(filteredMapeoGeoData);
              // Process geodata
              const processedMapeoData = prepareMapData(
                transformedMapeoData,
                viewsConfig[table].FRONT_END_FILTER_COLUMN,
              );

              mapeoData = processedMapeoData;
            }

            // Prepare statistics data for the alerts view
            const statistics = prepareAlertStatistics(mainData, metadata);

            // Convert alert data to GeoJSON format
            const geojsonData = {
              mostRecentAlerts: transformToGeojson(
                changeDetectionData.mostRecentAlerts,
              ),
              previousAlerts: transformToGeojson(
                changeDetectionData.previousAlerts,
              ),
            };

            const response = {
              alertsData: geojsonData,
              imageExtensions: imageExtensions,
              logoUrl: viewsConfig[table].LOGO_URL,
              mapLegendLayerIds: viewsConfig[table].MAP_LEGEND_LAYER_IDS,
              mapbox3d: viewsConfig[table].MAPBOX_3D,
              mapboxAccessToken: viewsConfig[table].MAPBOX_ACCESS_TOKEN,
              mapboxBearing: viewsConfig[table].MAPBOX_BEARING,
              mapboxLatitude: viewsConfig[table].MAPBOX_CENTER_LATITUDE,
              mapboxLongitude: viewsConfig[table].MAPBOX_CENTER_LONGITUDE,
              mapboxPitch: viewsConfig[table].MAPBOX_PITCH,
              mapboxProjection: viewsConfig[table].MAPBOX_PROJECTION,
              mapboxStyle: viewsConfig[table].MAPBOX_STYLE,
              mapboxZoom: viewsConfig[table].MAPBOX_ZOOM,
              mapeoData: mapeoData,
              mediaBasePath: viewsConfig[table].MEDIA_BASE_PATH,
              mediaBasePathAlerts: viewsConfig[table].MEDIA_BASE_PATH_ALERTS,
              planetApiKey: viewsConfig[table].PLANET_API_KEY,
              statistics: statistics,
              table: table,
            };

            res.json(response);
          } catch (error: any) {
            console.error("Error fetching data on API side:", error.message);
            res.status(500).json({ error: error.message });
          }
        },
      );
    }

    // Endpoint for the map view
    if (viewsConfig[table].VIEWS.includes("map")) {
      app.get(
        `/${table}/map`,
        async (_req: express.Request, res: express.Response) => {
          try {
            // Fetch the latest viewsConfig
            const viewsConfig = await getViewsConfig();
            // Fetch data
            const { mainData, columnsData } = await fetchData(
              db,
              table,
              IS_SQLITE,
            );

            // Filter data to remove unwanted columns and substrings
            const filteredData = filterUnwantedKeys(
              mainData,
              columnsData,
              viewsConfig[table].UNWANTED_COLUMNS,
              viewsConfig[table].UNWANTED_SUBSTRINGS,
            );
            // Filter data to remove unwanted values per chosen column
            const dataFilteredByValues = filterOutUnwantedValues(
              filteredData,
              viewsConfig[table].FILTER_BY_COLUMN,
              viewsConfig[table].FILTER_OUT_VALUES_FROM_COLUMN,
            );
            // Filter only data with valid geofields
            const filteredGeoData = filterGeoData(dataFilteredByValues);
            // Transform data that was collected using survey apps (e.g. KoBoToolbox, Mapeo)
            const transformedData = transformSurveyData(filteredGeoData);
            // Process geodata
            const processedGeoData = prepareMapData(
              transformedData,
              viewsConfig[table].FRONT_END_FILTER_COLUMN,
            );

            const response = {
              audioExtensions: audioExtensions,
              data: processedGeoData,
              filterColumn: viewsConfig[table].FRONT_END_FILTER_COLUMN,
              imageExtensions: imageExtensions,
              mapLegendLayerIds: viewsConfig[table].MAP_LEGEND_LAYER_IDS,
              mapbox3d: viewsConfig[table].MAPBOX_3D,
              mapboxAccessToken: viewsConfig[table].MAPBOX_ACCESS_TOKEN,
              mapboxBearing: viewsConfig[table].MAPBOX_BEARING,
              mapboxLatitude: viewsConfig[table].MAPBOX_CENTER_LATITUDE,
              mapboxLongitude: viewsConfig[table].MAPBOX_CENTER_LONGITUDE,
              mapboxPitch: viewsConfig[table].MAPBOX_PITCH,
              mapboxProjection: viewsConfig[table].MAPBOX_PROJECTION,
              mapboxStyle: viewsConfig[table].MAPBOX_STYLE,
              mapboxZoom: viewsConfig[table].MAPBOX_ZOOM,
              mediaBasePath: viewsConfig[table].MEDIA_BASE_PATH,
              planetApiKey: viewsConfig[table].PLANET_API_KEY,
              table: table,
              videoExtensions: videoExtensions,
            };

            res.json(response);
          } catch (error: any) {
            console.error("Error fetching data on API side:", error.message);
            res.status(500).json({ error: error.message });
          }
        },
      );
    }

    // Endpoint for the gallery view
    if (viewsConfig[table].VIEWS.includes("gallery")) {
      app.get(
        `/${table}/gallery`,
        async (_req: express.Request, res: express.Response) => {
          try {
            // Fetch the latest viewsConfig
            const viewsConfig = await getViewsConfig();
            // Fetch data
            const { mainData, columnsData } = await fetchData(
              db,
              table,
              IS_SQLITE,
            );

            // Filter data to remove unwanted columns and substrings
            const filteredData = filterUnwantedKeys(
              mainData,
              columnsData,
              viewsConfig[table].UNWANTED_COLUMNS,
              viewsConfig[table].UNWANTED_SUBSTRINGS,
            );
            // Filter data to remove unwanted values per chosen column
            const dataFilteredByValues = filterOutUnwantedValues(
              filteredData,
              viewsConfig[table].FILTER_BY_COLUMN,
              viewsConfig[table].FILTER_OUT_VALUES_FROM_COLUMN,
            );
            // Filter only data with media attachments
            const dataWithFilesOnly = filterDataByExtension(
              dataFilteredByValues,
              allExtensions,
            );
            // Transform data that was collected using survey apps (e.g. KoBoToolbox, Mapeo)
            const transformedData = transformSurveyData(dataWithFilesOnly);

            const response = {
              audioExtensions: audioExtensions,
              data: transformedData,
              filterColumn: viewsConfig[table].FRONT_END_FILTER_COLUMN,
              imageExtensions: imageExtensions,
              mediaBasePath: viewsConfig[table].MEDIA_BASE_PATH,
              table: table,
              videoExtensions: videoExtensions,
            };

            res.json(response);
          } catch (error: any) {
            console.error("Error fetching data on API side:", error.message);
            res.status(500).json({ error: error.message });
          }
        },
      );
    }
  });
};

// Set up database connections for config and data
const setupAndInitialize = async () => {
  let configDbName = "gc_views";
  if (IS_SQLITE && DATABASE) {
    configDbName = DATABASE;
  }

  // Create config database if it does not exist
  if (!IS_SQLITE) {
    await createDatabaseIfNotExists(
      configDbName,
      DATABASE,
      DB_HOST,
      DB_USER,
      DB_PASSWORD,
      DB_PORT,
      DB_SSL,
    );
  }

  configDb = setupDatabaseConnection(
    IS_SQLITE,
    SQLITE_DB_PATH,
    configDbName,
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    DB_PORT,
    DB_SSL,
  );

  db = setupDatabaseConnection(
    IS_SQLITE,
    SQLITE_DB_PATH,
    DATABASE,
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    DB_PORT,
    DB_SSL,
  );

  // Initialize views using config
  await initializeViewsConfig();
};

// GET views configuration
app.get("/config", async (_req: express.Request, res: express.Response) => {
  try {
    res.json(await getViewsConfig());
  } catch (error: any) {
    console.error("Error fetching views configuration:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST views configuration
app.post(
  "/config/:tableName",
  async (req: express.Request, res: express.Response) => {
    const { tableName } = req.params;
    const config = req.body;

    try {
      await updateConfig(configDb, tableName, config, IS_SQLITE);
      res.json({ message: "Configuration updated successfully" });

      // Reinitialize viewsConfig with updated config
      await getViewsConfig();
      initializeViewsConfig().catch((error) => {
        console.error("Error reinitializing views config:", error.message);
      });
    } catch (error: any) {
      console.error("Error updating config:", error.message);
      res.status(500).json({ error: error.message });
    }
  },
);

// DELETE a table from configuration
app.delete(
  "/config/:tableName",
  async (req: express.Request, res: express.Response) => {
    const { tableName } = req.params;

    try {
      await removeTableFromConfig(configDb, tableName, IS_SQLITE);
      res.json({ message: "Table removed from views configuration." });

      // Reinitialize viewsConfig with updated config
      await getViewsConfig();
      initializeViewsConfig().catch((error) => {
        console.error("Error reinitializing views config:", error.message);
      });
    } catch (error: any) {
      console.error("Error removing table from config:", error.message);
      res.status(500).json({ error: error.message });
    }
  },
);

setupAndInitialize().catch((error) => {
  console.error("Error initializing views config:", error.message);
});

export default {
  path: "/api",
  handler: app,
};
