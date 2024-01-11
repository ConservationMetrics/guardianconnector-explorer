<template>
  <div>
    <Map
      v-if="dataFetched"
      :audio-extensions="audioExtensions"
      :data="mapData"
      :embed-media="embedMedia"
      :filter-data="filterData"
      :filter-field="filterField"
      :image-extensions="imageExtensions"
      :map-legend-layer-ids="mapLegendLayerIds"
      :mapbox-access-token="mapboxAccessToken"
      :mapbox-bearing="mapboxBearing"
      :mapbox-latitude="mapboxLatitude"
      :mapbox-longitude="mapboxLongitude"
      :mapbox-pitch="mapboxPitch"
      :mapbox-projection="mapboxProjection"
      :mapbox-style="mapboxStyle"
      :mapbox-zoom="mapboxZoom"
      :mapbox3d="mapbox3d"
      :media-base-path="mediaBasePath"
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
      const response = await $axios.$get(`/api/${table}/map`, { headers });

      // Return the data to be merged with the component's data
      return {
        audioExtensions: response.audioExtensions,
        dataFetched: true,
        embedMedia: response.embedMedia,
        filterData: response.filterData,
        filterField: response.filterField,
        imageExtensions: response.imageExtensions,
        mapData: response.data,
        mapLegendLayerIds: response.mapLegendLayerIds,
        mapbox3d: response.mapbox3d,
        mapboxAccessToken: response.mapboxAccessToken,
        mapboxBearing: response.mapboxBearing,
        mapboxLatitude: response.mapboxLatitude,
        mapboxLongitude: response.mapboxLongitude,
        mapboxPitch: response.mapboxPitch,
        mapboxProjection: response.mapboxProjection,
        mapboxStyle: response.mapboxStyle,
        mapboxZoom: response.mapboxZoom,
        mediaBasePath: response.mediaBasePath,
        videoExtensions: response.videoExtensions
      };
    } catch (error) {
      // Handle errors as appropriate
      console.error('Error fetching map data:', error);
      redirect('/');
      // Return default data
      return {
        dataFetched: false
      };
    }
  },
};
</script>
