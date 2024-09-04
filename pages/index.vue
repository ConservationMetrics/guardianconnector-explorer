<template>
  <div class="container relative">
    <div class="absolute top-0 right-0 flex justify-end space-x-4 mb-4">
      <LanguagePicker />
    </div>
    <h1>{{ $t("availableViews") }}</h1>
    <div
      v-if="viewsConfig"
      v-for="(config, tableName) in filteredSortedViewsConfig"
      :key="tableName"
      class="table-item"
    >
      <h2>
        <strong>{{ $t("table") }}:</strong> {{ tableName }}
      </h2>
      <ul>
        <li v-for="view in config.VIEWS.split(',')" :key="view">
          <nuxt-link :to="`/${view}/${tableName}`">{{ $t(view) }}</nuxt-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import LanguagePicker from "~/components/shared/LanguagePicker.vue";

export default {
  components: {
    LanguagePicker,
  },
  data() {
    return {
      viewsConfig: [],
    };
  },
  computed: {
    filteredSortedViewsConfig() {
      return Object.keys(this.viewsConfig)
        .filter((key) => Object.keys(this.viewsConfig[key]).length > 0)
        .sort()
        .reduce((acc, key) => {
          acc[key] = this.viewsConfig[key];
          return acc;
        }, {});
    },
  },
  async mounted() {
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
      const response = await axios.get("/api/config", { headers });

      // Check if the response is OK
      if (response.status !== 200) {
        throw new Error("Network response was not ok");
      }

      // Set the viewsConfig data
      this.viewsConfig = response.data[0];
    } catch (error) {
      console.error("Error fetching views config from API:", error);
    }
  },
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2em;
}

.container h1 {
  color: #333;
  margin-bottom: 1em;
  font-size: 2em;
  font-weight: 900;
}

.table-item {
  background-color: #f9f9f9;
  border-radius: 5px;
  padding: 1em;
  margin-bottom: 1em;
  width: 50%;
}

.table-item h2 {
  color: #333;
  margin-bottom: 0.5em;
}

.table-item ul {
  list-style: none;
  padding: 0;
}

.table-item ul li {
  margin-bottom: 0.5em;
}

.table-item ul li a {
  color: #007bff;
  text-decoration: none;
}

.table-item ul li a:hover {
  color: #0056b3;
  text-decoration: underline;
}
</style>
