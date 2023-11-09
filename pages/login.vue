<template>
    <!-- <Login /> -->
    <div class="flex flex-col items-center justify-center h-screen">
      <button class="px-4 py-2 mb-4 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50" @click="loginWithAuth0">Login with Auth0</button>
      <p v-if="errorMessage" class="text-red-500 text-xs italic">{{ errorMessage }}</p>
    </div>
</template>
  
  <script>
  // import Login from '~/components/Login.vue'
  
  export default {
    data() {
      return {
        errorMessage: ""
      };
    },
    components: {
      // Login
    },
    beforeMount() {
      if (this.$auth.loggedIn) {
        this.$router.push('/');
      }
    },    
    mounted() {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const error = hashParams.get('error');
      const errorDescription = hashParams.get('error_description');

      if (error === 'access_denied') {
        this.errorMessage = decodeURIComponent(errorDescription);
      }
    },
    watch: {
      '$auth.loggedIn'(loggedIn) {
        if (loggedIn) {
          this.$router.push('/');
        }
      }
    },
    methods: {
      async loginWithAuth0() {
        try {
          await this.$auth.loginWith('auth0')
        } catch (error) {
          console.error(error)
        }
      }
    }
  }
  </script>
