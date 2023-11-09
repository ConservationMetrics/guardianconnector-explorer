<template>
  <div class="container">
    <h1>Available Views</h1>
    <div v-for="table in tables" :key="table" class="table-item">
      <h2><strong>Table:</strong> {{ table }}</h2>
      <ul>
        <li>
          <nuxt-link :to="`/${table}/map`">Map</nuxt-link>
        </li>
        <li v-if="embedMedia">
          <nuxt-link :to="`/${table}/gallery`">Gallery</nuxt-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tables: process.env.NUXT_ENV_TABLES.split(','),
      embedMedia: process.env.EMBED_MEDIA.toUpperCase() === 'YES',
    };
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
  color: #007BFF;
  text-decoration: none;
}

.table-item ul li a:hover {
  color: #0056b3;
  text-decoration: underline;
}
</style>
