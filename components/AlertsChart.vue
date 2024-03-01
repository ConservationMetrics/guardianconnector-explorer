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
  props: ["statistics", "calculateHectares"],
  components: { LineChart },
  computed: {
    chartData() {
      // Determine which dataset to use based on the calculateHectares prop
      const dataKey = this.calculateHectares ? 'hectaresPerMonth' : 'alertsPerMonth';
      const label = this.calculateHectares ? 'Hectares affected' : 'Number of alerts';

      return {
        labels: Object.keys(this.statistics[dataKey]),
        datasets: [
          {
            backgroundColor: "rgba(0, 0, 0, 0)",
            borderColor: "#f87979",
            data: Object.values(this.statistics[dataKey]),
            fill: false,
            label: label,
            pointBackgroundColor: "#f87979",
          },
        ],
      };
    },
  },
};
</script>