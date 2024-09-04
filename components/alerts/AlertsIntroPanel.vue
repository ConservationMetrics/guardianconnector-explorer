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
          {{ $t("changeDetectionAlerts") }}: {{ statistics.territory }}
        </h2>
        <p class="text-l mb-2">
          {{ $t("mostRecentAlertsShownIn") }}
          <span style="color: #ff0000"
            ><strong>{{ $t("red") }}</strong></span
          >.
        </p>
        <div
          class="mb-2"
          v-if="statistics.typeOfAlerts && stastistics.typeOfAlerts.length"
        >
          <span class="font-bold">{{ $t("typeOfAlerts") }}:</span>
          {{ statistics.typeOfAlerts.join(", ") }}
        </div>
        <div
          class="mb-2"
          v-if="statistics.dataProviders && statistics.dataProviders.length"
        >
          <span class="font-bold">{{ $t("dataProviders") }}:</span>
          {{ statistics.dataProviders.join(", ") }}
        </div>
        <div class="mb-2">
          <span class="font-bold">{{ $t("alertDetectionRange") }}:</span>
          {{ statistics.alertDetectionRange }}
        </div>
        <div class="mb-2">
          <span class="font-bold">{{ $t("recentAlertsDate") }}:</span>
          {{ statistics.recentAlertsDate }}
        </div>
        <div class="mb-2">
          <span class="font-bold">{{ $t("recentAlertsNumber") }}:</span>
          {{ statistics.recentAlertsNumber }}
        </div>
        <div class="mb-2">
          <span class="font-bold">{{ $t("alertsTotal") }}:</span>
          {{ statistics.alertsTotal }}
        </div>
        <div v-if="calculateHectares" class="mb-2">
          <span class="font-bold">{{ $t("hectaresTotal") }}:</span>
          {{ statistics.hectaresTotal }}
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
        <Download
          :geojson="geojsonSelection"
          :type-of-data="'multiple-alerts'"
        />
      </div>
    </div>
    <!-- Chart -->
    <div v-if="statistics" class="feature p-4 rounded-lg shadow-lg">
      <AlertsChart
        :statistics="statistics"
        :calculate-hectares="calculateHectares"
      />
    </div>
  </div>
</template>

<script>
import AlertsChart from "~/components/alerts/AlertsChart.vue";
import AlertsSlider from "~/components/alerts/AlertsSlider.vue";
import Download from "~/components/shared/Download.vue";

export default {
  name: "AlertsIntroPanel",
  props: [
    "calculateHectares",
    "dateOptions",
    "geojsonSelection",
    "logoUrl",
    "showSlider",
    "statistics",
  ],
  components: { AlertsChart, AlertsSlider, Download },
};
</script>

<style scoped></style>
