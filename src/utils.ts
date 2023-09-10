// Function to get file paths from a feature object
export default function getFilePaths(feature: {[key: string]: any}, allExtensions: string[]): string[] {  
  if (!feature) return [];

  // Get the value of the uuidKey or set it to null if it doesn't exist
  const uuidKey = Object.keys(feature).find((key) =>
    key.toLowerCase().includes("uuid")
  );
  const uuid = uuidKey ? feature[uuidKey] : null;

  const filePaths: string[] = [];
  Object.keys(feature).forEach((key) => {
    if (typeof feature[key] !== "string") return;
    if (feature[key].includes("attachment")) return;
    const files = feature[key].split(",");
    files.forEach((file: string) => {

      // Check if the file has any extension listed in allExtensions array
      if (allExtensions.some((ext: string) => file.trim().endsWith(ext))) {
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
}
