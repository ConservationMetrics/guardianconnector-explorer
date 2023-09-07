const transformKey = (key) => {
    let transformedKey = key.replace(/^p__/, "").replace(/_/g, " ");
    transformedKey = transformedKey.replace(/\b\w/g, c => c.toUpperCase()); // Capitalize first letter of each word
    if (transformedKey === "Today") {
      transformedKey = "Data Collected On";
    } else if (transformedKey === "Categoryid") {
      transformedKey = "Category";
    }
    return transformedKey;
  };
  
  const transformValue = (key, value) => {
    let transformedValue = value;
    if (typeof transformedValue === "string") {
      transformedValue = transformedValue.replace(/_/g, " ").replace(/;/g, ", ");
      if (key.includes("Category")) {
        transformedValue = transformedValue.replace(/-/g, " ");
      }
      transformedValue = transformedValue.charAt(0).toUpperCase() + transformedValue.slice(1);
    }
    // Handle lists enclosed in square brackets
    if (transformedValue.match(/^\[.*\]$/)) {
      transformedValue = transformedValue.replace(/^\[|\]$/g, "").split(", ").map(item => item.replace(/'/g, "")).join(", ");
    }
    return transformedValue;
  };