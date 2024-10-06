<template>
  <div class="config-section">
    <div class="config-header">
      <h3>{{ $t("alerts") }} {{ $t("configuration") }}</h3>
    </div>
    <div v-for="key in keys" :key="key" class="config-field">
      <label :for="`${tableName}-${key}`">{{ $t(toCamelCase(key)) }}</label>
      <template v-if="key === 'MAPEO_TABLE'">
        <input
          :id="`${tableName}-${key}`"
          v-model="localConfig[key]"
          class="input-field"
        />
      </template>
      <template v-else-if="key === 'MAPEO_CATEGORY_IDS'">
        <VueTagsInput
          class="tag-field"
          v-model="tagInputs[key]"
          :tags="tags[key]"
          @tags-changed="updateTags(key, $event)"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits, reactive, watch } from "vue";
import { toCamelCase } from "@/utils";

import { VueTagsInput } from "@vojtechlanka/vue-tags-input";

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
const tagInputs = ref({
  MAPEO_CATEGORY_IDS: "",
});

const tags = ref({
  MAPEO_CATEGORY_IDS: props.config.MAPEO_CATEGORY_IDS
    ? props.config.MAPEO_CATEGORY_IDS.split(",").map((tag) => ({
        text: tag,
      }))
    : [],
});

// Methods
function updateTags(key, newTags) {
  tags.value[key] = newTags;
  localConfig[key] = newTags.map((tag) => tag.text).join(",");
}

// Watch for changes in localConfig and emit updates
watch(
  localConfig,
  (newValue) => {
    emit("updateConfig", newValue);
  },
  { deep: true },
);
</script>
