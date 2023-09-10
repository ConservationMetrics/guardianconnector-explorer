<template>
  <div>
    <div v-if="isImage" class="mb-4">
      <a
        :href="mediaBasePath + '/' + filePath"
        target="_blank"
        :data-lightbox="filePath"
        :data-title="filePath"
      >
        <img
          :src="mediaBasePath + '/' + filePath"
          alt="Image"
          class="w-full h-auto rounded-lg"
          loading="lazy"
        />
      </a>
    </div>
    <div v-if="isAudio" class="mb-4">
      <audio controls class="w-full" preload="none">
        <source
          :src="mediaBasePath + '/' + filePath"
          :type="'audio/' + getExtension(filePath)"
        />
        Your browser does not support the audio element.
      </audio>
    </div>
    <div v-if="isVideo" class="mb-4">
      <video controls class="w-full h-auto rounded-lg" preload="none">
        <source
          :src="mediaBasePath + '/' + filePath"
          :type="'video/' + getExtension(filePath)"
        />
        Your browser does not support the video element.
      </video>
    </div>
  </div>
</template>

<script>
export default {
  props: [
    "mediaBasePath",
    "filePath",
    "imageExtensions",
    "audioExtensions",
    "videoExtensions",
  ],
  computed: {
    isImage() {
      const extension = this.getExtension(this.filePath);
      return this.imageExtensions.includes(extension);
    },
    isAudio() {
      const extension = this.getExtension(this.filePath);
      return this.audioExtensions.includes(extension);
    },
    isVideo() {
      const extension = this.getExtension(this.filePath);
      return this.videoExtensions.includes(extension);
    },
  },
  methods: {
    getExtension(filePath) {
      return filePath.split(".").pop().toLowerCase();
    },
  },
};
</script>

<style scoped></style>
