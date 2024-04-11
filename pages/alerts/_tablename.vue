<template>
  <div>
    <AlertsDashboard
      v-if="dataFetched"
      :alert-resources="alertResources"
      :alertsData="alertsData"
      :embed-media="embedMedia"
      :image-extensions="imageExtensions"
      :logo-url="logoUrl"
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
      :mapeo-data="mapeoData"
      :media-base-path="mediaBasePath"
      :planet-api-key="planetApiKey"
      :statistics="statistics"
    />
  </div>
</template>

<script>
import AlertsDashboard from "~/components/AlertsDashboard.vue";

export default {
  head() {
    return {
      title: "GuardianConnector Views: Change Detection Alerts",
    };
  },
  components: { AlertsDashboard },
  async asyncData({ params, $axios, app, redirect }) {
    // Get the current table name from the route parameters
    const table = params.tablename;

    // Set up the headers for the request
    let headers = {
      "x-api-key": app.$config.apiKey.replace(/['"]+/g, ""),
      "x-auth-strategy": app.$auth.strategy.name,
    };

    // If the authentication strategy is 'local', include the token in the headers
    if (app.$auth.strategy.name === "local") {
      const token = app.$auth.strategy.token.get();
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      // Use the table name in the API request
      const response = await $axios.$get(`/api/${table}/alerts`, { headers });

      // Return the data to be merged with the component's data
      return {
        alertResources: response.alertResources,
        alertsData: response.alertsData,
        dataFetched: true,
        embedMedia: response.embedMedia,
        imageExtensions: response.imageExtensions,
        logoUrl: response.logoUrl,
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
        mapeoData: response.mapeoData,
        mediaBasePath: response.mediaBasePath,
        planetApiKey: response.planetApiKey,
        statistics: response.statistics,
      };
    } catch (error) {
      // Handle errors as appropriate
      console.error("Error fetching alerts data:", error);
      redirect("/");
      // Return default data
      return {
        dataFetched: false,
      };
    }
  },
};
</script>
