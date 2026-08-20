# Образ для Cloud Run. Збірка standalone: у фінальний шар потрапляє
# лише сервер і те, що він реально використовує.

FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# public/ може не існувати в репозиторії, а COPY у фінальний шар його вимагає
RUN mkdir -p public && npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Cloud Run передає порт через $PORT
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Мовні дані OCR (~3 МБ) кладемо в образ, інакше кожен новий інстанс качає їх
# із CDN на першому ж розпізнаванні фото.
ADD https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz /app/tessdata/eng.traineddata.gz
ENV TESSERACT_LANG_PATH=/app/tessdata

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 8080
CMD ["node", "server.js"]
