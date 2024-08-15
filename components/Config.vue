<template>
  <div class="container relative">
    <div class="absolute top-0 right-0 flex justify-end space-x-4 mb-4">
      <LanguagePicker />
    </div>
    <h1>{{ $t("availableViews") }}: {{ $t("configuration") }}</h1>
    <div class="grid-container">
      <ConfigCard
        v-for="(config, tableName) in viewsConfig"
        :key="tableName"
        :tableName="tableName"
        :config="config"
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
import overlayModal from "@/components/shared/overlay.css";

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
    };
  },
  methods: {
    async handleSubmit(tableName, config) {
      this.$emit("submit-config", tableName, config);
      this.modalMessage = this.$t("configUpdated") + "!";
      this.showModal = true;
      setTimeout(() => {
        this.showModal = false;
        location.reload();
      }, 3000);
    },
  },
};
</script>

<style scoped>
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
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(400px, 1fr)
  ); /* Increased min-width to 400px */
  gap: 1em;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
