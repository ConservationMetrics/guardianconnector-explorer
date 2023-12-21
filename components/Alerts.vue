<template>
  <div id="map">
    <FeaturePopup
      :show-sidebar="showSidebar"
      :feature="selectedFeature"
      @close="showSidebar = false"
    />
  </div>
</template>
  
<script>
import mapboxgl from "mapbox-gl";
import getFilePaths from "@/src/utils.ts";

export default {
  components: { },
  props: [
    "data",
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
    "mapbox3d",
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
      ];
    },
  },
  methods: {
    getFilePaths: getFilePaths,

    onFeatureClick(feature) {
      this.selectedFeature = feature;
      this.showSidebar = true;
    },

    addDataToMap() {
      const geoJsonSource = this.data;

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
          "circle-color": "#FF0000",
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
          "line-color": "#FF0000",
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
          "fill-color": "#FF0000",
          "fill-opacity": 0.5,
        },
      });     
      
      // Add a stroke for Polygon features
      this.map.addLayer({
        id: "data-layer-polygon-outline",
        type: "line",
        source: "data-source",
        filter: ["==", "$type", "Polygon"],
        paint: {
          "line-color": "#FF0000",
          "line-width": 2,
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
          let featureObject = e.features[0].properties;
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
