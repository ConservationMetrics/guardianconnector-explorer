<template>
  <div class="relative inline-block text-left">
    <div>
      <button
        @click="toggleDropdown"
        class="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
      >
        {{ currentLocaleName }}
        <svg
          class="-mr-1 ml-2 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>
    <div
      v-if="dropdownOpen"
      class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
    >
      <div class="py-1">
        <a
          href="#"
          v-for="locale in availableLocales"
          :key="locale.code"
          class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          @click.prevent.stop="changeLocale(locale.code)"
        >
          {{ locale.name }}
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dropdownOpen: false,
    };
  },
  computed: {
    currentLocaleName() {
      const currentLocale = this.availableLocales.find(
        (locale) => locale.code === this.$i18n.locale,
      );
      return currentLocale ? currentLocale.name : "";
    },
    availableLocales() {
      return this.$i18n.locales;
    },
  },
  methods: {
    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
    },
    changeLocale(localeCode) {
      this.$i18n.setLocale(localeCode);
      this.dropdownOpen = false;
    },
  },
};
</script>
