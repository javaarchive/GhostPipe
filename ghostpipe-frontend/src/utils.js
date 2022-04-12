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
    if(!videoData.requested_audio_format){
        videoData.audioOnly = true;
    }
    // filtering by thumb height existence is nesscary cause sort picks low quality thumbnails when height not defined
    videoData.hugest_jpg_thumbnail = videoData.thumbnails.filter(thumb => thumb.url.endsWith(".jpg") && thumb.height).sort((a,b) => { return b.height - a.height; })[0];
    videoData.hugest_webp_thumbnail = videoData.thumbnails.filter(thumb => thumb.url.endsWith(".webp") && thumb.height).sort((a,b) => { return b.height - a.height; })[0];
    return videoData;
}