<template>
  <div>
    <Map
      v-if="dataFetched"
      :data="data"
      :filter-data="filterData"
      :filter-field="filterField"
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
      :mapbox3d="mapbox3d"
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
      filterData: false,
      filterField: '',
      imageExtensions: [],
      audioExtensions: [],
      videoExtensions: [],
      embedMedia: false,
      mediaBasePath: '',
      mapboxAccessToken: '',
      mapboxStyle: '',
      mapboxProjection: '',
      mapboxLatitude: '',
      mapboxLongitude: '',
      mapboxZoom: '',
      mapboxPitch: '',
      mapboxBearing: '',
      mapbox3d: false
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
      
      const response = await this.$axios.$get('api/map', { headers });
      this.data = response.data;
      this.filterData = response.filterData;
      this.filterField = response.filterField;
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
      this.mapbox3d = response.mapbox3d;
      this.dataFetched = true;
    } catch (error) {
      console.error('Error fetching data on client side:', error);
    }
  },
};
</script>