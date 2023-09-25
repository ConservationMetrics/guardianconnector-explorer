import { Middleware } from '@nuxt/types'
import { Auth } from '@nuxtjs/auth-next'
import { Context } from '@nuxt/types'

interface CustomContext extends Context {
  $auth: Auth
}

const authMiddleware: Middleware = ({ app, $auth, redirect }) => {
  const USE_PASSWORD = process.env.USE_PASSWORD ? process.env.USE_PASSWORD.replace(/['"]+/g, '') : 'NO';
  if (USE_PASSWORD === 'NO') {
    return;
  }
  if (!$auth.loggedIn) {
    return redirect('/login')
  }
}

export default authMiddleware