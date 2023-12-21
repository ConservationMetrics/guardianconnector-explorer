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
      @close="showSidebar = false"
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
      imageUrl: [],
      imageCaption: null,
      previewMapLink: null
    };
  },
  computed: {
  },
  methods: {
    addDataToMap() {
      const geoJsonSource = this.data;

      console.log(geoJsonSource)


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
          "fill-color": "#EC00FF",
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
          "line-color": "#EC00FF",
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
          "fill-color": "#FF0000",
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
          "line-color": "#FF0000",
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
          this.imageUrl = [e.features[0].properties.image_url];
          this.imageCaption = "Imagery source: " + e.features[0].properties.image_caption;
          this.previewMapLink = [e.features[0].properties.preview_link];
          delete featureObject["image_url"];
          delete featureObject["image_caption"];
          delete featureObject["preview_link"];
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
