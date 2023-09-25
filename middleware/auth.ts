import { Middleware } from '@nuxt/types'
import { Auth } from '@nuxtjs/auth-next'
import { Context } from '@nuxt/types'

interface CustomContext extends Context {
  $auth: Auth
}

const authMiddleware: Middleware = ({ app, $auth, redirect }) => {
  if (!$auth.loggedIn) {
    return redirect('/login')
  }
}

export default authMiddleware