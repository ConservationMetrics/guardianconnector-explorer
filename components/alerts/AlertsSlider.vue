<template>
  <div class="mt-4 mb-10">
    <h3 class="text-2xl font-semibold mb-2">
      {{ $t("selectAlertDateRange") }}
    </h3>
    <div class="mb-6">
      <VueSlider
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

<script setup>
import VueSlider from "vue-3-slider-component";

import { ref, watch, onMounted, defineEmits } from "vue";

// Define emits
const emit = defineEmits(["date-range-changed"]);

// Define props
const props = defineProps({
  dateOptions: Array,
});

// Set up reactive state
const selectedRange = ref([]);
const userInteracted = ref(false);

// Lifecycle hooks
onMounted(() => {
  if (props.dateOptions && props.dateOptions.length > 0) {
    selectedRange.value = [
      props.dateOptions[0],
      props.dateOptions[props.dateOptions.length - 1],
    ];
  }
});

// Watchers
watch(selectedRange, (newRange) => {
  if (userInteracted.value) {
    emit("date-range-changed", newRange);
  }
});
</script>
