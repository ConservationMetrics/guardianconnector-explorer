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
      <Slider :dateOptions="dateOptions" />
    </div>
    <!-- Chart -->
    <div v-if="statistics" class="feature p-4 rounded-lg shadow-lg">
      <div class="mt-4">
        <h3 class="text-2xl font-semibold mb-2">Alerts in the last 12 months</h3>
        <div class="mb-2">
          <LineChart :data="chartData" />
        </div>
        <p class="mb-2"><em>Note: this chart is showing data since {{ statistics.earliestAlertsDate }}</em></p>
      </div>
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
import Slider from "@/components/Slider.vue";

import { Line as LineChart } from "vue-chartjs";
import { Chart, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale } from 'chart.js';

Chart.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);


export default {
  name: "AlertsIntroPanel",
  props: [
    "showSlider",
    "statistics", 
    "dateOptions", 
    "allDataGeojson"
  ],
  components: { Download, LineChart, },
  computed: {
    chartData() {
        return {
        labels: Object.keys(this.statistics.hectaresPerMonth),
        datasets: [
          {
            label: "Hectares affected",
            data: Object.values(this.statistics.hectaresPerMonth),
            borderColor: "#f87979",
            backgroundColor: 'rgba(0, 0, 0, 0)',
            pointBackgroundColor: "#f87979",
            fill: false
          },
        ],
      };
    },
  }
};
</script>

<style scoped></style>
