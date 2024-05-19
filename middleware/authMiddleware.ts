import { Middleware } from "@nuxt/types";

const authMiddleware: Middleware = ({ $auth, redirect, route }) => {
  const AUTH_STRATEGY = process.env.NUXT_ENV_AUTH_STRATEGY
    ? process.env.NUXT_ENV_AUTH_STRATEGY.replace(/['"]+/g, "")
    : "none";

  if (route.path !== "/login" && AUTH_STRATEGY === "auth0" && !$auth.loggedIn) {
    return redirect(`/login?redirect=${route.fullPath}`);
  } else if (
    route.path !== "/login" &&
    AUTH_STRATEGY === "password" &&
    !$auth.loggedIn
  ) {
    return redirect(`/login?redirect=${route.fullPath}`);
  }
};

export default authMiddleware;
