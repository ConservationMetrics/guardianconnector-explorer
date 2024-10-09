<script setup>
import { ref } from "vue";
import { useHead, useFetch, useRuntimeConfig } from "#app";
import { useI18n } from "vue-i18n";

// Set up config
const {
  public: { appApiKey },
} = useRuntimeConfig();

// Set up composables
const { t } = useI18n();

// Set up reactive state
const viewsConfig = ref([]);
const tableNames = ref([]);
const dataFetched = ref(false);

// Define headers
const headers = {
  "x-api-key": appApiKey,
};

// Fetch config
const { data, error } = await useFetch("/api/config", {
  headers,
});

if (data.value && !error.value) {
  viewsConfig.value = data.value[0];
  tableNames.value = data.value[1];
  dataFetched.value = true;
} else {
  console.error("Error fetching data:", error.value);
}

// Methods
const submitConfig = async ({ config, tableName }) => {
  try {
    await $fetch(`/api/config/update_config/${tableName}`, {
      method: "POST",
      headers,
      body: JSON.stringify(config),
    });
  } catch (error) {
    console.error("Error submitting request data:", error);
  }
};

const removeTableFromConfig = async (tableName) => {
  try {
    await $fetch(`/api/config/delete_table/${tableName}`, {
      method: "POST",
      headers,
    });
  } catch (error) {
    console.error("Error removing table from config:", error);
  }
};

const addTableToConfig = async (tableName) => {
  try {
    await $fetch(`/api/config/new_table/${tableName}`, {
      method: "POST",
      headers,
    });
  } catch (error) {
    console.error("Error adding table to config:", error);
  }
};

// Set up page metadata
useHead({
  title: "GuardianConnector Explorer: " + t("configuration"),
});
</script>

<template>
  <div>
    <ClientOnly>
      <ConfigDashboard
        v-if="dataFetched"
        :views-config="viewsConfig"
        :table-names="tableNames"
        @submitConfig="submitConfig"
        @removeTableFromConfig="removeTableFromConfig"
        @addTableToConfig="addTableToConfig"
    /></ClientOnly>
  </div>
</template>
