<template>
  <div id="map">
    <DataFilter v-if="filterData === true" :data="data" :filter-field="filterField" @filter="filter" />
    <FeaturePopup :show-sidebar="showSidebar" :embed-media="embedMedia" :media-base-path="mediaBasePath"
      :file-paths="getFilePaths(selectedFeature, allExtensions)" :feature="selectedFeature"
      :image-extensions="imageExtensions" :audio-extensions="audioExtensions" :video-extensions="videoExtensions"
      @close="showSidebar = false" />
  </div>
</template>

<script>
import mapboxgl from "mapbox-gl";
import DataFilter from "@/components/DataFilter.vue";
import FeaturePopup from "@/components/FeaturePopup.vue";
import getFilePaths from "@/src/utils.ts";

export default {
  components: { DataFilter, FeaturePopup },
  props: [
    "data",
    "filterData",
    "filterField",
    "imageExtensions",
    "audioExtensions",
    "videoExtensions",
    "embedMedia",
    "mediaBasePath",
    "mapboxAccessToken",
    "mapboxStyle",
    "mapboxProjection",
    "mapboxLatitude",
    "mapboxLongitude",
    "mapboxZoom",
    "mapboxPitch",
    "mapboxBearing",
    "mapbox3d"
  ],
  data() {
    return {
      showSidebar: false,
      selectedFeature: null,
      processedData: [],
      filteredData: [],
      colorMap: new Map(),
    };
  },
  watch: {
    data: {
      immediate: true,
      handler(newData) {
        this.processedData = newData.map(this.processGeolocation);
      },
    },
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
    filter(value) {
      if (value === 'null') {
        this.filteredData = this.processedData;
      } else {
        this.filteredData = this.processedData.filter(item => item[this.filterField] === value);
      }
      this.addDataToMap(); // Call this method to update the map data
    },

    getFilePaths: getFilePaths,

    getRandomColor() {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    },

    // Process different geometry types and extract coordinates
    processGeolocation(obj) {
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
    },

    onFeatureClick(feature) {
      this.selectedFeature = feature;
      this.showSidebar = true;
    },

    addDataToMap() {
      // Remove existing data layers from the map
      if (this.map) {
        this.map.getStyle().layers.forEach(layer => {
          if (layer.id.startsWith('Point-') || layer.id.startsWith('LineString-') || layer.id.startsWith('Polygon-')) {
            this.map.removeLayer(layer.id);
            this.map.removeSource(layer.id);
          }
        });
      }

      this.filteredData.forEach((feature) => {
        feature = this.processGeolocation(feature);
        const geoJsonFeature = {
          type: "Feature",
          geometry: {
            type: feature.Geotype,
            coordinates: feature.Geocoordinates,
          },
        };

        let color = this.colorMap.get(feature[this.filterField]);
        if (!color) {
          color = this.getRandomColor();
          this.colorMap.set(feature[this.filterField], color);
        }

        // Process and render Point geometry
        if (geoJsonFeature.geometry.type === "Point") {
          const id = feature.Id;
          const pointLayer = {
            id: `Point-${id}`, // Unique ID for the layer
            type: 'circle',
            source: {
              type: "geojson",
              data: geoJsonFeature,
            },
            paint: {
              'circle-radius': 6,
              'circle-color': color,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#fff'
            },
          };
          this.map.addLayer(pointLayer);

          this.map.on("mouseenter", pointLayer.id, () => {
            this.map.getCanvas().style.cursor = "pointer";
          });
          this.map.on("mouseleave", pointLayer.id, () => {
            this.map.getCanvas().style.cursor = "";
          });

          this.map.on("click", pointLayer.id, () => {
            this.selectedFeature = feature;
            this.showSidebar = true;
          });
        }

        // Process and render LineString or Polygon geometry
        else if (geoJsonFeature.geometry.type === "LineString" || geoJsonFeature.geometry.type === "Polygon") {
          const geometryType = geoJsonFeature.geometry.type;
          const id = feature.Id;

          const featureLayer = {
            id: `${geometryType}-${id}`, // Unique ID for the layer
            type: geometryType === "Polygon" ? "fill" : "line",
            source: {
              type: "geojson",
              data: geoJsonFeature,
            },
            paint: {
              ...(geometryType === "Polygon" && {
                "fill-color": "#3FB1CE",
                "fill-opacity": 0.75,
              }),
              ...(geometryType === "LineString" && {
                "line-color": "#3FB1CE",
                "line-opacity": 0.75,
                "line-width": 8,
              }),
            },
          };

          // TODO: get these event listeners working for non-Point geometries
          if (geometryType === "Polygon" || geometryType === "LineString") {
            this.map.on("mouseenter", featureLayer.id, () => {
              this.map.getCanvas().style.cursor = "pointer";
            });
            this.map.on("mouseleave", featureLayer.id, () => {
              this.map.getCanvas().style.cursor = "";
            });
          }

          this.map.on("click", featureLayer.id, () => {
            this.selectedFeature = feature;
            this.showSidebar = true;
          });

          this.map.addLayer(featureLayer);
        }
      });
    },
  },
  mounted() {
    mapboxgl.accessToken = this.mapboxAccessToken;

    this.map = new mapboxgl.Map({
      container: "map",
      style: this.mapboxStyle || "mapbox://styles/mapbox/streets-v12",
      projection: this.mapboxProjection || "globe",
      center: [
        this.mapboxLongitude || 0,
        this.mapboxLatitude || -15
      ],
      zoom: this.mapboxZoom || 2.5,
      pitch: this.mapboxPitch || 0,
      bearing: this.mapboxBearing || 0,
    });

    this.filteredData = this.data; // Initialize filteredData with the original data
    this.map.on("load", () => {

      // Add 3D Terrain if set in env var
      console.log(this.mapbox3d)
      if (this.mapbox3d) {
        this.map.addSource('mapbox-dem', {
          'type': 'raster-dem',
          'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
          'tileSize': 512,
          'maxzoom': 14
        });
        this.map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
      }

      this.addDataToMap();
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
