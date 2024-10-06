import { fetchTableNames } from "../../database/dbOperations";

export const getFilteredTableNames = async (
  database: string,
  isSqlite: boolean
) => {
  let tableNames = await fetchTableNames(database, isSqlite);
  // Filter out anything with metadata, columns, and anything PostGIS related
  tableNames = tableNames.filter(
    (name) =>
      !name.includes("metadata") &&
      !name.includes("columns") &&
      !name.includes("spatial_ref_sys")
  );
  return tableNames;
};
