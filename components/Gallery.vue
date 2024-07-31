<template>
  <div
    id="galleryContainer"
    class="gallery p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
  >
    <div class="sticky top-10 right-10 z-10">
      <DataFilter
        v-if="filterData === true"
        :data="data"
        :filter-column="filterColumn"
        @filter="filter"
      />
    </div>
    <Feature
      v-for="(feature, index) in paginatedData"
      :audio-extensions="audioExtensions"
      :embed-media="embedMedia"
      :feature="feature"
      :file-paths="getFilePathsWithExtension(feature, allExtensions)"
      :image-extensions="imageExtensions"
      :key="index"
      :media-base-path="mediaBasePath"
      :video-extensions="videoExtensions"
    />
  </div>
</template>

<script>
import DataFilter from "@/components/DataFilter.vue";
import Feature from "@/components/Feature.vue";
import { getFilePathsWithExtension } from "@/src/utils.ts";

export default {
  components: { DataFilter, Feature },
  props: [
    "audioExtensions",
    "data",
    "embedMedia",
    "filterData",
    "filterColumn",
    "imageExtensions",
    "mediaBasePath",
    "videoExtensions",
  ],
  data() {
    return {
      filteredData: this.data,
      currentPage: 1,
      itemsPerPage: 100,
    };
  },
  computed: {
    paginatedData() {
      const start = 0;
      const end = this.currentPage * this.itemsPerPage;
      return this.filteredData.slice(start, end);
    },
    allExtensions() {
      return [
        ...this.imageExtensions,
        ...this.audioExtensions,
        ...this.videoExtensions,
      ];
    },
  },
  mounted() {
    window.addEventListener("scroll", this.handleScroll);
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    handleScroll() {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        this.currentPage++;
      }
    },
    getFilePathsWithExtension: getFilePathsWithExtension,
    filter(values) {
      if (values.includes("null")) {
        this.filteredData = this.data;
      } else {
        this.filteredData = this.data.filter((item) =>
          values.includes(item[this.filterColumn]),
        );
      }
    },
  },
};
</script>

<style scoped></style>
