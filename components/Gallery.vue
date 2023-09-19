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
      v-for="(feature, index) in filteredData"
      :key="index"
      :embed-media="embedMedia"
      :media-base-path="mediaBasePath"
      :file-paths="getFilePaths(feature, allExtensions)"
      :feature="feature"
      :image-extensions="imageExtensions"
      :audio-extensions="audioExtensions"
      :video-extensions="videoExtensions"
    />
  </div>
</template>

<script>
import Feature from "@/components/Feature.vue";
import DataFilter from "@/components/DataFilter.vue";
import getFilePaths from "@/src/utils.ts";

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
    "mediaBasePath"
  ],
  data() {
    return {
      filteredData: this.data,
    };
  },
  computed: {
    allExtensions() {
      return [
        ...this.imageExtensions,
        ...this.audioExtensions,
        ...this.videoExtensions,
      ];
    },
  },
  methods: {
    getFilePaths: getFilePaths,
    filter(value) {
      if (value === 'null') {
        this.filteredData = this.data;
      } else {
        this.filteredData = this.data.filter(item => item[this.filterField] === value);
      }
    },
  },
};
</script>

<style scoped></style>
