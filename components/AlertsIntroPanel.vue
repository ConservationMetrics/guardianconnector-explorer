<template>
  <div>
    <div class="feature p-4 rounded-lg shadow-lg">
      <div class="mt-4">
        <h2 class="text-2xl font-semibold mb-2">
          Change detection alerts dashboard: {{ statistics.territory }}
        </h2>
        <p class="text-l mb-2">
          This dashboard shows alerts and statistics about change detection for
          the selected territory.
        </p>
        <p class="text-l mb-2">
          Most recent alerts shown on map in
          <span style="color: #ec00ff"><strong>purple</strong></span
          >.
        </p>
        <div class="mb-2">
          <span class="font-bold">Type of alerts:</span>
          {{ statistics.type_of_alerts.join(", ") }}
        </div>
        <div class="mb-2">
          <span class="font-bold">Alert detection range:</span>
          {{ statistics.alert_detection_range }}
        </div>
        <div class="mb-2">
          <span class="font-bold">Date of most recent alerts published:</span>
          {{ statistics.recent_alerts_date }}
        </div>
        <div class="mb-2">
          <span class="font-bold">Number of most recent alerts:</span>
          {{ statistics.recent_alerts_number }}
        </div>
        <div class="mb-2">
          <span class="font-bold">Total number of alerts:</span>
          {{ statistics.alerts_total }}
        </div>
        <div class="mb-2">
          <span class="font-bold">Total number of hectares affected:</span>
          {{ statistics.hectares_total }}
        </div>
      </div>
    </div>
    <div v-if="statistics" class="feature p-4 rounded-lg shadow-lg">
      <div class="mt-4">
        <h3 class="text-2xl font-semibold mb-2">Alerts in the last 12 months</h3>
        <div class="mb-2">
          <LineChart :data="chartData" />
        </div>
        <p class="mb-2"><em>Note: this chart is showing data since {{ statistics.recent_alerts_date }}</em></p>
      </div>
    </div>
  </div>
</template>

<script>
import { Line as LineChart } from "vue-chartjs";
import { Chart, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale } from 'chart.js';

Chart.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);


export default {
  props: ["statistics"],
  name: "LineChartComponent",
  components: { LineChart },
  computed: {
    chartData() {
        return {
        labels: Object.keys(this.statistics.hectares_per_month),
        datasets: [
          {
            label: "Hectares affected",
            data: Object.values(this.statistics.hectares_per_month),
            borderColor: "#f87979",
            backgroundColor: 'rgba(0, 0, 0, 0)',
            pointBackgroundColor: "#f87979",
            fill: false
          },
        ],
      };
    },
  },
};
</script>

<style scoped></style>
