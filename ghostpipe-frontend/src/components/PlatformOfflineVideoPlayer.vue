<template>
  <div class="gp-player">
      <vue-plyr :options="options">
        <video controls playsinline v-bind:data-poster="viddata.hugest_jpg_thumbnail.url" ref="video">
            
        </video>
      </vue-plyr>
  </div>
</template>

<script>

import config from "../config";

import Hls from "Hls.js";


export default {
  name: 'PlatformOfflineVideoPlayer',
  data: () => {
    return {
        options:{

        },
        isDebug: config.isDebug
    };
  },
  props: [
      "viddata"
  ],
  methods:{
      
  },
  mounted(){
      // Attach hls.js   
      let hls = new Hls({
          progressive: true
      });
         
  }
}
</script>
