<template>
  <div class="feature p-4 rounded-lg shadow-lg">
    <!-- Conditional rendering depending on file extension -->
    <div v-if="alertResources" :class="{ 'flex-container': alertResources }">
    <Media
      v-if="embedMedia"
      v-for="filePath in filePaths"
      :key="filePath"
      :mediaBasePath="mediaBasePath"
      :filePath="filePath"
      :link-to-alert-resources="alertResources"
      :image-extensions="imageExtensions"
      :audio-extensions="audioExtensions"
      :video-extensions="videoExtensions"
    />
    </div>
    <div class="mt-4">
      <div
        v-for="(value, key) in sortedFeature"
        :key="key"
        v-if="
          value !== null &&
          value !== '' &&
          key.toLowerCase() !== 'uuid' &&
          !key.toLowerCase().includes('photo') &&
          key.toLowerCase() !== 'audio'
        "
        class="mb-2"
      >
      <span class="font-bold">{{ key }}</span>:
      <span v-if="key !== 'Geographic centroid'">{{ value }}</span>
      <span v-else>
        {{ value }} 
        <!-- guide on Google search URL construction here: https://developers.google.com/maps/documentation/urls/get-started-->
        <a :href="'https://www.google.com/maps/search/?api=1&query=' + value" target="_blank">(view on Google maps)</a>
      </span>
      </div>
    </div>
  </div>
</template>

<script>
import Media from "@/components/Media.vue";

export default {
  components: { Media },
  computed: {
    sortedFeature() {
      return Object.keys(this.feature)
        .sort()
        .reduce((obj, key) => {
          obj[key] = this.feature[key];
          return obj;
        }, {});
    },
  },
  props: [
    "embedMedia",
    "mediaBasePath",
    "filePaths",
    "feature",
    "alertResources",
    "imageExtensions",
    "audioExtensions",
    "videoExtensions",
  ],
  methods: {},
};
</script>

<style scoped>
  a {
    text-decoration: underline;
  }
  .flex-container {
    display: flex;
    justify-content: space-between;
    gap: 20px;
  }
  .flex-container > img {
    flex: 1 0 45%;
    max-width: calc(50% - 10px);
  }
</style>
