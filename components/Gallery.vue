<template>
  <div
    id="galleryContainer"
    class="gallery p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
  >
    <Feature
      v-for="(feature, index) in data"
      :key="index"
      :mediaBasePath="mediaBasePath"
      :filePaths="getFilePaths(feature, allExtensions)"
      :feature="feature"
      :image-extensions="imageExtensions"
      :audio-extensions="audioExtensions"
      :video-extensions="videoExtensions"
    />
  </div>
</template>

<script>
import Feature from "@/components/Feature.vue";
import getFilePaths from "@/src/utils.ts";

export default {
  components: { Feature },
  props: ["data", "imageExtensions", "audioExtensions", "videoExtensions"],
  data() {
    return {
      mediaBasePath: process.env.MEDIA_BASE_PATH || "",
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
  },
};
</script>

<style scoped></style>
