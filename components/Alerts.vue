<template>
  <div id="map">
    <FeaturePopup
      :embed-media="embedMedia"
      :feature="selectedFeature"
      :file-paths="imageUrl"
      :image-caption="imageCaption"
      :image-extensions="imageExtensions"
      :preview-map-link="previewMapLink"
      :media-base-path="mediaBasePath"      
      :show-sidebar="showSidebar"
      @close="resetSelectedFeature"
    />
  </div>
</template>
  
<script>
import mapboxgl from "mapbox-gl";

export default {
  components: { },
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
    "mapbox3d"
  ],
  data() {
    return {
      showSidebar: false,
      selectedFeature: null,
      selectedFeatureId: null,
      selectedFeatureSource: null,
      imageUrl: [],
      imageCaption: null,
      previewMapLink: null
    };
  },
  computed: {
  },
  methods: {
    resetSelectedFeature() {
      if (this.selectedFeatureId && this.selectedFeatureSource) {
        // Reset the feature state of the previously selected feature
        this.map.setFeatureState(
          { source: this.selectedFeatureSource, id: this.selectedFeatureId },
          { selected: false }
        );

        // Reset the component state
        this.selectedFeatureId = null;
        this.selectedFeatureSource = null;
        this.selectedFeature = null;
        this.showSidebar = false;
      }
    },

    calculateCentroid(coords) {
        let totalLat = 0;
        let totalLng = 0;
        const numCoords = coords.length;

        coords.forEach(coord => {
            totalLng += coord[0]; // Longitude is the first element
            totalLat += coord[1]; // Latitude is the second element
        });

        const avgLng = (totalLng / numCoords).toFixed(6);
        const avgLat = (totalLat / numCoords).toFixed(6);

        return `${avgLat}, ${avgLng}`;
    },

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
      [
        "recent-alerts",
        "alerts",
      ].forEach((layerId) => {
        this.map.on("mouseenter", layerId, () => {
          this.map.getCanvas().style.cursor = "pointer";
        });
        this.map.on("mouseleave", layerId, () => {
          this.map.getCanvas().style.cursor = "";
        });
        this.map.on("click", layerId, (e) => {
          let featureObject = e.features[0].properties;
          featureObject["Geographic centroid"] = this.calculateCentroid(e.features[0].geometry.coordinates[0]);
          let featureId = e.features[0].id;

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
          this.selectedFeatureId = featureId;
          this.selectedFeatureSource = layerId;
          this.selectedFeature = featureObject;
          this.showSidebar = true;

          // Fields that may or may not exist, depending on views config
          let imageUrl = featureObject.image_url;
          imageUrl && (this.imageUrl = [imageUrl]);
          let imageCaption = featureObject.image_caption;
          imageCaption && (this.imageCaption = "Imagery source: " + imageCaption);
          let previewMapLink = featureObject.preview_link;
          previewMapLink && (this.previewMapLink = previewMapLink);
          delete featureObject["image_url"], delete featureObject["image_caption"], delete featureObject["preview_link"];

          // Update component state
          this.selectedFeatureId = featureId;
          this.selectedFeature = featureObject;
          this.showSidebar = true;
        });
      });
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

      this.addDataToMap();

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
