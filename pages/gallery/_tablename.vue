<template>
  <div>
    <Gallery 
      v-if="embedMedia && dataFetched"
      :data="galleryData"
      :filter-data="filterData"
      :filter-field="filterField"
      :image-extensions="imageExtensions"
      :audio-extensions="audioExtensions"
      :video-extensions="videoExtensions"
      :embed-media="embedMedia"
      :media-base-path="mediaBasePath"
    />
    <h3 v-if="!embedMedia && dataFetched">
      GuardianConnector Views Gallery is not available. Please activate media embedding.
    </h3>
  </div>
</template>

<script>
import Gallery from "~/components/Gallery.vue";

export default {
  head() {
    return {
      title: 'GuardianConnector Views: Gallery'
    }
  },
  components: { Gallery },
  async asyncData({ params, $axios, app, redirect }) {

    // Get the current table name from the route parameters
    const table = params.tablename;

    // Set up the headers for the request
    let headers = {
      'x-api-key': app.$config.apiKey.replace(/['"]+/g, ''),
      'x-auth-strategy': app.$auth.strategy.name
    };

    // If the authentication strategy is 'local', include the token in the headers
    if (app.$auth.strategy.name === 'local') {
      const token = app.$auth.strategy.token.get();
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      // Use the table name in the API request
      const response = await $axios.$get(`/api/${table}/gallery`, { headers });

      // Return the data to be merged with the component's data
      return {
        dataFetched: true,
        galleryData: response.data,
        filterData: response.filterData,
        filterField: response.filterField,
        imageExtensions: response.imageExtensions,
        audioExtensions: response.audioExtensions,
        videoExtensions: response.videoExtensions,
        embedMedia: response.embedMedia,
        mediaBasePath: response.mediaBasePath
      };
    } catch (error) {
      // Handle errors as appropriate
      console.error('Error fetching gallery data:', error);
      redirect('/');
      // Return default data
      return {
        dataFetched: false
      };
    }
  },
};
</script>
