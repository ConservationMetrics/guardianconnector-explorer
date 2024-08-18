<template>
  <div class="table-item card">
    <h2 class="card-header">
      <p class="table-name">{{ tableName }}</p>
      <button class="hamburger" @click="$emit('toggle-minimize', tableName)">
        ☰
      </button>
    </h2>
    <div v-if="!isMinimized" class="card-body">
      <form @submit.prevent="handleSubmit">
        <ConfigViews v-if="shouldShowConfigViews" :tableName="tableName" :config="config" :views="views" @update:views="updateViews" />
        <ConfigMap v-if="shouldShowConfigMap" :tableName="tableName" :views="views" :config="config" />
        <ConfigMedia v-if="shouldShowConfigMedia" :tableName="tableName" :views="views" :config="config" />
        <ConfigAlerts v-if="shouldShowConfigAlerts" :tableName="tableName" :views="views" :config="config" />
        <ConfigFilters v-if="shouldShowConfigFilters" :tableName="tableName" :views="views" :config="config" />
        <div v-if="hasOtherConfig && views.length" class="config-section">
          <div class="config-header">
                <h3>{{ $t("other") }} {{ $t("configuration") }}</h3>
              </div>
          <div v-if="isOtherConfigKey(key)" v-for="(value, key) in config" :key="key" class="config-field">
            <template>

              <label :for="`${tableName}-${key}`">{{ $t(key) }}</label>
              <template v-if="key === 'LOGO_URL'">
                <input
                  :id="`${tableName}-${key}`"
                  v-model="config[key]"
                  class="input-field"
                  type="url"
                />
              </template>
              <template v-else>
                <input
                  :id="`${tableName}-${key}`"
                  v-model="config[key]"
                  class="input-field"
                />
              </template>
            </template>
          </div>
        </div>
        <button
          type="submit"
          :disabled="!isChanged"
          :class="[
            'submit-button',
            {
              'bg-gray-500 cursor-not-allowed': !isChanged,
              'bg-blue-500 hover:bg-blue-700': isChanged,
            },
          ]"
          class="text-white font-bold py-2 px-4 rounded transition-colors duration-200 md:block"
        >
          {{ $t("submit") }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import ConfigViews from './ConfigViews.vue';
import ConfigMap from './ConfigMap.vue';
import ConfigMedia from './ConfigMedia.vue';
import ConfigAlerts from './ConfigAlerts.vue';
import ConfigFilters from './ConfigFilters.vue';

export default {
  props: {
    tableName: String,
    config: Object,
    isMinimized: Boolean,
  },
  components: {
    ConfigViews,
    ConfigMap,
    ConfigMedia,
    ConfigAlerts,
    ConfigFilters,
  },
  data() {
    return {
      originalConfig: JSON.parse(JSON.stringify(this.config)),
      views: this.config.VIEWS ? this.config.VIEWS.split(",") : [],
    };
  },
  computed: {
    viewsKeys() {
      return ["VIEWS"];
    },
    mapConfigKeys() {
      return [
        "MAPBOX_STYLE",
        "MAPBOX_ACCESS_TOKEN",
        "MAPBOX_ZOOM",
        "MAPBOX_CENTER_LATITUDE",
        "MAPBOX_CENTER_LONGITUDE",
        "MAPBOX_PROJECTION",
        "MAPBOX_BEARING",
        "MAPBOX_PITCH",
        "MAPBOX_3D",
        "MAP_LEGEND_LAYER_IDS",
        "PLANET_API_KEY",
      ];
    },
    mediaKeys() {
      return ["EMBED_MEDIA", "MEDIA_BASE_PATH", "MEDIA_BASE_PATH_ALERTS"];
    },
    alertKeys() {
      return ["ALERT_RESOURCES", "MAPEO_CATEGORY_IDS", "MAPEO_TABLE"];
    },
    filterKeys() {
      return [
        "FRONT_END_FILTER_COLUMN",
        "FRONT_END_FILTERING",
        "UNWANTED_COLUMNS",
        "UNWANTED_SUBSTRINGS",
      ];
    },
    hasOtherConfig() {
      const allKeys = [
        ...this.viewsKeys,
        ...this.mapConfigKeys,
        ...this.filterKeys,
        ...this.mediaKeys,
        ...this.alertKeys
      ];
      return Object.keys(this.config).some(key => !allKeys.includes(key));
    },
    isChanged() {
      return (
        JSON.stringify(this.config) !== JSON.stringify(this.originalConfig)
      );
    },
    shouldShowConfigViews() {
      return this.hasConfigKey(this.viewsKeys);
    },
    shouldShowConfigMap() {
      return this.hasConfigKey(this.mapConfigKeys) && this.hasView(['alerts', 'map']);
    },
    shouldShowConfigMedia() {
      return this.hasConfigKey(this.mediaKeys) && this.hasView(['map', 'gallery', 'alerts']);
    },
    shouldShowConfigAlerts() {
      return this.hasConfigKey(this.alertKeys) && this.hasView(['alerts']);
    },
    shouldShowConfigFilters() {
      return this.hasConfigKey(this.filterKeys) && this.hasView(['map', 'gallery']);
    },
  },
  methods: {
    hasConfigKey(keys) {
      return keys.some(key => key in this.config);
    },
    hasView(views) {
      return views.some(view => this.views.includes(view));
    },
    handleSubmit() {
      this.originalConfig = JSON.parse(JSON.stringify(this.config));
      this.$emit("submit-config", this.tableName, this.config);
    },
    isOtherConfigKey(key) {
      const allKeys = [
        ...this.viewsKeys,
        ...this.mapConfigKeys,
        ...this.filterKeys,
        ...this.mediaKeys,
        ...this.alertKeys
      ];
      return !allKeys.includes(key);
    },
    updateViews(newViews) {
      this.views = newViews;
      this.config.VIEWS = newViews.join(",");
    },
  },
};
</script>

<style>
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
  height: 3em;
  font-size: 1.25em;
  font-weight: bold;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.table-name {
  margin: 0;
  float: left;
}

.hamburger {
  background: none;
  border: none;
  font-size: 1em;
  cursor: pointer;
  margin-left: auto;
  float: right;
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

.views-checkboxes {
  display: flex;
  gap: 1em;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: normal !important;
}

.checkbox-label input[type="checkbox"] {
  margin-right: 0.5em;
}

.tag-field {
  min-width: 100%;
}

.config-section {
  margin-bottom: 2em;
}

.config-header {
  margin-bottom: 1em;
}

.config-header h3 {
  margin: 0;
  padding: 0.5em 0;
  font-size: 1.15em;
  font-weight: bold;
  border-bottom: 1px solid #ddd;
  color: #333;
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
