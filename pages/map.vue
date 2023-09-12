<template>
  <div>
    <Map
      v-if="dataFetched"
      :data="data"
      :image-extensions="imageExtensions"
      :audio-extensions="audioExtensions"
      :video-extensions="videoExtensions"
      :embed-media="embedMedia"
      :media-base-path="mediaBasePath"
      :mapbox-access-token="mapboxAccessToken"
      :mapbox-style="mapboxStyle"
      :mapbox-projection="mapboxProjection"
      :mapbox-latitude="mapboxLatitude"
      :mapbox-longitude="mapboxLongitude"
      :mapbox-zoom="mapboxZoom"
      :mapbox-pitch="mapboxPitch"
      :mapbox-bearing="mapboxBearing"
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
      dataFetched: false,
      data: [],
      imageExtensions: [],
      audioExtensions: [],
      videoExtensions: [],
      embedMedia: '',
      mediaBasePath: '',
      mapboxAccessToken: '',
      mapboxStyle: '',
      mapboxProjection: '',
      mapboxLatitude: '',
      mapboxLongitude: '',
      mapboxZoom: '',
      mapboxPitch: '',
      mapboxBearing: ''
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
      this.embedMedia = response.embedMedia;
      this.mediaBasePath = response.mediaBasePath;
      this.mapboxAccessToken = response.mapboxAccessToken;
      this.mapboxStyle = response.mapboxStyle;
      this.mapboxProjection = response.mapboxProjection;
      this.mapboxLatitude = response.mapboxLatitude;
      this.mapboxLongitude = response.mapboxLongitude;
      this.mapboxZoom = response.mapboxZoom;
      this.mapboxPitch = response.mapboxPitch;
      this.mapboxBearing = response.mapboxBearing;
      this.dataFetched = true;
    } catch (error) {
      console.error('Error fetching data on client side:', error);
    }
  },
};
</script>