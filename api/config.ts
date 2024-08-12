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
  PASSWORD: string;
  PORT: string;
  SECRET_JWT_KEY: string;
  SQLITE_DB_PATH: string;
  VUE_APP_API_KEY: string;
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
const IS_SQLITE = getEnvVar(
  "IS_SQLITE",
  "NO",
  (val) => val.toUpperCase() === "YES",
) as unknown as boolean;
const MAPBOX_ACCESS_TOKEN = getEnvVar("MAPBOX_ACCESS_TOKEN", "pk.ey") as string;
const PASSWORD = getEnvVar("PASSWORD");
const SECRET_JWT_KEY = getEnvVar("SECRET_JWT_KEY", "secret-jwt-key") as string;
const SQLITE_DB_PATH = getEnvVar("SQLITE_DB_PATH");

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
};
