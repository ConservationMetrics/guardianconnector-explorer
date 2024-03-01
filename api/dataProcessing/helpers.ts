export const getRandomColor = (): any => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const capitalizeFirstLetter = (string: string): string => {
  return string
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const isValidCoordinate = (coord: any): boolean => {
  return coord != null && !isNaN(coord) && coord >= -180 && coord <= 180;
};

export const hasValidCoordinates = (obj: Record<string, any>): boolean => {
  return Object.keys(obj).some((key) => {
    if (key.toLowerCase().includes("coordinates")) {
      let coordinates = obj[key];
      // Filter out data with null coordinates
      if (coordinates) {
        if (typeof coordinates === "string") {
          // Remove whitespaces and split by comma
          coordinates = coordinates.replace(/\s+/g, "").split(",");
          coordinates = JSON.parse(coordinates);
        }
        if (Array.isArray(coordinates)) {
          // Flatten the array if it contains sub-arrays
          coordinates = coordinates.flat();
          // Check if all elements are valid coordinates
          return (
            coordinates.length % 2 === 0 && coordinates.every(isValidCoordinate)
          );
        }
      }
    }
    return false;
  });
};

export const calculateCentroid = (coords: string): string => {
  let totalLat = 0;
  let totalLng = 0;
  let numCoords = 0;

  const allCoords: any = JSON.parse(coords);

  const processCoord = (coord: number[]) => {
    totalLng += coord[0];
    totalLat += coord[1];
    numCoords++;
  };

  // Check if it's a MultiPolygon (array of array of array)
  if (
    Array.isArray(allCoords[0]) &&
    Array.isArray(allCoords[0][0]) &&
    Array.isArray(allCoords[0][0][0])
  ) {
    allCoords.forEach((polygon: number[][][]) => {
      polygon.flat().forEach((coord: number[]) => processCoord(coord));
    });
  } else if (Array.isArray(allCoords[0]) && Array.isArray(allCoords[0][0])) {
    // It's a Polygon (array of array)
    allCoords.flat().forEach((coord: number[]) => processCoord(coord));
  } else if (Array.isArray(allCoords)) {
    // It's a LineString (array of coordinates)
    allCoords.forEach((coord: number[]) => processCoord(coord));
  } else {
    console.error("Invalid input format");
    return "";
  }

  const avgLng = (totalLng / numCoords).toFixed(6);
  const avgLat = (totalLat / numCoords).toFixed(6);

  return `${avgLat}, ${avgLng}`;
};
