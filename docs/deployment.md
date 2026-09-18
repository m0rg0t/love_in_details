# Deployment

The application has two independent static hosting targets. A failed build on
one target must not replace or delete the last working version on the other.

## Coolify production

- Project: `vk-mini-apps`
- Environment: `production`
- Resource: `love-in-details-ru1`
- Server: `firstvds-multiradio-ru1` (RU, `linux/amd64`)
- Public URL: <https://love-in-details.pixel-and-byte.ru>
- Build pack: `Dockerfile`
- Dockerfile location: `/Dockerfile`
- Exposed port: `80`
- Healthcheck: `/healthz`
- Deployment branch: `main`

The multi-stage image builds `dist/` with the pinned Node 24 runtime and serves
it with Nginx. The image supports both `linux/arm64` and `linux/amd64`; the RU
production target uses AMD64, while the previous Coolify host remains available
as a rollback target. `npm ci` keeps optional dependencies enabled so
Vite/Rolldown installs the correct native binding for the target architecture.

Coolify's GitHub integration deploys pushes to `main`. Keep the previous
container running until the new image is healthy. A deployment is complete only
after both checks return HTTP 200:

```sh
curl --fail --show-error https://love-in-details.pixel-and-byte.ru/healthz
curl --fail --show-error https://love-in-details.pixel-and-byte.ru/
```

## VK Hosting fallback

`vk-hosting-config.json` and `npm run deploy` remain the independent VK Hosting
path for application `54445864`. Do not remove or overwrite the last confirmed
VK version when changing Coolify.

Current retained staging endpoint:

<https://stage-app54445864-e7ca2fcf123a.pages.vk-apps.ru/index.html>

VK Hosting is a warm manual fallback, not automatic traffic failover. If the
Coolify origin is unavailable, switch the Web, mobile and m.vk.ru URLs in the VK
administrator settings to the last confirmed VK Hosting URL. Test the selected
URL in an ordinary browser and in a real VK mobile client before treating the
switch as complete.

When publishing a new VK Hosting version, follow these rules:

1. Build and test locally first.
2. Upload once and record the emitted version number.
3. Confirm that exact version; do not re-upload just to request another code.
4. Require HTTP 200 from the retained URL after confirmation.

## Rollback

- Coolify build failure: leave the last healthy container active and inspect
  the failed deployment log.
- Coolify runtime regression: redeploy the previous successful Git commit.
- Coolify/VDS outage: manually point the VK application URLs to the retained VK
  Hosting version.
- VK Hosting outage: keep the application URLs on the Coolify domain.
