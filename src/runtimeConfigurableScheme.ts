import { Oauth2Scheme, Auth } from "@nuxtjs/auth-next/dist/runtime.js";
import { SchemeOptions } from "@nuxtjs/auth-next";

export default class RuntimeConfigurableOauth2Scheme extends Oauth2Scheme {
  constructor($auth: Auth, options: SchemeOptions) {
    const configOptions: SchemeOptions = {
      ...options,
      ...$auth.ctx.$config.auth.strategies[options.name],
    };
    super($auth, configOptions);
  }
}
