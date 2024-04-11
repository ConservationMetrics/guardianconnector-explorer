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
      :is-alert="isAlert"
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
    <BasemapSelector 
      v-if="showBasemapSelector"
      :mapbox-style="mapboxStyle"
      :planet-api-key="planetApiKey"
      @basemapSelected="handleBasemapChange"
    />
  </div>
</template>

<script>
import mapboxgl from "mapbox-gl";
import bbox from "@turf/bbox";
import { lineString } from "@turf/helpers";
import length from "@turf/length";
import along from "@turf/along";

import BasemapSelector from "@/components/BasemapSelector.vue";
import Sidebar from "@/components/Sidebar.vue";
import MapLegend from "@/components/MapLegend.vue";

import { changeMapStyle, prepareMapLegendLayers, prepareCoordinatesForSelectedFeature } from "@/src/mapFunctions.ts";

export default {
  components: {
    BasemapSelector,
    Sidebar,
    MapLegend,
  },
  props: [
    "alertResources",
    "alertsData",
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
    "mapeoData",
    "mediaBasePath",
    "planetApiKey",
    "statistics",
  ],
  data() {
    return {
      calculateHectares: false,
      dateOptions: [],
      downloadAlert: false,
      featuresUnderCursor: 0,
      hasLineStrings: false,
      imageUrl: [],
      isAlert: false,
      map: null,
      mapeoDataColor: null,
      mapLegendContent: null,
      selectedDateRange: null,
      selectedFeature: null,
      selectedFeatureGeojson: null,
      selectedFeatureId: null,
      selectedFeatureSource: null,
      showBasemapSelector: false,
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
        return this.alertsData;
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
          ...this.alertsData.mostRecentAlerts,
          features: filterFeatures(this.alertsData.mostRecentAlerts.features),
        },
        previousAlerts: {
          ...this.alertsData.previousAlerts,
          features: filterFeatures(this.alertsData.previousAlerts.features),
        },
      };
    },
  },
  methods: {
    addAlertsData() {
      const geoJsonSource = this.alertsData;

      // Check if the data contains Polygon features for recent alerts
      if (
        geoJsonSource.mostRecentAlerts.features.some(
          (feature) => feature.geometry.type === "Polygon",
        )
      ) {
        // Add the most recent alerts source to the map as Polygons
        if (!this.map.getSource("most-recent-alerts-polygon")) {
          this.map.addSource("most-recent-alerts-polygon", {
            type: "geojson",
            data: {
              ...geoJsonSource.mostRecentAlerts,
              features: geoJsonSource.mostRecentAlerts.features.filter(
                (feature) => feature.geometry.type === "Polygon",
              ),
            },
          });
        }

        // Add a layer for most recent alerts Polygons
        if (!this.map.getLayer("most-recent-alerts-polygon")) {
          this.map.addLayer({
            id: "most-recent-alerts-polygon",
            type: "fill",
            source: "most-recent-alerts-polygon",
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
        }

        // Add a stroke for most recent alerts Polygons
        if (!this.map.getLayer("most-recent-alerts-stroke-polygon")) {
          this.map.addLayer({
            id: "most-recent-alerts-stroke-polygon",
            type: "line",
            source: "most-recent-alerts-polygon",
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
      }

      // Check if the data contains LineString features for recent alerts
      if (
        geoJsonSource.mostRecentAlerts.features.some(
          (feature) => feature.geometry.type === "LineString",
        )
      ) {
        // Add the most recent alerts source to the map as LineStrings
        if (!this.map.getSource("most-recent-alerts-linestring")) {
          this.map.addSource("most-recent-alerts-linestring", {
            type: "geojson",
            data: {
              ...geoJsonSource.mostRecentAlerts,
              features: geoJsonSource.mostRecentAlerts.features.filter(
                (feature) => feature.geometry.type === "LineString",
              ),
            },
          });
        }

        // Add a layer for most recent alerts LineStrings
        if (!this.map.getLayer("most-recent-alerts-linestring")) {
          this.map.addLayer({
            id: "most-recent-alerts-linestring",
            type: "line",
            source: "most-recent-alerts-linestring",
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
      }

      // Check if the data contains Polygon features for previous alerts
      if (
        geoJsonSource.previousAlerts.features.some(
          (feature) => feature.geometry.type === "Polygon",
        )
      ) {
        // Add the previous alerts source to the map as Polygons
        if (!this.map.getSource("previous-alerts-polygon")) {
          this.map.addSource("previous-alerts-polygon", {
            type: "geojson",
            data: {
              ...geoJsonSource.previousAlerts,
              features: geoJsonSource.previousAlerts.features.filter(
                (feature) => feature.geometry.type === "Polygon",
              ),
            },
          });
        }

        // Add a layer for previous alerts Polygons
        if (!this.map.getLayer("previous-alerts-polygon")) {
          this.map.addLayer({
            id: "previous-alerts-polygon",
            type: "fill",
            source: "previous-alerts-polygon",
            paint: {
              "fill-color": [
                "case",
                ["boolean", ["feature-state", "selected"], false],
                "#FFFF00",
                "#FD8D3C",
              ],
              "fill-opacity": 0.5,
            },
          });
        }

        // Add a stroke for previous alerts Polygons
        if (!this.map.getLayer("previous-alerts-stroke-polygon")) {
          this.map.addLayer({
            id: "previous-alerts-stroke-polygon",
            type: "line",
            source: "previous-alerts-polygon",
            paint: {
              "line-color": [
                "case",
                ["boolean", ["feature-state", "selected"], false],
                "#FFFF00",
                "#FD8D3C",
              ],
              "line-width": 2,
            },
          });
        }
      }

      // Check if the data contains LineString features for previous alerts
      if (
        geoJsonSource.previousAlerts.features.some(
          (feature) => feature.geometry.type === "LineString",
        )
      ) {
        // Add the previous alerts source to the map as LineStrings
        if (!this.map.getSource("previous-alerts-linestring")) {
          this.map.addSource("previous-alerts-linestring", {
            type: "geojson",
            data: {
              ...geoJsonSource.previousAlerts,
              features: geoJsonSource.previousAlerts.features.filter(
                (feature) => feature.geometry.type === "LineString",
              ),
            },
          });
        }

        // Add a layer for previous alerts linestrings
        if (!this.map.getLayer("previous-alerts-linestring")) {
          this.map.addLayer({
            id: "previous-alerts-linestring",
            type: "line",
            source: "previous-alerts-linestring",
            filter: ["==", "$type", "LineString"],
            paint: {
              "line-color": [
                "case",
                ["boolean", ["feature-state", "selected"], false],
                "#FFFF00",
                "#FD8D3C",
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
      }

      // Add event listeners for layers that start with 'most-recent-alerts' and 'alerts'
      this.map.getStyle().layers.forEach((layer) => {
        if (
          layer.id.startsWith("most-recent-alerts") && !layer.id.includes("stroke") ||
          layer.id.startsWith("previous-alerts") && !layer.id.includes("stroke")
        ) {
          this.map.on("mouseenter", layer.id, () => {
            this.featuresUnderCursor++;
            this.map.getCanvas().style.cursor = "pointer";
          });
          this.map.on("mouseleave", layer.id, () => {
            this.featuresUnderCursor--;
            if (this.featuresUnderCursor === 0) {
              this.map.getCanvas().style.cursor = "";
            }
          });
          this.map.on("click", layer.id, (e) => {
            this.selectFeature(e.features[0], layer.id);
          });
        }
      });

      // Check mostRecentAlerts and previousAlerts for LineString features
      // If found, set hasLineStrings state to true to activate methods
      // relevant to lineStrings
      this.hasLineStrings =
        geoJsonSource.mostRecentAlerts.features.some(
          (feature) => feature.geometry.type === "LineString",
        ) ||
        geoJsonSource.previousAlerts.features.some(
          (feature) => feature.geometry.type === "LineString",
        );
    },

    addMapeoData() {
      // Create a GeoJSON source with all the features
      const geoJsonSource = {
        type: "FeatureCollection",
        features: this.mapeoData.map((feature) => ({
          id: feature.Id,
          type: "Feature",
          geometry: {
            type: feature.Geotype,
            coordinates: feature.Geocoordinates,
          },
          properties: {
            ...feature
          },
        })),
      };

      this.mapeoDataColor = this.mapeoData[0]["filter-color"];

      // Add the source to the map
      if (!this.map.getSource("mapeo-data")) {
        this.map.addSource("mapeo-data", {
          type: "geojson",
          data: geoJsonSource,
          generateId: true
        });
      }

      // Add a layer for Point features
      if (!this.map.getLayer("mapeo-data")) {
        this.map.addLayer({
          id: "mapeo-data",
          type: "circle",
          source: "mapeo-data",
          filter: ["==", "$type", "Point"],
          paint: {
            "circle-radius": 5,
            "circle-color": [
              // Use filter-color for fallback if selected is false
              "case",
              ["boolean", ["feature-state", "selected"], false],
              "#FFFF00",
              ["get", "filter-color"],
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#fff",
          },
        });    
      }
      
      // Add event listeners
      [
        "mapeo-data"
      ].forEach((layerId) => {
        this.map.on("mouseenter", layerId, () => {
          this.featuresUnderCursor++;
          this.map.getCanvas().style.cursor = "pointer";
        });
        this.map.on("mouseleave", layerId, () => {
          this.featuresUnderCursor--;
            if (this.featuresUnderCursor === 0) {
              this.map.getCanvas().style.cursor = "";
            }
        });
        this.map.on("click", layerId, (e) => {
          this.selectFeature(e.features[0], layerId);
        });
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
            border: 5px solid #FF0000;
            border-radius: inherit;
            box-shadow: 0 0 0 2px #FF0000;
            animation: pulse 2s infinite;
          }
        `;
      const styleSheet = document.createElement("style");
      styleSheet.type = "text/css";
      styleSheet.innerText = styles;
      document.head.appendChild(styleSheet);

      // Check for sources that start with 'most-recent-alerts'
      const sources = this.map.getStyle().sources;
      const recentAlertsSources = Object.keys(sources).filter((source) =>
        source.startsWith("most-recent-alerts"),
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
          let lng, lat;

          if (feature.geometry.type === "Polygon") {
            // Calculate the center of the bounding box
            const bounds = bbox(feature);
            lng = (bounds[0] + bounds[2]) / 2;
            lat = (bounds[1] + bounds[3]) / 2;
          } else if (feature.geometry.type === "LineString") {
            // Use Turf to find the midpoint of the LineString
            const line = lineString(feature.geometry.coordinates);
            const lineLength = length(line, { units: "kilometers" });
            const midpoint = along(line, lineLength / 2, {
              units: "kilometers",
            });
            lng = midpoint.geometry.coordinates[0];
            lat = midpoint.geometry.coordinates[1];
          } else if (feature.geometry.type === "Point") {
            [lng, lat] = feature.geometry.coordinates;
          } else {
            return;
          }

          // Create a new marker and add it to the map
          const pulsingMarker = pulsingDot.cloneNode();
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

    handleBasemapChange(newBasemap) {
      this.removePulsingCircles();
      changeMapStyle(this.map, newBasemap, this.planetApiKey);

      // Once map is idle, re-add sources, layers, and event listeners
      this.map.once("idle", () => {
        this.prepareMapCanvasContent();
      });
    },

    handleBufferClick(e) {
      const pixelBuffer = 10;
      const bbox = [
        [e.point.x - pixelBuffer, e.point.y - pixelBuffer],
        [e.point.x + pixelBuffer, e.point.y + pixelBuffer]
      ];

      const features = this.map.queryRenderedFeatures(bbox, {
        layers: ['most-recent-alerts-linestring', 'previous-alerts-linestring']
      });

      if (features.length > 0) {
        const firstFeature = features[0];
        const layerId = firstFeature.layer.id; 
        this.selectFeature(firstFeature, layerId);      
      }
    },

    handleBufferMouseEvent(e) {
      const pixelBuffer = 10;
      const bbox = [
        [e.point.x - pixelBuffer, e.point.y - pixelBuffer],
        [e.point.x + pixelBuffer, e.point.y + pixelBuffer],
      ];

      const features = this.map.queryRenderedFeatures(bbox, {
        layers: ["most-recent-alerts-linestring", "previous-alerts-linestring"],
      });

      if (features.length) {
        this.map.getCanvas().style.cursor = "pointer";
      } else {
        this.map.getCanvas().style.cursor = "";
      }
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
            layer.id.startsWith("most-recent-alerts") ||
            layer.id.startsWith("previous-alerts")
          ) {
            this.map.setFilter(layer.id, [
              "all",
              [">=", ["get", "YYYYMM"], startDate],
              ["<=", ["get", "YYYYMM"], endDate],
            ]);
          }
        });

        // If 'most-recent-alerts' layers are empty, remove the pulsing circles. If not, add them.
        const recentAlertsLayers = this.map
          .getStyle()
          .layers.filter((layer) => layer.id.startsWith("most-recent-alerts"));
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
        ...this.alertsData.mostRecentAlerts.features,
        ...this.alertsData.previousAlerts.features,
      ];
      return allFeatures.every(
        (feature) => feature.geometry.type === "LineString",
      );
    },

    prepareMapCanvasContent() {
      if (this.alertsData) {
        this.addAlertsData();
      }
      if (this.mapeoData) {
        this.addMapeoData();
      }
      this.addPulsingCircles();
      this.prepareMapLegendContent();

      // Add buffer for LineStrings to make them easier to select
      if (this.hasLineStrings) {
        this.map.on("mousemove", this.handleBufferMouseEvent);
        this.map.on('click', this.handleBufferClick);
      }
    },

    prepareMapLegendContent() {
      this.map.once("idle", () => {
        let mapLegendLayerIds;

        // Add most-recent-alerts & previous-alerts layers to mapLegendContent
        mapLegendLayerIds = this.mapLegendLayerIds;
        if (this.hasLineStrings) {
          mapLegendLayerIds = "most-recent-alerts-linestring,previous-alerts-linestring," + mapLegendLayerIds;
        } else {
          mapLegendLayerIds = "most-recent-alerts-polygon,previous-alerts-polygon," + mapLegendLayerIds;
        }

        // Add mapeo-data layer to mapLegendContent
        if (this.mapeoData) {
          mapLegendLayerIds = "mapeo-data," + mapLegendLayerIds;
        }

        // if there are no layers to show in the legend, return
        if (!mapLegendLayerIds) {
          return;
        }
        
        this.mapLegendContent = prepareMapLegendLayers(
          this.map,
          mapLegendLayerIds,
          this.mapeoDataColor,
        );
      });
    },

    removePulsingCircles() {
      document.querySelectorAll(".pulsing-dot").forEach((el) => el.remove());
    },

    resetSelectedFeature() {
      if (this.selectedFeatureId === null || !this.selectedFeatureSource) {
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

      // Reset the filters for layers that start with 'most-recent-alerts' and 'alerts'
      this.map.getStyle().layers.forEach((layer) => {
        if (
          layer.id.startsWith("most-recent-alerts") ||
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

    selectFeature(feature, layerId) {
      let featureObject = feature.properties;

      const featureGeojson = {
        type: feature.type,
        geometry: feature.geometry,
        properties: feature.properties,
      };
      const featureId = feature.id;

      // Reset the previously selected feature
      if (this.selectedFeatureId !== null && this.selectedFeatureSource) {
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
        { source: layerId, id: featureId },
        { selected: true },
      );

      delete featureObject["YYYYMM"];

      // Update component state
      this.selectedFeature = featureObject;
      this.selectedFeatureGeojson = featureGeojson;
      this.selectedFeatureId = featureId;
      this.selectedFeatureSource = layerId;
      this.showSidebar = true;
      this.showIntroPanel = false;
      this.downloadAlert = true;

      if (featureObject["Alert ID"]) {
        this.isAlert = true;
      } else {
        this.isAlert = false;
      }

      // Fields that may or may not exist, depending on views config
      this.imageUrl = [];
      featureObject.t0_url && this.imageUrl.push(featureObject.t0_url);
      featureObject.t1_url && this.imageUrl.push(featureObject.t1_url);
      featureObject["Photos"] && this.imageUrl.push(featureObject["Photos"]);
      delete featureObject["t0_url"], delete featureObject["t1_url"];
      delete featureObject["filter-color"];

      // Rewrite coordinates string from [long, lat] to lat, long, removing brackets
      if (featureObject.Geocoordinates) {
        featureObject.Geocoordinates = prepareCoordinatesForSelectedFeature(featureObject.Geocoordinates);
      }

      this.removePulsingCircles();
    }
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

      this.prepareMapCanvasContent();

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

      this.showBasemapSelector = true;

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
