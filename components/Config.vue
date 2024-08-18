<template>
  <div class="container relative">
    <div class="absolute top-0 right-0 flex justify-end space-x-4 mb-4">
      <LanguagePicker />
    </div>
    <h1>{{ $t("availableViews") }}: {{ $t("configuration") }}</h1>
    <div class="grid-container">
      <ConfigCard
        v-for="(config, tableName) in sortedViewsConfig"
        :key="tableName"
        :tableName="tableName"
        :config="config"
        :isMinimized="minimizedCards[tableName]"
        @toggle-minimize="toggleMinimize"
        @submit-config="handleSubmit"
      />
    </div>
    <div v-if="showModal" class="overlay"></div>
    <div v-if="showModal" class="modal">
      {{ modalMessage }}
    </div>
  </div>
</template>

<script>
import ConfigCard from "./config/ConfigCard.vue";
import LanguagePicker from "./shared/LanguagePicker.vue";

export default {
  components: {
    ConfigCard,
    LanguagePicker,
  },
  props: {
    viewsConfig: Object,
  },
  data() {
    return {
      showModal: false,
      minimizedCards: this.initializeMinimizedCards(),
    };
  },
  computed: {
    sortedViewsConfig() {
      return Object.keys(this.viewsConfig)
        .sort()
        .reduce((acc, key) => {
          acc[key] = this.viewsConfig[key];
          return acc;
        }, {});
    },
  },
  methods: {
    initializeMinimizedCards() {
      const minimized = {};
      for (const tableName in this.viewsConfig) {
        minimized[tableName] = true;
      }
      return minimized;
    },
    async handleSubmit(tableName, config) {
      this.$emit("submit-config", tableName, config);
      this.modalMessage = this.$t("configUpdated") + "!";
      this.showModal = true;
      setTimeout(() => {
        this.showModal = false;
        location.reload();
      }, 3000);
    },
    toggleMinimize(tableName) {
      const isCurrentlyMinimized = this.minimizedCards[tableName];
      for (let key in this.minimizedCards) {
        this.$set(this.minimizedCards, key, true);
      }
      this.$set(this.minimizedCards, tableName, !isCurrentlyMinimized);
    },
  },
};
</script>

<style scoped>
@import "@/components/shared/overlay.css";

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2em;
}

.container h1 {
  color: #333;
  margin-bottom: 1em;
  font-size: 2em;
  font-weight: 900;
}

.grid-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1em;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
