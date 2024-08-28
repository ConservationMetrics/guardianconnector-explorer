<template>
  <div class="container relative">
    <div class="absolute top-0 right-4 flex justify-end space-x-4 mb-4">
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
        @delete-config="handleDelete"
      />
    </div>
    <div v-if="showModal" class="overlay"></div>
    <div v-if="showModal" class="modal">
      <p>
        {{ modalMessage }}: <strong> {{ this.tableNameToDelete }}</strong
        >?
      </p>
      <div v-if="showDeleteModal" class="mt-4">
        <button
          @click="confirmDelete"
          class="text-white font-bold bg-red-500 hover:bg-red-700 py-2 px-4 rounded transition-colors duration-200 mb-2 md:mb-0"
        >
          {{ $t("confirm") }}
        </button>
        <button
          @click="cancelDelete"
          class="text-white font-bold bg-gray-500 hover:bg-gray-700 py-2 px-4 rounded transition-colors duration-200 mb-2 md:mb-0"
        >
          {{ $t("cancel") }}
        </button>
      </div>
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
      showDeleteModal: false,
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
    handleDelete(tableName) {
      this.modalMessage = this.$t("deleteViewAreYouSure");
      this.showModal = true;
      this.showDeleteModal = true;
      this.tableNameToDelete = tableName;
    },
    confirmDelete() {
      this.$emit("delete-config", this.tableNameToDelete);
      this.showModal = false;
      this.showDeleteModal = false;
    },
    cancelDelete() {
      this.modalMessage = "";
      this.tableNameToDelete = "";
      this.showModal = false;
      this.showDeleteModal = false;
    },
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
