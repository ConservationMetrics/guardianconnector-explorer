<template>
  <div id="map">
    <button v-if="!showSidebar" @click="resetToInitialState" class="reset-button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mx-2">Reset Dashboard</button>
    <FeaturePopup
      :all-data-geojson="data"
      :embed-media="embedMedia"
      :feature="selectedFeature"
      :feature-geojson="selectedFeatureGeojson"
      :file-paths="imageUrl"
      :image-caption="imageCaption"
      :image-extensions="imageExtensions"
      :preview-map-link="previewMapLink"
      :media-base-path="mediaBasePath"      
      :show-sidebar="showSidebar"
      :show-intro-panel="showIntroPanel"
      :download-alert="downloadAlert"
      :statistics="statistics"
      @close="handleSidebarClose"
    />
    <vue-slider
      class="date-slider rounded-lg shadow-lg"
      v-model="dateOptions"
      :data="dateOptions"
      :value="dateOptions"
      :contained="true"
      :tooltip="'always'"
      :tooltipPlacement="'bottom'"
      :width="200"
      :height="6"
      :marks="dateOptions"
    />
  </div>
</template>
  
<script>
import mapboxgl from "mapbox-gl";
import bbox from '@turf/bbox';
import FeaturePopup from "./FeaturePopup.vue";

export default {
  components: { 
    FeaturePopup
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
      dateOptions: [],
      downloadAlert: false,
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
  },
  methods: {
    resetToInitialState() {
      this.resetSelectedFeature();
      this.showSidebar = true;
      this.showIntroPanel = true;
      this.downloadAlert = false;
      this.imageUrl = [];
      this.imageCaption = null;
      this.previewMapLink = null;

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
      let dates = [];
      dates.push('01-2024')
      this.data.mostRecentAlerts.features.forEach(feature => {
        dates.push(feature.properties["Month detected"]);
      });
      this.data.otherAlerts.features.forEach(feature => {
        dates.push(feature.properties["Month detected"]);
      });
      // Remove duplicates and sort
      dates = [...new Set(dates)].sort((a, b) => new Date(a.split('-')[1], a.split('-')[0]) - new Date(b.split('-')[1], b.split('-')[0]));
      return dates;
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

.date-slider {
  position: absolute;
  top: 25px;
  right: 60px;
  z-index: 10;
  background-color: white;
  margin: 20px;
}
</style>
