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
