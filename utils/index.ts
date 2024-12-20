// Function to get file paths from a feature object
export const getFilePathsWithExtension = (
  feature: { [key: string]: unknown },
  allExtensions: { [category: string]: string[] },
): string[] => {
  if (!feature) return [];

  // Get the value of the uuidKey or set it to null if it doesn't exist
  const uuidKey = Object.keys(feature).find((key) =>
    key.toLowerCase().includes("uuid"),
  );
  const uuid = uuidKey ? feature[uuidKey] : null;

  const filePaths: string[] = [];
  Object.keys(feature).forEach((key) => {
    if (typeof feature[key] !== "string") return;
    if (feature[key].includes("attachment")) return;
    const files = feature[key].split(",");
    files.forEach((file: string) => {
      // Check if the file has any extension listed in allExtensions object
      const hasValidExtension = Object.values(allExtensions).some(
        (extensions) =>
          extensions.some((ext: string) => file.trim().endsWith(ext)),
      );

      if (hasValidExtension) {
        const cleanedFile = file
          .trim()
          .replace(/ /g, "_")
          .replace(/^\['|'\]$/g, "");

        // If uuid is present, prepend it to the cleanedFile, otherwise use cleanedFile as is
        filePaths.push(uuid ? `${uuid}/${cleanedFile}` : cleanedFile);
      }
    });
  });
  return filePaths;
};

export const toCamelCase = (key: string): string => {
  return key
    .toLowerCase()
    .replace(/_([a-z0-9])/g, (_, p1) => p1.toUpperCase())
    .replace(/(^\w)/, (match) => match.toLowerCase());
};
