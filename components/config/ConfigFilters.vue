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
          v-model="config[key]"
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

<script>
import { toCamelCase } from "@/src/utils.ts";
export default {
  props: {
    tableName: String,
    config: Object,
    views: Array,
    keys: Array,
  },
  components: {
    VueTagsInput: () => import("@johmun/vue-tags-input"),
  },
  data() {
    return {
      tagInputs: {
        FILTER_OUT_VALUES_FROM_COLUMN: "",
        UNWANTED_COLUMNS: "",
        UNWANTED_SUBSTRINGS: "",
      },
      tags: {
        FILTER_OUT_VALUES_FROM_COLUMN: this.config.FILTER_OUT_VALUES_FROM_COLUMN
          ? this.config.FILTER_OUT_VALUES_FROM_COLUMN.split(",").map((tag) => ({
              text: tag,
            }))
          : [],
        UNWANTED_COLUMNS: this.config.UNWANTED_COLUMNS
          ? this.config.UNWANTED_COLUMNS.split(",").map((tag) => ({
              text: tag,
            }))
          : [],
        UNWANTED_SUBSTRINGS: this.config.UNWANTED_SUBSTRINGS
          ? this.config.UNWANTED_SUBSTRINGS.split(",").map((tag) => ({
              text: tag,
            }))
          : [],
      },
      isClient: false,
    };
  },
  methods: {
    toCamelCase: toCamelCase,
    updateTags(key, newTags) {
      this.tags[key] = newTags;
      this.config[key] = newTags.map((tag) => tag.text).join(",");
    },
  },
  mounted() {
    this.isClient = true;
  },
};
</script>
