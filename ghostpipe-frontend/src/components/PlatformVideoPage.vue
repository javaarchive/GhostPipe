<template>
  <v-container>
    <PlatformVideo v-bind:vid="$route.query.v" ></PlatformVideo>
    <p>Rendering on page. </p>
  </v-container>
</template>

<script>

import PlatformVideo from './PlatformVideo.vue'

export default {
  name: 'PlatformVideoPage',

  data: () => {
    return {};
  },
  components: {
    PlatformVideo
  }
}
</script>
