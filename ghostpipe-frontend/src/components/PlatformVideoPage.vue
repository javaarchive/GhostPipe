<template>
  <v-container>
    <PlatformVideo v-bind:vid="$route.query.vid" ></PlatformVideo>
    <p>Rendering on </p>
  </v-container>
</template>

<script>

import PlatformVideo from './PlatformVideo.vue'

export default {
  name: 'PlatformVideoPage',

  data: () => {
    
  },
  components: {
    PlatformVideo
  }
}
</script>
