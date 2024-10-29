export const getConfig = () => {
  const {
    configDatabase,
    database,
    dbHost,
    dbUser,
    dbPassword,
    dbPort,
    dbSsl,
    isSQLite,
    sqliteDbPath,
    // eslint-disable-next-line no-undef
  } = useRuntimeConfig() as unknown as {
    configDatabase: string;
    database: string;
    dbHost: string;
    dbUser: string;
    dbPassword: string;
    dbPort: string;
    dbSsl: boolean;
    isSQLite: boolean;
    sqliteDbPath: string;
  };

  return {
    configDatabase,
    database,
    dbHost,
    dbUser,
    dbPassword,
    dbPort,
    dbSsl,
    isSQLite,
    sqliteDbPath,
  };
};
