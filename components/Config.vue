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
        @remove-table-from-config="handleRemoveTableFromConfig"
      />
    </div>
      <button 
        @click="handleAddNewTable"
        class="text-white font-bold bg-blue-500 hover:bg-blue-700 py-2 px-4 rounded transition-colors duration-200"
      >
        + {{ $t("addNewTable") }}
      </button>   
    <div v-if="showModal" class="overlay"></div>
    <div v-if="showModal" class="modal">
      <p v-html="modalMessage"></p>
      <div v-if="showModalButtons" class="mt-4">
        <button
          @click="handleConfirmButton"
          class="text-white font-bold bg-red-500 hover:bg-red-700 py-2 px-4 rounded transition-colors duration-200 mb-2 md:mb-0"
        >
          {{ $t("confirm") }}
        </button>
        <button
          @click="handleCancelButton"
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
      currentModalAction: null,
      showModal: false,
      showModalButtons: false,
      showNewTableDropdown: false,
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
    handleAddNewTable() {
      this.modalMessage = this.$t("selectTableToAdd");
      this.currentModalAction = "addTable";
      this.showModal = true;
      this.showModalButtons = true;
    },
    handleRemoveTableFromConfig(tableName) {
      this.modalMessage =
        this.$t("removeTableAreYouSure") +
        ": <strong>" +
        tableName +
        "</strong>?<br><br><em>" +
        this.$t("tableRemovedNote") +
        ".</em>";
      this.currentModalAction = "removeTable";
      this.showModal = true;
      this.showModalButtons = true;
      this.tableNameToRemove = tableName;
    },
    handleConfirmButton() {
      if (this.currentModalAction === "removeTable") {
        this.$emit("remove-table-from-config", this.tableNameToRemove);
        this.modalMessage = this.$t("tableRemovedFromViews") + "!";
      } else if (this.currentModalAction === "addTable") {
        // TODO: Get table name from dropdown
        this.tableNameToAdd = "table_" + Math.floor(Math.random() * 1000);
        this.$emit("add-table-to-config", this.tableNameToAdd);
        this.modalMessage = this.$t("tableAddedToViews") + "!";
      }
      this.showModalButtons = false;
      setTimeout(() => {
        this.showModal = false;
        this.currentModalAction = null;
        location.reload();
      }, 3000);
    },
    handleCancelButton() {
      this.modalMessage = "";
      this.tableNameToRemove = "";
      this.showModal = false;
      this.showModalButtons = false;
      this.currentModalAction = null;
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
  margin: 0 auto 1em auto;
}
</style>
