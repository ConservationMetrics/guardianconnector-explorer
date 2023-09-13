<template>
  <div>
    <Gallery 
      v-if="embedMedia === 'YES' && dataFetched"
      :data="data"
      :image-extensions="imageExtensions"
      :audio-extensions="audioExtensions"
      :video-extensions="videoExtensions"
      :embed-media="embedMedia"
      :media-base-path="mediaBasePath"
    />
    <h3 v-if="embedMedia !== 'YES' && dataFetched">
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
      imageExtensions: [],
      audioExtensions: [],
      videoExtensions: [],
      embedMedia: '',
      mediaBasePath: ''
    };
  },
  async created() {
      try {
        let apiKey = this.$config.apiKey;
        apiKey = apiKey.replace(/['"]+/g, '');
        const response = await this.$axios.$get('api/gallery', { headers: { 'x-api-key': apiKey } });
        this.data = response.data;
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