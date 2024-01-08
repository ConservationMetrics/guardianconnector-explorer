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
  let transformedKey = key
    .replace(/^g__/, "Geo")
    .replace(/^p__/, "")
    .replace(/_/g, " ");
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
  if (key === "g__coordinates") return value;

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
  if (
    typeof transformedValue === "string" &&
    transformedValue.match(/^\[.*\]$/)
  ) {
    transformedValue = transformedValue
      .replace(/^\[|\]$/g, "")
      .split(", ")
      .map((item) => item.replace(/'/g, ""))
      .join(", ");
  }
  return transformedValue;
};

const capitalizeFirstLetter = (string: string): string => {
  return string
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
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
  const unwantedColumns = unwantedColumnsList
    ? unwantedColumnsList.split(",")
    : [];
  const unwantedSubstrings = unwantedSubstringsList
    ? unwantedSubstringsList.split(",")
    : [];

  let filteredSqlColumns: Set<string>;

  // If there is a __columns table, use that for SQL column mapping and filtering
  if (columns) {
    // Create an original-to-SQL column mapping for lookup
    const columnMapping: { [key: string]: string } = {};
    columns.forEach((column) => {
      columnMapping[column.original_column] = column.sql_column;
    });

    const originalColumnsSet = new Set(
      columns.map((column) => column.original_column)
    );
    const unwantedColumnsSet = filterColumns(
      originalColumnsSet,
      unwantedColumns,
      unwantedSubstrings
    );

    // Map the unwanted original_column entries to sql_column entries
    const unwantedSqlColumns = new Set(
      [...unwantedColumnsSet].map((column) => columnMapping[column])
    );

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

const hasKeyIncludingSubstring = (
  obj: Record<string, any>,
  substring: string
): boolean => {
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

// Filter out data without valid geo fields
const filterGeoData = (
  data: Array<Record<string, any>>
): Array<Record<string, any>> => {
  const geoData = data.filter((feature) => hasValidCoordinates(feature));

  return geoData;
};

// Filter out data without any fields with file extensions
const filterDataByExtension = (
  data: Array<Record<string, any>>,
  extensions: string[]
): Array<Record<string, any>> => {
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
const transformData = (
  filteredData: Array<Record<string, any>>
): Array<Record<string, any>> => {
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
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const processGeoData = (
  transformedData: Array<Record<string, any>>,
  filterField: string | undefined
): Array<Record<string, any>> => {
  const colorMap = new Map<string, string>();

  // Add geometry type and process coordinates for each item
  const processedGeoData = transformedData.map((item) => {
    if (!item.Geotype) {
      let coordinateKey = Object.keys(item).find((key) =>
        key.toLowerCase().includes("coordinates")
      );
      if (coordinateKey) {
        let coordinates = JSON.parse(item[coordinateKey]);
        if (
          Array.isArray(coordinates) &&
          coordinates.length === 2 &&
          typeof coordinates[0] === "number" &&
          typeof coordinates[1] === "number"
        ) {
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
        item["filter-color"] = colorMap.get(filterFieldValue);
      } else {
        item["filter-color"] = "#FFA500"; // Fallback color of orange
      }
    } else {
      // Handle the case when filterField is undefined
      // For example, you might want to set a default color
      item["filter-color"] = "#FFA500"; // Fallback color of orange
    }

    return processGeolocation(item);
  });

  return processedGeoData;
};

const prepareChangeDetectionData = (
  data: Array<Record<string, any>>,
  embedMedia: boolean,
  linkToGCCDResources: boolean
): {
  mostRecentAlerts: Array<Record<string, any>>;
  otherAlerts: Array<Record<string, any>>;
} => {
  let latestDate = new Date(0);
  let latestMonthStr = "";

  // First pass to find the latest date
  data.forEach((item) => {
    const formattedMonth =
      item.month_detec.length === 1 ? `0${item.month_detec}` : item.month_detec;
    const monthYearStr = `${formattedMonth}-${item.year_detec}`;
    const date = new Date(item.year_detec, formattedMonth - 1);

    if (date > latestDate) {
      latestDate = date;
      latestMonthStr = monthYearStr;
    }
  });

  const mostRecentAlerts: Array<Record<string, any>> = [];
  const otherAlerts: Array<Record<string, any>> = [];

  // Second pass to segregate the data
  data.forEach((item) => {
    // Prepend 0 to single-digit months, if found
    const formattedMonth =
      item.month_detec.length === 1 ? `0${item.month_detec}` : item.month_detec;

    const monthYearStr = `${formattedMonth}-${item.year_detec}`;

    const transformedItem = transformItem(
      item,
      formattedMonth,
      embedMedia,
      linkToGCCDResources
    );

    // Segregate data based on the latest month detected
    if (monthYearStr === latestMonthStr) {
      mostRecentAlerts.push(transformedItem);
    } else {
      otherAlerts.push(transformedItem);
    }
  });

  return { mostRecentAlerts, otherAlerts };
};

function transformItem(
  item: Record<string, any>,
  formattedMonth: string,
  embedMedia: boolean,
  linkToGCCDResources: boolean
): Record<string, any> {
  const transformedItem: Record<string, any> = {};

  // Keep fields starting with 'g__'
  Object.keys(item).forEach((key) => {
    if (key.startsWith("g__")) {
      transformedItem[key] = item[key];
    }
  });

  // To rewrite the satellite prefix field
  const satelliteLookup: { [key: string]: string } = {
    S1: "Sentinel-1",
    S2: "Sentinel-2",
    PS: "Planetscope",
    L8: "Landsat 8",
    L9: "Landsat 9",
    WV1: "WorldView-1",
    WV2: "WorldView-2",
    WV3: "WorldView-3",
    WV4: "WorldView-4",
    IK: "IKONOS",
  };

  // Include only the transformed fields

  transformedItem["Territory"] = capitalizeFirstLetter(
    item.territory_name ?? ""
  );
  transformedItem["Alert ID"] = item._id;
  transformedItem[
    "Alert detection range"
  ] = `${item.date_start_t1} to ${item.date_end_t1}`;
  transformedItem["Month detected"] = `${formattedMonth}-${item.year_detec}`;
  transformedItem["YYYYMM"] = `${item.year_detec}${formattedMonth}`;
  transformedItem["Data provider"] = capitalizeFirstLetter(`${item._topic}`);
  transformedItem["Alert type"] = item.alert_type?.replace(/_/g, " ") ?? "";
  transformedItem["Alert area (hectares)"] =
    typeof item.area_alert_ha === "number"
      ? item.area_alert_ha.toFixed(2)
      : item.area_alert_ha;
  transformedItem["Satellite used for detection"] =
    satelliteLookup[item.sat_detect_prefix] || item.sat_detect_prefix;

  if (embedMedia) {
    transformedItem[
      "image_url"
    ] = `alerts/${item.territory_id}/${item.year_detec}/${formattedMonth}/${item._id}/resources/output_t1.jpg`;
    transformedItem["image_caption"] =
      satelliteLookup[item.sat_viz_prefix] || item.sat_viz_prefix;
  }
  if (linkToGCCDResources) {
    transformedItem[
      "preview_link"
    ] = `alerts/${item.territory_id}/${item.year_detec}/${formattedMonth}/${item._id}/output.html`;
  }

  return transformedItem;
}

interface AlertRecord {
  territory_name: string;
  alert_type: string;
  month_detec: string;
  year_detec: string;
  area_alert_ha: string;
  _topic: string;
}

const prepareStatistics = (data: AlertRecord[]): Record<string, any> => {
  const territory =
    data[0].territory_name.charAt(0).toUpperCase() +
    data[0].territory_name.slice(1);

  const typeOfAlerts = Array.from(
    new Set(data.map((item) => item.alert_type.replace(/_/g, " ")))
  );

  const dataProviders = Array.from(
    new Set(data.map((item) => item._topic.replace(/_/g, " ")))
  ).map((provider) => provider.replace(/\b\w/g, (char) => char.toUpperCase()));

  // Create Date objects for sorting and comparisons
  const formattedDates = data.map((item) => ({
    date: new Date(
      `${item.year_detec}-${item.month_detec.padStart(2, "0")}-01`
    ),
    dateString: `${item.month_detec.padStart(2, "0")}-${item.year_detec}`,
  }));

  // Sort dates to find the earliest and latest
  formattedDates.sort((a, b) => a.date.getTime() - b.date.getTime());
  const latestDate = formattedDates[formattedDates.length - 1].date;
  const latestDateStr = formattedDates[formattedDates.length - 1].dateString;

  // Create an array of all dates
  const allDates = Array.from(
    new Set(formattedDates.map((item) => item.dateString))
  );

  // Determine the date 12 months before the latest date
  let twelveMonthsBefore = new Date(latestDate);
  twelveMonthsBefore.setFullYear(twelveMonthsBefore.getFullYear() - 1);

  // Filter and sort the data for the last 12 months
  const last12MonthsData = data
    .filter((item) => {
      const itemDate = new Date(
        `${item.year_detec}-${item.month_detec.padStart(2, "0")}-01`
      );
      return itemDate >= twelveMonthsBefore && itemDate <= latestDate;
    })
    .sort((a, b) => {
      const aDate = new Date(
        `${a.year_detec}-${a.month_detec.padStart(2, "0")}`
      );
      const bDate = new Date(
        `${b.year_detec}-${b.month_detec.padStart(2, "0")}`
      );
      return aDate.getTime() - bDate.getTime();
    });

  const twelveMonthsBeforeStr = `${
    twelveMonthsBefore.getMonth() + 1
  }-${twelveMonthsBefore.getFullYear()}`;

  // Function to generate last 12 months
  function getLast12Months() {
    const months = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      currentDate.setMonth(currentDate.getMonth() - 1);
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const year = currentDate.getFullYear();
      months.push(`${month}-${year}`);
    }
    return months;
  }

  // Initialize hectaresPerMonth with last 12 months
  type HectaresPerMonth = Record<string, number>;
  const hectaresPerMonth: HectaresPerMonth = {};
  getLast12Months().forEach((monthYear) => {
    hectaresPerMonth[monthYear] = 0;
  });

  // Populate hectaresPerMonth with your data
  last12MonthsData.forEach((item) => {
    const monthYear: string = `${item.month_detec.padStart(2, "0")}-${
      item.year_detec
    }`;
    if (hectaresPerMonth.hasOwnProperty(monthYear)) {
      const hectares = parseFloat(item.area_alert_ha);
      hectaresPerMonth[monthYear] += isNaN(hectares) ? 0 : hectares;
      hectaresPerMonth[monthYear] = parseFloat(
        hectaresPerMonth[monthYear].toFixed(2)
      );
    }
  });

  // Find the earliest date
  const earliestAlertsDate = formattedDates[0].dateString;

  // Find the most recent alert date
  const recentAlertDate = formattedDates.reduce(
    (latest, current) => (current.date > latest.date ? current : latest),
    formattedDates[0]
  ).dateString;

  // Count the number of alerts for the most recent date
  const recentAlertsNumber = data.filter(
    (item) =>
      `${item.month_detec.padStart(2, "0")}-${item.year_detec}` ===
      recentAlertDate
  ).length;

  // Calculate total number of alerts
  const alertsTotal = data.length;

  // Calculate total hectares
  const hectaresTotal = data
    .reduce((total, item) => total + parseFloat(item.area_alert_ha), 0)
    .toFixed(2);

  return {
    territory,
    typeOfAlerts,
    dataProviders,
    alertDetectionRange: `${earliestAlertsDate} to ${latestDateStr}`,
    allDates,
    earliestAlertsDate: earliestAlertsDate,
    recentAlertsDate: recentAlertDate,
    recentAlertsNumber,
    alertsTotal,
    hectaresTotal,
    hectaresPerMonth,
    twelveMonthsBefore: twelveMonthsBeforeStr,
  };
};

const transformToGeojson = (
  inputArray: Array<{ [key: string]: any }>
): {
  type: string;
  features: Array<{
    type: string;
    id?: string | undefined;
    properties: { [key: string]: any };
    geometry?: { [key: string]: any };
  }>;
} => {
  const features = inputArray.map((input) => {
    const feature = {
      type: "Feature",
      id: undefined,
      properties: {} as { [key: string]: any },
      geometry: {} as { [key: string]: any },
    };

    Object.entries(input).forEach(([key, value]) => {
      if (key === "Alert ID") {
        feature.id = value.substring(4);
        feature.properties[key] = value;
      } else if (key.startsWith("g__")) {
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
    features: features,
  };
};

export {
  filterData,
  filterGeoData,
  filterDataByExtension,
  transformData,
  processGeoData,
  prepareChangeDetectionData,
  prepareStatistics,
  transformToGeojson,
};
