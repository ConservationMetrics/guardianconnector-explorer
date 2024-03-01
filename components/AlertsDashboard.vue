<template>
  <div>
    <div id="map"></div>
    <button
      v-if="!showSidebar"
      @click="resetToInitialState"
      class="reset-button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mx-2"
    >
      Reset Dashboard
    </button>
    <Sidebar
      :alert-resources="alertResources"
      :calculate-hectares="calculateHectares"
      :date-options="dateOptions"
      :download-alert="downloadAlert"
      :embed-media="embedMedia"
      :feature-geojson="selectedFeatureGeojson"
      :feature="selectedFeature"
      :file-paths="imageUrl"
      :geojson-selection="filteredData"
      :image-extensions="imageExtensions"
      :logo-url="logoUrl"
      :media-base-path="mediaBasePath"
      :show-intro-panel="showIntroPanel"
      :show-sidebar="showSidebar"
      :show-slider="showSlider"
      :statistics="statistics"
      @close="handleSidebarClose"
      @date-range-changed="handleDateRangeChanged"
    />
    <MapLegend
      v-if="mapLegendContent && map"
      :map-legend-content="mapLegendContent"
    />
  </div>
</template>

<script>
import mapboxgl from "mapbox-gl";
import bbox from "@turf/bbox";

import Sidebar from "@/components/Sidebar.vue";
import MapLegend from "@/components/MapLegend.vue";

import { prepareMapLegendLayers } from "@/src/mapFunctions.ts";

export default {
  components: {
    Sidebar,
    MapLegend,
  },
  props: [
    "alertResources",
    "data",
    "embedMedia",
    "imageExtensions",
    "logoUrl",
    "mapLegendLayerIds",
    "mapbox3d",
    "mapboxAccessToken",
    "mapboxBearing",
    "mapboxLatitude",
    "mapboxLongitude",
    "mapboxPitch",
    "mapboxProjection",
    "mapboxStyle",
    "mapboxZoom",
    "mediaBasePath",
    "statistics",
  ],
  data() {
    return {
      calculateHectares: false,
      dateOptions: [],
      downloadAlert: false,
      imageUrl: [],
      map: null,
      mapLegendContent: null,
      selectedDateRange: null,
      selectedFeature: null,
      selectedFeatureGeojson: null,
      selectedFeatureId: null,
      selectedFeatureSource: null,
      showIntroPanel: true,
      showSidebar: true,
      showSlider: false,
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

      const [startDate, endDate] = this.convertDates(start, end);

      const filterFeatures = (features) => {
        return features.filter((feature) => {
          const monthDetected = feature.properties["YYYYMM"];
          return monthDetected >= startDate && monthDetected <= endDate;
        });
      };

      return {
        mostRecentAlerts: {
          ...this.data.mostRecentAlerts,
          features: filterFeatures(this.data.mostRecentAlerts.features),
        },
        otherAlerts: {
          ...this.data.otherAlerts,
          features: filterFeatures(this.data.otherAlerts.features),
        },
      };
    },
  },
  methods: {
    addDataToMap() {
      const geoJsonSource = this.data;

      // Check if the data contains Polygon features for recent alerts
      if (
        geoJsonSource.mostRecentAlerts.features.some(
          (feature) => feature.geometry.type === "Polygon",
        )
      ) {
        // Add the most recent alerts source to the map as Polygons
        this.map.addSource("recent-alerts-polygon", {
          type: "geojson",
          data: {
            ...geoJsonSource.mostRecentAlerts,
            features: geoJsonSource.mostRecentAlerts.features.filter(
              (feature) => feature.geometry.type === "Polygon",
            ),
          },
        });

        // Add a layer for most recent alerts Polygons
        this.map.addLayer({
          id: "recent-alerts-polygon",
          type: "fill",
          source: "recent-alerts-polygon",
          paint: {
            "fill-color": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              "#FFFF00",
              "#EC00FF",
            ],
            "fill-opacity": 0.5,
          },
        });

        // Add a stroke for most recent alerts Polygons
        this.map.addLayer({
          id: "recent-alerts-stroke-polygon",
          type: "line",
          source: "recent-alerts-polygon",
          paint: {
            "line-color": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              "#FFFF00",
              "#EC00FF",
            ],
            "line-width": 2,
          },
        });
      }

      // Check if the data contains LineString features for recent alerts
      if (
        geoJsonSource.mostRecentAlerts.features.some(
          (feature) => feature.geometry.type === "LineString",
        )
      ) {
        // Add the most recent alerts source to the map as LineStrings
        this.map.addSource("recent-alerts-linestring", {
          type: "geojson",
          data: {
            ...geoJsonSource.mostRecentAlerts,
            features: geoJsonSource.mostRecentAlerts.features.filter(
              (feature) => feature.geometry.type === "LineString",
            ),
          },
        });

        // Add a layer for most recent alerts LineStrings
        this.map.addLayer({
          id: "recent-alerts-linestring",
          type: "line",
          source: "recent-alerts-linestring",
          paint: {
            "line-color": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              "#FFFF00",
              "#EC00FF",
            ],
            "line-width": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              5,
              3,
            ],
            "line-opacity": 0.8,
          },
        });
      }

      // Check if the data contains Polygon features for other alerts
      if (
        geoJsonSource.otherAlerts.features.some(
          (feature) => feature.geometry.type === "Polygon",
        )
      ) {
        // Add the other alerts source to the map as Polygons
        this.map.addSource("alerts-polygon", {
          type: "geojson",
          data: {
            ...geoJsonSource.otherAlerts,
            features: geoJsonSource.otherAlerts.features.filter(
              (feature) => feature.geometry.type === "Polygon",
            ),
          },
        });

        // Add a layer for other alerts Polygons
        this.map.addLayer({
          id: "alerts-polygon",
          type: "fill",
          source: "alerts-polygon",
          paint: {
            "fill-color": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              "#FFFF00",
              "#FF0000",
            ],
            "fill-opacity": 0.5,
          },
        });

        // Add a stroke for other alerts Polygons
        this.map.addLayer({
          id: "alerts-stroke-polygon",
          type: "line",
          source: "alerts-polygon",
          paint: {
            "line-color": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              "#FFFF00",
              "#FF0000",
            ],
            "line-width": 2,
          },
        });
      }

      // Check if the data contains LineString features for other alerts
      if (
        geoJsonSource.otherAlerts.features.some(
          (feature) => feature.geometry.type === "LineString",
        )
      ) {
        // Add the other alerts source to the map as LineStrings
        this.map.addSource("alerts-linestring", {
          type: "geojson",
          data: {
            ...geoJsonSource.otherAlerts,
            features: geoJsonSource.otherAlerts.features.filter(
              (feature) => feature.geometry.type === "LineString",
            ),
          },
        });

        // Add a layer for other alerts linestrings
        this.map.addLayer({
          id: "alerts-linestring",
          type: "line",
          source: "alerts-linestring",
          filter: ["==", "$type", "LineString"],
          paint: {
            "line-color": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              "#FFFF00",
              "#FF0000",
            ],
            "line-width": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              5,
              3,
            ],
            "line-opacity": 0.8,
          },
        });
      }

      // Add event listeners for layers that start with 'recent-alerts' and 'alerts'
      this.map.getStyle().layers.forEach((layer) => {
        if (
          layer.id.startsWith("recent-alerts") ||
          layer.id.startsWith("alerts")
        ) {
          this.map.on("mouseenter", layer.id, () => {
            this.map.getCanvas().style.cursor = "pointer";
          });
          this.map.on("mouseleave", layer.id, () => {
            this.map.getCanvas().style.cursor = "";
          });
          this.map.on("click", layer.id, (e) => {
            let featureObject = e.features[0].properties;

            const featureGeojson = (({ type, geometry, properties }) => ({
              type,
              geometry,
              properties,
            }))(e.features[0]);
            const featureId = e.features[0].id;

            // Reset the previously selected feature
            if (this.selectedFeatureId && this.selectedFeatureSource) {
              this.map.setFeatureState(
                {
                  source: this.selectedFeatureSource,
                  id: this.selectedFeatureId,
                },
                { selected: false },
              );
            }

            // Set new feature state
            this.map.setFeatureState(
              { source: layer.id, id: featureId },
              { selected: true },
            );

            delete featureObject["YYYYMM"];

            // Update component state
            this.selectedFeature = featureObject;
            this.selectedFeatureGeojson = featureGeojson;
            this.selectedFeatureId = featureId;
            this.selectedFeatureSource = layer.id;
            this.showSidebar = true;
            this.showIntroPanel = false;
            this.downloadAlert = true;

            // Fields that may or may not exist, depending on views config
            this.imageUrl = [];
            featureObject.t0_url && this.imageUrl.push(featureObject.t0_url);
            featureObject.t1_url && this.imageUrl.push(featureObject.t1_url);
            delete featureObject["t0_url"], delete featureObject["t1_url"];

            // Update component state
            this.selectedFeatureId = featureId;
            this.selectedFeature = featureObject;
            this.showSidebar = true;

            this.removePulsingCircles();
          });
        }
      });
    },

    addPulsingCircles() {
      if (document.querySelector(".pulsing-dot")) {
        return;
      }

      // Define the pulsing dot CSS
      const pulsingDot = document.createElement("div");
      pulsingDot.className = "pulsing-dot";

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
      const styleSheet = document.createElement("style");
      styleSheet.type = "text/css";
      styleSheet.innerText = styles;
      document.head.appendChild(styleSheet);

      // Check for sources that start with 'recent-alerts'
      const sources = this.map.getStyle().sources;
      const recentAlertsSources = Object.keys(sources).filter((source) =>
        source.startsWith("recent-alerts"),
      );

      recentAlertsSources.forEach((sourceId) => {
        // Wait until the map has loaded the source
        if (!this.map.isSourceLoaded(sourceId)) {
          this.map.once("idle", () => {
            this.addPulsingCircles();
          });
          return;
        }

        const features = this.map.querySourceFeatures(sourceId);

        features.forEach((feature) => {
          const bounds = bbox(feature);

          // Create a new marker element for this feature
          const pulsingMarker = pulsingDot.cloneNode();

          // Calculate the center of the bounding box
          const lng = (bounds[0] + bounds[2]) / 2;
          const lat = (bounds[1] + bounds[3]) / 2;

          // Create a new marker and add it to the map
          new mapboxgl.Marker(pulsingMarker)
            .setLngLat([parseFloat(lng), parseFloat(lat)])
            .addTo(this.map);
        });
      });
    },

    convertDates(start, end) {
      // Convert "MM-YYYY" to "YYYYMM" for comparison
      const convertToDate = (dateStr) => {
        const [month, year] = dateStr.split("-").map(Number);
        return (year * 100 + month).toString();
        // Converts to YYYYMM format
      };

      if (start === "Earlier") {
        start = this.statistics.earliestAlertsDate;
      }

      if (end === "Earlier") {
        end = this.statistics.twelveMonthsBefore;
      }

      const startDate = convertToDate(start);
      const endDate = convertToDate(end);

      return [startDate, endDate];
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

      const [startDate, endDate] = this.convertDates(start, end);

      // Update the layers to only show features within the selected date range
      this.$nextTick(() => {
        this.map.getStyle().layers.forEach((layer) => {
          if (
            layer.id.startsWith("recent-alerts") ||
            layer.id.startsWith("alerts")
          ) {
            this.map.setFilter(layer.id, [
              "all",
              [">=", ["get", "YYYYMM"], startDate],
              ["<=", ["get", "YYYYMM"], endDate],
            ]);
          }
        });

        // If 'recent-alerts' layers are empty, remove the pulsing circles. If not, add them.
        const recentAlertsLayers = this.map
          .getStyle()
          .layers.filter((layer) => layer.id.startsWith("recent-alerts"));
        let recentAlertsFeatures = [];
        recentAlertsLayers.forEach((layer) => {
          recentAlertsFeatures.push(
            ...this.map.querySourceFeatures(layer.source, {
              sourceLayer: layer["source-layer"],
              filter: [
                "all",
                [">=", ["get", "YYYYMM"], startDate],
                ["<=", ["get", "YYYYMM"], endDate],
              ],
            }),
          );
        });

        if (recentAlertsFeatures.length > 0) {
          this.addPulsingCircles();
        } else {
          this.removePulsingCircles();
        }

        // Update the selected date range
        this.selectedDateRange = newRange;
      });
    },

    handleSidebarClose() {
      this.showSidebar = false;
      this.resetSelectedFeature();
    },

    isOnlyLineStringData() {
      const allFeatures = [
        ...this.data.mostRecentAlerts.features,
        ...this.data.otherAlerts.features,
      ];
      return allFeatures.every(
        (feature) => feature.geometry.type === "LineString",
      );
    },

    prepareMapLegendContent() {
      if (!this.mapLegendLayerIds) {
        return;
      }
      this.map.once("idle", () => {
        this.mapLegendContent = prepareMapLegendLayers(
          this.map,
          this.mapLegendLayerIds,
        );
      });
    },

    removePulsingCircles() {
      document.querySelectorAll(".pulsing-dot").forEach((el) => el.remove());
    },

    resetSelectedFeature() {
      if (!this.selectedFeatureId || !this.selectedFeatureSource) {
        return;
      }
      this.map.setFeatureState(
        { source: this.selectedFeatureSource, id: this.selectedFeatureId },
        { selected: false },
      );
      this.selectedFeature = null;
      this.selectedFeatureGeojson = null;
      this.selectedFeatureId = null;
      this.selectedFeatureSource = null;
    },

    resetToInitialState() {
      this.resetSelectedFeature();
      this.showSidebar = true;
      this.showIntroPanel = true;
      this.downloadAlert = false;
      this.imageUrl = [];
      this.imageCaption = null;
      this.selectedDateRange = null;

      // Reset the filters for layers that start with 'recent-alerts' and 'alerts'
      this.map.getStyle().layers.forEach((layer) => {
        if (
          layer.id.startsWith("recent-alerts") ||
          layer.id.startsWith("alerts")
        ) {
          this.map.setFilter(layer.id, null);
        }
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
      this.map.once("idle", () => {
        this.addPulsingCircles();
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
      this.prepareMapLegendContent();

      // Navigation Control (zoom buttons and compass)
      const nav = new mapboxgl.NavigationControl();
      this.map.addControl(nav, "top-right");

      // Scale Control
      const scale = new mapboxgl.ScaleControl({
        maxWidth: 80,
        unit: "metric",
      });
      this.map.addControl(scale, "bottom-left");

      // Fullscreen Control
      const fullscreenControl = new mapboxgl.FullscreenControl();
      this.map.addControl(fullscreenControl, "top-right");
    });

    this.dateOptions = this.getDateOptions();

    if (this.isOnlyLineStringData() !== true) {
      this.calculateHectares = true;
    }
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
