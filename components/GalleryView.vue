<template>
  <div
    id="galleryContainer"
    class="gallery p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
  >
    <div class="sticky top-10 right-10 z-10" v-if="filterColumn">
      <!-- <DataFilter
        :galleryData="galleryData"
        :filter-column="filterColumn"
        @filter="filter"
      /> -->
    </div>
    <DataFeature
      v-for="(feature, index) in paginatedData"
      :audio-extensions="audioExtensions"
      :feature="feature"
      :file-paths="getFilePathsWithExtension(feature, allExtensions)"
      :image-extensions="imageExtensions"
      :key="index"
      :media-base-path="mediaBasePath"
      :video-extensions="videoExtensions"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { getFilePathsWithExtension } from "@/utils";

import DataFeature from "@/components/shared/DataFeature.vue";

// Define props
const props = defineProps({
  audioExtensions: Array,
  filterColumn: String,
  galleryData: Object,
  imageExtensions: Array,
  mediaBasePath: String,
  videoExtensions: Array,
});

// Set up reactive state
const filteredData = ref(props.galleryData);
const currentPage = ref(1);
const itemsPerPage = 100;

// Set up computed properties
const paginatedData = computed(() => {
  const start = 0;
  const end = currentPage.value * itemsPerPage;
  return filteredData.value.slice(start, end);
});

const allExtensions = computed(() => [
  ...props.imageExtensions,
  ...props.audioExtensions,
  ...props.videoExtensions,
]);

// Define methods
function handleScroll() {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
    currentPage.value++;
  }
}

function filter(values) {
  if (values.includes("null")) {
    filteredData.value = props.galleryData;
  } else {
    filteredData.value = props.galleryData.filter((item) =>
      values.includes(item[props.filterColumn]),
    );
  }
}

// Lifecycle hooks
onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>
