<template>
    <div>
        <div class="basemap-toggle rounded shadow" :class="{ active: showModal }" @click="toggleModal">
            <img src="/map.svg" alt="Map Icon">
        </div>
        <div v-if="showModal" class="modal rounded shadow">
            <div class="modal-content">
                <h3 class="font-semibold mb-2">Select Basemap</h3>
                <label>
                    <input type="radio" :value="{ id: 'custom', style: mapboxStyle }" name="basemap" v-model="selectedBasemap" @change="emitBasemap">
                    Your Mapbox Style (default)
                </label>
                <label>
                    <input type="radio" :value="{ id: 'satellite-streets', style: 'mapbox://styles/mapbox/satellite-streets-v12' }" name="basemap" v-model="selectedBasemap" @change="emitBasemap">
                    Mapbox Satellite (up to 2019)
                </label>
                <label>
                    <input type="radio" :value="{ id: 'streets', style: 'mapbox://styles/mapbox/streets-v12' }" name="basemap" v-model="selectedBasemap" @change="emitBasemap">
                    Mapbox Streets
                </label>
                <label
                    v-if="planetApiKey"
                >
                    <input type="radio" :value="{ id: 'planet', monthYear: monthYear}" name="basemap" v-model="selectedBasemap" @change="emitBasemap">
                    Planet Monthly Visual Basemap
                </label>
                <label v-if="selectedBasemap.id === 'planet'">
                    <Datepicker v-model="monthYear" format="YYYY-MM" value-type="YYYY-MM" type="month" :default-value="maxMonth" :disabled-date="setPlanetDateRange" :clearable="false" @selected="updatePlanetBasemap"></Datepicker>
                </label>
            </div>

        </div>
    </div>
  </template>
  
  <script>
  // @ts-ignore
  import Datepicker from 'vue2-datepicker';
  import 'vue2-datepicker/index.css';

  export default {
    name: "BasemapSelector",
    components: {
        Datepicker
    },
    props: ["mapboxStyle", "planetApiKey"],
    data() {
        return {
            monthYear: this.maxMonth,
            minMonth: '2020-09', // The first month we have Planet NICFI monthly basemaps
            showModal: false,
            selectedBasemap: { id: 'custom', style: this.mapboxStyle}
        };
    },
    computed: {
        maxMonth() { 
            // If the current day is less than or equal to 15, maxMonth is two months ago.
            // Otherwise, maxMonth is the previous  month.
            // This is because Planet NICFI monthly basemaps for the previous month are published on the 15th of each month.
            const date = new Date();
            if (date.getDate() <= 15) {
                date.setMonth(date.getMonth() - 2);
            } else {
                date.setMonth(date.getMonth() - 1);
            }
            const year = date.getFullYear();
            let month = date.getMonth() + 1;
            month = month < 10 ? `0${month}` : month;
            return `${year}-${month}`;
        }    
    },
    methods: {
        toggleModal() {
            this.showModal = !this.showModal;
        },
        emitBasemap() {
            this.$emit('basemapSelected', this.selectedBasemap);
        },
        setPlanetDateRange(date) {
            // minMonth and maxMonth are in format YYYY-MM, but date is a Date object
            // so we need to convert it to a string in the same format
            date = date.toISOString().slice(0, 7);
            return date < this.minMonth || date > this.maxMonth;
        },
        updatePlanetBasemap() {
            if (this.selectedBasemap.id === 'planet') {
                this.selectedBasemap.monthYear = this.monthYear;
                this.emitBasemap();
            }
        },
    },
    watch: {
        selectedBasemap(newVal, oldVal) {
            // Update the monthYear when the planet basemap is selected
            if (newVal.id === 'planet' && newVal !== oldVal) {
                this.monthYear = this.maxMonth;
            }
        },
        monthYear(newVal, oldVal) {
            if (this.selectedBasemap.id === 'planet') {
                this.updatePlanetBasemap();
            }
        }
    }
  };
  </script>
  
<style scoped>
.basemap-toggle {
  position: absolute;
  top: 147px;
  right: 10px;
  padding: 3px;
  width: 30px;
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
    right: 50px;
    top: 147px;
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
  