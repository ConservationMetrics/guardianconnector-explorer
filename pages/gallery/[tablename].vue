<template>
  <div>
    <ClientOnly>
      <GalleryView
        v-if="mediaBasePath && dataFetched"
        :audio-extensions="audioExtensions"
        :gallery-data="galleryData"
        :filter-column="filterColumn"
        :image-extensions="imageExtensions"
        :media-base-path="mediaBasePath"
        :video-extensions="videoExtensions"
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

// Set up config
const {
  public: { appApiKey },
} = useRuntimeConfig();

// Set up reactive state
const audioExtensions = ref([]);
const dataFetched = ref(false);
const filterColumn = ref("");
const galleryData = ref([]);
const imageExtensions = ref([]);
const mediaBasePath = ref("");
const videoExtensions = ref([]);

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
  audioExtensions.value = data.value.audioExtensions;
  dataFetched.value = true;
  filterColumn.value = data.value.filterColumn;
  galleryData.value = data.value.data;
  imageExtensions.value = data.value.imageExtensions;
  mediaBasePath.value = data.value.mediaBasePath;
  videoExtensions.value = data.value.videoExtensions;
} else {
  console.error("Error fetching data:", error.value);
}

// Set up page metadata
useHead({
  title: "GuardianConnector Explorer",
});
</script>
