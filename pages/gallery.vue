<template>
  <div>
    <Gallery 
      v-if="embedMedia === true && dataFetched"
      :data="data"
      :filter-data="filterData"
      :filter-field="filterField"
      :image-extensions="imageExtensions"
      :audio-extensions="audioExtensions"
      :video-extensions="videoExtensions"
      :embed-media="embedMedia"
      :media-base-path="mediaBasePath"
    />
    <h3 v-if="embedMedia !== true && dataFetched">
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
  data() {
    return {
      dataFetched: false,
      data: [],
      filterData: false,
      filterField: '',
      imageExtensions: [],
      audioExtensions: [],
      videoExtensions: [],
      embedMedia: false,
      mediaBasePath: ''
    };
  },
  async created() {
      try {
        let apiKey = this.$config.apiKey;
        apiKey = apiKey.replace(/['"]+/g, '');
        const headers = { 
          'x-api-key': apiKey,
          'x-auth-strategy': this.$auth.strategy.name
        };

        // If the authentication strategy is 'local', include the token in the headers
        if (this.$auth.strategy.name === 'local') {
          const token = this.$auth.strategy.token.get();
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await this.$axios.$get('api/gallery', { headers });
        this.data = response.data;
        this.filterData = response.filterData;
        this.filterField = response.filterField;
        this.imageExtensions = response.imageExtensions;
        this.audioExtensions = response.audioExtensions;
        this.videoExtensions = response.videoExtensions;
        this.embedMedia = response.embedMedia;
        this.mediaBasePath = response.mediaBasePath;
        this.dataFetched = true;
    } catch (error) {
      console.error('Error fetching data on client side:', error);
    }
  },
};
</script>