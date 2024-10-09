<script setup>
import { defineEmits, ref, computed, onMounted } from "vue";

// Define props
const props = defineProps({
  tableName: String,
  config: Object,
  isMinimized: Boolean,
});

// Set up composables
const emit = defineEmits([
  "submitConfig",
  "removeTableFromConfig",
  "toggleMinimize",
]);

// Set up reactive state
const localConfig = ref({});
const originalConfig = ref(null);
const views = ref([]);

onMounted(() => {
  if (props.config) {
    localConfig.value = JSON.parse(JSON.stringify(props.config));
  }
  originalConfig.value = JSON.parse(JSON.stringify(localConfig.value));
  views.value = localConfig.value?.VIEWS
    ? localConfig.value.VIEWS.split(",")
    : [];
});

// Methods
const viewsKeys = computed(() => ["VIEWS"]);
const mapConfigKeys = computed(() => [
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
]);
const mediaKeys = computed(() => ["MEDIA_BASE_PATH", "MEDIA_BASE_PATH_ALERTS"]);
const alertKeys = computed(() => ["MAPEO_CATEGORY_IDS", "MAPEO_TABLE"]);
const filterKeys = computed(() => [
  "FILTER_OUT_VALUES_FROM_COLUMN",
  "FRONT_END_FILTER_COLUMN",
  "UNWANTED_COLUMNS",
  "UNWANTED_SUBSTRINGS",
]);
const otherKeys = computed(() => ["LOGO_URL"]);

const isChanged = computed(() => {
  const localConfigFiltered = Object.fromEntries(
    Object.entries(localConfig.value).filter(([value]) => value !== ""),
  );
  const originalConfigFiltered = Object.fromEntries(
    Object.entries(originalConfig.value).filter(([value]) => value !== ""),
  );
  return (
    JSON.stringify(localConfigFiltered) !==
    JSON.stringify(originalConfigFiltered)
  );
});

const isFormValid = computed(() => {
  const isMapConfigValid = shouldShowConfigMap.value
    ? localConfig.value.MAPBOX_ACCESS_TOKEN?.trim() !== "" &&
      localConfig.value.MAPBOX_ACCESS_TOKEN != null
    : true;

  return isMapConfigValid;
});

const shouldShowConfigMap = computed(() => hasView(["alerts", "map"]));
const shouldShowConfigMedia = computed(() =>
  hasView(["map", "gallery", "alerts"]),
);
const shouldShowConfigAlerts = computed(() => hasView(["alerts"]));
const shouldShowConfigFilters = computed(() => hasView(["map", "gallery"]));
const shouldShowConfigOther = computed(() =>
  hasView(["map", "gallery", "alerts"]),
);

function hasView(viewsArray) {
  return viewsArray.some((view) => views.value.includes(view));
}

function handleConfigUpdate(newConfig) {
  localConfig.value = newConfig;
}

function handleSubmit() {
  emit("submitConfig", {
    tableName: props.tableName,
    config: localConfig.value,
  });
}

function updateViews(newViews) {
  views.value = newViews;
  localConfig.value.VIEWS = newViews.join(",");
}
</script>

<template>
  <div class="table-item card">
    <h2 class="card-header">
      <p class="table-name">{{ tableName }}</p>
      <button class="hamburger" @click="$emit('toggleMinimize', { tableName })">
        ☰
      </button>
    </h2>
    <div v-if="!isMinimized" class="card-body">
      <form @submit.prevent="handleSubmit">
        <ConfigViews
          :tableName="tableName"
          :config="localConfig"
          :views="views"
          :keys="viewsKeys"
          @update:views="updateViews"
        />
        <ConfigMap
          v-if="shouldShowConfigMap"
          :tableName="tableName"
          :views="views"
          :config="localConfig"
          :keys="mapConfigKeys"
          @updateConfig="handleConfigUpdate"
        />
        <ConfigMedia
          v-if="shouldShowConfigMedia"
          :tableName="tableName"
          :views="views"
          :config="localConfig"
          :keys="mediaKeys"
          @updateConfig="handleConfigUpdate"
        />
        <ConfigAlerts
          v-if="shouldShowConfigAlerts"
          :tableName="tableName"
          :views="views"
          :config="localConfig"
          :keys="alertKeys"
          @updateConfig="handleConfigUpdate"
        />
        <ConfigFilters
          v-if="shouldShowConfigFilters"
          :tableName="tableName"
          :views="views"
          :config="localConfig"
          :keys="filterKeys"
          @updateConfig="handleConfigUpdate"
        />
        <ConfigOther
          v-if="shouldShowConfigOther"
          :tableName="tableName"
          :views="views"
          :config="localConfig"
          :keys="otherKeys"
          @updateConfig="handleConfigUpdate"
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
          class="text-white font-bold py-2 px-4 rounded transition-colors duration-200 mr-2 mb-2 md:mb-0"
        >
          {{ $t("submit") }}
        </button>
        <button
          type="button"
          class="remove-button text-white font-bold bg-red-500 hover:bg-red-700 py-2 px-4 rounded transition-colors duration-200"
          @click="$emit('removeTableFromConfig', tableName)"
        >
          {{ $t("removeTable") }}
        </button>
      </form>
    </div>
  </div>
</template>

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
