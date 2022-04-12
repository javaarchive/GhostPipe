<template>
  
  <v-app>
    <v-navigation-drawer app>
    <!-- -->
  </v-navigation-drawer>

  <v-app-bar app>
    <v-app-bar-nav-icon>

    </v-app-bar-nav-icon>
    <v-app-bar-title>
      {{brand}}
    </v-app-bar-title>
  </v-app-bar>
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>

import config from "./config";

import HelloWorld from './components/HelloWorld.vue'

export default {
  name: config.brand,

  components: {
  },

  data: () => ({
    brand: config.brand
  }),
  mounted(){
    document.title = config.brand;
  }
}
</script>
