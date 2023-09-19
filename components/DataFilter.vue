<template>
    <div class="filter-modal">
      <h4>Filter data by field: <strong>{{ filterField }}</strong> </h4>
      <select v-model="selectedValue" @change="emitFilter" v-if="uniqueValues.length > 0">
        <option disabled value="">Select field</option>
        <option value="null">Show all data</option>
        <option v-for="value in uniqueValues" :key="value" :value="value">
          {{ value }}
        </option>
      </select>
      <p class="no-data" v-else><i>No data found that matches {{ filterField }}.</i></p>
    </div>
  </template>
  
  <script>
  export default {
    props: ['data', 'filterField'],
    data() {
      return {
        selectedValue: "",
      };
    },
    computed: {
      uniqueValues() {
        const values = this.data
          .map(item => item[this.filterField])
          .filter(value => value !== null && value !== '' && value !== undefined);
        console.log(values)
        return [...new Set(values)];
      },
    },
    methods: {
      emitFilter() {
        this.$emit('filter', this.selectedValue);
      },
    },
  };
  </script>
  
  <style scoped>
  .filter-modal {
    position: absolute;
    top: 10px;
    right: 10px;
    min-width: 150px;
    background: #f5f5f5;
    padding: 10px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
    border-radius: 10px; /* Rounded corners */
    z-index: 1000;
    
    h4 {
      font-size: 1.2em;
      margin: 0;
      color: #333; 
    }

    select { 
      width: 100%;
      margin: 5px 0;
      padding: 5px;
    }

    .no-data {
      font-style: italic;
      max-width: 150px;
      color: #999;
    }
  }

  </style>