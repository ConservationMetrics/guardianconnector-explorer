<template>
  <div class="filter-modal">
    <h4>
      {{ $t("filterDataByColumn") }}: <strong>{{ filterColumn }}</strong>
    </h4>
    <v-select
      multiple
      :options="uniqueValues"
      @input="emitFilter"
      label="label"
      v-model="selectedValue"
    >
      <!-- These are the options in the dropdown -->
      <template v-slot:option="option">
        <span
          class="colored-dot"
          v-if="showColoredDot"
          :style="{ backgroundColor: option.color }"
        ></span>
        {{ option.label }}
      </template>
      <!-- This is what shows in the listbox when selected -->
      <template v-slot:selected-option="option">
        <span
          class="colored-dot"
          v-if="showColoredDot"
          :style="{ backgroundColor: option.color }"
        ></span>
        {{ option.label }}
      </template>
    </v-select>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";

// Define props
const props = defineProps({
  data: Array,
  filterColumn: String,
  showColoredDot: Boolean,
});

// Set up reactive state
const defaultColor = "#ffffff";
const selectedValue = ref([]);

// Set up computed properties
const uniqueValues = computed(() => {
  const values = props.data
    .map((item) => ({
      label: item[props.filterColumn],
      value: item[props.filterColumn],
      color: item["filter-color"] ? item["filter-color"] : defaultColor,
    }))
    .filter(
      (item) =>
        item.value !== null && item.value !== "" && item.value !== undefined,
    );

  // Filter out the selected values
  const filteredValues = values.filter(
    (value) => !selectedValue.value.map((v) => v.value).includes(value.value),
  );

  return [
    ...new Map(filteredValues.map((item) => [item.value, item])).values(),
  ];
});

// Define methods
function emitFilter() {
  if (selectedValue.value.length > 0) {
    const labels = selectedValue.value.map((item) => item.label);
    emit("filter", labels);
  } else {
    emit("filter", "null");
  }
}
</script>

<style scoped>
.filter-modal {
  position: absolute;
  top: 10px;
  right: 50px;
  min-width: 325px;
  max-width: 600px;
  background: #f5f5f5;
  padding: 10px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 10px; /* Rounded corners */
  z-index: 1000;

  h4 {
    font-size: 1.2em;
    margin: 0;
    color: #333;
  }

  .v-select {
    width: 100%;
    margin: 5px 0;
    padding: 5px;

    --vs-selected-bg: #f9f9f9;

    .colored-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      display: inline-block;
      margin-right: 5px;
    }
  }

  .no-data {
    font-style: italic;
    max-width: 150px;
    color: #999;
  }
}
</style>
