export function filterFormats(formats){
    return formats.filter(format => {
        return format.ext != "mhtml" && format.ext != "3gp"; // no extremely bad format pls
    });
}

export function processVideoData(videoData){
    videoData.formats = filterFormats(videoData.formats);
    videoData.formats = videoData.formats.map(format => {
        if(format.video_ext == "none"){
            format.mimetype = "audio/" + format.audio_ext;
        }else{
            format.mimetype = "video/" + format.video_ext;
        }

        return format;
    });
    videoData.hugest_format = videoData.formats.sort((a,b) => { return b.filesize - a.filesize; })[0];
    videoData.audioOnly = false;
    videoData.requested_video_format = videoData.requested_formats.filter(format => format.video_ext != "none")[0];
    videoData.requested_audio_format = videoData.requested_formats.filter(format => format.audio_ext != "none")[0];
    videoData.audio_formats = [];
    videoData.video_formats = [];

    if(!videoData.requested_audio_format){
        videoData.audioOnly = true;
    }else{
        videoData.video_formats = videoData.formats.filter(format => format.resolution != "audio only");
    }
    videoData.audio_formats = videoData.formats.filter(format => format.audio_ext != "none" && format.video_ext == "none");
    // filtering by thumb height existence is nesscary cause sort picks low quality thumbnails when height not defined
    videoData.hugest_jpg_thumbnail = videoData.thumbnails.filter(thumb => thumb.url.endsWith(".jpg") && thumb.height).sort((a,b) => { return b.height - a.height; })[0];
    videoData.hugest_webp_thumbnail = videoData.thumbnails.filter(thumb => thumb.url.endsWith(".webp") && thumb.height).sort((a,b) => { return b.height - a.height; })[0];
    return videoData;
}

// Thanks to https://stackoverflow.com/a/14919494/10818862

/**
 * Format bytes as human-readable text.
 * 
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use 
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 * 
 * @return Formatted string.
 */
 export function humanFileSize(bytes, si=false, dp=1) {
    const thresh = si ? 1000 : 1024;
  
    if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }
  
    const units = si 
      ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10**dp;
  
    do {
      bytes /= thresh;
      ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
  
  
    return bytes.toFixed(dp) + ' ' + units[u];
  }