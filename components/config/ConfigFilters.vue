<template>
  <div class="config-section">
    <div class="config-header">
      <h3>{{ $t("filtering") }} {{ $t("configuration") }}</h3>
    </div>
    <div v-for="key in keys" :key="key" class="config-field">
      <template v-if="key === 'FRONT_END_FILTER_COLUMN'">
        <label :for="`${tableName}-${key}`">{{ $t(toCamelCase(key)) }}</label>
        <input
          :id="`${tableName}-${key}`"
          v-model="localConfig[key]"
          class="input-field"
        />
      </template>
      <template
        v-else-if="
          key === 'FILTER_OUT_VALUES_FROM_COLUMN' ||
          key === 'UNWANTED_COLUMNS' ||
          key === 'UNWANTED_SUBSTRINGS'
        "
      >
        <label :for="`${tableName}-${key}`">{{ $t(toCamelCase(key)) }}</label>

        <component
          class="tag-field"
          :is="isClient ? 'vue-tags-input' : 'div'"
          v-if="isClient"
          v-model="tagInputs[key]"
          :tags="tags[key]"
          @tags-changed="updateTags(key, $event)"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits, onMounted, reactive, watch } from "vue";
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
const tagInputs = ref({
  FILTER_OUT_VALUES_FROM_COLUMN: "",
  UNWANTED_COLUMNS: "",
  UNWANTED_SUBSTRINGS: "",
});
const localConfig = reactive({ ...props.config });
const tags = ref({
  FILTER_OUT_VALUES_FROM_COLUMN: props.config.FILTER_OUT_VALUES_FROM_COLUMN
    ? props.config.FILTER_OUT_VALUES_FROM_COLUMN.split(",").map((tag) => ({
        text: tag,
      }))
    : [],
  UNWANTED_COLUMNS: props.config.UNWANTED_COLUMNS
    ? props.config.UNWANTED_COLUMNS.split(",").map((tag) => ({
        text: tag,
      }))
    : [],
  UNWANTED_SUBSTRINGS: props.config.UNWANTED_SUBSTRINGS
    ? props.config.UNWANTED_SUBSTRINGS.split(",").map((tag) => ({
        text: tag,
      }))
    : [],
});

const isClient = ref(false);

// Methods
function updateTags(key, newTags) {
  tags.value[key] = newTags;
  localConfig[key] = newTags.map((tag) => tag.text).join(",");
}

// Lifecycle hooks
onMounted(async () => {
  isClient.value = true;
});

// Watch for changes in localConfig and emit updates
watch(
  localConfig,
  (newValue) => {
    emit("updateConfig", newValue);
  },
  { deep: true }
);
</script>
