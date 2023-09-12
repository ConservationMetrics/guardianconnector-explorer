<template>
  <div id="map">
    <FeaturePopup
      :show-sidebar="showSidebar"
      :embed-media="embedMedia"
      :media-base-path="mediaBasePath"
      :file-paths="getFilePaths(selectedFeature, allExtensions)"
      :feature="selectedFeature"
      :image-extensions="imageExtensions"
      :audio-extensions="audioExtensions"
      :video-extensions="videoExtensions"
      @close="showSidebar = false"
    />
  </div>
</template>

<script>
import mapboxgl from "mapbox-gl";
import FeaturePopup from "@/components/FeaturePopup.vue";
import getFilePaths from "@/src/utils.ts";

export default {
  components: { FeaturePopup },
  props: [
    "data", 
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
    "mapboxBearing"
  ],
  data() {
    return {
      showSidebar: false,
      selectedFeature: null,
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
    getFilePaths: getFilePaths,

    // Process different geometry types and extract coordinates
    processGeolocation(obj) {
      try {
        const geometryType = obj.Geotype;
        let coordinates;

        // Convert string to array
        coordinates = JSON.parse(obj.Geocoordinates);

        if (
          geometryType === "Point" &&
          Array.isArray(coordinates) &&
          coordinates.length === 2
        ) {
          const [longitude, latitude] = coordinates;
          obj.latitude = latitude;
          obj.longitude = longitude;
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
      this.data.forEach((feature) => {
        feature = this.processGeolocation(feature);
        const geoJsonFeature = {
          type: "Feature",
          geometry: {
            type: feature.Geotype,
            coordinates: feature.Geocoordinates,
          },
        };

        // Process and render Point geometry
        if (geoJsonFeature.geometry.type == "Point") {
          const marker = new mapboxgl.Marker().setLngLat([
            feature.longitude,
            feature.latitude,
          ]);
          marker.getElement().style.cursor = "pointer"; // Change cursor to pointer
          marker.addTo(this.map);
          marker.getElement().addEventListener("click", () => {
            this.selectedFeature = feature;
            this.showSidebar = true;
          });
        }
        // Process and render LineString or Polygon geometry
        else if ( geoJsonFeature.geometry.type === "LineString" || geoJsonFeature.geometry.type === "Polygon") {
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

    this.map.on("load", this.addDataToMap);
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
  padding-left: 400px; /* to account for the sidebar */
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
