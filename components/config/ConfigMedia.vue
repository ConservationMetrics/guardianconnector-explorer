<template>
  <div class="config-section">
    <div class="config-header">
      <h3>{{ $t("media") }} {{ $t("configuration") }}</h3>
    </div>
    <div v-for="key in keys" :key="key" class="config-field">
      <template
        v-if="key === 'MEDIA_BASE_PATH_ALERTS' && views.includes('alerts')"
      >
        <label :for="`${tableName}-${key}`">{{ $t(toCamelCase(key)) }}</label>
        <input
          :id="`${tableName}-${key}`"
          v-model="localConfig[key]"
          class="input-field"
          placeholder="https://…"
          type="url"
        />
      </template>
      <template v-else-if="key === 'MEDIA_BASE_PATH'">
        <label :for="`${tableName}-${key}`">{{ $t(toCamelCase(key)) }}</label>
        <input
          :id="`${tableName}-${key}`"
          v-model="localConfig[key]"
          class="input-field"
          placeholder="https://…"
          type="url"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import { defineEmits, reactive, watch } from "vue";
import { toCamelCase } from "@/utils";

// Define props
const props = defineProps({
  tableName: String,
  config: Object,
  views: Array,
  keys: Array,
});

// Set up composables
const emit = defineEmits(["updateConfig"]);

// Set up reactive state
const localConfig = reactive({ ...props.config });

// Watch for changes in localConfig and emit updates
watch(
  localConfig,
  (newValue) => {
    emit("updateConfig", newValue);
  },
  { deep: true }
);
</script>
