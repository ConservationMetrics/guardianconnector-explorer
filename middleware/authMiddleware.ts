import { Middleware } from '@nuxt/types'
import { Auth } from '@nuxtjs/auth-next'
import { Context } from '@nuxt/types'

interface CustomContext extends Context {
  $auth: Auth
}

const authMiddleware: Middleware = ({ app, $auth, redirect }) => {
  const AUTH_STRATEGY = process.env.NUXT_ENV_AUTH_STRATEGY ? process.env.NUXT_ENV_AUTH_STRATEGY.replace(/['"]+/g, '') : 'none';
  if (AUTH_STRATEGY === 'auth0' && !$auth.loggedIn) {
    return redirect('/login')
  } else if (AUTH_STRATEGY === 'password' && !$auth.loggedIn) {
    return redirect('/login')
  }
}

export default authMiddleware
