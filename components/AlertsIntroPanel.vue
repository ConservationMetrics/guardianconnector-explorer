<template>
<div>
  <div class="feature p-4 rounded-lg shadow-lg">
    <div class="mt-4">
        <h2 class="text-2xl font-semibold mb-2">Change detection alerts dashboard: {{ statistics.territory }} </h2>
        <p class="text-l mb-2">This dashboard shows alerts and statistics about change detection for the selected territory.</p>
        <p class="text-l mb-2">Most recent alerts shown on map in <span style="color: #EC00FF"><strong>purple</strong></span>.</p>
        <div class="mb-2">
            <span class="font-bold">Type of alerts:</span> {{ statistics.type_of_alerts.join(', ') }}
        </div>
        <div class="mb-2">
            <span class="font-bold">Alert detection range:</span> {{ statistics.alert_detection_range }}
        </div>
        <div class="mb-2">
            <span class="font-bold">Date of most recent alerts published:</span> {{ statistics.recent_alerts_date}}
        </div>
        <div class="mb-2">
            <span class="font-bold">Number of most recent alerts:</span> {{ statistics.recent_alerts_number }}
        </div>
        <div class="mb-2">
            <span class="font-bold">Total number of alerts:</span> {{ statistics.alerts_total }}
        </div>
        <div class="mb-2">
            <span class="font-bold">Total number of hectares affected:</span> {{ statistics.hectares_total }}
        </div>
    </div>
  </div>
  <div class="feature p-4 rounded-lg shadow-lg">
        <div class="mt-4">
            <h3 class="text-2xl font-semibold mb-2">Alerts per month</h3>
            <p>{{ statistics.hectares_per_month }}</p>
        </div>
  </div>
</div>
  </template>
  
  <script>
  export default {
    props: ["statistics"],
    methods: {
    },
  };
  </script>
  
  <style scoped>
  </style>
  