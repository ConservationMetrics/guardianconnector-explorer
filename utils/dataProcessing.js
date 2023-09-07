let fetch;

// Request db data
const fetchData = async (baseUrl) => {
    if (!fetch) {
        fetch = (await import('node-fetch')).default;
    }
    try {
        // Construct the URL for fetching data
        const apiUrl = new URL("data", baseUrl);

        const response = await fetch(apiUrl);

        if (!response.ok) { 
            console.error(`Failed with status: ${response.status}, statusText: ${response.statusText}`);
            throw new Error("Network response was not ok"); 
        }
        const apiResponse = await response.json();
        return apiResponse;
    } catch (error) {
        console.error("Error fetching API response:", error);
        throw new Error("Failed to fetch data from /data endpoint");
    }
};

// Filter columns with unwanted columns and substrings
const filterColumns = (
    originalColumns,
    unwantedColumns,
    unwantedSubstrings
) => {
    return new Set(
        [...originalColumns].filter((column) => {
            if (unwantedColumns.includes(column)) return false;
            if (unwantedSubstrings.some((sub) => column.includes(sub)))
                return false;
            return true;
        })
    );
};

const fetchDataAndFilter = async (baseUrl, unwantedColumnsList, unwantedSubstringsList) => {
    const apiResponse = await fetchData(baseUrl);
    const data = apiResponse.data;

    if (!data.length) {
        console.warn("API response contains no data.");
        return {
            filteredSqlColumns: new Set()
        };
    }

    // Fetch and split the unwantedColumns and unwantedSubstrings from .env
    const unwantedColumns = unwantedColumnsList.split(','); 
    const unwantedSubstrings = unwantedSubstringsList.split(',');

    let filteredSqlColumns;

    // If there is a __columns table, use that for SQL column mapping and filtering
    if (apiResponse.columns) {
      const columns = apiResponse.columns;

      // Create an original-to-SQL column mapping for lookup
      const columnMapping = {};
      columns.forEach((column) => {
        columnMapping[column.original_column] = column.sql_column;
      });

      const originalColumnsSet = new Set(
        columns.map((column) => column.original_column)
      );
      const columnsToFilter = filterColumns(
        originalColumnsSet,
        unwantedColumns,
        unwantedSubstrings
      );

      // Map the filtered original_column entries to sql_column entries
      filteredSqlColumns = new Set(
        [...columnsToFilter].map((column) => columnMapping[column])
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

    return {
      data,
      filteredSqlColumns
    };
  }; 

module.exports = fetchDataAndFilter;