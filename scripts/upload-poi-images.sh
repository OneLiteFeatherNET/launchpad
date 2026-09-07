#!/usr/bin/env bash
#
# Uploads the community-POI images to the R2 bucket behind img.onelitefeather.net.
#
# Why this exists: @nuxt/image's Cloudflare provider fetches originals from
# img.onelitefeather.net, which serves /images/** and nothing else. These images
# live only in ../r2-upload and in the bucket, never in the repository — the
# same handling the Yggdrasil POI already uses.
#
# They are uploaded RAW, at full resolution. img.onelitefeather.net has
# Cloudflare Image Resizing enabled and @nuxt/image calls it through
# /cdn-cgi/image/w=…,f=avif,q=75/…, so scaling and format conversion happen at
# request time. Pre-shrinking them would compress twice and cap the resolution.
#
# Requires an R2 API token with Object Read & Write on the bucket:
#   Cloudflare dashboard -> R2 -> Manage API tokens -> Create API token
#
set -euo pipefail

ENDPOINT="https://4f562a3754b386b01953b7f5aed871ea.r2.cloudflarestorage.com"
BUCKET="img-onelitefeather-net"
SRC="../r2-upload/images/community-poi"   # originals, not in the repo
DEST_PREFIX="images/community-poi"   # verified below before anything is written

: "${R2_ACCESS_KEY_ID:?set R2_ACCESS_KEY_ID (R2 API token access key)}"
: "${R2_SECRET_ACCESS_KEY:?set R2_SECRET_ACCESS_KEY (R2 API token secret)}"

RC=(
  rclone
  --s3-provider Cloudflare
  --s3-endpoint "${ENDPOINT}"
  --s3-access-key-id "${R2_ACCESS_KEY_ID}"
  --s3-secret-access-key "${R2_SECRET_ACCESS_KEY}"
  --s3-region auto
  --s3-no-check-bucket
)

echo "==> 1/4  Confirming the key layout inside the bucket"
# The public URL is https://img.onelitefeather.net/images/<path>. Whether the
# bucket stores that as "images/<path>" or strips the prefix at the edge cannot
# be told from the URL alone, and guessing wrong uploads into a dead prefix.
# So: look at where an image that IS known to work actually lives.
if "${RC[@]}" lsf ":s3:${BUCKET}/images/blog/" 2>/dev/null | head -3 | grep -q .; then
  echo "    ok — keys are stored with the images/ prefix"
else
  echo "    !! images/blog/ is empty or unreachable under that prefix."
  echo "    !! Check manually before uploading:"
  echo "         rclone lsd :s3:${BUCKET}/ ...   (top level)"
  echo "    !! If the bucket has no images/ folder, set DEST_PREFIX=community-poi"
  echo "       in this script and re-run."
  exit 1
fi

echo "==> 2/4  What would be uploaded (dry run)"
"${RC[@]}" copy "${SRC}" ":s3:${BUCKET}/${DEST_PREFIX}" \
  --dry-run --progress --stats-one-line

echo
read -r -p "Proceed with the real upload? [y/N] " reply
[[ "${reply}" == "y" || "${reply}" == "Y" ]] || { echo "aborted"; exit 0; }

echo "==> 3/4  Uploading"
# copy, never sync: sync deletes anything in the destination that is not in the
# source, and the destination holds every other image on the site.
"${RC[@]}" copy "${SRC}" ":s3:${BUCKET}/${DEST_PREFIX}" \
  --progress --stats-one-line --transfers 4

echo "==> 4/4  Verifying over the public URL"
fail=0
for p in \
  images/community-poi/hafengebaeude/litematica_day.png \
  images/community-poi/hafengebaeude/litematica_sunset.png \
  images/community-poi/hafengebaeude/reference_exterior.png \
  images/community-poi/hafengebaeude/reference_details.png \
  images/community-poi/labyrinth/progress_inner_walls.png \
  images/community-poi/labyrinth/progress_night_overview.png \
  images/community-poi/labyrinth/progress_aerial.png \
  images/community-poi/megabase/site_overview.png \
  images/community-poi/megabase/reference_uncensored_library.jpg
do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "https://img.onelitefeather.net/${p}")
  ct=$(curl -s -o /dev/null -w '%{content_type}' --max-time 15 "https://img.onelitefeather.net/${p}")
  printf '    %s  %-22s %s\n' "${code}" "${ct}" "${p#images/community-poi/}"
  [[ "${code}" == "200" ]] || fail=1
done

if [[ "${fail}" -ne 0 ]]; then
  echo
  echo "Some paths did not return 200. If the objects are there, Cloudflare may"
  echo "still be serving a cached 404 — purge that prefix in the dashboard, or"
  echo "wait out the negative-cache TTL, then re-run step 4."
  exit 1
fi

echo
echo "All nine images are live. The content already points at these paths, so"
echo "nothing further needs deploying for them to appear."
