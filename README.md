# 🔥 ProgImaji - simple image optimization microservice based on NodeJS 🔥

ProgImaji is image resizing CDN microservices that focus on enabling next-gen image extensions such as JpegXL and AVIF, while providing opportunity for microservice owners to monetize their ProgImaji instances with Interledger.

## Rationale

Image resizing and optimization is very crucial to deliver good performance on the web. However, image resizing tools I found on the open source community, either don't have the features I want (because lack of dependencies capability, resource to implement, etc), or don't offer the functionality I need. So I thought I'd write my own simple implementation, one that I can control its functionality while make it fit with the use case I needed--mainly to serve optimized images for my other project ProgNovel. In the long road, hopefully it'll be good enough to serve people across communities.

## Vision

ProgImaji should be a small microservices aimed to be the backend for processing image, while some caching layer sit on top of it (preferably Cloudflare KV Workers for performance or Bunny.net networks for a pretty good budget CDN). It designed to be small and simple, less feature besides that to optimizing images, so that it can focus promoting good practices for web owners to deliver optimized images to the end users.

Integration with Interledger also will be considered in the roadmap to entice third-party hosting a network of image optimize microservices to strengthen infastructure for performance driven website/webapps for the community.

## Performance

The bottleneck performance of ProgImaji will be its image transformation instead of HTTP requests, so the choice of NodeJS unlikely to significantly impact its performance due to ProgImaji using libvps under the hood (thanks to Sharp). Libvps with Sharp implementation already taking advantages of modern hardware like using multicore processors and the use of SIMD, so it will benefits from being hosted on dedicated modern multicore server.

Additionally, ProgImaji uses NodeJS Stream API, piping images buffer chunks by chunks to be processed by libvps while streaming them out into HTTP respond at the same time. This prevent server from buffering the entire image data before processing, thus making it memory efficient during the image transformation process.

**Please note that** at this time, core performance feature like HTTP requests throttling is under development, so heavy concurrent requests most likely will make it crash.

For hardware provision recommendation, it more or less the same as other image resize optimization microservices; scaling horizontally by provisioning more instances is better than using more powerful but less servers. However, since ProgImaji is designed to sit below layers of cache (CDN), storage is less relevant when choosing to host your ProgImaji instance--therefore ephemereal servers like Fly.io and (maybe?) GCP Cloud Run is best suited for ProgImaji.

## Planned features

[ ] HTTP requests throttling.

[ ] JXL and AVIF image transformation.

[ ] Animated GIF -> WEBP / WEBM transformation.

[ ] Monetize ProgImaji per bandwidth/requests with Interledger.

[ ] CORS, proxy, whitelisting url source, requests auth, all that stuff.

## Integration

ProgImaji is designed to sit below layers of caching networks like CDN and Cloudflare KV Workers. Additionally, the ability to accept billing payments with Interledger is in the roadmap. Below are different integration you can make to bootstrap your networks of image optimization with ProgImaji.

### Cache layers

Choose one. If you need more layers for more POP (Point of Presence) coverage, consider to use balancer service like Perfops to bootstrap your multi-cloud CDN strategies.

#### Cloudflare Workers KV

WIP

#### Bunny.net and other CDN

WIP

### Interledger

WIP