import 'vuetify/styles' // Global CSS has to be imported

// video player
import VuePlyr from 'vue-plyr'
import 'vue-plyr/dist/vue-plyr.css'

import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from "./router/index";
import { loadFonts } from './plugins/webfontloader'

import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import './styles/ghostpipe_default.css'

import {humanFileSize} from "./utils";

loadFonts()

let app = createApp(App)
  .use(vuetify)
  .use(router)
  .use(VuePlyr, {
    plyr: {

    }
  })
  ;


app.config.errorHandler = (err) => {
  alert("Error Encountered: " + err);
}

app.config.globalProperties.$filters = {
  formatFilesize(number) {
      return humanFileSize(number);
  }
}

app.mount('#app');

