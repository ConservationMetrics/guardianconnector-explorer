<template>
    <div class="map-legend feature p-4 rounded-lg shadow-lg" >
        <h2 class="text-2xl font-semibold mb-2">Map Legend</h2>
        <p>{{ mapLegendLayers }}</p>
            
    </div>
  </template>
  
  <script>
  export default {
    props: ["mapLegendLayers"],
  };
  </script>
  
  <style scoped>
  .map-legend {
    position: absolute;
    bottom: 30px;
    right: 10px;
    max-width: 300px;    
    background-color: #fff;
    padding: 20px;
    line-height: 18px;
    overflow-y: auto;
    z-index: 1000;
  }

  @media (max-width: 768px) {
    .map-legend {
        display: none;
    }
}
  </style>
  