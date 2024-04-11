<template>
    <div>
        <div class="basemap-toggle rounded shadow" :class="{ active: showModal }" @click="toggleModal">
            <img src="/map.svg" alt="Map Icon">
        </div>
        <div v-if="showModal" class="modal rounded shadow">
            <div class="modal-content">
                <h3 class="font-semibold mb-2">Select Basemap</h3>
                <label>
                    <input type="radio" value="custom" name="basemap" v-model="selectedBasemap">
                    Mapbox Custom Map (default)
                </label>
                <label>
                    <input type="radio" value="satellite" name="basemap" v-model="selectedBasemap">
                    Mapbox Satellite
                </label>
                <label
                    v-if="planetApiKey"
                >
                    <input type="radio" value="planet" name="basemap" v-model="selectedBasemap">
                    Planet Monthly Visual Basemap
                </label>
            </div>
        </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "BasemapSelector",
    props: ["planetApiKey"],
    data() {
        return {
            showModal: false,
            selectedBasemap: 'satellite'
        };
    },
    methods: {
        toggleModal() {
            this.showModal = !this.showModal;
        }
    }
  };
  </script>
  
<style scoped>
.basemap-toggle {
  position: absolute;
  top: 10px;
  right: 50px;
  padding: 3px;
  width: 35px;
  background-color: #fff;
  z-index: 1000;

  img {
    width: 100%;
  }
}

.basemap-toggle:hover {
    background-color: #f0f0f0;
    cursor: pointer;
}

.basemap-toggle.active {
  background-color: #FFF44F;
}

.modal {
    position: absolute;
    right: 95px;
    top: 10px;
    background-color: #fff;
    border: 1px solid #ccc;
    z-index: 1001;
    padding: 10px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.modal-content {
    display: flex;
    flex-direction: column;
}

.modal h3 {
    margin-top: 0;
}

label {
    margin-bottom: 10px;
}
</style>
  