#!/usr/bin/env bash
# Pull latest code and redeploy. Run as root:  bash /opt/omut/deploy/redeploy.sh
set -euo pipefail

APP_DIR=/opt/omut
UPLOAD_DIR=/var/www/omut-uploads/gallery
cd "$APP_DIR"

echo "==> Ensuring upload storage"
mkdir -p "$UPLOAD_DIR"
chmod 755 /var/www/omut-uploads "$UPLOAD_DIR"

echo "==> Pulling latest"
git fetch origin
git reset --hard origin/main

echo "==> Installing dependencies"
npm ci

echo "==> Applying database schema"
npx prisma db push --skip-generate --accept-data-loss

echo "==> Seeding database"
npx prisma db seed

echo "==> Building"
npm run build

echo "==> Restarting service"
systemctl restart omut
sleep 2
systemctl --no-pager status omut | head -n 6
echo "==> DONE"
