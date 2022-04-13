<template>
  <div class="gp-player">
      <vue-plyr :options="options">
        <video controls playsinline v-bind:data-poster="viddata.hugest_jpg_thumbnail.url" ref="video">
            
        </video>
      </vue-plyr>
      <audio v-if="!viddata.audioOnly" v-bind:src="viddata.requested_audio_format.url" ref="audio" controls v-show="isDebug"></audio>
  </div>
</template>

<script>

import config from "../config";

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
      
  }
}
</script>
