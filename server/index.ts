import { refreshDatabaseConnection } from "./database/dbConnection";

export default async () => {
  try {
    await refreshDatabaseConnection(false);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to connect to database: ${error.message}`);
    } else {
      console.error("Unknown error connecting to database:", error);
    }
  }
};
