<template>
  <component :is="loginComponent" />
</template>

<script>
import Auth0Login from "~/components/Auth0Login.vue";
import PasswordLogin from "~/components/PasswordLogin.vue";

export default {
  data() {
    return {
      authStrategy: "none",
    };
  },
  created() {
    try {
      this.authStrategy = this.$config.authStrategy;
    } catch (error) {
      console.error(
        "Error fetching authStrategy config on client side:",
        error,
      );
    }
  },
  components: {
    Auth0Login,
    PasswordLogin,
  },
  computed: {
    loginComponent() {
      return this.authStrategy === "auth0" ? Auth0Login : PasswordLogin;
    },
  },
};
</script>
