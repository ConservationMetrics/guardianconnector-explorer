// As documented here: https://github.com/NightCatSama/vue-slider-component/issues/75,
// the component is not compatible with SSR. Setting the component up as a plugin,
// with ssr:false in nuxt.config.ts, is a workaround to  prevent an error where 
// the component is trying to access the document object

import Vue from 'vue'
import VueSlider from 'vue-slider-component'

Vue.component('vue-slider', VueSlider)
