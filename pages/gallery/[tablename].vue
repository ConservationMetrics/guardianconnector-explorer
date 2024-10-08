<template>
  <div>
    <ClientOnly>
      <GalleryView
        v-if="mediaBasePath && dataFetched"
        :allowed-file-extensions="allowedFileExtensions"
        :gallery-data="galleryData"
        :filter-column="filterColumn"
        :media-base-path="mediaBasePath"
      />
      <h3 v-if="!mediaBasePath && dataFetched">
        {{ $t("galleryNotAvailable") }}.
      </h3>
    </ClientOnly>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useHead, useFetch, useRuntimeConfig } from "#app";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

// Set up config
const {
  public: { appApiKey },
} = useRuntimeConfig();

// Set up composables
const { t } = useI18n();

// Set up reactive state
const allowedFileExtensions = ref({});
const dataFetched = ref(false);
const filterColumn = ref("");
const galleryData = ref([]);
const mediaBasePath = ref("");

// Define headers
const headers = {
  "x-api-key": appApiKey,
};

// Get the current route
const route = useRoute();

// Extract the tablename from the route parameters
const table = route.params.tablename;

const { data, error } = await useFetch(`/api/${table}/gallery`, {
  headers,
});

if (data.value && !error.value) {
  allowedFileExtensions.value = data.value.allowedFileExtensions;
  dataFetched.value = true;
  filterColumn.value = data.value.filterColumn;
  galleryData.value = data.value.data;
  mediaBasePath.value = data.value.mediaBasePath;
} else {
  console.error("Error fetching data:", error.value);
}

// Set up page metadata
useHead({
  title: "GuardianConnector Explorer" + t("gallery"),
});
</script>
