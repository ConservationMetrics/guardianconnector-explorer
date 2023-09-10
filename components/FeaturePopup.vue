<template>
  <div v-if="showSidebar" class="sidebar">
    <button class="close-btn" @click="$emit('close')">X</button>
    <Feature
      :mediaBasePath="mediaBasePath"
      :filePaths="filePaths"
      :feature="filteredFeature"
      :image-extensions="imageExtensions"
      :audio-extensions="audioExtensions"
      :video-extensions="videoExtensions"
    />
  </div>
</template>

<script>
import Feature from "@/components/Feature.vue";

export default {
  components: { Feature },
  props: [
    "mediaBasePath",
    "filePaths",
    "feature",
    "imageExtensions",
    "audioExtensions",
    "videoExtensions",
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
