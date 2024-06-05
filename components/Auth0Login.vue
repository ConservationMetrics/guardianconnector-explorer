<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <p class="italic">{{ $t("authMessage") }}.</p>
    <button
      class="px-4 py-2 mb-4 mt-4 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
      @click="login"
    >
      {{ $t("loginButton") }}
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
      redirectPath: this.localePath("/"),
    };
  },
  created() {
    const redirect = this.$route.query.redirect;
    this.redirectPath = redirect
      ? decodeURIComponent(redirect)
      : this.localePath("/");
  },
  mounted() {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const error = hashParams.get("error");
    const errorDescription = hashParams.get("error_description");

    if (error === "access_denied") {
      this.errorMessage = decodeURIComponent(errorDescription);
    }
    if (this.$auth.loggedIn) {
      this.$router.replace(this.redirectPath);
    }
  },
  methods: {
    async login() {
      try {
        // TODO: This process of logging in with auth0 takes the user away from
        // GuardianConnector Views and onto the auth0 authorization page.
        // As a consequence, any app state (regarding routes, etc.) is lost, which
        // means that we cannot bring the user back to the same page after login.
        // The only hacky workaround is to store the redirectPath in localStorage,
        // but this will not work when GuardianConnector Views is embedded in an
        // iframe, as localStorage is not shared between the parent and the iframe.
        // This points to a deficiency in our current architecture (embedding
        // GuardianConnector Views in an iframe on Superset). We will likely need to
        // move away from the iframe approach and instead build a common
        // post-authentication entry point for all of GCV, and link to Superset
        // from there.
        await this.$auth.loginWith("auth0", {
          redirectUri: window.location.origin + this.redirectPath,
        });
      } catch (error) {
        console.error(this.$t("auth0LoginError") + ":", error);
      }
    },
  },
};
</script>
