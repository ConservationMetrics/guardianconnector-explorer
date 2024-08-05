<template>
  <div class="container relative">
    <div class="absolute top-0 right-0 flex justify-end space-x-4 mb-4">
      <div class="relative inline-block text-left">
        <div>
          <button
            @click="toggleDropdown"
            class="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
          >
            {{ currentLocaleName }}
            <svg
              class="-mr-1 ml-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div
          v-if="dropdownOpen"
          class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
        >
          <div class="py-1">
            <a
              href="#"
              v-for="locale in availableLocales"
              :key="locale.code"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              @click.prevent.stop="changeLocale(locale.code)"
            >
              {{ locale.name }}
            </a>
          </div>
        </div>
      </div>
    </div>
    <h1>{{ $t("availableViews") }}</h1>
    <div
      v-for="(config, tableName) in viewsConfig"
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

export default {
  data() {
    return {
      viewsConfig: [],
      dropdownOpen: false,
    };
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
      this.viewsConfig = response.data;
    } catch (error) {
      console.error("Error fetching views config from API:", error);
    }
  },
  methods: {
    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
    },
    changeLocale(localeCode) {
      this.$i18n.setLocale(localeCode);
      this.dropdownOpen = false;
    },
  },
  computed: {
    currentLocaleName() {
      const currentLocale = this.availableLocales.find(
        (locale) => locale.code === this.$i18n.locale,
      );
      return currentLocale ? currentLocale.name : "";
    },
    availableLocales() {
      return this.$i18n.locales;
    },
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
