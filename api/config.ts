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
  PASSWORD: string;
  PORT: string;
  SECRET_JWT_KEY: string;
  SQLITE_DB_PATH: string;
  VUE_APP_API_KEY: string;
}

interface ViewConfig {
  VIEWS: string;
  ALERT_RESOURCES: string;
  EMBED_MEDIA: string;
  FRONT_END_FILTERING: string;
  FRONT_END_FILTER_FIELD: string;
  GFW_API_KEY: string;
  GFW_AOI: string;
  MAPBOX_STYLE: string;
  MAPBOX_PROJECTION: string;
  MAPBOX_CENTER_LATITUDE: string;
  MAPBOX_CENTER_LONGITUDE: string;
  MAPBOX_ZOOM: string;
  MAPBOX_PITCH: string;
  MAPBOX_BEARING: string;
  MAPBOX_3D: string;
  MAPEO_TABLE: string;
  MAPEO_CATEGORY_IDS: string;
  MAP_LEGEND_LAYER_IDS: string;
  MEDIA_BASE_PATH: string;
  MEDIA_BASE_PATH_ALERTS: string;
  LOGO_URL: string;
  PLANET_API_KEY: string;
  UNWANTED_COLUMNS?: string;
  UNWANTED_SUBSTRINGS?: string;
}

interface Views {
  [key: string]: ViewConfig;
}

const env = process.env as unknown as EnvVars;

// Remove quotations from all env vars if they exist.
// This is important as the presence of quotation marks in .env can lead to issues when trying to connect to the database or any other operation requiring these variables.
// Replace with default values in some cases.
const getEnvVar = (
  key: keyof EnvVars,
  defaultValue?: string,
  transform?: (val: string) => any,
) => {
  const value = env[key];
  let result = value !== undefined ? value.replace(/['"]+/g, "") : defaultValue;
  if (transform && result) {
    result = transform(result);
  }
  return result;
};

const API_KEY = getEnvVar("VUE_APP_API_KEY");
const AUTH_STRATEGY = getEnvVar("NUXT_ENV_AUTH_STRATEGY", "none");
const DATABASE = getEnvVar("DATABASE");
const DB_HOST = getEnvVar("DB_HOST");
const DB_USER = getEnvVar("DB_USER");
const DB_PASSWORD = getEnvVar("DB_PASSWORD");
const DB_PORT = getEnvVar("DB_PORT", "5432") as string;
const DB_SSL = getEnvVar("DB_SSL", "YES") as string;
const IS_SQLITE = getEnvVar("IS_SQLITE", "NO", (val) =>
  val.toUpperCase() === "YES" ? "YES" : "NO",
) as string;
const MAPBOX_ACCESS_TOKEN = getEnvVar("MAPBOX_ACCESS_TOKEN", "pk.ey") as string;
const PASSWORD = getEnvVar("PASSWORD");
const SECRET_JWT_KEY = getEnvVar("SECRET_JWT_KEY", "secret-jwt-key") as string;
const SQLITE_DB_PATH = getEnvVar("SQLITE_DB_PATH");
const VIEWS_CONFIG = process.env.NUXT_ENV_VIEWS_CONFIG;

export {
  API_KEY,
  AUTH_STRATEGY,
  DATABASE,
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_PORT,
  DB_SSL,
  IS_SQLITE,
  MAPBOX_ACCESS_TOKEN,
  PASSWORD,
  SECRET_JWT_KEY,
  SQLITE_DB_PATH,
  VIEWS_CONFIG,
  Views,
};
