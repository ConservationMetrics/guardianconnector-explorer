<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { getFilePathsWithExtension } from "@/utils";

import DataFilter from "@/components/shared/DataFilter.vue";
import DataFeature from "@/components/shared/DataFeature.vue";

const props = defineProps({
  allowedFileExtensions: Object,
  filterColumn: String,
  galleryData: Object,
  mediaBasePath: String,
});

const filteredData = ref(props.galleryData);

// Pagination per page
const currentPage = ref(1);
const itemsPerPage = 100;
const paginatedData = computed(() => {
  const start = 0;
  const end = currentPage.value * itemsPerPage;
  return filteredData.value.slice(start, end);
});

const handleScroll = () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
    currentPage.value++;
  }
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
});

// Filter data based on selected values from DataFilter component
const filterValues = (values) => {
  if (values.includes("null")) {
    filteredData.value = props.galleryData;
  } else {
    filteredData.value = props.galleryData.filter((item) =>
      values.includes(item[props.filterColumn]),
    );
  }
};

// Lifecycle hooks
</script>

<template>
  <div
    id="galleryContainer"
    class="gallery p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
  >
    <div class="sticky top-10 right-10 z-10" v-if="filterColumn">
      <DataFilter
        :data="galleryData"
        :filter-column="filterColumn"
        @filter="filterValues"
      />
    </div>
    <DataFeature
      v-for="(feature, index) in paginatedData"
      :allowed-file-extensions="allowedFileExtensions"
      :feature="feature"
      :file-paths="getFilePathsWithExtension(feature, allowedFileExtensions)"
      :key="index"
      :media-base-path="mediaBasePath"
    />
  </div>
</template>
