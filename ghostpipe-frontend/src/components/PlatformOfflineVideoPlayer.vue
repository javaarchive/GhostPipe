<template>
  <div class="gp-player">
      <vue-plyr :options="options">
        <video controls playsinline ref="video">
            
        </video>
      </vue-plyr>
      <p class="gp-offline-note">Offline is still in developement and may not work. </p>
  </div>
</template>

<script>

import config from "../config";

import db from "../database/db";

import Hls from "hls.js";

let videoFileCache = new Map();

async function loadFile(filename){
  if(videoFileCache.has(filename)){
    return videoFileCache.get(filename);
  }
  let fileDetails = (await db.videoSegments.where({
        filename: filename
      }).toArray())[0];
  if(fileDetails){
    let url = URL.createObjectURL(fileDetails.data);
    videoFileCache.set(filename,url);
    return url;
  }else{
    return null;
  }
}

// Fake HLS Loader impl
function HLSLocalLoader(config){
    let id = Math.random().toString();
    // console.log("Initalized Fake HLS Loader",id);
    let self = {};
    self.aborted = false;
    self.parsing = {start:1, end: 1};
    self.loading = {start:1,end:1,first:1};
    self.buffering = {start:1,end:1,first:1};
    self.chunkCount = 1;
    self.loader = new Hls.DefaultConfig.loader(config);
    self.stats = {
      aborted: self.aborted,
      parsing: self.parsing,
      loading: self.loading,
      buffering: self.buffering,
      chunkCount: self.chunkCount
    }
    self.load = async (context, config, callbacks) => {
      // console.log("Loading",context.url,context.type,context.responseType);
      // console.log("Callbacks",callbacks,"ctx",context);

      let filename = context.url.split("/").filter(part => part.endsWith(".m3u8") || part.endsWith(".ts"))[0];
      // console.log("Determined filename",filename);
      

      if(filename){
        context.url = await loadFile(filename);
        self.loader.load(context, config, callbacks)
        /*let convertedData = (context.responseType == "arraybuffer") ? (await blob.arrayBuffer()) : (await blob.text());
        console.log("Converted data",convertedData);

        let callbackParams = [{
          url: context.url,
          data: convertedData,
        }, {
          aborted: self.aborted,
          loaded: fileDetails.data.size,
          total: fileDetails.data.size,
          retry: 0,
          bwEstimate: 1024*1024*25, // casual internet for filler
          parsing: self.parsing,
          loading: self.loading,
          // buffering: self.buffering,
          chunkCount: self.chunkCount,
          customStats: true
        }, context];
        console.log("Callbacking to",callbackParams);
        callbacks.onSuccess.apply(self, callbackParams);*/
      }else{
        console.log("File not found for loader");
        callbacks.onError({
          code: 404,
          message: "File not stored. "
        }, context)
      }
    }
    self.abort = () => {
      // console.log("Aborting");
      if(self.loader){
        self.loader.abort();
      }
      self.aborted = true;
    }
    self.destroy = () => {
      console.trace();
      if(self.loader){
        self.loader.destroy();
      }
      // console.log("HLS Fake Loader destroyed",id);
    }
    return self;
}


export default {
  name: 'PlatformOfflineVideoPlayer',
  data: () => {
    return {
        options:{

        },
        isDebug: config.isDebug,
        detached: false
    };
  },
  props: [
      "viddata"
  ],
  methods:{
      
  },
  mounted(){
    // Attach hls.js   
    let hlsConfig = {
      ...Hls.DefaultConfig,
        // progressive: true,
        loader: HLSLocalLoader,
        pLoader: HLSLocalLoader,
        fLoader: HLSLocalLoader,
        debug: this.isDebug,
        // enableWorker: false,
        // maxBufferLength: 60,
        autoStartLoad: true,
        lowLatencyMode: true
        // backBufferLength: 90
    };
    // Hls.DefaultConfig = hlsConfig;
    let hls = new Hls(hlsConfig);

    console.log("Attaching to video element");
    let outerThis = this;
    hls.on(Hls.Events.MEDIA_ATTACHED, function () {
      let srcUrl = "/offline/" + outerThis.viddata.id + ".m3u8";
      console.log("Loading virtual url",srcUrl);
      if(!outerThis.detached) hls.loadSource(srcUrl);
    });

    hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
      console.log("Manifest parsed",data);
     
    });

     hls.attachMedia(this.$refs["video"]);
     hls.startLoad(-1);
         
  },
  beforeDestroy(){
    this.detached = true;
  }
}
</script>
