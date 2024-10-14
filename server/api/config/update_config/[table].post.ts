import { defineEventHandler, sendError, readBody, H3Event } from "h3";
import { configDb } from "@/server/index";
import { updateConfig } from "../../../database/dbOperations";

export default defineEventHandler(async (event: H3Event) => {
  const {
    isSqlite,
    // eslint-disable-next-line no-undef
  } = useRuntimeConfig() as unknown as {
    isSqlite: boolean;
  };

  const table = event.context?.params?.table as string;
  const config = await readBody(event);

  try {
    await updateConfig(configDb, table, config, isSqlite);
    return { message: "Configuration updated successfully" };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating config on API side:", error.message);
      return sendError(event, new Error(error.message));
    } else {
      console.error("Unknown error updating config on API side:", error);
      return sendError(event, new Error("An unknown error occurred"));
    }
  }
});
