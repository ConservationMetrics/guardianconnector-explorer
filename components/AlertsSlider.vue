<template>
  <div class="mt-4 mb-10">
    <h3 class="text-2xl font-semibold mb-2">Select an alert date range</h3>
    <div class="mb-6">
      <vue-slider
        class="date-slider"
        v-model="selectedRange"
        :contained="true"
        :data="dateOptions"
        :height="8"
        :hide-label="true"
        :marks="true"
        :tooltip="'always'"
        :tooltipPlacement="'bottom'"
        @drag-start="userInteracted = true"
      />
    </div>
  </div>
</template>

<script>
// This specific pattern of importing vue-slider-component follows the official
// documentation for server-side rendering: https://nightcatsama.github.io/vue-slider-component/#/
import VueSlider from "vue-slider-component/dist-css/vue-slider-component.umd.min.js";
import "vue-slider-component/dist-css/vue-slider-component.css";
import "vue-slider-component/theme/default.css";

export default {
  name: "AlertSlider",
  props: ["dateOptions"],
  components: { VueSlider },
  data() {
    return {
      selectedRange: [],
      userInteracted: false,
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
  watch: {
    selectedRange(newRange) {
      if (this.userInteracted) {
        this.$emit("date-range-changed", newRange);
      }
    },
  },
};
</script>

<style scoped></style>
