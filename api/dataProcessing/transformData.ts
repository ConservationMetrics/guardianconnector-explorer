import { AlertRecord, Metadata, AlertsPerMonth } from "../types";
import {
  capitalizeFirstLetter,
  getRandomColor,
  calculateCentroid,
} from "./helpers";

// Transform survey data keys and values
const transformSurveyData = (
  filteredData: Array<Record<string, any>>,
): Array<Record<string, any>> => {
  const transformSurveyDataKey = (key: string): string => {
    let transformedKey = key
      .replace(/^g__/, "geo")
      .replace(/^p__/, "")
      .replace(/_/g, " ");
    if (transformedKey.toLowerCase() === "today") {
      transformedKey = "dataCollectedOn";
    } else if (transformedKey.toLowerCase().includes("categoryid")) {
      transformedKey = "category";
    } else if (transformedKey.toLowerCase() === "id") {
      transformedKey = "ID";
    }
    return transformedKey.trimStart();
  };

  const transformSurveyDataValue = (key: string, value: any): any => {
    if (value === null) return null;
    if (key === "g__coordinates") return value;

    let transformedValue = value;
    if (typeof transformedValue === "string") {
      transformedValue = transformedValue
        .replace(/_/g, " ")
        .replace(/;/g, ", ");
      if (key.toLowerCase().includes("category")) {
        transformedValue = transformedValue.replace(/-/g, " ");
      }
      if (
        key.toLowerCase().includes("created") ||
        key.toLowerCase().includes("modified")
      ) {
        // First let's ensure the date is in the correct format
        const dateRegex = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).*/;
        const dateMatch = transformedValue.match(dateRegex);
        if (dateMatch) {
          transformedValue = new Date(
            `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}T${dateMatch[4]}:${dateMatch[5]}:${dateMatch[6]}`,
          ).toLocaleDateString();
        }
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
  const transformedData = filteredData.map((entry) => {
    const transformedEntry: Record<string, any> = {};
    Object.entries(entry).forEach(([key, value]) => {
      const transformedKey = transformSurveyDataKey(key);
      const transformedValue = transformSurveyDataValue(key, value);
      transformedEntry[transformedKey] = transformedValue;
    });
    return transformedEntry;
  });

  return transformedData;
};

// Prepare data for the map view
const prepareMapData = (
  transformedData: Array<Record<string, any>>,
  filterColumn: string | undefined,
): Array<Record<string, any>> => {
  const colorMap = new Map<string, string>();

  // Process different geometry types and extract coordinates
  const processGeolocation = (obj: any): any => {
    try {
      const geometryType = obj.geotype;
      let coordinates;

      // Convert string to array
      if (!Array.isArray(obj.geocoordinates)) {
        coordinates = JSON.parse(obj.geocoordinates);
      } else {
        coordinates = obj.geocoordinates;
      }
      if (
        geometryType === "Point" &&
        Array.isArray(coordinates) &&
        coordinates.length === 2
      ) {
        obj.geocoordinates = coordinates;
      } else if (geometryType === "LineString") {
        obj.geocoordinates = coordinates;
      } else if (geometryType === "Polygon") {
        obj.geocoordinates = [coordinates];
      }
    } catch (error) {
      console.error("Error parsing coordinates:", error);
    }
    return obj;
  };

  // Add geometry type and process coordinates for each item
  const processedGeoData = transformedData.map((item) => {
    if (!item.geotype) {
      let coordinateKey = Object.keys(item).find((key) =>
        key.toLowerCase().includes("coordinates"),
      );
      if (coordinateKey) {
        let coordinates = JSON.parse(item[coordinateKey]);
        if (
          Array.isArray(coordinates) &&
          coordinates.length === 2 &&
          typeof coordinates[0] === "number" &&
          typeof coordinates[1] === "number"
        ) {
          item.geotype = "Point";
        } else {
          item.geotype = "Polygon";
        }
      }
    }

    // Add random color to each item per the filter column
    if (filterColumn !== undefined) {
      const filterColumnValue = item[filterColumn];
      if (filterColumnValue) {
        if (!colorMap.has(filterColumnValue)) {
          colorMap.set(filterColumnValue, getRandomColor());
        }
        item["filter-color"] = colorMap.get(filterColumnValue);
      } else {
        item["filter-color"] = "#3333FF"; // Fallback color of blue
      }
    } else {
      // Handle the case when filterColumn is undefined
      item["filter-color"] = "#3333FF"; // Fallback color of blue
    }

    return processGeolocation(item);
  });

  return processedGeoData;
};

// Prepare data for the alerts view
const prepareAlertData = (
  data: Array<Record<string, any>>,
): {
  mostRecentAlerts: Array<Record<string, any>>;
  previousAlerts: Array<Record<string, any>>;
} => {
  const transformChangeDetectionItem = (
    item: Record<string, any>,
    formattedMonth: string,
  ): Record<string, any> => {
    const transformedItem: Record<string, any> = {};

    // Keep columns starting with 'g__'
    Object.keys(item).forEach((key) => {
      if (key.startsWith("g__")) {
        transformedItem[key] = item[key];
      }
    });

    // To rewrite the satellite prefix column
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

    // Include only the transformed columns
    transformedItem["territory"] = capitalizeFirstLetter(
      item.territory_name ?? "",
    );
    transformedItem["alertID"] = item._id;
    transformedItem["alertDetectionRange"] =
      `${item.date_start_t1} to ${item.date_end_t1}`;
    transformedItem["monthDetected"] = `${formattedMonth}-${item.year_detec}`;
    transformedItem["YYYYMM"] = `${item.year_detec}${formattedMonth}`;
    transformedItem["dataProvider"] = capitalizeFirstLetter(
      `${item.alert_source}`,
    );
    transformedItem["confidenceLevel"] = item.confidence;
    transformedItem["alertType"] = item.alert_type?.replace(/_/g, " ") ?? "";
    transformedItem["alertAreaHectares"] =
      typeof item.area_alert_ha === "number"
        ? item.area_alert_ha.toFixed(2)
        : item.area_alert_ha;
    transformedItem["geographicCentroid"] = calculateCentroid(
      item.g__coordinates,
    );
    transformedItem["satelliteUsedForDetection"] =
      satelliteLookup[item.sat_detect_prefix] || item.sat_detect_prefix;

    transformedItem["t0_url"] =
      `alerts/${item.territory_id}/${item.year_detec}/${formattedMonth}/${item._id}/images/${item.sat_viz_prefix}_T0_${item._id}.jpg`;
    transformedItem["t1_url"] =
      `alerts/${item.territory_id}/${item.year_detec}/${formattedMonth}/${item._id}/images/${item.sat_viz_prefix}_T1_${item._id}.jpg`;
    transformedItem["previewImagerySource"] =
      satelliteLookup[item.sat_viz_prefix] || item.sat_viz_prefix;

    return transformedItem;
  };

  let latestDate = new Date(0);
  let latestMonthStr = "";

  const validGeoData = data.filter(isValidGeolocation);

  // First pass to find the latest date
  validGeoData.forEach((item) => {
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
  const previousAlerts: Array<Record<string, any>> = [];

  // Second pass to segregate the data
  validGeoData.forEach((item) => {
    // Prepend 0 to single-digit months, if found
    const formattedMonth =
      item.month_detec.length === 1 ? `0${item.month_detec}` : item.month_detec;

    const monthYearStr = `${formattedMonth}-${item.year_detec}`;

    const transformedItem = transformChangeDetectionItem(item, formattedMonth);

    // Segregate data based on the latest month detected
    if (monthYearStr === latestMonthStr) {
      mostRecentAlerts.push(transformedItem);
    } else {
      previousAlerts.push(transformedItem);
    }
  });
  return { mostRecentAlerts, previousAlerts };
};

// Prepare statistics for the alerts view intro panel
const prepareAlertStatistics = (
  data: AlertRecord[],
  metadata: Metadata[] | null,
): Record<string, any> => {
  let dataProviders: string[] = [];

  const territory =
    data[0].territory_name.charAt(0).toUpperCase() +
    data[0].territory_name.slice(1);

  const typeOfAlerts = Array.from(
    new Set(
      data
        .map((item) =>
          item.alert_type ? item.alert_type.replace(/_/g, " ") : null,
        )
        .filter(Boolean),
    ),
  );

  // Create Date objects for sorting and comparisons
  const formattedDates = data.map((item) => ({
    date: new Date(
      `${item.year_detec}-${item.month_detec.padStart(2, "0")}-15`,
    ),
    dateString: `${item.month_detec.padStart(2, "0")}-${item.year_detec}`,
  }));

  // Sort dates to find the earliest and latest
  formattedDates.sort((a, b) => a.date.getTime() - b.date.getTime());

  let earliestDateStr, latestDateStr;
  let earliestDate: Date, latestDate: Date;

  if (metadata && metadata.length > 0) {
    // Find earliest and latest dates from metadata
    metadata.sort((a, b) =>
      a.year === b.year ? a.month - b.month : a.year - b.year,
    );
    const earliestMetadata = metadata[0];
    const latestMetadata = metadata[metadata.length - 1];

    earliestDate = new Date(
      earliestMetadata.year,
      earliestMetadata.month - 1,
      1,
    );
    latestDate = new Date(latestMetadata.year, latestMetadata.month - 1, 28);

    earliestDateStr = `${String(earliestMetadata.month).padStart(2, "0")}-${earliestMetadata.year}`;
    latestDateStr = `${String(latestMetadata.month).padStart(2, "0")}-${latestMetadata.year}`;

    // Set alert_source
    dataProviders = Array.from(
      new Set(metadata.map((item) => item.alert_source)),
    );
  } else {
    // If metadata is null, calculate earliest and latest dates from data
    const formattedDates = data.map((item) => ({
      date: new Date(
        `${item.year_detec}-${item.month_detec.padStart(2, "0")}-15`,
      ),
      dateString: `${item.month_detec.padStart(2, "0")}-${item.year_detec}`,
    }));

    formattedDates.sort((a, b) => a.date.getTime() - b.date.getTime());

    earliestDate = formattedDates[0].date;
    earliestDate.setDate(1);
    earliestDateStr = formattedDates[0].dateString;

    latestDate = formattedDates[formattedDates.length - 1].date;
    latestDate.setDate(28);
    latestDateStr = formattedDates[formattedDates.length - 1].dateString;
  }

  // Create an array of all dates
  const allDates = Array.from(
    new Set(formattedDates.map((item) => item.dateString)),
  );

  // Determine the date 12 months before the latest date
  const twelveMonthsBefore = new Date(latestDate);
  twelveMonthsBefore.setFullYear(twelveMonthsBefore.getFullYear() - 1);

  // Filter and sort the data for the last 12 months
  const last12MonthsData = data
    .filter((item) => {
      const itemDate = new Date(
        `${item.year_detec}-${item.month_detec.padStart(2, "0")}-01`,
      );
      return itemDate >= twelveMonthsBefore && itemDate <= latestDate;
    })
    .sort((a, b) => {
      const aDate = new Date(
        `${a.year_detec}-${a.month_detec.padStart(2, "0")}`,
      );
      const bDate = new Date(
        `${b.year_detec}-${b.month_detec.padStart(2, "0")}`,
      );
      return aDate.getTime() - bDate.getTime();
    });

  const twelveMonthsBeforeStr = `${
    twelveMonthsBefore.getMonth() + 1
  }-${twelveMonthsBefore.getFullYear()}`;

  const getUpTo12MonthsForChart = (): string[] => {
    const months = [];

    // We have to use UTC here to avoid issues with local time settings
    const currentDate = new Date(
      Date.UTC(latestDate.getUTCFullYear(), latestDate.getUTCMonth(), 15),
    );

    for (let i = 0; i < 12; i++) {
      // Decrement the month in currentDate, after the first iteration (latestDate).
      // This moves the date back by one month at a time.
      if (i > 0) {
        currentDate.setMonth(currentDate.getMonth() - 1);
      }

      // Format the month part of the currentDate to ensure it has two digits.
      // This is necessary as months are 0-indexed in JavaScript,
      // so January is 0, February is 1, and so on.
      const month = String(currentDate.getUTCMonth() + 1).padStart(2, "0");
      const year = currentDate.getUTCFullYear();
      const monthYear = `${month}-${year}`;

      // Check if this currentDate falls within the range of earliestDate and latestDate.
      // If it does, add the monthYear string to the months array.
      if (currentDate >= earliestDate && currentDate <= latestDate) {
        months.push(monthYear);
      }
    }

    // Reverse the months array to have the dates in ascending order.
    months.reverse();
    return months;
  };

  // Helper function to update months cumulatively
  // Whether it be alerts or hectares
  const updateCumulativeData = (
    dataCollection: AlertRecord[],
    accumulatorMap: Record<string, number>,
    property: "alerts" | "hectares",
  ) => {
    let cumulativeValue = 0;
    const months = Object.keys(accumulatorMap);

    months.forEach((monthYear) => {
      if (property === "alerts") {
        const monthData = dataCollection.filter(
          (item) =>
            `${item.month_detec.padStart(2, "0")}-${item.year_detec}` ===
            monthYear,
        );
        cumulativeValue += monthData.length;
      } else if (property === "hectares") {
        dataCollection.forEach((item) => {
          const monthYearItem = `${item.month_detec.padStart(2, "0")}-${item.year_detec}`;
          if (monthYearItem === monthYear) {
            const hectares = parseFloat(item.area_alert_ha);
            cumulativeValue += isNaN(hectares) ? 0 : hectares;
          }
        });
      }
      accumulatorMap[monthYear] = parseFloat(cumulativeValue.toFixed(2));
    });
  };

  // Initialize alertsPerMonth and hectaresPerMonth
  const alertsPerMonth: AlertsPerMonth = {};
  const hectaresPerMonth: AlertsPerMonth = {};
  const months = getUpTo12MonthsForChart();

  months.forEach((monthYear) => {
    alertsPerMonth[monthYear] = 0;
    hectaresPerMonth[monthYear] = 0;
  });

  // Populate alertsPerMonth and hectaresPerMonth using the helper function
  updateCumulativeData(last12MonthsData, alertsPerMonth, "alerts");
  updateCumulativeData(last12MonthsData, hectaresPerMonth, "hectares");

  // Count the number of alerts for the most recent date
  const recentAlertDate =
    last12MonthsData.length > 0
      ? `${last12MonthsData[last12MonthsData.length - 1].month_detec.padStart(2, "0")}-${last12MonthsData[last12MonthsData.length - 1].year_detec}`
      : "N/A";
  const recentAlertsNumber = data.filter(
    (item) =>
      `${item.month_detec.padStart(2, "0")}-${item.year_detec}` ===
      recentAlertDate,
  ).length;

  // Calculate total number of alerts
  const alertsTotal = data.length;

  // Calculate total hectares
  const hectaresTotal = data
    .reduce((total, item) => total + parseFloat(item.area_alert_ha || "0"), 0)
    .toFixed(2);

  return {
    territory,
    typeOfAlerts,
    dataProviders,
    alertDetectionRange: `${earliestDateStr} to ${latestDateStr}`,
    allDates,
    earliestAlertsDate: earliestDateStr,
    recentAlertsDate: recentAlertDate,
    recentAlertsNumber,
    alertsTotal,
    alertsPerMonth,
    hectaresTotal,
    hectaresPerMonth,
    twelveMonthsBefore: twelveMonthsBeforeStr,
  };
};

// Transform data to GeoJSON format
const transformToGeojson = (
  inputArray: Array<{ [key: string]: any }>,
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
      if (key === "alertID") {
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

// Validate geolocation data
const isValidGeolocation = (item: Record<string, any>): boolean => {
  const validGeoTypes = [
    "LineString",
    "MultiLineString",
    "Point",
    "Polygon",
    "MultiPolygon",
  ];

  const isValidCoordinates = (type: string, coordinates: any): boolean => {
    if (typeof coordinates === "string") {
      try {
        coordinates = JSON.parse(coordinates);
      } catch (error) {
        return false;
      }
    }

    if (type === "Point") {
      return (
        Array.isArray(coordinates) &&
        coordinates.length === 2 &&
        coordinates.every(Number.isFinite)
      );
    } else if (type === "LineString" || type === "MultiLineString") {
      return (
        Array.isArray(coordinates) &&
        coordinates.every(
          (coord) =>
            Array.isArray(coord) &&
            coord.length === 2 &&
            coord.every(Number.isFinite),
        )
      );
    } else if (type === "Polygon") {
      return (
        Array.isArray(coordinates) &&
        coordinates.every(
          (ring) =>
            Array.isArray(ring) &&
            ring.every(
              (coord) =>
                Array.isArray(coord) &&
                coord.length === 2 &&
                coord.every(Number.isFinite),
            ),
        )
      );
    } else if (type === "MultiPolygon") {
      return (
        Array.isArray(coordinates) &&
        coordinates.every(
          (polygon) =>
            Array.isArray(polygon) &&
            polygon.every(
              (ring) =>
                Array.isArray(ring) &&
                ring.every(
                  (coord) =>
                    Array.isArray(coord) &&
                    coord.length === 2 &&
                    coord.every(Number.isFinite),
                ),
            ),
        )
      );
    }
    return false;
  };

  return (
    validGeoTypes.includes(item.g__type) &&
    isValidCoordinates(item.g__type, item.g__coordinates)
  );
};

export {
  transformSurveyData,
  prepareMapData,
  prepareAlertData,
  prepareAlertStatistics,
  transformToGeojson,
};
