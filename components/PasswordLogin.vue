<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-gray-100"
  >
    <form
      @submit.prevent="login"
      class="w-full max-w-sm bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
    >
      <div class="mb-4">
        <label
          class="block text-gray-700 text-sm font-bold mb-2"
          for="password"
        >
          Password
        </label>
        <input
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="password"
          type="password"
          v-model="password"
          required
        />
      </div>
      <div class="flex items-center justify-between">
        <button
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
        >
          Login
        </button>
      </div>
    </form>
    <p v-if="error" class="text-red-500 text-xs italic">{{ error }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      password: "",
      error: null,
    };
  },
  methods: {
    async login() {
      const authStrategy = this.$config.authStrategy || "none";
      if (authStrategy === "password") {
        try {
          await this.$auth.loginWith("password", {
            data: {
              password: this.password,
            },
          });
          this.$router.push("/");
        } catch (error) {
          if (error.response) {
            if (error.response.status === 403) {
              this.error = "The password you entered is incorrect.";
            } else if (error.response.data && error.response.data.message) {
              this.error = error.response.data.message;
            } else {
              this.error = "An error occurred while trying to log in.";
            }
          } else {
            this.error =
              error.message || "An error occurred while trying to log in.";
          }
        }
      }
    },
  },
  watch: {
    "$auth.loggedIn"(loggedIn) {
      if (loggedIn) {
        this.$router.push("/");
      }
    },
  },
  async created() {
    if (this.$route.query.secret_key) {
      try {
        const response = await this.$axios.$get("/api/login", {
          params: {
            secret_key: this.$route.query.secret_key,
          },
        });
        // If the request is successful, log in the user
        if (response.token) {
          this.$auth.strategy.token.set(`Bearer ${response.token}`);
          location.reload();
        }
      } catch (error) {
        this.error = "An error occurred while trying to log in.";
      }
    }
  },
  beforeMount() {
    if (this.$auth.loggedIn) {
      this.$router.push("/");
    }
  },
};
</script>
