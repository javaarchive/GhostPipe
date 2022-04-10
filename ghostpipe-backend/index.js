const config = require("./config");

const express = require('express');

const {
    createProxyMiddleware,
    responseInterceptor,
  } = require("http-proxy-middleware");

const app = express();

if(config.behind_proxy){
  app.set("trust proxy", true);
}

if(config.pretty_print_debug){
  app.set('json spaces', 4);
}

app.disable("x-powered-by");

// Get /

app.get("/", (req, res) => {
    res.send("OK!");
});

app.get("/ok", (req, res) => {
  res.send("OK!");
});

// Proxy layer

let existingProxies = new Map();

function makeProxyObj(domain) {
    if (existingProxies.has(domain)) {
      return existingProxies.get(domain);
    }
    // TODO: Allow downgrading to http
    let proxyObj = createProxyMiddleware({
      target: "https://" + domain,
      changeOrigin: true,
      selfHandleResponse: true,
      onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
        if(proxyRes.statusCode == 404 || (res && res.statusCode == 404)){
          // console.log(req.originalUrl, "404ed");
          return "Not Found";
        }
        return responseBuffer;
      })
    });
  
    existingProxies.set(domain, proxyObj);
  
    return proxyObj;
}



app.use((req, res, next) => {
    if (!req.originalUrl.startsWith("/real_api")) {
  
      let middleware = makeProxyObj(config.pipedInstances[Math.floor(Math.random() * config.pipedInstances.length)]);
  
      middleware(req, res, next);
    } else {
      next();
    }
 });

app.use("/real_api/tasks", require("./routes/tasks"));
app.use("/real_api/videos", require("./routes/video_fulldata"));

console.log("Reached end up of routes, starting to listen");
app.listen(config.port,() => {
    console.log("Listening at 127.0.0.1:" + config.port);
});