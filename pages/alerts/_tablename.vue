<template>
  <div>
    <Alerts 
      v-if="dataFetched"
      :data="alertsData"
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
import Alerts from "~/components/Alerts.vue";

export default {
  head() {
    return {
      title: 'GuardianConnector Views: Change Detection Alerts'
    }
  },
  components: { Alerts },
  async asyncData({ params, $axios, app }) {
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
      const response = await $axios.$get(`/api/${table}/alerts`, { headers });

      // Return the data to be merged with the component's data
      return {
        dataFetched: true,
        alertsData: response.data,
        embedMedia: response.embedMedia,
        mediaBasePath: response.mediaBasePath,
        mapboxAccessToken: response.mapboxAccessToken,
        mapboxStyle: response.mapboxStyle,
        mapboxProjection: response.mapboxProjection,
        mapboxLatitude: response.mapboxLatitude,
        mapboxLongitude: response.mapboxLongitude,
        mapboxZoom: response.mapboxZoom,
        mapboxPitch: response.mapboxPitch,
        mapboxBearing: response.mapboxBearing,
        mapbox3d: response.mapbox3d
      };
    } catch (error) {
      // Handle errors as appropriate
      console.error('Error fetching alerts data:', error);
      // Return default data
      return {
        dataFetched: false
      };
    }
  },
};
</script>
