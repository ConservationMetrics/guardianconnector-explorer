<template>
  <div v-if="showSidebar" class="sidebar">
    <button class="close-btn" @click="$emit('close')">X</button>
    <Feature
      :embed-media="embedMedia"
      :preview-map-link="previewMapLink"
      :mediaBasePath="mediaBasePath"
      :filePaths="filePaths"
      :feature="filteredFeature"
      :image-caption="imageCaption"
      :image-extensions="imageExtensions"
      :audio-extensions="audioExtensions"
      :video-extensions="videoExtensions"
    />
    <Download v-if="showDownloadButtons" :feature-geojson="featureGeojson" />
  </div>
</template>

<script>
import Feature from "@/components/Feature.vue";
import Download from "@/components/Download.vue";

export default {
  components: { Feature, Download },
  props: [
    "embedMedia",
    "previewMapLink",
    "mediaBasePath",
    "filePaths",
    "feature",
    "featureGeojson",
    "imageCaption",
    "imageExtensions",
    "audioExtensions",
    "videoExtensions",
    "showDownloadButtons",
    "showSidebar",
  ],
  computed: {
    filteredFeature() {
      const { latitude, longitude, ...rest } = this.feature;
      return rest;
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

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
}
</style>
