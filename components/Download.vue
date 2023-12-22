<template>
  <div class="button-container">
    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mx-2"
      @click="downloadCSV"
    >
      Download CSV
    </button>
    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mx-2"
      @click="downloadGeoJSON"
    >
      Download GeoJSON
    </button>
  </div>
</template>

<script>
export default {
  props: ["featureGeojson"],
  methods: {
    downloadCSV() {
      // Convert featureObject to CSV and download
      if (!this.featureGeojson) {
        console.error("No GeoJSON data available to download and convert to CSV.");
        return;
      }

      // Flatten the object
      const { geometry, properties } = this.featureGeojson;
      let flattened = { ...properties }; // Start with properties
      
      // Ensure that all coordinate properties render well in CSV
      flattened['Geographic centroid'] = `[${properties['Geographic centroid']}]`;
      const coordinates = JSON.stringify(geometry.coordinates);
      delete flattened['coordinates'];
      
      // Generate CSV data
      const csvColumns = Object.keys(flattened);
      const csvData = Object.values(flattened).map(value => 
        typeof value === 'string' && value.includes(',') ? `"${value.replace(/"/g, '""')}"` : value
      );

      // Remove top level GeoJSON "type" property
      const typeIndex = csvColumns.indexOf('type');
      if (typeIndex > -1) {
        csvColumns.splice(typeIndex, 1);
        csvData.splice(typeIndex, 1);
      }

      // Append geometry type and coordinates at the end
      csvColumns.push('type');
      csvData.push(`"${geometry.type}"`);
      csvColumns.push('coordinates');
      csvData.push(`"${coordinates}"`);

      const csvString = [
        csvColumns.join(','),
        csvData.join(',')
      ].join('\n');

      // Download CSV
      const filename = `${this.featureGeojson.properties["Alert ID"]}.csv`;
      const blob = new Blob([csvString], { type: "text/csv" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);

      link.click();

      // Clean up and free memory
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    },
    downloadGeoJSON() {
      // Convert featureObject to GeoJSON and download
      if (!this.featureGeojson) {
        console.error("No GeoJSON data available to download.");
        return;
      }

      const filename = `${this.featureGeojson.properties["Alert ID"]}.geojson`;
      const jsonStr = JSON.stringify(this.featureGeojson, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);

      link.click();

      // Clean up and free memory
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    },
  },
};
</script>

<style scoped>
.button-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
