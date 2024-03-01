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
          Change detection alerts: {{ statistics.territory }} territory
        </h2>
        <p class="text-l mb-2">
          Most recent alerts shown on map in
          <span style="color: #ec00ff"><strong>purple</strong></span
          >.
        </p>
        <div class="mb-2">
          <span class="font-bold">Type of alerts:</span>
          {{ statistics.typeOfAlerts.join(", ") }}
        </div>
        <div class="mb-2">
          <span class="font-bold">Data provider(s):</span>
          {{ statistics.dataProviders.join(", ") }}
        </div>
        <div class="mb-2">
          <span class="font-bold">Alert detection range:</span>
          {{ statistics.alertDetectionRange }}
        </div>
        <div class="mb-2">
          <span class="font-bold">Date of most recent alerts published:</span>
          {{ statistics.recentAlertsDate }}
        </div>
        <div class="mb-2">
          <span class="font-bold">Number of most recent alerts:</span>
          {{ statistics.recentAlertsNumber }}
        </div>
        <div class="mb-2">
          <span class="font-bold">Total number of alerts:</span>
          {{ statistics.alertsTotal }}
        </div>
        <div v-if="calculateHectares" class="mb-2">
          <span class="font-bold">Total number of hectares affected:</span>
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
    <div v-if="statistics && calculateHectares" class="feature p-4 rounded-lg shadow-lg">
      <AlertsChart :statistics="statistics" />
    </div>
  </div>
</template>

<script>
import AlertsChart from "@/components/AlertsChart.vue";
import AlertsSlider from "@/components/AlertsSlider.vue";
import Download from "@/components/Download.vue";

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
