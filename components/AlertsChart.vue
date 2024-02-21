<template>
  <div class="mt-4">
    <h3 class="text-2xl font-semibold mb-2">Alerts in the last 12 months</h3>
    <div class="mb-2">
      <LineChart :data="chartData" />
    </div>
  </div>
</template>

<script>
import { Line as LineChart } from "vue-chartjs";
import {
  Chart,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

Chart.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
);

export default {
  name: "AlertsChart",
  props: ["statistics"],
  components: { LineChart },
  computed: {
    chartData() {
      return {
        labels: Object.keys(this.statistics.hectaresPerMonth),
        datasets: [
          {
            backgroundColor: "rgba(0, 0, 0, 0)",
            borderColor: "#f87979",
            data: Object.values(this.statistics.hectaresPerMonth),
            fill: false,
            label: "Hectares affected",
            pointBackgroundColor: "#f87979",
          },
        ],
      };
    },
  },
};
</script>

<style scoped></style>
