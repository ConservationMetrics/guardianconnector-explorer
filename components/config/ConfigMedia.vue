<template>
  <div class="config-section">
    <div class="config-header">
      <h3>{{ $t("media") }} {{ $t("configuration") }}</h3>
    </div>
    <div v-for="key in keys" :key="key" class="config-field">
      <template
        v-if="key === 'MEDIA_BASE_PATH_ALERTS' && views.includes('alerts')"
      >
        <label :for="`${tableName}-${key}`">{{ $t(key) }}</label>
        <input
          :id="`${tableName}-${key}`"
          v-model="config[key]"
          class="input-field"
          type="url"
        />
      </template>
      <template v-else-if="key === 'MEDIA_BASE_PATH'">
        <label :for="`${tableName}-${key}`">{{ $t(key) }}</label>
        <input
          :id="`${tableName}-${key}`"
          v-model="config[key]"
          class="input-field"
          type="url"
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
    views: Array,
    keys: Array,
  },
};
</script>
