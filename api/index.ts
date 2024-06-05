import express from "express";
import fetch, { Response } from 'node-fetch';

import setupDatabaseConnection from "./database/dbConnection";
import fetchData from "./database/dbOperations";
import {
  filterUnwantedKeys,
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
  MAPBOX_ACCESS_TOKEN,
  VIEWS_CONFIG,
  Views,
} from "./config";

const app = express();

app.use(express.json());

app.get("/login", getLogin);
app.post("/login", postLogin);

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
  DB_SSL,
);

// If TABLES is undefined or empty, throw an error before proceeding
if (!VIEWS_CONFIG) {
  throw new Error(
    "The NUXT_ENV_VIEWS_CONFIG environment variable is not defined or is empty.",
  );
} else {
  let VIEWS: Views;
  try {
    // Remove single quotes from stringified JSON
    VIEWS = JSON.parse(VIEWS_CONFIG.replace(/'/g, ""));
  } catch (error: any) {
    throw new Error("Error parsing NUXT_ENV_VIEWS_CONFIG: " + error.message);
  }

  const tableNames = Object.keys(VIEWS);

  // Media extensions
  const imageExtensions = ["jpg", "jpeg", "png", "webp"];
  const audioExtensions = ["mp3", "ogg", "wav"];
  const videoExtensions = ["mov", "mp4", "avi", "mkv"];
  const allExtensions = [
    ...imageExtensions,
    ...audioExtensions,
    ...videoExtensions,
  ];

  tableNames.forEach((table) => {
    // Check if VIEWS[table].VIEWS is not set
    if (!VIEWS[table].VIEWS) {
      console.log(`Views not defined for ${table}, skipping...`);
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

    // Endpoint for the map view
    if (VIEWS[table].VIEWS.includes("map")) {
      app.get(
        `/${table}/map`,
        async (_req: express.Request, res: express.Response) => {
          try {
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
              VIEWS[table].UNWANTED_COLUMNS,
              VIEWS[table].UNWANTED_SUBSTRINGS,
            );
            // Filter only data with valid geofields
            const filteredGeoData = filterGeoData(filteredData);
            // Transform data that was collected using survey apps (e.g. KoBoToolbox, Mapeo)
            const transformedData = transformSurveyData(filteredGeoData);
            // Process geodata
            const processedGeoData = prepareMapData(
              transformedData,
              VIEWS[table].FRONT_END_FILTER_FIELD,
            );

            const response = {
              audioExtensions: audioExtensions,
              data: processedGeoData,
              embedMedia: VIEWS[table].EMBED_MEDIA === "YES",
              filterData: VIEWS[table].FRONT_END_FILTERING === "YES",
              filterField: VIEWS[table].FRONT_END_FILTER_FIELD,
              imageExtensions: imageExtensions,
              mapLegendLayerIds: VIEWS[table].MAP_LEGEND_LAYER_IDS,
              mapbox3d: VIEWS[table].MAPBOX_3D === "YES",
              mapboxAccessToken: MAPBOX_ACCESS_TOKEN,
              mapboxBearing: VIEWS[table].MAPBOX_BEARING,
              mapboxLatitude: VIEWS[table].MAPBOX_CENTER_LATITUDE,
              mapboxLongitude: VIEWS[table].MAPBOX_CENTER_LONGITUDE,
              mapboxPitch: VIEWS[table].MAPBOX_PITCH,
              mapboxProjection: VIEWS[table].MAPBOX_PROJECTION,
              mapboxStyle: VIEWS[table].MAPBOX_STYLE,
              mapboxZoom: VIEWS[table].MAPBOX_ZOOM,
              mediaBasePath: VIEWS[table].MEDIA_BASE_PATH,
              planetApiKey: VIEWS[table].PLANET_API_KEY,
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

    // Endpoint for the alert dashboard view
    if (VIEWS[table].VIEWS.includes("alerts")) {
      app.get(
        `/${table}/alerts`,
        async (_req: express.Request, res: express.Response) => {
          try {
            // Fetch data
            const { mainData, metadata } = await fetchData(
              db,
              table,
              IS_SQLITE,
            );

            // Prepare alerts data for the alerts view
            const changeDetectionData = prepareAlertData(
              mainData,
              VIEWS[table].EMBED_MEDIA === "YES",
            );

            const mapeoTable = VIEWS[table].MAPEO_TABLE;
            const mapeoCategoryIds = VIEWS[table].MAPEO_CATEGORY_IDS;

            let mapeoData = null;

            // Optionally add Mapeo data
            if (mapeoTable && mapeoCategoryIds) {
              // Fetch Mapeo data
              const rawMapeoData = await fetchData(db, mapeoTable, IS_SQLITE);

              // Filter data to remove unwanted columns and substrings
              const filteredMapeoData = filterUnwantedKeys(
                rawMapeoData.mainData,
                rawMapeoData.columnsData,
                VIEWS[table].UNWANTED_COLUMNS,
                VIEWS[table].UNWANTED_SUBSTRINGS,
              );

              // Filter Mapeo data to only show data where p__categoryid matches any values in mapeoCategoryIds (a comma-separated string of values)
              const filteredMapeoDataByCategory = filteredMapeoData.filter(
                (row: any) => {
                  return mapeoCategoryIds.includes(row.p__categoryid);
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
                VIEWS[table].FRONT_END_FILTER_FIELD,
              );

              mapeoData = processedMapeoData;
            }

            let gfwData = null;

            // Optionally add GFW data
            if (VIEWS[table].GFW_API_KEY && VIEWS[table].GFW_AOI) {
              console.log("Fetching GFW data...")
              const gfwApiKey = VIEWS[table].GFW_API_KEY;
              const gfwAOI = [JSON.parse(VIEWS[table].GFW_AOI)];

              // TODO: Figure out a more efficient way to fetch GFW data
              // The GFW API does raster analysis on the fly increasing latency, 
              // and the payload can be quite large (with a ceiling of 5291556 bytes)
              // For even a small AOI, the response can be quite large, slowing down 
              // the GCV API response time. A possible solution is to use a separate 
              // service (frizzle?) to fetch GFW data and store it in a database, 
              // or as a GeoJSON file

              // TODO: For this first attempt, the alert layer is hardcoded to 
              // gfw_integrated_alerts and the query data is hardcoded to alerts 
              // from 2024-01-01 onwards.
              // We should allow these to be configurable in the future.

              try {
                const rawGfwData = await fetch(
                  "https://data-api.globalforestwatch.org/dataset/gfw_integrated_alerts/latest/query",
                  {
                    method: "POST",
                    headers: {
                      "x-api-key": gfwApiKey,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      geometry: {
                        type: "Polygon",
                        coordinates: gfwAOI,
                      },
                      sql: "SELECT latitude, longitude, gfw_integrated_alerts__date, gfw_integrated_alerts__confidence FROM results WHERE gfw_integrated_alerts__date >= '2024-01-01'",
                    }),
                  },
                ).then((res: Response) => res.json());

                // Convert GFW data response to GeoJSON format
                gfwData = {
                  type: 'FeatureCollection',
                  features: rawGfwData.data.map((alert: any) => ({
                    type: 'Feature',
                    geometry: {
                      type: 'Point',
                      coordinates: [alert.longitude, alert.latitude]
                    },
                    properties: {
                      date: alert.gfw_integrated_alerts__date,
                      confidence: alert.gfw_integrated_alerts__confidence
                    }
                  }))
                };

                console.log("Successfully fetched GFW data!");
              } catch (error: any) {
                console.error("Error fetching GFW data:", error.message);
                gfwData = null;
              }
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
              alertResources: VIEWS[table].ALERT_RESOURCES === "YES",
              alertsData: geojsonData,
              embedMedia: VIEWS[table].EMBED_MEDIA === "YES",
              gfwData: gfwData,
              imageExtensions: imageExtensions,
              logoUrl: VIEWS[table].LOGO_URL,
              mapLegendLayerIds: VIEWS[table].MAP_LEGEND_LAYER_IDS,
              mapbox3d: VIEWS[table].MAPBOX_3D === "YES",
              mapboxAccessToken: MAPBOX_ACCESS_TOKEN,
              mapboxBearing: VIEWS[table].MAPBOX_BEARING,
              mapboxLatitude: VIEWS[table].MAPBOX_CENTER_LATITUDE,
              mapboxLongitude: VIEWS[table].MAPBOX_CENTER_LONGITUDE,
              mapboxPitch: VIEWS[table].MAPBOX_PITCH,
              mapboxProjection: VIEWS[table].MAPBOX_PROJECTION,
              mapboxStyle: VIEWS[table].MAPBOX_STYLE,
              mapboxZoom: VIEWS[table].MAPBOX_ZOOM,
              mapeoData: mapeoData,
              mediaBasePath: VIEWS[table].MEDIA_BASE_PATH,
              mediaBasePathAlerts: VIEWS[table].MEDIA_BASE_PATH_ALERTS,
              planetApiKey: VIEWS[table].PLANET_API_KEY,
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

    // Endpoint for the gallery view
    if (VIEWS[table].VIEWS.includes("gallery")) {
      app.get(
        `/${table}/gallery`,
        async (_req: express.Request, res: express.Response) => {
          try {
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
              VIEWS[table].UNWANTED_COLUMNS,
              VIEWS[table].UNWANTED_SUBSTRINGS,
            );
            // Filter only data with media attachments
            const dataWithFilesOnly = filterDataByExtension(
              filteredData,
              allExtensions,
            );
            // Transform data that was collected using survey apps (e.g. KoBoToolbox, Mapeo)
            const transformedData = transformSurveyData(dataWithFilesOnly);

            const response = {
              audioExtensions: audioExtensions,
              data: transformedData,
              embedMedia: VIEWS[table].EMBED_MEDIA === "YES",
              filterData: VIEWS[table].FRONT_END_FILTERING === "YES",
              filterField: VIEWS[table].FRONT_END_FILTER_FIELD,
              imageExtensions: imageExtensions,
              mediaBasePath: VIEWS[table].MEDIA_BASE_PATH,
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
}

export default {
  path: "/api",
  handler: app,
};
