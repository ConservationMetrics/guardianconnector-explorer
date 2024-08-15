<template>
  <div class="feature p-4 rounded-lg shadow-lg">
    <div
      v-for="(value, key) in sortedFeature"
      :key="key"
      v-if="key.toLowerCase().includes('data source')"
      class="mt-4"
    >
      <h1 class="text-2xl font-bold">{{ value }} data</h1>
    </div>
    <div
      v-if="embedMedia && (!isAlert || (isAlert && alertResources))"
      :class="{ 'flex-container': alertResources }"
    >
      <Media
        v-if="embedMedia"
        v-for="filePath in filePaths"
        :alert-resources="alertResources"
        :audio-extensions="audioExtensions"
        :filePath="filePath"
        :image-extensions="imageExtensions"
        :key="filePath"
        :mediaBasePath="setMediaBasePath()"
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
          key.toLowerCase() !== 'audio' &&
          !key.toLowerCase().includes('data source')
        "
        class="mb-2"
      >
        <span class="font-bold">{{
          $t(key).charAt(0).toUpperCase() + $t(key).slice(1)
        }}</span
        >:
        <span
          v-if="key !== 'geographicCentroid' && key !== 'geocoordinates'"
          class="break-words"
          >{{ value }}</span
        >
        <span v-else>
          {{ value }}
          <!-- guide on Google search URL construction here: https://developers.google.com/maps/documentation/urls/get-started-->
          <a
            :href="'https://www.google.com/maps/search/?api=1&query=' + value"
            target="_blank"
            >({{ $t("viewOnGoogleMaps") }})</a
          >
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import Media from "~/components/shared/Media.vue";

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
    "alertResources",
    "audioExtensions",
    "embedMedia",
    "feature",
    "filePaths",
    "imageExtensions",
    "isAlert",
    "mediaBasePath",
    "mediaBasePathAlerts",
    "videoExtensions",
  ],
  methods: {
    setMediaBasePath() {
      if (this.isAlert) {
        return this.mediaBasePathAlerts;
      } else {
        return this.mediaBasePath;
      }
    },
  },
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
