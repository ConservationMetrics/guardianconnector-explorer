<template>
  <div v-if="showSidebar" class="sidebar" @scroll="handleScroll">
    <div class="scroll-indicator" v-if="!scrolled">&#x2193;</div>
    <button class="close-btn" @click="$emit('close')">X</button>
    <AlertsIntroPanel
      v-if="showIntroPanel"
      :calculate-hectares="calculateHectares"
      :date-options="dateOptions"
      :geojson-selection="geojsonSelection"
      :logo-url="logoUrl"
      :show-slider="showSlider"
      :statistics="statistics"
      @date-range-changed="$emit('date-range-changed', $event)"
    />
    <Feature
      v-if="feature"
      :alert-resources="alertResources"
      :audio-extensions="audioExtensions"
      :embed-media="embedMedia"
      :feature="filteredFeature"
      :file-paths="filePaths"
      :image-extensions="imageExtensions"
      :is-alert="isAlert"
      :media-base-path="mediaBasePath"
      :media-base-path-alerts="mediaBasePathAlerts"
      :video-extensions="videoExtensions"
    />
    <Download
      v-if="downloadAlert"
      :geojson="featureGeojson"
      :type-of-data="'alert'"
    />
  </div>
</template>

<script>
import Download from "@/components/Download.vue";
import Feature from "@/components/Feature.vue";
import AlertsIntroPanel from "@/components/AlertsIntroPanel.vue";

export default {
  components: { AlertsIntroPanel, Download, Feature },
  props: [
    "alertResources",
    "audioExtensions",
    "calculateHectares",
    "dateOptions",
    "downloadAlert",
    "embedMedia",
    "feature",
    "featureGeojson",
    "filePaths",
    "geojsonSelection",
    "imageExtensions",
    "isAlert",
    "logoUrl",
    "mediaBasePath",
    "mediaBasePathAlerts",
    "showIntroPanel",
    "showSidebar",
    "showSlider",
    "statistics",
    "videoExtensions",
  ],

  data() {
    return {
      scrolled: false,
    };
  },

  methods: {
    handleScroll(event) {
      if (!this.scrolled && event.target.scrollTop > 0) {
        this.scrolled = true;
      }
    },
  },

  computed: {
    filteredFeature() {
      const { latitude, longitude, ...rest } = this.feature;
      return rest;
    },
  },
  watch: {
    // Show pulsing down arrow when sidebar has new feature or is opened anew
    feature(newValue) {
      if (newValue) {
        this.scrolled = false;
      }
    },
    showSidebar(newValue) {
      if (newValue) {
        this.scrolled = false;
      }
    },
  },
};
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 400px;
  background: white;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  z-index: 1000;
}

@media (max-width: 768px) {
  .sidebar {
    height: 50%;
    width: 100%;
    bottom: 0;
    top: auto;
  }

  .scroll-indicator {
    display: block !important;
  }
}

.scroll-indicator {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 46px;
  font-weight: bold;
  color: #333;
  animation: pulse 1s infinite;
  display: none;
}

@keyframes pulse {
  0% {
    transform: translateX(-50%) scale(1);
  }
  50% {
    transform: translateX(-50%) scale(1.2); /* Slightly larger */
  }
  100% {
    transform: translateX(-50%) scale(1);
  }
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
}
</style>
