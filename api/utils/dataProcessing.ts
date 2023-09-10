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
  unwantedColumnsList: string,
  unwantedSubstringsList: string
): any[] => {
  // Split the unwantedColumns and unwantedSubstrings from .env
  const unwantedColumns = unwantedColumnsList.split(",");
  const unwantedSubstrings = unwantedSubstringsList.split(",");

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
      hasValidCoordinates(feature) &&
      hasKeyIncludingSubstring(feature, "g__type")
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


export { filterData, filterGeoData, filterDataByExtension, transformData };
