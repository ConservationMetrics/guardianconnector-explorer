<template>
  <div class="table-item card">
    <h2 class="card-header">
      <p class="table-name">{{ tableName }}</p>
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
          <template v-if="key === 'VIEWS'">
            <label :for="`${tableName}-${key}`">{{ $t(key) }}</label>
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
          <template v-else-if="mapConfigKeys.includes(key)">
            <div v-if="key === mapConfigKeys[0]" class="config-header">
              <h3>Map Configuration</h3>
            </div>
            <label :for="`${tableName}-${key}`">{{ $t(key) }}</label>
            <template v-if="key === 'MAPBOX_STYLE'">
              <input
                :id="`${tableName}-${key}`"
                v-model="config[key]"
                class="input-field"
                pattern="^mapbox://styles/[^/]+/[^/]+$"
              />
            </template>
            <template v-if="key === 'MAPBOX_ACCESS_TOKEN'">
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
            <template v-else-if="key === 'MAPBOX_3D'">
              <label :for="`${tableName}-${key}`" class="checkbox-label">
                <input
                  type="checkbox"
                  :id="`${tableName}-${key}`"
                  v-model="config[key]"
                />
                {{ $t("enable") }}
              </label>
            </template>
            <template v-else-if="key === 'MAP_LEGEND_LAYER_IDS'">
              <component
                class="tag-field"
                :is="isClient ? 'vue-tags-input' : 'div'"
                v-if="isClient"
                v-model="tagInputs[key]"
                :tags="tags[key]"
                @tags-changed="updateTags(key, $event)"
              />
            </template>
            <template v-else-if="key === 'PLANET_API_KEY'">
              <input
                :id="`${tableName}-${key}`"
                v-model="config[key]"
                class="input-field"
              />
            </template>
          </template>
          <template v-else-if="filteringKeys.includes(key)">
            <div v-if="key === filteringKeys[0]" class="config-header">
              <h3>Filtering Configuration</h3>
            </div>
            <label :for="`${tableName}-${key}`">{{ $t(key) }}</label>
            <template v-if="key === 'FRONT_END_FILTERING'">
              <label :for="`${tableName}-${key}`" class="checkbox-label">
                <input
                  type="checkbox"
                  :id="`${tableName}-${key}`"
                  v-model="config[key]"
                />
                {{ $t("enable") }}
              </label>
            </template>
            <template v-else-if="key === 'FRONT_END_FILTER_COLUMN'">
              <input
                :id="`${tableName}-${key}`"
                v-model="config[key]"
                class="input-field"
              />
            </template>
            <template
              v-else-if="
                key === 'UNWANTED_COLUMNS' || key === 'UNWANTED_SUBSTRINGS'
              "
            >
              <component
                class="tag-field"
                :is="isClient ? 'vue-tags-input' : 'div'"
                v-if="isClient"
                v-model="tagInputs[key]"
                :tags="tags[key]"
                @tags-changed="updateTags(key, $event)"
              />
            </template>
          </template>
          <template v-else-if="mediaKeys.includes(key)">
            <div v-if="key === mediaKeys[0]" class="config-header">
              <h3>Media Configuration</h3>
            </div>
            <label :for="`${tableName}-${key}`">{{ $t(key) }}</label>
            <template v-if="key === 'EMBED_MEDIA'">
              <label :for="`${tableName}-${key}`" class="checkbox-label">
                <input
                  type="checkbox"
                  :id="`${tableName}-${key}`"
                  v-model="config[key]"
                />
                {{ $t(key) }}
              </label>
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
          </template>
          <template v-else-if="alertKeys.includes(key)">
            <div v-if="key === alertKeys[0]" class="config-header">
              <h3>Alert Panel Configuration</h3>
            </div>
            <label :for="`${tableName}-${key}`">{{ $t(key) }}</label>

            <template v-if="key === 'ALERT_RESOURCES'">
              <label :for="`${tableName}-${key}`" class="checkbox-label">
                <input
                  type="checkbox"
                  :id="`${tableName}-${key}`"
                  v-model="config[key]"
                />
                {{ $t("enable") }}
              </label>
            </template>
            <template v-else-if="key === 'MAPEO_CATEGORY_IDS' || 'MAPEO_TABLE'">
              <input
                :id="`${tableName}-${key}`"
                v-model="config[key]"
                class="input-field"
              />
            </template>
          </template>
          <template v-else>
            <div
              v-if="
                key ===
                Object.keys(sortedConfig).find(
                  (k) =>
                    !mapConfigKeys.includes(k) &&
                    !filteringKeys.includes(k) &&
                    !mediaKeys.includes(k) &&
                    !alertKeys.includes(k) &&
                    k !== 'VIEWS',
                )
              "
              class="config-header"
            >
              <h3>Other Configuration</h3>
            </div>
            <label :for="`${tableName}-${key}`">{{ $t(key) }}</label>
            <template v-if="key === 'LOGO_URL'">
              <input
                :id="`${tableName}-${key}`"
                v-model="config[key]"
                class="input-field"
                type="url"
              />
            </template>
            <template v-else>
              <input
                :id="`${tableName}-${key}`"
                v-model="config[key]"
                class="input-field"
              />
            </template>
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
  components: {
    VueTagsInput: () => import("@johmun/vue-tags-input"),
  },
  data() {
    return {
      isClient: false,
      originalConfig: JSON.parse(JSON.stringify(this.config)),
      tagInputs: {
        UNWANTED_COLUMNS: "",
        UNWANTED_SUBSTRINGS: "",
        MAPEO_CATEGORY_IDS: "",
        MAP_LEGEND_LAYER_IDS: "",
      },
      tags: {
        UNWANTED_COLUMNS: this.config.UNWANTED_COLUMNS
          ? this.config.UNWANTED_COLUMNS.split(",").map((tag) => ({
              text: tag,
            }))
          : [],
        UNWANTED_SUBSTRINGS: this.config.UNWANTED_SUBSTRINGS
          ? this.config.UNWANTED_SUBSTRINGS.split(",").map((tag) => ({
              text: tag,
            }))
          : [],
        MAPEO_CATEGORY_IDS: this.config.MAPEO_CATEGORY_IDS
          ? this.config.MAPEO_CATEGORY_IDS.split(",").map((tag) => ({
              text: tag,
            }))
          : [],
        MAP_LEGEND_LAYER_IDS: this.config.MAP_LEGEND_LAYER_IDS
          ? this.config.MAP_LEGEND_LAYER_IDS.split(",").map((tag) => ({
              text: tag,
            }))
          : [],
      },
      views: this.config.VIEWS ? this.config.VIEWS.split(",") : [],
      mapConfigKeys: [
        "MAPBOX_STYLE",
        "MAPBOX_ACCESS_TOKEN",
        "MAPBOX_ZOOM",
        "MAPBOX_CENTER_LATITUDE",
        "MAPBOX_CENTER_LONGITUDE",
        "MAPBOX_PROJECTION",
        "MAPBOX_BEARING",
        "MAPBOX_PITCH",
        "MAPBOX_3D",
        "MAP_LEGEND_LAYER_IDS",
        "PLANET_API_KEY",
      ],
      filteringKeys: [
        "FRONT_END_FILTER_COLUMN",
        "FRONT_END_FILTERING",
        "UNWANTED_COLUMNS",
        "UNWANTED_SUBSTRINGS",
      ],
      mediaKeys: ["EMBED_MEDIA", "MEDIA_BASE_PATH", "MEDIA_BASE_PATH_ALERTS"],
      alertKeys: ["ALERT_RESOURCES", "MAPEO_CATEGORY_IDS", "MAPEO_TABLE"],
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

      // Reusable function to sort entries based on the order of keys in an array
      const sortEntries = (keysArray) => {
        return configEntries
          .filter(([key]) => keysArray.includes(key))
          .sort(
            ([keyA], [keyB]) =>
              keysArray.indexOf(keyA) - keysArray.indexOf(keyB),
          );
      };

      // Apply sorting function to each group of keys
      const mapEntries = sortEntries(this.mapConfigKeys);
      const filteringEntries = sortEntries(this.filteringKeys);
      const mediaEntries = sortEntries(this.mediaKeys);
      const alertEntries = sortEntries(this.alertKeys);

      // Sort the remaining entries alphabetically
      const otherEntries = configEntries
        .filter(
          ([key]) =>
            !this.mapConfigKeys.includes(key) &&
            !this.filteringKeys.includes(key) &&
            !this.mediaKeys.includes(key) &&
            !this.alertKeys.includes(key) &&
            key !== "VIEWS",
        )
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

      // Combine all entries in the correct order
      return Object.fromEntries(
        [
          viewsEntry,
          ...mapEntries,
          ...filteringEntries,
          ...mediaEntries,
          ...alertEntries,
          ...otherEntries,
        ].filter(Boolean), // Remove undefined entries
      );
    },
  },
  methods: {
    handleSubmit() {
      this.originalConfig = JSON.parse(JSON.stringify(this.config));
      this.$emit("submit-config", this.tableName, this.config);
    },
    updateTags(key, newTags) {
      this.tags[key] = newTags;
      this.config[key] = newTags.map((tag) => tag.text).join(",");
    },
  },
  mounted() {
    this.isClient = true;
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

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: normal !important;
}

.checkbox-label input[type="checkbox"] {
  margin-right: 0.5em;
}

.tag-field {
  min-width: 100%;
}

.config-header {
  margin-bottom: 1em;
}

.config-header h3 {
  margin: 0;
  padding: 0.5em 0;
  font-size: 1.15em;
  font-weight: bold;
  border-bottom: 1px solid #ddd;
  color: #333;
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
