<template>
    <!-- <Login /> -->
    <div class="flex items-center justify-center h-screen">
      <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50" @click="loginWithAuth0">Login with Auth0</button>
    </div>
</template>
  
  <script>
  // import Login from '~/components/Login.vue'
  
  export default {
    components: {
      // Login
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