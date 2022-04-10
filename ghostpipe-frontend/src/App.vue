<template>
  
  <v-app>
    <v-navigation-drawer app>
    <!-- -->
  </v-navigation-drawer>

  <v-app-bar app>
    <!-- -->
  </v-app-bar>
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'GhostPipe',

  components: {
    HelloWorld,
  },

  data: () => ({
    //
  }),
}
</script>
