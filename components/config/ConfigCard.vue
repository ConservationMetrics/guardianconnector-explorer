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
        <ConfigViews
          :tableName="tableName"
          :config="config"
          :views="views"
          @update:views="updateViews"
        />
        <ConfigMap
          v-if="shouldShowConfigMap"
          :tableName="tableName"
          :views="views"
          :config="config"
        />
        <ConfigMedia
          v-if="shouldShowConfigMedia"
          :tableName="tableName"
          :views="views"
          :config="config"
        />
        <ConfigAlerts
          v-if="shouldShowConfigAlerts"
          :tableName="tableName"
          :views="views"
          :config="config"
        />
        <ConfigFilters
          v-if="shouldShowConfigFilters"
          :tableName="tableName"
          :views="views"
          :config="config"
        />
        <ConfigOther
          v-if="shouldShowConfigOther"
          :tableName="tableName"
          :views="views"
          :config="config"
        />
        <button
          type="submit"
          :disabled="!isChanged || !isFormValid"
          :class="[
            'submit-button',
            {
              'bg-gray-500 cursor-not-allowed': !isChanged || !isFormValid,
              'bg-blue-500 hover:bg-blue-700': isChanged && isFormValid,
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
import ConfigViews from "./ConfigViews.vue";
import ConfigMap from "./ConfigMap.vue";
import ConfigMedia from "./ConfigMedia.vue";
import ConfigAlerts from "./ConfigAlerts.vue";
import ConfigFilters from "./ConfigFilters.vue";
import ConfigOther from "./ConfigOther.vue";

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
    ConfigOther,
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
      return ["MEDIA_BASE_PATH", "MEDIA_BASE_PATH_ALERTS"];
    },
    alertKeys() {
      return ["MAPEO_CATEGORY_IDS", "MAPEO_TABLE"];
    },
    filterKeys() {
      return [
        "FILTER_OUT_VALUES_FROM_COLUMN",
        "FRONT_END_FILTER_COLUMN",
        "UNWANTED_COLUMNS",
        "UNWANTED_SUBSTRINGS",
      ];
    },
    otherKeys() {
      return ["LOGO_URL"];
    },
    isFormValid() {
      // Validations for required fields
      return (
        (!this.shouldShowConfigMap ||
          (this.config.MAPBOX_ACCESS_TOKEN)) &&
        (!this.shouldShowConfigMedia || this.config.MEDIA_BASE_PATH)
      );
    },
    isChanged() {
      return (
        JSON.stringify(this.config) !== JSON.stringify(this.originalConfig)
      );
    },
    shouldShowConfigMap() {
      return this.hasView(["alerts", "map"]);
    },
    shouldShowConfigMedia() {
      return this.hasView(["map", "gallery", "alerts"]);
    },
    shouldShowConfigAlerts() {
      return this.hasView(["alerts"]);
    },
    shouldShowConfigFilters() {
      return this.hasView(["map", "gallery"])
    },
    shouldShowConfigOther() {
      return this.hasView(["map", "gallery", "alerts"])
    },
  },
  methods: {
    hasView(views) {
      return views.some((view) => this.views.includes(view));
    },
    handleSubmit() {
      this.originalConfig = JSON.parse(JSON.stringify(this.config));
      this.$emit("submit-config", this.tableName, this.config);
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
  background-color: #d3bce3;
  border-bottom: 1px solid #b399c1;
  padding: 0.75em 1em;
  height: 3em;
  font-size: 1.25em;
  font-weight: bold;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-body {
  margin-top: 2em;
}

.table-name {
  margin: 0;
  float: left;
}

.hamburger {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
}

.config-section {
  background-color: #f1f1f1;
  margin-bottom: 1.5em;
  padding: 1em;
  border: 1px dashed #ccc;
  border-radius: 8px;
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

select {
  background-color: #fff;
}

.tag-field {
  min-width: 100%;
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
