<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <button
      class="px-4 py-2 mb-4 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
      @click="login"
    >
      Login with auth0
    </button>
    <p v-if="errorMessage" class="text-red-500 text-xs italic">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      errorMessage: "",
    };
  },
  beforeMount() {
    if (this.$auth.loggedIn) {
      this.$router.push("/");
    }
  },
  mounted() {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const error = hashParams.get("error");
    const errorDescription = hashParams.get("error_description");

    if (error === "access_denied") {
      this.errorMessage = decodeURIComponent(errorDescription);
    }
  },
  watch: {
    "$auth.loggedIn"(loggedIn) {
      if (loggedIn) {
        this.$router.push("/");
      }
    },
  },
  methods: {
    async login() {
      await this.$auth.loginWith("auth0");
    },
  },
};
</script>
