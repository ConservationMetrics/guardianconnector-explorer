<template>
  <div class="table-item card">
    <h2 class="card-header">
      <strong>{{ $t("table") }}:</strong> {{ tableName }}
    </h2>
    <div class="card-body">
      <form @submit.prevent="handleSubmit">
        <div v-for="(value, key) in config" :key="key" class="config-field">
          <label :for="`${tableName}-${key}`">{{ $t(key) }}</label>
          <input
            :id="`${tableName}-${key}`"
            v-model="config[key]"
            class="input-field"
          />
        </div>
        <button
          type="submit"
          class="submit-button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer transition-colors duration-200 md:block"
        >
          {{ $t("submit") }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    tableName: String,
    config: Object,
  },
  methods: {
    handleSubmit() {
      this.$emit("submit-config", this.tableName, this.config);
    },
  },
};
</script>

<style scoped>
.table-item {
  background-color: #f9f9f9;
  border-radius: 5px;
  padding: 1em;
  margin-bottom: 1em;
  width: 50%;
}

.table-item h2 {
  color: #333;
  margin-bottom: 0.5em;
}

.table-item ul {
  list-style: none;
  padding: 0;
}

.table-item ul li {
  margin-bottom: 0.5em;
}

.table-item ul li a {
  color: #007bff;
  text-decoration: none;
}

.table-item ul li a:hover {
  color: #0056b3;
  text-decoration: underline;
}

.table-item.card {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1em;
  width: 100%;
  max-width: 600px;
}

.card-header {
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
  padding: 0.75em 1em;
  font-size: 1.25em;
  font-weight: bold;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.card-body {
  padding: 1em;
}

.config-field {
  margin-bottom: 1em;
}

.config-field label {
  display: block;
  margin-bottom: 0.5em;
  font-weight: bold;
}

.config-field .input-field {
  width: 100%;
  padding: 0.5em;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
