<template>
  <div>
    <Gallery
      v-if="embedMedia && dataFetched"
      :audio-extensions="audioExtensions"
      :data="galleryData"
      :embed-media="embedMedia"
      :filter-data="filterData"
      :filter-column="filterColumn"
      :image-extensions="imageExtensions"
      :media-base-path="mediaBasePath"
      :video-extensions="videoExtensions"
    />
    <h3 v-if="!embedMedia && dataFetched">{{ $t("galleryNotAvailable") }}.</h3>
  </div>
</template>

<script>
import Gallery from "~/components/Gallery.vue";

export default {
  head() {
    return {
      title: "GuardianConnector Views: " + this.$t("gallery"),
    };
  },
  components: { Gallery },
  async asyncData({ params, $axios, app, redirect }) {
    // Get the current table name from the route parameters
    const table = params.tablename;

    // Set up the headers for the request
    let headers = {
      "x-api-key": app.$config.apiKey.replace(/['"]+/g, ""),
      "x-auth-strategy": app.$auth.strategy.name,
    };

    // If the authentication strategy is 'local', include the token in the headers
    if (app.$auth.strategy.name === "local") {
      const token = app.$auth.strategy.token.get();
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      // Use the table name in the API request
      const response = await $axios.$get(`/api/${table}/gallery`, { headers });

      // Return the data to be merged with the component's data
      return {
        audioExtensions: response.audioExtensions,
        dataFetched: true,
        embedMedia: response.embedMedia,
        filterData: response.filterData,
        filterColumn: response.filterColumn,
        galleryData: response.data,
        imageExtensions: response.imageExtensions,
        mediaBasePath: response.mediaBasePath,
        videoExtensions: response.videoExtensions,
      };
    } catch (error) {
      // Handle errors as appropriate
      console.error("Error fetching gallery data:", error);
      redirect("/");
      // Return default data
      return {
        dataFetched: false,
      };
    }
  },
};
</script>
