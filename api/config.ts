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
  PORT: string;
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
  MAP_LEGEND_LAYER_IDS: string;
  LINK_TO_GCCD_RESOURCES: string;
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
  transform?: (val: string) => any
) => {
  const value = env[key];
  let result = value !== undefined ? value.replace(/['"]+/g, "") : defaultValue;
  if (transform && result) {
    result = transform(result);
  }
  return result;
};

const AUTH_STRATEGY = getEnvVar("NUXT_ENV_AUTH_STRATEGY", "none");
const DATABASE = getEnvVar("DATABASE");
const DB_HOST = getEnvVar("DB_HOST");
const DB_USER = getEnvVar("DB_USER");
const DB_PASSWORD = getEnvVar("DB_PASSWORD");
const DB_PORT = getEnvVar("DB_PORT", "5432") as string;
const DB_SSL = getEnvVar("DB_SSL", "YES") as string;
const IS_SQLITE = getEnvVar("IS_SQLITE", "NO", (val) =>
  val.toUpperCase() === "YES" ? "YES" : "NO"
) as string;
const SQLITE_DB_PATH = getEnvVar("SQLITE_DB_PATH");
const PASSWORD = getEnvVar("PASSWORD");
const MAPBOX_ACCESS_TOKEN = getEnvVar("MAPBOX_ACCESS_TOKEN", "pk.ey") as string;
const SECRET_JWT_KEY = getEnvVar("SECRET_JWT_KEY", "secret-jwt-key") as string;
const API_KEY = getEnvVar("VUE_APP_API_KEY");
const VIEWS_CONFIG = process.env.NUXT_ENV_VIEWS_CONFIG;

export {
  AUTH_STRATEGY,
  DATABASE,
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_PORT,
  DB_SSL,
  IS_SQLITE,
  SQLITE_DB_PATH,
  PASSWORD,
  MAPBOX_ACCESS_TOKEN,
  SECRET_JWT_KEY,
  API_KEY,
  VIEWS_CONFIG,
  Views,
};
