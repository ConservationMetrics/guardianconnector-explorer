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
          v-model="config[key]"
          class="input-field"
        />
      </template>
      <template v-else-if="key === 'MAPEO_CATEGORY_IDS'">
        <component
          v-if="isClient"
          class="tag-field"
          :is="isClient ? 'vue-tags-input' : 'div'"
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
        MAPEO_CATEGORY_IDS: "",
      },
      tags: {
        MAPEO_CATEGORY_IDS: this.config.MAPEO_CATEGORY_IDS
          ? this.config.MAPEO_CATEGORY_IDS.split(",").map((tag) => ({
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
