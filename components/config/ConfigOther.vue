<template>
  <div class="config-section">
    <div class="config-header">
      <h3>{{ $t("other") }} {{ $t("configuration") }}</h3>
    </div>
    <div v-for="key in mediaKeys" :key="key" class="config-field">
      <template v-if="key === 'LOGO_URL'">
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
  },
  data() {
    return {
      mediaKeys: ["LOGO_URL"],
    };
  },
};
</script>
