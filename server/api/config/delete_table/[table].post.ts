import { defineEventHandler, sendError, H3Event } from "h3";
import { configDb } from "@/server/index";
import { removeTableFromConfig } from "../../../database/dbOperations";

export default defineEventHandler(async (event: H3Event) => {
  const {
    isSqlite,
    // eslint-disable-next-line no-undef
  } = useRuntimeConfig() as unknown as {
    isSqlite: boolean;
  };

  const table = event.context?.params?.table as string;

  try {
    await removeTableFromConfig(configDb, table, isSqlite);
    return { message: "Table removed from views configuration." };
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        "Error removing table from config on API side:",
        error.message,
      );
      return sendError(event, new Error(error.message));
    } else {
      console.error(
        "Unknown error removing table from config on API side:",
        error,
      );
      return sendError(event, new Error("An unknown error occurred"));
    }
  }
});
