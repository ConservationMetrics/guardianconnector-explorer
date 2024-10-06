import { defineEventHandler, sendError, H3Event } from "h3";
import { setupDatabaseConnection } from "../../database/dbConnection";
import { fetchConfig, fetchData } from "../../database/dbOperations";
import {
  prepareAlertData,
  prepareAlertStatistics,
  transformToGeojson,
  prepareMapData,
  transformSurveyData,
} from "../../dataProcessing/transformData";
import {
  filterUnwantedKeys,
  filterGeoData,
} from "../../dataProcessing/filterData";
import { type AllowedFileExtensions } from "../../types";
import { setup } from "@nuxt/test-utils";

export default defineEventHandler(async (event: H3Event) => {
  const { table } = event.context.params as { table: string };

  const {
    public: { allowedFileExtensions },
    configDatabase,
    database,
    dbHost,
    dbUser,
    dbPassword,
    dbPort,
    dbSsl,
    isSqlite,
    sqliteDbPath,
  } = useRuntimeConfig() as unknown as {
    public: { allowedFileExtensions: AllowedFileExtensions };
    configDatabase: string;
    isSqlite: boolean;
    sqliteDbPath: string;
    database: string;
    dbHost: string;
    dbUser: string;
    dbPassword: string;
    dbPort: string;
    dbSsl: boolean;
  };

  const configDb = setupDatabaseConnection(
    /* isConfigDb */ true,
    isSqlite,
    sqliteDbPath,
    configDatabase,
    database,
    dbHost,
    dbUser,
    dbPassword,
    dbPort,
    dbSsl
  );

  const db = setupDatabaseConnection(
    /* isConfigDb */ false,
    isSqlite,
    sqliteDbPath,
    database,
    database,
    dbHost,
    dbUser,
    dbPassword,
    dbPort,
    dbSsl
  );

  try {
    const viewsConfig = await fetchConfig(configDb, isSqlite);
    const { mainData, metadata } = await fetchData(db, table, isSqlite);

    // Prepare alerts data for the alerts view
    const changeDetectionData = prepareAlertData(mainData);

    const mapeoTable = viewsConfig[table].MAPEO_TABLE;
    const mapeoCategoryIds = viewsConfig[table].MAPEO_CATEGORY_IDS;

    let mapeoData = null;

    if (mapeoTable && mapeoCategoryIds) {
      // Fetch Mapeo data
      const rawMapeoData = await fetchData(db, mapeoTable, isSqlite);

      // Filter data to remove unwanted columns and substrings
      const filteredMapeoData = filterUnwantedKeys(
        rawMapeoData.mainData,
        rawMapeoData.columnsData,
        viewsConfig[table].UNWANTED_COLUMNS,
        viewsConfig[table].UNWANTED_SUBSTRINGS
      );

      // Filter Mapeo data to only show data where category matches any values in mapeoCategoryIds (a comma-separated string of values)
      const filteredMapeoDataByCategory = filteredMapeoData.filter(
        (row: any) => {
          return Object.keys(row).some(
            (key) =>
              key.includes("category") &&
              mapeoCategoryIds.split(",").includes(row[key])
          );
        }
      );

      // Filter only data with valid geofields
      const filteredMapeoGeoData = filterGeoData(filteredMapeoDataByCategory);
      // Transform data that was collected using survey apps (e.g. KoBoToolbox, Mapeo)
      const transformedMapeoData = transformSurveyData(filteredMapeoGeoData);
      // Process geodata
      const processedMapeoData = prepareMapData(
        transformedMapeoData,
        viewsConfig[table].FRONT_END_FILTER_COLUMN
      );

      mapeoData = processedMapeoData;
    }

    // Prepare statistics data for the alerts view
    const statistics = prepareAlertStatistics(mainData, metadata);

    // Convert alert data to GeoJSON format
    const geojsonData = {
      mostRecentAlerts: transformToGeojson(
        changeDetectionData.mostRecentAlerts
      ),
      previousAlerts: transformToGeojson(changeDetectionData.previousAlerts),
    };

    const response = {
      alertsData: geojsonData,
      imageExtensions: allowedFileExtensions.image,
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

    return response;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching data on API side:", error.message);
      return sendError(event, new Error(error.message));
    } else {
      console.error("Unknown error fetching data on API side:", error);
      return sendError(event, new Error("An unknown error occurred"));
    }
  }
});
