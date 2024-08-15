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
    <h1>{{ $t("availableViews") }}: {{ $t("configuration") }}</h1>
    <div class="grid-container">
      <div
        v-for="(config, tableName) in viewsConfig"
        :key="tableName"
        class="table-item card"
      >
        <h2 class="card-header">
          <strong>{{ $t("table") }}:</strong> {{ tableName }}
        </h2>
        <div class="card-body">
          <form @submit.prevent="submitConfig(tableName, config)">
            <div v-for="(value, key) in config" :key="key" class="config-field">
              <label :for="`${tableName}-${key}`">{{ $t(key) }}</label>
              <input
                :id="`${tableName}-${key}`"
                v-model="config[key]"
                class="input-field"
              />
            </div>
            <button
              type="submit"
              class="submit-button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer transition-colors duration-200 md:block"
            >
              {{ $t("submit") }}
            </button>
          </form>
        </div>
      </div>
    </div>
    <div v-if="showModal" class="overlay"></div>
    <div v-if="showModal" class="modal">
      {{ modalMessage }}
    </div>
  </div>
</template>

<script>
import axios from "axios";
import overlayModal from "@/components/shared/overlay.css";

export default {
  data() {
    return {
      viewsConfig: [],
      dropdownOpen: false,
      showModal: false,
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

        console.log("Configuration updated successfully");
        (this.modalMessage = this.$t("configUpdated") + "!"),
          (this.showModal = true);
        // wait 3 seconds and refresh the page content
        setTimeout(() => {
          this.showModal = false;
          location.reload();
        }, 3000);
      } catch (error) {
        console.error("Error updating config:", error);
      }
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

.grid-container {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(400px, 1fr)
  ); /* Increased min-width to 400px */
  gap: 1em;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
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

.table-item.card {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1em;
  width: 100%;
  max-width: 600px;
}

.card-header {
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
  padding: 0.75em 1em;
  font-size: 1.25em;
  font-weight: bold;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.card-body {
  padding: 1em;
}

.config-field {
  margin-bottom: 1em;
}

.config-field label {
  display: block;
  margin-bottom: 0.5em;
  font-weight: bold;
}

.config-field .input-field {
  width: 100%;
  padding: 0.5em;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
