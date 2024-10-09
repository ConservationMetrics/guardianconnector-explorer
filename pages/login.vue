<script setup>
import { ref } from "vue";
import { useHead, useUserSession } from "#imports";
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { loggedIn } = useUserSession();
const errorMessage = ref("");

onMounted(() => {
  // eslint-disable-next-line no-undef
  errorMessage.value = useAuth(loggedIn);
});

const { t } = useI18n();
useHead({
  title: "Frizzle: " + t("login"),
});
</script>

<template>
  <Auth0Login
    v-if="loggedIn === false"
    :errorMessage="errorMessage"
  ></Auth0Login>
</template>
