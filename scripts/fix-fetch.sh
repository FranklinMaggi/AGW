#!/bin/bash

echo "[fix-fetch] Starting automatic API migration..."

PROJECT_ROOT="$(pwd)"
ENV_LOCAL="$PROJECT_ROOT/.env.local"
ENV_PRODUCTION="$PROJECT_ROOT/.env.production"

# ==========================================================
# 1. CREAZIONE ENV SOLO SE NON ESISTONO
# ==========================================================

if [ ! -f "$ENV_LOCAL" ]; then
  echo "[fix-fetch] Creating .env.local"
  cat <<EOF > "$ENV_LOCAL"
# LOCAL DEVELOPMENT API ENDPOINT
NEXT_PUBLIC_API_URL="https://agw-dev.franklin19.workers.dev"
EOF
fi

if [ ! -f "$ENV_PRODUCTION" ]; then
  echo "[fix-fetch] Creating .env.production"
  cat <<EOF > "$ENV_PRODUCTION"
# PRODUCTION API ENDPOINT
NEXT_PUBLIC_API_URL="https://agw.franklin19.workers.dev"
EOF
fi

# ==========================================================
# 2. FILE TARGET
# ==========================================================

TARGET_FILES=$(grep -Rl "https://agw" ./app ./components ./lib 2>/dev/null)

if [ -z "$TARGET_FILES" ]; then
  echo "[fix-fetch] No files with old fetch URLs found."
  exit 0
fi

# ==========================================================
# 3. REPLACE RULES
# ==========================================================

for FILE in $TARGET_FILES; do
  echo "[fix-fetch] Updating: $FILE"

  sed -i "" \
    -e 's|"https:\/\/agw\.franklin19\.workers\.dev|`${process.env.NEXT_PUBLIC_API_URL}|g' \
    -e 's|"https:\/\/agw-dev\.franklin19\.workers\.dev|`${process.env.NEXT_PUBLIC_API_URL}|g' \
    -e 's|"${NEXT_PUBLIC_API_URL}|`${process.env.NEXT_PUBLIC_API_URL}|g' \
    -e 's|${NEXT_PUBLIC_API_URL}|${process.env.NEXT_PUBLIC_API_URL}|g' \
    -e 's|"\/api|`${process.env.NEXT_PUBLIC_API_URL}\/api|g' \
    -e 's|"`${process.env.NEXT_PUBLIC_API_URL}|`${process.env.NEXT_PUBLIC_API_URL}|g' \
    "$FILE"
  
done

echo "[fix-fetch] Migration complete!"
