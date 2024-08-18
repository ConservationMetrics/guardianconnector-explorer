<template>
    <div class="config-section">
      <div class="config-header">
      <h3>{{ $t("alerts") }} {{ $t("configuration") }}</h3>
    </div>
    <div v-for="key in alertKeys" :key="key" class="config-field">
      <label :for="`${tableName}-${key}`">{{ $t(key) }}</label>
      <template v-if="key === 'ALERT_RESOURCES'">
        <label :for="`${tableName}-${key}`" class="checkbox-label">
          <input
            type="checkbox"
            :id="`${tableName}-${key}`"
            v-model="config[key]"
          />
          {{ $t("enable") }}
        </label>
      </template>
      <template v-else-if="key === 'MAPEO_CATEGORY_IDS' || 'MAPEO_TABLE'">
              <input
                :id="`${tableName}-${key}`"
                v-model="config[key]"
                class="input-field"
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
      alertKeys: ["ALERT_RESOURCES", "MAPEO_CATEGORY_IDS", "MAPEO_TABLE"],
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