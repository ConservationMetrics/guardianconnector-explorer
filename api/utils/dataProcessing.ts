// Filter columns with unwanted columns and substrings
const filterColumns = (
  originalColumns: Set<string>,
  unwantedColumns: string[],
  unwantedSubstrings: string[]
): Set<string> => {
  return new Set(
    [...originalColumns].filter((column) => {
      if (unwantedColumns.includes(column)) return true;
      if (unwantedSubstrings.some((sub) => column.includes(sub))) return true;
      return false;
    })
  );
};

// Remove underscores from keys
const removeUnderscores = (key: string): string => {
  return key.replace(/^_/, "");
};

// Rewrite keys to be more legible
const transformKey = (key: string): string => {
  let transformedKey = key.replace(/^g__/, "Geo").replace(/^p__/, "").replace(/_/g, " ");  
  transformedKey = transformedKey.replace(/\b\w/g, (c) => c.toUpperCase()); // Capitalize first letter of each word
  if (transformedKey.toLowerCase() === "today") {
    transformedKey = "Data Collected On";
  } else if (transformedKey.toLowerCase() === "categoryid") {
    transformedKey = "Category";
  }
  return transformedKey.trimStart();
};

// Rewrite values to be more legible
const transformValue = (key: string, value: any): any => {
  if (value === null) return null;
  if (key === 'g__coordinates') return value;

  let transformedValue = value;
  if (typeof transformedValue === "string") {
    transformedValue = transformedValue.replace(/_/g, " ").replace(/;/g, ", ");
    if (key.includes("Category")) {
      transformedValue = transformedValue.replace(/-/g, " ");
    }
    transformedValue =
      transformedValue.charAt(0).toUpperCase() + transformedValue.slice(1);
  }
  // Handle lists enclosed in square brackets
  if (typeof transformedValue === "string" && transformedValue.match(/^\[.*\]$/)) {
    transformedValue = transformedValue
      .replace(/^\[|\]$/g, "")
      .split(", ")
      .map((item) => item.replace(/'/g, ""))
      .join(", ");
  }
  return transformedValue;
};


// Filter data using SQL column mapping
type Column = {
  original_column: string;
  sql_column: string;
};

const filterData = (
  data: any[],
  columns: Column[] | null,
  unwantedColumnsList: string | undefined,
  unwantedSubstringsList: string | undefined
): any[] => {
  // Split the unwantedColumns and unwantedSubstrings from .env
  const unwantedColumns = unwantedColumnsList ? unwantedColumnsList.split(",") : [];
  const unwantedSubstrings = unwantedSubstringsList ? unwantedSubstringsList.split(",") : [];  

  let filteredSqlColumns: Set<string>;

  // If there is a __columns table, use that for SQL column mapping and filtering
  if (columns) {
    // Create an original-to-SQL column mapping for lookup
    const columnMapping: { [key: string]: string } = {};
    columns.forEach((column) => {
      columnMapping[column.original_column] = column.sql_column;
    });

    const originalColumnsSet = new Set(columns.map((column) => column.original_column));
    const unwantedColumnsSet = filterColumns(
      originalColumnsSet,
      unwantedColumns,
      unwantedSubstrings
    );

    // Map the unwanted original_column entries to sql_column entries
    const unwantedSqlColumns = new Set([...unwantedColumnsSet].map((column) => columnMapping[column]));

    // Filter out the unwanted sql_column entries
    filteredSqlColumns = new Set(
      Object.values(columnMapping).filter(
        (sqlColumn) => !unwantedSqlColumns.has(sqlColumn)
      )
    );
  } else {
    // If there is no __columns table, then filter based on Object keys of one data entry
    filteredSqlColumns = new Set(
      Object.keys(data[0]) // assuming data has at least one item
        .filter(
          (key) =>
            !unwantedColumns.includes(key) &&
            !unwantedSubstrings.some((sub) => key.includes(sub))
        )
    );
  }

  // Create new filtered dataset
  const filteredData = data.map((item) =>
    Object.keys(item)
      .filter((key) => filteredSqlColumns.has(key))
      .reduce((obj: any, key) => {
        obj[key] = item[key];
        return obj;
      }, {})
  );

  return filteredData;
};


const hasKeyIncludingSubstring = (obj: Record<string, any>, substring: string): boolean => {
  return Object.keys(obj).some(
    (key) =>
      key.toLowerCase().includes(substring.toLowerCase()) && obj[key] != null
  );
};

// Ensure coordinates are valid
const isValidCoordinate = (coord: any): boolean => {
  return coord != null && !isNaN(coord) && coord >= -180 && coord <= 180;
};

const hasValidCoordinates = (obj: Record<string, any>): boolean => {
  return Object.keys(obj).some((key) => {
    if (key.toLowerCase().includes("coordinates")) {
      let coordinates = obj[key];
      // Filter out data with null coordinates
      if (coordinates) {
        if (typeof coordinates === 'string') {
          // Remove whitespaces and split by comma
          coordinates = coordinates.replace(/\s+/g, '').split(',');
          coordinates = JSON.parse(coordinates);
        } 
        if (Array.isArray(coordinates)) {
          // Flatten the array if it contains sub-arrays
          coordinates = coordinates.flat();
          // Check if all elements are valid coordinates
          return coordinates.length % 2 === 0 && coordinates.every(isValidCoordinate);
        }
      }
    }
    return false;
  });
}

// Filter out data without valid geo fields
const filterGeoData = (data: Array<Record<string, any>>): Array<Record<string, any>> => {
  const geoData = data.filter(
    (feature) =>
      hasValidCoordinates(feature)
  );

  return geoData;
};

// Filter out data without any fields with file extensions
const filterDataByExtension = (data: Array<Record<string, any>>, extensions: string[]): Array<Record<string, any>> => {
  return data.filter((entry) => {
    return Object.values(entry).some((value) =>
      extensions.some(
        (extension) =>
          typeof value === "string" && value.toLowerCase().includes(extension)
      )
    );
  });
};

// Transform keys and values
const transformData = (filteredData: Array<Record<string, any>>): Array<Record<string, any>> => {
  // Transform the keys and values
  const transformedData = filteredData.map((entry) => {
    const transformedEntry: Record<string, any> = {};
    Object.entries(entry).forEach(([key, value]) => {
      const transformedKey = transformKey(key);
      const transformedValue = transformValue(key, value);
      transformedEntry[transformedKey] = transformedValue;
    });
    return transformedEntry;
  });

  return transformedData;
};

// Process different geometry types and extract coordinates
const processGeolocation = (obj: any): any => {
  try {
    const geometryType = obj.Geotype;
    let coordinates;

    // Convert string to array
    if (!Array.isArray(obj.Geocoordinates)) {
      coordinates = JSON.parse(obj.Geocoordinates);
    } else {
      coordinates = obj.Geocoordinates;
    }
    if (
      geometryType === "Point" &&
      Array.isArray(coordinates) &&
      coordinates.length === 2
    ) {
      obj.Geocoordinates = coordinates;
    } else if (geometryType === "LineString") {
      obj.Geocoordinates = coordinates;
    } else if (geometryType === "Polygon") {
      obj.Geocoordinates = [coordinates];
    }
  } catch (error) {
    console.error("Error parsing coordinates:", error);
  }
  return obj;
};

const getRandomColor = (): any => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const processGeoData = (transformedData: Array<Record<string, any>>, filterField: string | undefined): Array<Record<string, any>> => {
  const colorMap = new Map<string, string>();

  // Add geometry type and process coordinates for each item
  const processedGeoData = transformedData.map((item) => {
    if (!item.Geotype) {
      let coordinateKey = Object.keys(item).find(key => key.toLowerCase().includes("coordinates"));
      if (coordinateKey) {
        let coordinates = JSON.parse(item[coordinateKey]);
        if (Array.isArray(coordinates) && coordinates.length === 2 && typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number') {
          item.Geotype = "Point";
        } else {
          item.Geotype = "Polygon";
        }  
      }
    }

    // Add random color to each item per the filter field
    if (filterField !== undefined) {
      const filterFieldValue = item[filterField];
      if (filterFieldValue) {
        if (!colorMap.has(filterFieldValue)) {
          colorMap.set(filterFieldValue, getRandomColor());
        }
        item['filter-color'] = colorMap.get(filterFieldValue);
      } else {
        item['filter-color'] = '#FFA500'; // Fallback color of orange
      }
    } else {
      // Handle the case when filterField is undefined
      // For example, you might want to set a default color
      item['filter-color'] = '#FFA500'; // Fallback color of orange
    }

    return processGeolocation(item);
  });

  return processedGeoData;
}

const prepareChangeDetectionData = (data: Array<Record<string, any>>): Array<Record<string, any>> => {
  const changeDetectionData = data.map((item) => {
    const transformedItem: Record<string, any> = {};
    Object.entries(item).forEach(([key, value]) => {
      let transformedKey = removeUnderscores(key);
      if (transformedKey === "topic") {
        transformedKey = "source";
      }
      transformedItem[transformedKey] = value;
    });
    return transformedItem;
  });
  return changeDetectionData;
}

const transformToGeojson = (inputArray: Array<{ [key: string]: any }>): { 
  type: string; 
  features: Array<{ 
    type: string; 
    properties: { [key: string]: any }; 
    geometry?: { [key: string]: any };
  }>;
} => {
  const features = inputArray.map(input => {
    const feature = { 
      type: "feature", 
      properties: {} as { [key: string]: any },
      geometry: {} as { [key: string]: any }
    };

    Object.entries(input).forEach(([key, value]) => {
      if (key.startsWith("g__")) {
        const geometryKey = key.substring(3); // Removes 'g__' prefix
        if (geometryKey === "coordinates") {
          feature.geometry[geometryKey] = JSON.parse(value);
        } else {
          feature.geometry[geometryKey] = value;
        }
      } else {
        feature.properties[key] = value;
      }
    });

    return feature;
  });

  return {
    type: "FeatureCollection",
    features: features
  };
};


export { filterData, filterGeoData, filterDataByExtension, transformData, processGeoData, prepareChangeDetectionData, transformToGeojson };
