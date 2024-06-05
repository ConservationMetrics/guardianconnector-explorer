import { Middleware } from "@nuxt/types";

const authMiddleware: Middleware = ({ $auth, redirect, route }) => {
  if (route.path !== "/login" && !$auth.loggedIn) {
    if (route.query.redirect) {
      // If already redirected, avoid adding another redirect query parameter
      return;
    }
    const redirectTo = encodeURIComponent(route.fullPath);
    return redirect(`/login?redirect=${redirectTo}`);
  }
};

export default authMiddleware;
