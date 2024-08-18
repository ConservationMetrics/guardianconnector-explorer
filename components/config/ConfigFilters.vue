<template>
    <div class="config-section">
      <div class="config-header">
        <h3>{{ $t("filtering") }} {{ $t("configuration") }}</h3>
    </div>
    <div v-for="key in filterKeys" :key="key" class="config-field">
        <template v-if="key === 'FRONT_END_FILTERING'">
          <label :for="`${tableName}-${key}`">{{ $t(key) }}</label>
          <label :for="`${tableName}-${key}`" class="checkbox-label">
          
            <input
            type="checkbox"
            :id="`${tableName}-${key}`"
            v-model="config[key]"
            />
            {{ $t("enable") }}
        </label>
        </template>
        <template v-else-if="key === 'FRONT_END_FILTER_COLUMN' && config.FRONT_END_FILTERING">
          <label :for="`${tableName}-${key}`">{{ $t(key) }}</label>
          <input
            :id="`${tableName}-${key}`"
            v-model="config[key]"
            class="input-field"
        />
        </template>
        <template
        v-else-if="
            key === 'UNWANTED_COLUMNS' || key === 'UNWANTED_SUBSTRINGS'
        "
        >
        <label :for="`${tableName}-${key}`">{{ $t(key) }}</label>

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
  export default {
    props: {
      tableName: String,
      config: Object,
      views: Array
    },
    components: {
        VueTagsInput: () => import("@johmun/vue-tags-input"),
    },
    data() {
      return {
        tagInputs: {
          UNWANTED_COLUMNS: "",
          UNWANTED_SUBSTRINGS: "",
        },
        tags: {
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
        filterKeys: ["FRONT_END_FILTERING", "FRONT_END_FILTER_COLUMN", "UNWANTED_COLUMNS", "UNWANTED_SUBSTRINGS"],
        isClient: false,
      };
    },
    methods: {
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