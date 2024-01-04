<template>
  <div>
    <!-- Header and stats -->
    <div class="feature p-4 rounded-lg shadow-lg">
      <div class="mt-4">
        <h2 class="text-2xl font-semibold mb-2">
          Change detection alerts dashboard: {{ statistics.territory }}
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
        <div class="mb-2">
          <span class="font-bold">Total number of hectares affected:</span>
          {{ statistics.hectaresTotal }}
        </div>
      </div>
    </div>
    <!-- Slider -->
    <div v-if="showSlider" class="feature p-4 rounded-lg shadow-lg">
      <AlertSlider :dateOptions="dateOptions" />
    </div>
    <!-- Chart -->
    <div v-if="statistics" class="feature p-4 rounded-lg shadow-lg">
      <AlertChart :statistics="statistics" />
    </div>
    <!-- Download -->
    <div class="p-4" v-if="allDataGeojson">
      <h3 class="text-2xl font-semibold mb-2 text-center">Download all alerts</h3>
      <Download 
        :geojson="allDataGeojson" 
        :type-of-data="'all'" 
      />
    </div>
  </div>
</template>

<script>
import Download from "@/components/Download.vue";
import AlertSlider from "@/components/AlertSlider.vue";
import AlertChart from "@/components/AlertChart.vue";

export default {
  name: "AlertsIntroPanel",
  props: [
    "showSlider",
    "statistics", 
    "dateOptions", 
    "allDataGeojson"
  ],
  components: { Download, AlertChart, AlertSlider }
};
</script>

<style scoped></style>
