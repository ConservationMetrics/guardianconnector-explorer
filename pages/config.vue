<template>
  <div>
    <Config
      v-if="dataFetched"
      :views-config="viewsConfig"
      :table-names="tableNames"
      @submit-config="submitConfig"
      @remove-table-from-config="removeTableFromConfig"
      @add-table-to-config="addTableToConfig"
    />
  </div>
</template>

<script>
import axios from "axios";
import Config from "~/components/Config.vue";

export default {
  head() {
    return {
      title: "GuardianConnector Views: " + this.$t("configuration"),
    };
  },
  components: { Config },
  async asyncData({ $axios, app }) {
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
      const response = await $axios.get("/api/config", { headers });

      // Check if the response is OK
      if (response.status !== 200) {
        throw new Error("Network response was not ok");
      }

      // Set the viewsConfig data
      return {
        viewsConfig: response.data[0],
        tableNames: response.data[1],
        dataFetched: true,
      };
    } catch (error) {
      console.error("Error fetching views config from API:", error);
      return {
        dataFetched: false,
      };
    }
  },
  data() {
    return {
      viewsConfig: {},
      tableNames: [],
      dataFetched: false,
    };
  },
  methods: {
    async submitConfig(tableName, config) {
      try {
        // Set up the headers for the request
        let headers = {
          "x-api-key": this.$config.apiKey.replace(/['"]+/g, ""),
          "x-auth-strategy": this.$auth.strategy.name,
        };

        // If the authentication strategy is 'local', include the token in the headers
        if (this.$auth.strategy.name === "local") {
          const token = this.$auth.strategy.token.get();
          headers["Authorization"] = `Bearer ${token}`;
        }

        // Make the API call using Axios
        const response = await axios.post(`/api/config/${tableName}`, config, {
          headers,
        });

        // Check if the response is OK
        if (response.status !== 200) {
          throw new Error("Network response was not ok");
        }
      } catch (error) {
        console.error("Error updating config:", error);
      }
    },
    async addTableToConfig(tableName) {
      try {
        // Set up the headers for the request
        let headers = {
          "x-api-key": this.$config.apiKey.replace(/['"]+/g, ""),
          "x-auth-strategy": this.$auth.strategy.name,
        };

        // If the authentication strategy is 'local', include the token in the headers
        if (this.$auth.strategy.name === "local") {
          const token = this.$auth.strategy.token.get();
          headers["Authorization"] = `Bearer ${token}`;
        }

        // Make the API call using Axios
        const response = await axios.post(
          `/api/config/new-table/${tableName}`,
          {
            tableName,
          },
          {
            headers,
          },
        );

        // Check if the response is OK
        if (response.status !== 200) {
          throw new Error("Network response was not ok");
        }
      } catch (error) {
        console.error("Error adding table to config:", error);
      }
    },
    async removeTableFromConfig(tableName) {
      try {
        // Set up the headers for the request
        let headers = {
          "x-api-key": this.$config.apiKey.replace(/['"]+/g, ""),
          "x-auth-strategy": this.$auth.strategy.name,
        };

        // If the authentication strategy is 'local', include the token in the headers
        if (this.$auth.strategy.name === "local") {
          const token = this.$auth.strategy.token.get();
          headers["Authorization"] = `Bearer ${token}`;
        }

        // Make the API call using Axios
        const response = await axios.delete(`/api/config/${tableName}`, {
          headers,
        });

        // Check if the response is OK
        if (response.status !== 200) {
          throw new Error("Network response was not ok");
        }
      } catch (error) {
        console.error("Error removing table from config:", error);
      }
    },
  },
};
</script>
