<template>
  <div class="table-item card">
    <h2 class="card-header">
      <p class="table-name">{{ $t("table") }}: {{ tableName }}</p>
      <button class="hamburger" @click="$emit('toggle-minimize', tableName)">
        ☰
      </button>
    </h2>
    <div v-if="!isMinimized" class="card-body">
      <form @submit.prevent="handleSubmit">
        <div
          v-for="(value, key) in sortedConfig"
          :key="key"
          class="config-field"
        >
          <label :for="`${tableName}-${key}`">{{ $t(key) }}</label>
          <template v-if="key === 'VIEWS'">
            <div class="views-checkboxes">
              <label>
                <input type="checkbox" value="map" v-model="views" />
                {{ $t("map") }}
              </label>
              <label>
                <input type="checkbox" value="gallery" v-model="views" />
                {{ $t("gallery") }}
              </label>
              <label>
                <input type="checkbox" value="alerts" v-model="views" />
                {{ $t("alerts") }}
              </label>
            </div>
          </template>
          <template
            v-else-if="
              key === 'ALERT_RESOURCES' ||
              key === 'EMBED_MEDIA' ||
              key === 'FRONT_END_FILTERING' ||
              key === 'MAPBOX_3D'
            "
          >
            <input type="checkbox" v-model="config[key]" />
          </template>
          <template
            v-else-if="
              key === 'MEDIA_BASE_PATH' || key === 'MEDIA_BASE_PATH_ALERTS'
            "
          >
            <input
              :id="`${tableName}-${key}`"
              v-model="config[key]"
              class="input-field"
              type="url"
            />
          </template>
          <template v-else-if="key === 'MAPBOX_ACCESS_TOKEN'">
            <input
              :id="`${tableName}-${key}`"
              v-model="config[key]"
              class="input-field"
              pattern="^pk\.ey.*"
            />
          </template>
          <template
            v-else-if="
              key === 'MAPBOX_BEARING' ||
              key === 'MAPBOX_CENTER_LATITUDE' ||
              key === 'MAPBOX_CENTER_LONGITUDE' ||
              key === 'MAPBOX_PITCH' ||
              key === 'MAPBOX_ZOOM'
            "
          >
            <input
              :id="`${tableName}-${key}`"
              v-model="config[key]"
              class="input-field"
              type="number"
              step="0.00001"
              :min="
                key === 'MAPBOX_BEARING'
                  ? -180
                  : key === 'MAPBOX_CENTER_LATITUDE'
                    ? -90
                    : key === 'MAPBOX_CENTER_LONGITUDE'
                      ? -180
                      : key === 'MAPBOX_PITCH'
                        ? 0
                        : key === 'MAPBOX_ZOOM'
                          ? 0
                          : 0
              "
              :max="
                key === 'MAPBOX_BEARING'
                  ? 180
                  : key === 'MAPBOX_CENTER_LATITUDE'
                    ? 90
                    : key === 'MAPBOX_CENTER_LONGITUDE'
                      ? 180
                      : key === 'MAPBOX_PITCH'
                        ? 85
                        : key === 'MAPBOX_ZOOM'
                          ? 23
                          : 0
              "
            />
          </template>
          <template v-else-if="key === 'MAPBOX_PROJECTION'">
            <select
              :id="`${tableName}-${key}`"
              v-model="config[key]"
              class="input-field"
            >
              <option value="mercator">Mercator</option>
              <option value="albers">Albers</option>
              <option value="equalEarth">Equal Earth</option>
              <option value="equirectangular">Equirectangular</option>
              <option value="lambertConformalConic">
                Lambert Conformal Conic
              </option>
              <option value="naturalEarth">Natural Earth</option>
              <option value="winkelTripel">Winkel Tripel</option>
              <option value="globe">Globe</option>
            </select>
          </template>
          <template v-else>
            <input
              :id="`${tableName}-${key}`"
              v-model="config[key]"
              class="input-field"
            />
          </template>
        </div>
        <button
          type="submit"
          :disabled="!isChanged"
          :class="[
            'submit-button',
            {
              'bg-gray-500 cursor-not-allowed': !isChanged,
              'bg-blue-500 hover:bg-blue-700': isChanged,
            },
          ]"
          class="text-white font-bold py-2 px-4 rounded transition-colors duration-200 md:block"
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
    isMinimized: Boolean,
  },
  data() {
    return {
      views: this.config.VIEWS ? this.config.VIEWS.split(",") : [],
      originalConfig: JSON.parse(JSON.stringify(this.config)),
    };
  },
  computed: {
    isChanged() {
      return (
        JSON.stringify(this.config) !== JSON.stringify(this.originalConfig)
      );
    },
    sortedConfig() {
      const configEntries = Object.entries(this.config);
      const viewsEntry = configEntries.find(([key]) => key === "VIEWS");
      const otherEntries = configEntries
        .filter(([key]) => key !== "VIEWS")
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
      return Object.fromEntries(
        viewsEntry ? [viewsEntry, ...otherEntries] : otherEntries,
      );
    },
  },
  methods: {
    handleSubmit() {
      this.originalConfig = JSON.parse(JSON.stringify(this.config));
      this.$emit("submit-config", this.tableName, this.config);
    },
  },
  watch: {
    views(newViews) {
      this.config.VIEWS = newViews.join(",");
    },
  },
};
</script>

<style scoped>
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
  height: 3em;
  font-size: 1.25em;
  font-weight: bold;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.table-name {
  margin: 0;
  float: left;
}

.hamburger {
  background: none;
  border: none;
  font-size: 1em;
  cursor: pointer;
  margin-left: auto;
  float: right;
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

.views-checkboxes {
  display: flex;
  gap: 1em;
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
