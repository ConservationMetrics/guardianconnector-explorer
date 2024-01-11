<template>
  <div>
    <AlertsDashboard 
      v-if="dataFetched"
      :data="alertsData"
      :statistics="statistics"
      :image-extensions="imageExtensions"
      :embed-media="embedMedia"
      :alert-resources="alertResources"
      :logo-url="logoUrl"
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
      :map-legend-layer-ids="mapLegendLayerIds"
    />
  </div>
</template>

<script>
import AlertsDashboard from "~/components/AlertsDashboard.vue";

export default {
  head() {
    return {
      title: 'GuardianConnector Views: Change Detection Alerts'
    }
  },
  components: { AlertsDashboard },
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
      const response = await $axios.$get(`/api/${table}/alerts`, { headers });

      // Return the data to be merged with the component's data
      return {
        dataFetched: true,
        alertsData: response.data,
        statistics: response.statistics,
        imageExtensions: response.imageExtensions,
        embedMedia: response.embedMedia,
        alertResources: response.alertResources,
        logoUrl: response.logoUrl,
        mediaBasePath: response.mediaBasePath,
        mapboxAccessToken: response.mapboxAccessToken,
        mapboxStyle: response.mapboxStyle,
        mapboxProjection: response.mapboxProjection,
        mapboxLatitude: response.mapboxLatitude,
        mapboxLongitude: response.mapboxLongitude,
        mapboxZoom: response.mapboxZoom,
        mapboxPitch: response.mapboxPitch,
        mapboxBearing: response.mapboxBearing,
        mapbox3d: response.mapbox3d,
        mapLegendLayerIds: response.mapLegendLayerIds
      };
    } catch (error) {
      // Handle errors as appropriate
      console.error('Error fetching alerts data:', error);
      redirect('/');
      // Return default data
      return {
        dataFetched: false
      };
    }
  },
};
</script>
