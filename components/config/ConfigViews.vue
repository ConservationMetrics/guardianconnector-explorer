<template>
  <div class="config-section">
    <div v-for="key in keys" :key="key" class="config-field">
      <template v-if="key === 'VIEWS'">
        <div class="config-header">
          <h3>{{ $t("views") }}</h3>
        </div>
        <div class="views-checkboxes">
          <label>
            <input
              type="checkbox"
              value="map"
              v-model="localViews"
              @change="updateViews"
            />
            {{ $t("map") }}
          </label>
          <label>
            <input
              type="checkbox"
              value="gallery"
              v-model="localViews"
              @change="updateViews"
            />
            {{ $t("gallery") }}
          </label>
          <label>
            <input
              type="checkbox"
              value="alerts"
              v-model="localViews"
              @change="updateViews"
            />
            {{ $t("alerts") }}
          </label>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    tableName: String,
    config: Object,
    views: Array,
    keys: Array,
  },
  data() {
    return {
      localViews: [...this.views],
    };
  },
  watch: {
    views: {
      handler(newViews) {
        this.localViews = [...newViews];
      },
      deep: true,
    },
  },
  methods: {
    updateViews() {
      this.$emit("update:views", this.localViews);
    },
  },
};
</script>
