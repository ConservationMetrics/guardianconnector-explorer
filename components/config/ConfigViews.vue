<script setup>
import { ref, watch, defineEmits } from "vue";

const props = defineProps({
  tableName: String,
  config: Object,
  views: Array,
  keys: Array,
});

const localViews = ref([...props.views]);

// Set up composables

// Watch for changes to views and emit updates
const emit = defineEmits(["update:views"]);

watch(
  () => props.views,
  (newViews) => {
    localViews.value = [...newViews];
  },
  { deep: true },
);

function updateViews() {
  emit("update:views", localViews.value);
}
</script>

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
