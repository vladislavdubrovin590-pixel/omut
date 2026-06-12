#!/usr/bin/env bash
# One-time / idempotent server provisioning + deploy for Omut.
# Run as root on the server:  bash /opt/omut/deploy/setup.sh
set -euo pipefail

APP_DIR=/opt/omut
SECRETS_DIR=/opt/omut-secrets
REPO_URL=https://github.com/vladislavdubrovin590-pixel/omut.git
PUBLIC_HOST="${PUBLIC_HOST:-201.51.3.75}"

echo "==> Ensuring secrets dir"
mkdir -p "$SECRETS_DIR"
chmod 700 "$SECRETS_DIR"

echo "==> Database password"
if [ ! -f "$SECRETS_DIR/dbpass" ]; then
  openssl rand -hex 16 > "$SECRETS_DIR/dbpass"
  chmod 600 "$SECRETS_DIR/dbpass"
fi
DBPASS="$(cat "$SECRETS_DIR/dbpass")"

echo "==> PostgreSQL user + database (idempotent)"
sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='omut'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE USER omut WITH PASSWORD '${DBPASS}';"
sudo -u postgres psql -c "ALTER USER omut WITH PASSWORD '${DBPASS}';"
sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='omut'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE DATABASE omut OWNER omut;"

echo "==> .env (created once; edit to add Firebase keys)"
if [ ! -f "$APP_DIR/.env" ]; then
  cat > "$APP_DIR/.env" <<EOF
# --- Database ---
DATABASE_URL="postgresql://omut:${DBPASS}@localhost:5432/omut?schema=public"

# --- App ---
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=http://${PUBLIC_HOST}
BOOTSTRAP_ADMIN_EMAILS=
BOOTSTRAP_ADMIN_PHONES=
SESSION_SECRET=$(openssl rand -hex 32)

# --- Firebase (client, public) --- fill these in ---
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=

# --- Firebase Admin (server, secret) --- fill these in ---
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# --- Free OAuth providers for first login ---
YANDEX_CLIENT_ID=
YANDEX_CLIENT_SECRET=
VK_CLIENT_ID=
VK_CLIENT_SECRET=
EOF
  chmod 600 "$APP_DIR/.env"
  echo "    Created $APP_DIR/.env"
else
  echo "    $APP_DIR/.env already exists, keeping it"
fi

echo "==> Installing dependencies"
cd "$APP_DIR"
npm ci

echo "==> Applying database schema"
npx prisma db push --skip-generate --accept-data-loss

echo "==> Seeding database (safe to re-run)"
npx prisma db seed || echo "    seed skipped/failed (continuing)"

echo "==> Building app"
npm run build

echo "==> systemd service"
cp "$APP_DIR/deploy/omut.service" /etc/systemd/system/omut.service
systemctl daemon-reload
systemctl enable omut
systemctl restart omut

echo "==> nginx"
cp "$APP_DIR/deploy/nginx.conf" /etc/nginx/sites-available/omut
ln -sf /etc/nginx/sites-available/omut /etc/nginx/sites-enabled/omut
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

echo "==> firewall"
ufw allow OpenSSH >/dev/null 2>&1 || true
ufw allow 'Nginx Full' >/dev/null 2>&1 || true
yes | ufw enable >/dev/null 2>&1 || true

echo "==> DONE. App: http://${PUBLIC_HOST}  | logs: journalctl -u omut -f"
systemctl --no-pager status omut | head -n 6
