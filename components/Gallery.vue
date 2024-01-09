<template>
  <div
    id="galleryContainer"
    class="gallery p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
  >
    <div class="sticky top-10 right-10 z-10">
      <DataFilter
        v-if="filterData === true"
        :data="data"
        :filter-field="filterField"
        @filter="filter"
      />
    </div>
    <Feature
      v-for="(feature, index) in paginatedData"
      :key="index"
      :embed-media="embedMedia"
      :file-paths="getFilePathsWithExtension(feature, allExtensions)"
      :feature="feature"
      :media-base-path="mediaBasePath"
      :image-extensions="imageExtensions"
      :audio-extensions="audioExtensions"
      :video-extensions="videoExtensions"
    />
  </div>
</template>

<script>
import Feature from "@/components/Feature.vue";
import DataFilter from "@/components/DataFilter.vue";
import { getFilePathsWithExtension } from "@/src/utils.ts";

export default {
  components: { Feature, DataFilter },
  props: [
    "data",
    "filterData",
    "filterField",
    "imageExtensions",
    "audioExtensions",
    "videoExtensions",
    "embedMedia",
    "mediaBasePath",
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
          values.includes(item[this.filterField])
        );
      }
    },
  },
};
</script>

<style scoped></style>
