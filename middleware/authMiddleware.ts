import { Middleware } from '@nuxt/types'

const authMiddleware: Middleware = ({ $auth, redirect }) => {
  const AUTH_STRATEGY = process.env.NUXT_ENV_AUTH_STRATEGY ? process.env.NUXT_ENV_AUTH_STRATEGY.replace(/['"]+/g, '') : 'none';
  if (AUTH_STRATEGY === 'auth0' && !$auth.loggedIn) {
    return redirect('/login')
  } else if (AUTH_STRATEGY === 'password' && !$auth.loggedIn) {
    return redirect('/login')
  }
}

export default authMiddleware
