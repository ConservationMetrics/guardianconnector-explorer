<template>
  <div class="container">
    <h1>{{ $t("availableViews") }}</h1>
    <div
      v-for="(config, tableName) in tablesConfig"
      :key="tableName"
      class="table-item"
    >
      <h2>
        <strong>{{ $t("table") }}:</strong> {{ tableName }}
      </h2>
      <ul>
        <li v-for="view in config.VIEWS.split(',')" :key="view">
          <nuxt-link :to="`/${view}/${tableName}`">{{ $t(view) }}</nuxt-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tablesConfig: [],
    };
  },
  async mounted() {
    try {
      this.tablesConfig = this.$config.tablesConfig;
    } catch (error) {
      console.error("Error fetching table config on client side:", error);
    }
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
</style>
