<template>
  <div class="filter-modal">
    <h4>
      {{ $t("filterDataByField") }}: <strong>{{ filterField }}</strong>
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

<script>
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";

export default {
  components: { vSelect },
  props: ["data", "filterField", "showColoredDot"],
  data() {
    return {
      defaultColor: "#ffffff",
      selectedValue: [],
    };
  },
  computed: {
    uniqueValues() {
      const values = this.data
        .map((item) => ({
          label: item[this.filterField],
          value: item[this.filterField],
          color: item["filter-color"]
            ? item["filter-color"]
            : this.defaultColor,
        }))
        .filter(
          (item) =>
            item.value !== null &&
            item.value !== "" &&
            item.value !== undefined,
        );

      // Filter out the selected values
      const filteredValues = values.filter(
        (value) =>
          !this.selectedValue.map((v) => v.value).includes(value.value),
      );

      return [
        ...new Map(filteredValues.map((item) => [item.value, item])).values(),
      ];
    },
  },
  methods: {
    emitFilter() {
      if (this.selectedValue.length > 0) {
        const labels = this.selectedValue.map((item) => item.label);
        this.$emit("filter", labels);
      } else {
        this.$emit("filter", "null");
      }
    },
  },
};
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
