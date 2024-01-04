<template>
  <div class="mt-4">
    <h3 class="text-2xl font-semibold mb-2">Select an alert date range</h3>
    <div class="mb-6">
      <vue-slider
        class="date-slider"
        v-model="selectedRange"
        :data="dateOptions"
        :contained="true"
        :height="8"
        :marks="true"
        :hide-label="true"
        :tooltip="'always'"
        :tooltipPlacement="'bottom'"
      />
    </div>
  </div>
</template>

<script>
import VueSlider from "vue-slider-component/dist-css/vue-slider-component.umd.min.js";
import "vue-slider-component/dist-css/vue-slider-component.css";
import "vue-slider-component/theme/default.css";

export default {
  name: "AlertSlider",
  props: ["dateOptions"],
  data() {
    return {
      selectedRange: [],
    };
  },
  created() {
    if (this.dateOptions && this.dateOptions.length > 0) {
      this.selectedRange = [
        this.dateOptions[0],
        this.dateOptions[this.dateOptions.length - 1],
      ];
    }
  },
  components: { VueSlider },
};
</script>

<style scoped></style>
