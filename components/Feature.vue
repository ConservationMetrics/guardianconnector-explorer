<template>
  <div class="feature p-4 rounded-lg shadow-lg">
    <!-- Conditional rendering depending on file extension -->
    <Media
      v-if="embedMedia === true"
      v-for="filePath in filePaths"
      :key="filePath"
      :mediaBasePath="mediaBasePath"
      :filePath="filePath"
      :image-caption="imageCaption"
      :image-extensions="imageExtensions"
      :audio-extensions="audioExtensions"
      :video-extensions="videoExtensions"
    />
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
        <a :href="'https://www.google.com/maps/search/' + value" target="_blank">(view on Google maps)</a>
      </span>
      </div>
      <span v-if="previewMapLink">
            <a
              class="text-blue-500 hover:text-blue-700"
              :href="mediaBasePath + '/' + previewMapLink + '?inline=true'"
              target="_blank"
              >Preview Map (not working yet)</a
            >
          </span>
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
    "previewMapLink",
    "mediaBasePath",
    "filePaths",
    "feature",
    "imageCaption",
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
</style>
