<template>
  <div>
    <Alerts 
      v-if="dataFetched"
      :data="alertsData"
      :embed-media="embedMedia"
      :media-base-path="mediaBasePath"
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
        mediaBasePath: response.mediaBasePath
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
