<template>
  <div>
    <Gallery v-if="embedMedia === 'YES'"
      :data="data"
      :image-extensions="imageExtensions"
      :audio-extensions="audioExtensions"
      :video-extensions="videoExtensions"
    />
    <h3 v-if="embedMedia !== 'YES'">
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
      data: [],
      imageExtensions: [],
      audioExtensions: [],
      videoExtensions: [],
      embedMedia: process.env.EMBED_MEDIA || "YES",
    };
  },
  async created() {
    try {
      // FIXME: this is throwing a "connect ECONNREFUSED" error on the server console 
      // upon first load, but it does not seem to impact API requests on the client side.
      const response = await this.$axios.$get('api/gallery');
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