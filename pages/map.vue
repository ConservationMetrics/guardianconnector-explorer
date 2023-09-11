<template>
  <div>
    <Map
      :data="data"
      :image-extensions="imageExtensions"
      :audio-extensions="audioExtensions"
      :video-extensions="videoExtensions"
    />
</div>
</template>

<script>
import Map from "~/components/Map.vue";

export default {
  head() {
    return {
      title: 'GuardianConnector Views: Map'
    }
  },
  components: { Map },
  data() {
    return {
      data: [],
      imageExtensions: [],
      audioExtensions: [],
      videoExtensions: [],
    };
  },
  async created() {
    try {
      // FIXME: this is throwing a "connect ECONNREFUSED" error on the server console 
      // upon first load, but it does not seem to impact API requests on the client side.
      const response = await this.$axios.$get('api/map');
      this.data = response.data;
      this.imageExtensions = response.imageExtensions;
      this.audioExtensions = response.audioExtensions;
      this.videoExtensions = response.videoExtensions;
    } catch (error) {
      console.error('Error fetching data on client side:', error);
    }
  },
};
</script>