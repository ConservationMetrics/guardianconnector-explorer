<template>
  <div class="map-legend feature p-4 rounded-lg shadow-lg">
    <h2 class="text-2xl font-semibold mb-2">{{ $t("mapLegend") }}</h2>
    <div
      v-for="item in localMapLegendContent"
      :key="item.id"
      class="legend-item"
    >
      <input
        class="mr-2"
        type="checkbox"
        :id="item.id"
        v-model="item.visible"
        @change="toggleLayerVisibility(item)"
        :checked="item.visible"
      />
      <label :for="item.id">
        <div
          :class="['color-box', getTypeClass(item)]"
          :style="{ backgroundColor: item.color }"
        ></div>
        <span>
          {{
            item.name === "Mapeo data"
              ? $t("mapeoData")
              : item.name === "Most recent alerts"
                ? $t("mostRecentAlerts")
                : item.name === "Previous alerts"
                  ? $t("previousAlerts")
                  : item.name
          }}
        </span>
      </label>
    </div>
  </div>
</template>

<script>
export default {
  props: ["mapLegendContent"],
  data() {
    return {
      localMapLegendContent: [],
    };
  },
  created() {
    // Ensure all items are visible initially
    this.localMapLegendContent = this.mapLegendContent.map((item) => ({
      ...item,
      visible: true,
    }));
    this.$root.$on("reset-legend-visibility", this.resetLegendVisibility);
  },
  methods: {
    getTypeClass(item) {
      return `${item.type}-box`;
    },
    toggleLayerVisibility(item) {
      this.$emit("toggle-layer-visibility", item);
    },
    resetLegendVisibility() {
      this.localMapLegendContent = this.localMapLegendContent.map((item) => ({
        ...item,
        visible: true,
      }));
    },
  },
  beforeDestroy() {
    this.$root.$off("reset-legend-visibility", this.resetLegendVisibility);
  },
};
</script>

<style scoped>
.map-legend {
  position: absolute;
  bottom: 30px;
  right: 10px;
  max-width: 300px;
  background-color: #fff;
  padding: 20px;
  line-height: 18px;
  overflow-y: auto;
  z-index: 1000;
}

.color-box {
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-right: 10px;
  vertical-align: middle;
  position: relative;
}

.fill-box {
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70% !important;
  transform: rotate(60deg);
}

.line-box {
  display: inline-block;
  width: 20px;
  height: 3px !important;
  transform: translateY(-50%);
}

.circle-box {
  border-radius: 50%;
  width: 10px;
  height: 10px;
  margin: 5px;
  margin-right: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

@media (max-width: 768px) {
  .map-legend {
    display: none;
  }
}
</style>
