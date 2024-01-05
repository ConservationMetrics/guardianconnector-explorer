<template>
  <div id="map">
    <button v-if="!showSidebar" @click="resetToInitialState" class="reset-button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mx-2">Reset Dashboard</button>
    <Sidebar
      :embed-media="embedMedia"
      :feature="selectedFeature"
      :feature-geojson="selectedFeatureGeojson"
      :file-paths="imageUrl"
      :image-caption="imageCaption"
      :image-extensions="imageExtensions"
      :preview-map-link="previewMapLink"
      :media-base-path="mediaBasePath"      
      :show-sidebar="showSidebar"
      :show-slider="showSlider"
      :show-intro-panel="showIntroPanel"
      :download-alert="downloadAlert"
      :statistics="statistics"
      :date-options="dateOptions"
      :geojson-selection="filteredData"
      @close="handleSidebarClose"
      @date-range-changed="handleDateRangeChanged"
    />
  </div>
</template>
  
<script>
import mapboxgl from "mapbox-gl";
import bbox from '@turf/bbox';
import Sidebar from "./Sidebar.vue";

export default {
  components: { 
    Sidebar
  },
  props: [
    "data",
    "embedMedia",
    "imageExtensions",
    "mediaBasePath",
    "mapboxAccessToken",
    "mapboxStyle",
    "mapboxProjection",
    "mapboxLatitude",
    "mapboxLongitude",
    "mapboxZoom",
    "mapboxPitch",
    "mapboxBearing",
    "mapbox3d",
    "statistics"
  ],
  data() {
    return {
      showSidebar: true,
      showIntroPanel: true,
      showSlider: false,
      dateOptions: [],
      downloadAlert: false,
      selectedDateRange: null,
      selectedFeature: null,
      selectedFeatureGeojson: null,
      selectedFeatureId: null,
      selectedFeatureSource: null,
      imageUrl: [],
      imageCaption: null,
      previewMapLink: null
    };
  },
  computed: {
    filteredData() {
      // Function to filter features by date range.
      // This is being passed to the Download component in
      // AlertsIntroPanel.

      // If no date range is selected, return the full data
      if (!this.selectedDateRange) {
        return this.data;
      }

      const [start, end] = this.selectedDateRange;
      const filterFeatures = (features) => {
        return features.filter(feature => {
          const monthDetected = feature.properties["Month detected"];
          return monthDetected >= start && monthDetected <= end;
        });
      };

      return {
        mostRecentAlerts: {
          ...this.data.mostRecentAlerts,
          features: filterFeatures(this.data.mostRecentAlerts.features)
        },
        otherAlerts: {
          ...this.data.otherAlerts,
          features: filterFeatures(this.data.otherAlerts.features)
        }
      };
    }
  },
  methods: {
    addDataToMap() {
      const geoJsonSource = this.data;

      // Add the most recent alerts source to the map
      this.map.addSource("recent-alerts", {
        type: "geojson",
        data: geoJsonSource.mostRecentAlerts,
      });

      // Add the other alerts source to the map
      this.map.addSource("alerts", {
        type: "geojson",
        data: geoJsonSource.otherAlerts,
      });

      // Add a layer for most recent alerts
      this.map.addLayer({
        id: "recent-alerts",
        type: "fill",
        source: "recent-alerts",
        filter: ["==", "$type", "Polygon"],
        paint: {
          "fill-color": [
            'case',
              ['boolean', ['feature-state', 'selected'], false],
              '#FFFF00',
              '#EC00FF'
            ],          
            "fill-opacity": 0.5,
        },
      });     
      
      // Add a stroke for most recent alerts
      this.map.addLayer({
        id: "recent-alerts-stroke",
        type: "line",
        source: "recent-alerts",
        filter: ["==", "$type", "Polygon"],
        paint: {
          "line-color": [
            'case',
              ['boolean', ['feature-state', 'selected'], false],
              '#FFFF00',
              '#EC00FF'
          ],
          "line-width": 2,
        },
      });   

      // Add a layer for other alerts
      this.map.addLayer({
        id: "alerts",
        type: "fill",
        source: "alerts",
        filter: ["==", "$type", "Polygon"],
        paint: {
          "fill-color": [
            'case',
              ['boolean', ['feature-state', 'selected'], false],
              '#FFFF00',
              '#FF0000'
          ],   
            "fill-opacity": 0.5,
        },
      });     
      
      // Add a stroke for other alerts
      this.map.addLayer({
        id: "alerts-stroke",
        type: "line",
        source: "alerts",
        filter: ["==", "$type", "Polygon"],
        paint: {
          "line-color": [
            'case',
              ['boolean', ['feature-state', 'selected'], false],
              '#FFFF00',
              '#FF0000'
          ],  
          "line-width": 2,
        },
      });   
      
      // Add event listeners
      ["recent-alerts", "alerts"].forEach((layerId) => {
        this.map.on("mouseenter", layerId, () => {
          this.map.getCanvas().style.cursor = "pointer";
        });
        this.map.on("mouseleave", layerId, () => {
          this.map.getCanvas().style.cursor = "";
        });
        this.map.on("click", layerId, (e) => {
          let featureObject = e.features[0].properties;
          featureObject["Geographic centroid"] = this.calculateCentroid(e.features[0].geometry.coordinates[0]);

          const featureGeojson = (({ type, geometry, properties }) => ({ type, geometry, properties }))(e.features[0]);
          const featureId = e.features[0].id;

          // Reset the previously selected feature
          if (this.selectedFeatureId && this.selectedFeatureSource) {
            this.map.setFeatureState(
              { source: this.selectedFeatureSource, id: this.selectedFeatureId },
              { selected: false }
            );
          }

          // Set new feature state
          this.map.setFeatureState(
            { source: layerId, id: featureId },
            { selected: true }
          );

          // Update component state
          this.selectedFeature = featureObject;
          this.selectedFeatureGeojson = featureGeojson;
          this.selectedFeatureId = featureId;
          this.selectedFeatureSource = layerId;
          this.showSidebar = true;
          this.showIntroPanel = false;
          this.downloadAlert = true;

          // Fields that may or may not exist, depending on views config
          let imageUrl = featureObject.image_url;
          imageUrl && (this.imageUrl = [imageUrl]);
          let imageCaption = featureObject.image_caption;
          imageCaption && (this.imageCaption = "Preview imagery source: " + imageCaption);
          let previewMapLink = featureObject.preview_link;
          previewMapLink && (this.previewMapLink = previewMapLink);
          delete featureObject["image_url"], delete featureObject["image_caption"], delete featureObject["preview_link"];

          // Update component state
          this.selectedFeatureId = featureId;
          this.selectedFeature = featureObject;
          this.showSidebar = true;

          this.removePulsingCircles();
        });
      });
    },

    resetToInitialState() {
      this.resetSelectedFeature();
      this.showSidebar = true;
      this.showIntroPanel = true;
      this.downloadAlert = false;
      this.imageUrl = [];
      this.imageCaption = null;
      this.previewMapLink = null;
      this.selectedDateRange = null;

      // Reset the filters for the 'recent-alerts' and 'alerts' layers
      ['recent-alerts', 'alerts', 'recent-alerts-stroke', 'alerts-stroke'].forEach(layerId => {
        this.map.setFilter(layerId, null);
      });

      // Fly to the initial position
      this.map.flyTo({
        center: [this.mapboxLongitude || 0, this.mapboxLatitude || -15],
        zoom: this.mapboxZoom || 2.5,
        pitch: this.mapboxPitch || 0,
        bearing: this.mapboxBearing || 0,
      });

      // Add pulsing circles after the map has finished flying 
      // to the initial position. This is for reasons of user experience,
      // as well as the fact that queryRenderedFeatures() will only return
      // features that are visible in the browser viewport.)
      this.map.once('idle', () => {
        this.addPulsingCircles();
      });
    },

    handleSidebarClose() {
      this.showSidebar = false;
      this.resetSelectedFeature();
    },

    resetSelectedFeature() {
      if (!this.selectedFeatureId || !this.selectedFeatureSource) {
        return
      }
      this.map.setFeatureState(
        { source: this.selectedFeatureSource, id: this.selectedFeatureId },
        { selected: false }
      );
      this.selectedFeature = null;
      this.selectedFeatureGeojson = null;
      this.selectedFeatureId = null;
      this.selectedFeatureSource = null;
    },

    calculateCentroid(coords) {
        let totalLat = 0;
        let totalLng = 0;
        const numCoords = coords.length;

        coords.forEach(coord => {
            totalLng += coord[0];
            totalLat += coord[1];
        });

        const avgLng = (totalLng / numCoords).toFixed(6);
        const avgLat = (totalLat / numCoords).toFixed(6);

        return `${avgLat}, ${avgLng}`;
    },

    addPulsingCircles() {
      if (document.querySelector('.pulsing-dot')) {
        return;
      }

      // Wait until the map has loaded recent-alerts
      if (!this.map.isSourceLoaded('recent-alerts')) {
        this.map.once('idle', () => {
          this.addPulsingCircles();
        });
        return;
      }
      // Define the pulsing dot CSS
      const pulsingDot = document.createElement('div');
      pulsingDot.className = 'pulsing-dot';
     
      // Add the CSS for the pulsing effect
      const styles = `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .pulsing-dot {
          width: 30px;
          height: 30px;
          position: absolute;
          border-radius: 50%;
          pointer-events: none!important;
        }

        .pulsing-dot::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 5px solid #EC00FF;
          border-radius: inherit;
          box-shadow: 0 0 0 2px #EC00FF;
          animation: pulse 2s infinite;
        }
      `;
      const styleSheet = document.createElement('style');
      styleSheet.type = 'text/css';
      styleSheet.innerText = styles;
      document.head.appendChild(styleSheet);

      const features = this.map.queryRenderedFeatures({ layers: ['recent-alerts'] });

      features.forEach((feature) => {
        const bounds = bbox(feature);

        // Create a new marker element for this feature
        const pulsingMarker = pulsingDot.cloneNode();
        
        // Calculate the center of the bounding box
        const lng = (bounds[0] + bounds[2]) / 2;
        const lat = (bounds[1] + bounds[3]) / 2;

        // Create a new marker and add it to the map
        const marker = new mapboxgl.Marker(pulsingMarker)
          .setLngLat([parseFloat(lng), parseFloat(lat)])
          .addTo(this.map);

      });
    },

    removePulsingCircles() {
      document.querySelectorAll('.pulsing-dot').forEach(el => el.remove());
    },

    getDateOptions() {
      let dates = this.statistics.allDates;

      // Check if there are more than 12 dates
      // Replace any earlier dates with "Earlier"
      if (dates.length > 12) {
        const last12Dates = dates.slice(-12);
        
        dates = ["Earlier", ...last12Dates];
      }
      
      return dates;
    },

    handleDateRangeChanged(newRange) {
      // Extract start and end dates from newRange
      let [start, end] = newRange;

      if (start === "Earlier") {
        start = this.statistics.earliestAlertsDate;
      }

      if (end === "Earlier") {
        end = this.statistics.twelveMonthsBefore;
      }

      // Convert "MM-YYYY" to "YYYYMM" for comparison
      const convertToDate = (dateStr) => {
        const [month, year] = dateStr.split('-').map(Number);
        return (year * 100 + month).toString()
         // Converts to YYYYMM format
      };

      const startDate = convertToDate(start);
      const endDate = convertToDate(end);

      // Update the 'recent-alerts' and 'alerts' layers to only show features within the selected date range
      this.$nextTick(() => {
        ['recent-alerts', 'alerts', 'recent-alerts-stroke', 'alerts-stroke'].forEach(layerId => {
          this.map.setFilter(layerId, [
            'all',
            ['>=', ['get', 'YYYYMM'], startDate],
            ['<=', ['get', 'YYYYMM'], endDate]
          ]);
        });

        this.removePulsingCircles();

        // Update the selected date range
        this.selectedDateRange = newRange;
      });
    },
  },
  mounted() {
    mapboxgl.accessToken = this.mapboxAccessToken;

    this.map = new mapboxgl.Map({
      container: "map",
      style: this.mapboxStyle || "mapbox://styles/mapbox/streets-v12",
      projection: this.mapboxProjection || "globe",
      center: [this.mapboxLongitude || 0, this.mapboxLatitude || -15],
      zoom: this.mapboxZoom || 2.5,
      pitch: this.mapboxPitch || 0,
      bearing: this.mapboxBearing || 0,
    });

    this.map.on("load", () => {
      // Add 3D Terrain if set in env var
      if (this.mapbox3d) {
        this.map.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });
        this.map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
      }

      this.addDataToMap();
      this.addPulsingCircles();

      // Navigation Control (zoom buttons and compass)
      const nav = new mapboxgl.NavigationControl();
      this.map.addControl(nav, 'top-right');

      // Scale Control
      const scale = new mapboxgl.ScaleControl({
        maxWidth: 80,
        unit: 'metric'
      });
      this.map.addControl(scale, 'bottom-left');

      // Fullscreen Control
      const fullscreenControl = new mapboxgl.FullscreenControl();
      this.map.addControl(fullscreenControl, 'top-right');
    });

    this.dateOptions = this.getDateOptions();
    this.showSlider = true;
  },
  beforeDestroy() {
    if (this.map) {
      this.map.remove();
    }
  },
};
</script>

<style scoped>
body {
  margin: 0;
  padding: 0;
}

#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}

.mapboxgl-popup-content {
  word-wrap: break-word;
}

.popup-media {
  width: 100%;
  display: block;
  margin-top: 5px;
}

.reset-button {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
}

</style>
