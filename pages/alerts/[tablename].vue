<script setup>
import { ref } from "vue";
import { useHead, useFetch, useRuntimeConfig } from "#app";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

// Set up config
const {
  public: { appApiKey },
} = useRuntimeConfig();

// Set up composables
const { t } = useI18n();

// Set up reactive state
const alertsData = ref([]);
const alertsStatistics = ref({});
const dataFetched = ref(false);
const allowedFileExtensions = ref([]);
const logoUrl = ref("");
const mapLegendLayerIds = ref([]);
const mapboxAccessToken = ref("");
const mapboxBearing = ref(0);
const mapboxLatitude = ref(0);
const mapboxLongitude = ref(0);
const mapboxPitch = ref(0);
const mapboxProjection = ref("");
const mapboxStyle = ref("");
const mapboxZoom = ref(0);
const mapbox3d = ref(false);
const mapeoData = ref([]);
const mediaBasePath = ref("");
const mediaBasePathAlerts = ref("");
const planetApiKey = ref("");

// Define headers
const headers = {
  "x-api-key": appApiKey,
};

// Get the current route
const route = useRoute();

// Extract the tablename from the route parameters
const table = route.params.tablename;

const { data, error } = await useFetch(`/api/${table}/alerts`, {
  headers,
});

if (data.value && !error.value) {
  alertsData.value = data.value.alertsData;
  alertsStatistics.value = data.value.alertsStatistics;
  allowedFileExtensions.value = data.value.allowedFileExtensions;
  dataFetched.value = true;
  logoUrl.value = data.value.logoUrl;
  mapLegendLayerIds.value = data.value.mapLegendLayerIds;
  mapboxAccessToken.value = data.value.mapboxAccessToken;
  mapboxBearing.value = data.value.mapboxBearing;
  mapboxLatitude.value = data.value.mapboxLatitude;
  mapboxLongitude.value = data.value.mapboxLongitude;
  mapboxPitch.value = data.value.mapboxPitch;
  mapboxProjection.value = data.value.mapboxProjection;
  mapboxStyle.value = data.value.mapboxStyle;
  mapboxZoom.value = data.value.mapboxZoom;
  mapbox3d.value = data.value.mapbox3d;
  mapeoData.value = data.value.mapeoData;
  mediaBasePath.value = data.value.mediaBasePath;
  mediaBasePathAlerts.value = data.value.mediaBasePathAlerts;
  planetApiKey.value = data.value.planetApiKey;
} else {
  console.error("Error fetching data:", error.value);
}

// Set up page metadata
useHead({
  title: "GuardianConnector Explorer" + t("changeDetectionAlerts"),
});
</script>

<template>
  <div>
    <ClientOnly>
      <AlertsDashboard
        v-if="dataFetched"
        :alerts-data="alertsData"
        :alerts-statistics="alertsStatistics"
        :allowed-file-extensions="allowedFileExtensions"
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
        :media-base-path-alerts="mediaBasePathAlerts"
        :planet-api-key="planetApiKey"
      />
    </ClientOnly>
  </div>
</template>
