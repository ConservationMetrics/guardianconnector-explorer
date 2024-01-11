<template>
  <div>
    <div id="map"></div>
    <DataFilter
      v-if="filterData === true"
      :data="data"
      :filter-field="filterField"
      :show-colored-dot="true"
      @filter="filterValues"
    />
    <Sidebar
      :audio-extensions="audioExtensions"
      :embed-media="embedMedia"
      :feature="selectedFeature"
      :file-paths="getFilePathsWithExtension(selectedFeature, allExtensions)"
      :image-extensions="imageExtensions"
      :media-base-path="mediaBasePath"
      :show-sidebar="showSidebar"
      :video-extensions="videoExtensions"
      @close="showSidebar = false"
    />
    <MapLegend 
      v-if="mapLegendContent && map"
      :map-legend-content="mapLegendContent"
    />
  </div>
</template>

<script>
import mapboxgl from "mapbox-gl";

import DataFilter from "@/components/DataFilter.vue";
import MapLegend from "@/components/MapLegend.vue";
import Sidebar from "@/components/Sidebar.vue";

import { getFilePathsWithExtension } from "@/src/utils.ts";
import { prepareMapLegendLayers } from "@/src/mapFunctions.ts";

export default {
  components: { DataFilter, MapLegend, Sidebar },
  props: [
    "audioExtensions",
    "data",
    "embedMedia",
    "filterData",
    "filterField",
    "imageExtensions",
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
    "videoExtensions",
  ],
  data() {
    return {
      colorMap: new Map(),
      filteredData: [],
      map: null,
      mapLegendContent: null,
      processedData: [],
      selectedFeature: null,
      showSidebar: false,
    };
  },
  computed: {
    allExtensions() {
      return [
        ...this.imageExtensions,
        ...this.audioExtensions,
        ...this.videoExtensions,
      ];
    },
  },
  methods: {

    addDataToMap() {
      // Remove existing data layers from the map
      if (this.map) {
        this.map.getStyle().layers.forEach((layer) => {
          if (layer.id.startsWith("data-layer")) {
            if (this.map.getLayer(layer.id)) {
              this.map.removeLayer(layer.id);
            }
          }
        });
        if (this.map.getSource("data-source")) {
          this.map.removeSource("data-source");
        }
      }

      // Create a GeoJSON source with all the features
      const geoJsonSource = {
        type: "FeatureCollection",
        features: this.filteredData.map((feature) => ({
          type: "Feature",
          geometry: {
            type: feature.Geotype,
            coordinates: feature.Geocoordinates,
          },
          properties: {
            feature,
          },
        })),
      };

      // Add the source to the map
      this.map.addSource("data-source", {
        type: "geojson",
        data: geoJsonSource,
      });

      // Add a layer for Point features
      this.map.addLayer({
        id: "data-layer-point",
        type: "circle",
        source: "data-source",
        filter: ["==", "$type", "Point"],
        paint: {
          "circle-radius": 6,
          "circle-color": ["get", "filter-color", ["get", "feature"]],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        },
      });

      // Add a layer for LineString features
      this.map.addLayer({
        id: "data-layer-linestring",
        type: "line",
        source: "data-source",
        filter: ["==", "$type", "LineString"],
        paint: {
          "line-color": ["get", "filter-color", ["get", "feature"]],
          "line-width": 2,
        },
      });

      // Add a layer for Polygon features
      this.map.addLayer({
        id: "data-layer-polygon",
        type: "fill",
        source: "data-source",
        filter: ["==", "$type", "Polygon"],
        paint: {
          "fill-color": ["get", "filter-color", ["get", "feature"]],
          "fill-opacity": 0.5,
        },
      });

      // Add event listeners
      [
        "data-layer-point",
        "data-layer-linestring",
        "data-layer-polygon",
      ].forEach((layerId) => {
        this.map.on("mouseenter", layerId, () => {
          this.map.getCanvas().style.cursor = "pointer";
        });
        this.map.on("mouseleave", layerId, () => {
          this.map.getCanvas().style.cursor = "";
        });
        this.map.on("click", layerId, (e) => {
          let featureObject = JSON.parse(e.features[0].properties.feature);
          delete featureObject["filter-color"];
          this.selectedFeature = featureObject;
          this.showSidebar = true;
        });
      });
    },

    filterValues(values) {
      if (values.includes("null")) {
        this.filteredData = [...this.processedData];
      } else {
        this.filteredData = this.processedData.filter((item) =>
          values.includes(item[this.filterField])
        );
      }
      this.addDataToMap(); // Call this method to update the map data
    },

    getFilePathsWithExtension: getFilePathsWithExtension,

    prepareMapLegendContent() {
      if (!this.mapLegendLayerIds) {
        return;
      }
      this.map.once('idle', () => {
        this.mapLegendContent = prepareMapLegendLayers(this.map, this.mapLegendLayerIds);
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

    this.filteredData = this.data;
    this.processedData = this.data;

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
      this.prepareMapLegendContent();

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
      this.map.addControl(fullscreenControl, 'top-right')
    });
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
</style>
