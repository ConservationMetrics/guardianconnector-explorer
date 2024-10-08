<template>
  <div>
    <!-- Header and stats -->
    <div class="feature p-4 rounded-lg shadow-lg">
      <div>
        <img
          v-if="logoUrl"
          :src="logoUrl"
          class="w-auto mx-auto mb-4 max-h-25"
          alt="Logo"
        />
        <h2 class="text-2xl font-semibold mb-2">
          {{ $t("changeDetectionAlerts") }}: {{ alertsStatistics.territory }}
        </h2>
        <p class="text-l mb-2">
          {{ $t("mostRecentAlertsShownIn") }}
          <span style="color: #ff0000"
            ><strong>{{ $t("red") }}</strong></span
          >.
        </p>
        <div
          class="mb-2"
          v-if="
            alertsStatistics.typeOfAlerts &&
            alertsStatistics.typeOfAlerts.length
          "
        >
          <span class="font-bold">{{ $t("typeOfAlerts") }}:</span>
          {{ alertsStatistics.typeOfAlerts.join(", ") }}
        </div>
        <div
          class="mb-2"
          v-if="
            alertsStatistics.dataProviders &&
            alertsStatistics.dataProviders.length
          "
        >
          <span class="font-bold">{{ $t("dataProviders") }}:</span>
          {{ alertsStatistics.dataProviders.join(", ") }}
        </div>
        <div class="mb-2">
          <span class="font-bold">{{ $t("alertDetectionRange") }}:</span>
          {{ alertsStatistics.alertDetectionRange }}
        </div>
        <div class="mb-2">
          <span class="font-bold">{{ $t("recentAlertsDate") }}:</span>
          {{ alertsStatistics.recentAlertsDate }}
        </div>
        <div class="mb-2">
          <span class="font-bold">{{ $t("recentAlertsNumber") }}:</span>
          {{ alertsStatistics.recentAlertsNumber }}
        </div>
        <div class="mb-2">
          <span class="font-bold">{{ $t("alertsTotal") }}:</span>
          {{ alertsStatistics.alertsTotal }}
        </div>
        <div v-if="calculateHectares" class="mb-2">
          <span class="font-bold">{{ $t("hectaresTotal") }}:</span>
          {{ alertsStatistics.hectaresTotal }}
        </div>
      </div>
    </div>
    <!-- Slider -->
    <div v-if="showSlider" class="feature p-4 rounded-lg shadow-lg">
      <AlertsSlider
        :date-options="dateOptions"
        @date-range-changed="$emit('date-range-changed', $event)"
      />
      <div v-if="geojsonSelection">
        <!-- Download -->
        <DownloadMapData
          :geojson="geojsonSelection"
          :type-of-data="'multiple-alerts'"
        />
      </div>
    </div>
    <!-- Chart -->
    <div v-if="alertsStatistics" class="feature p-4 rounded-lg shadow-lg">
      <AlertsChart
        :alerts-statistics="alertsStatistics"
        :calculate-hectares="calculateHectares"
      />
    </div>
  </div>
</template>

<script setup>
import AlertsChart from "~/components/alerts/AlertsChart.vue";
import AlertsSlider from "~/components/alerts/AlertsSlider.vue";
import DownloadMapData from "~/components/shared/DownloadMapData.vue";

const props = defineProps({
  alertsStatistics: Object,
  calculateHectares: Boolean,
  dateOptions: Array,
  geojsonSelection: Object,
  logoUrl: String,
  showSlider: Boolean,
});
</script>
